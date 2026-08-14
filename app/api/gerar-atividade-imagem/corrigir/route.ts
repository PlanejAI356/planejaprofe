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
    correspondencia[1].toLowerCase() ===
    "image/jpg"
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
     * Cruzadinhas do PlanejAI atualmente
     * são SVG gerados pelo código.
     *
     * Não vamos enviá-las para edição
     * raster porque isso poderia quebrar
     * grade, cruzamentos e respostas.
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

    const promptCorrecao = `
Você está EDITANDO uma atividade escolar já pronta.

OBJETIVO:
Corrigir EXCLUSIVAMENTE o erro informado pelo professor.

ERRO INFORMADO PELO PROFESSOR:

${correcao}

REGRAS CRÍTICAS E OBRIGATÓRIAS:

1. Use a imagem enviada como base.
2. Faça SOMENTE a alteração necessária para corrigir o erro descrito.
3. NÃO recrie a atividade inteira.
4. NÃO mude nenhuma parte que já esteja correta.
5. NÃO altere o título, salvo se o erro informado estiver no título.
6. NÃO altere comandos que não tenham sido mencionados.
7. NÃO altere questões que não tenham sido mencionadas.
8. NÃO altere textos corretos.
9. NÃO altere respostas ou alternativas que não tenham sido mencionadas.
10. NÃO altere desenhos, ilustrações ou figuras que não estejam relacionadas ao erro.
11. NÃO troque personagens, objetos ou imagens corretas.
12. NÃO altere cores.
13. NÃO altere fontes.
14. NÃO altere tamanhos das letras.
15. NÃO altere posições dos elementos.
16. NÃO altere espaçamentos.
17. NÃO altere bordas.
18. NÃO altere linhas de resposta.
19. NÃO altere quantidade de questões.
20. NÃO acrescente novas questões.
21. NÃO remova questões.
22. NÃO acrescente elementos decorativos.
23. NÃO remova elementos decorativos existentes.
24. Preserve exatamente a composição e o layout atual.
25. Preserve a proporção vertical atual da atividade.
26. Preserve o fundo branco.
27. Preserve a qualidade para impressão.
28. Se o professor indicar uma palavra errada, altere somente essa palavra.
29. Se o professor indicar uma figura errada, altere somente essa figura e, quando solicitado, seu rótulo correspondente.
30. Antes de finalizar, compare mentalmente com a imagem original e confirme que nenhuma outra parte foi modificada.

EXEMPLO:
Se o professor disser:
"Na questão 4 aparece uma casa, mas deveria ser uma bola."

Você deve trocar SOMENTE a casa por uma bola.

Todo o restante da atividade precisa permanecer visualmente igual.

Faça agora somente a correção solicitada.
`.trim();

    const resultado =
      await openai.images.edit({
        model: "gpt-image-2",
        image: arquivo,
        prompt: promptCorrecao,
        size: "1024x1536",
        quality: "medium",
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