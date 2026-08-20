import OpenAI, { toFile } from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 180;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CorpoCorrecao = {
  imagem?: string;
  correcao?: string;
};

function extrairImagemBase64(dataUrl: string) {
  const correspondencia = dataUrl.match(
    /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i
  );

  if (!correspondencia) {
    throw new Error(
      "A imagem enviada não possui um formato compatível para correção."
    );
  }

  const mimeType =
    correspondencia[1].toLowerCase() === "image/jpg"
      ? "image/jpeg"
      : correspondencia[1].toLowerCase();

  const base64 = correspondencia[2];

  return {
    mimeType,
    buffer: Buffer.from(base64, "base64"),
  };
}

function obterNomeArquivo(mimeType: string) {
  if (mimeType === "image/jpeg") {
    return "atividade.jpg";
  }

  if (mimeType === "image/webp") {
    return "atividade.webp";
  }

  return "atividade.png";
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CorpoCorrecao;

    const imagem = String(
      body.imagem || ""
    ).trim();

    const correcao = String(
      body.correcao || ""
    ).trim();

    if (!imagem) {
      return NextResponse.json(
        {
          erro:
            "A imagem da atividade não foi informada.",
        },
        {
          status: 400,
        }
      );
    }

    if (!correcao) {
      return NextResponse.json(
        {
          erro:
            "Descreva o erro que deve ser corrigido.",
        },
        {
          status: 400,
        }
      );
    }

    if (correcao.length > 500) {
      return NextResponse.json(
        {
          erro:
            "A descrição da correção é muito longa.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Cruzadinhas do PlanejAI são SVG
     * gerados pelo próprio código.
     *
     * Não enviamos cruzadinhas para
     * edição pelo modelo de imagem.
     */
    if (
      imagem.startsWith(
        "data:image/svg+xml"
      )
    ) {
      return NextResponse.json(
        {
          erro:
            "A correção automática da cruzadinha ainda não está disponível. Use Refazer atividade para gerar outra versão.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      mimeType,
      buffer,
    } =
      extrairImagemBase64(
        imagem
      );

    const arquivo =
      await toFile(
        buffer,
        obterNomeArquivo(
          mimeType
        ),
        {
          type: mimeType,
        }
      );

    /*
     * PROMPT ENXUTO
     *
     * Mantém as regras essenciais,
     * mas reduz bastante o texto
     * enviado ao modelo de imagem.
     */
    const promptCorrecao = `
Edite a atividade escolar enviada.

CORREÇÃO SOLICITADA:
${correcao}

REGRAS OBRIGATÓRIAS:

- Corrija SOMENTE o erro informado.
- Preserve todo o restante da imagem exatamente como está.
- Não altere layout, posições, fontes, tamanhos, cores, bordas ou espaçamentos.
- Não altere questões, textos, respostas, imagens ou elementos não mencionados.
- Não acrescente nem remova conteúdo.
- Preserve fundo branco e proporção vertical.
- Mantenha a atividade adequada para impressão.
- Se o erro for uma palavra, altere somente essa palavra.
- Se o erro for uma figura, altere somente a figura indicada.

Use a imagem enviada como base e faça apenas a correção solicitada.
`.trim();

    /*
     * CORREÇÃO DA IMAGEM
     *
     * quality "low" reduz o custo
     * da geração em comparação com
     * "medium".
     *
     * Mantemos 1024x1536 para preservar
     * o formato vertical da atividade.
     */
    const resultado =
      await openai.images.edit({
        model: "gpt-image-2",
        image: arquivo,
        prompt: promptCorrecao,
        size: "1024x1536",
        quality: "low",
        output_format: "png",
      });

    const imagemBase64 =
      resultado.data?.[0]?.b64_json;

    if (!imagemBase64) {
      return NextResponse.json(
        {
          erro:
            "A inteligência artificial não retornou a atividade corrigida.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      imagem:
        `data:image/png;base64,${imagemBase64}`,
    });
  } catch (error) {
    console.error(
      "Erro ao corrigir atividade:",
      error
    );

    const mensagem =
      error instanceof Error
        ? error.message
        : "Não foi possível corrigir a atividade.";

    return NextResponse.json(
      {
        erro: mensagem,
      },
      {
        status: 500,
      }
    );
  }
}