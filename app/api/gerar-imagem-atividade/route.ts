import OpenAI from "openai";
import { NextResponse } from "next/server";
import { gerarPromptAlfabetizacaoImagem } from "../prompts/alfabetizacaoImagem";

export const runtime = "nodejs";
export const maxDuration = 180;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CorpoRequisicao = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  pedido?: string;
  quantidadeQuestoes?: number;
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CorpoRequisicao;

    const etapaEnsino = String(
      body.etapaEnsino || ""
    ).trim();

    const serie = String(
      body.serie || ""
    ).trim();

    const disciplina = String(
      body.disciplina || ""
    ).trim();

    const pedido = String(
      body.pedido || ""
    ).trim();

    const quantidadeQuestoes = Math.max(
      1,
      Math.min(
        10,
        Number(body.quantidadeQuestoes || 6)
      )
    );

    if (!etapaEnsino) {
      return NextResponse.json(
        {
          erro:
            "A etapa de ensino não foi informada.",
        },
        { status: 400 }
      );
    }

    if (!serie) {
      return NextResponse.json(
        {
          erro:
            "A série ou turma não foi informada.",
        },
        { status: 400 }
      );
    }

    if (!disciplina) {
      return NextResponse.json(
        {
          erro:
            "A disciplina não foi informada.",
        },
        { status: 400 }
      );
    }

    if (!pedido) {
      return NextResponse.json(
        {
          erro:
            "Descreva a atividade que deseja criar.",
        },
        { status: 400 }
      );
    }

    const promptFinal =
      gerarPromptAlfabetizacaoImagem({
        etapaEnsino,
        serie,
        disciplina,
        pedido,
        quantidadeQuestoes,
      });

    const resultado =
      await openai.images.generate({
        model: "gpt-image-2",
        prompt: promptFinal,
        size: "1024x1536",
        quality: "medium",
        output_format: "jpeg",
        output_compression: 90,
      });

    const imagemBase64 =
      resultado.data?.[0]?.b64_json;

    if (!imagemBase64) {
      return NextResponse.json(
        {
          erro:
            "A atividade não foi retornada pela inteligência artificial.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imagem: `data:image/jpeg;base64,${imagemBase64}`,
    });
  } catch (error) {
    console.error(
      "Erro ao gerar atividade em imagem:",
      error
    );

    const mensagem =
      error instanceof Error
        ? error.message
        : "Não foi possível gerar a atividade.";

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