import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CorpoRequisicao = {
  descricao?: string;
  palavra?: string;
  estilo?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CorpoRequisicao;

    const descricao = String(
      body.descricao || body.palavra || ""
    ).trim();

    const estilo = String(
      body.estilo || "ilustração infantil didática"
    ).trim();

    if (!descricao) {
      return NextResponse.json(
        {
          erro:
            "A descrição da figura não foi informada.",
        },
        { status: 400 }
      );
    }

    if (descricao.length > 500) {
      return NextResponse.json(
        {
          erro:
            "A descrição da figura está muito longa.",
        },
        { status: 400 }
      );
    }

    const prompt = `
Crie UMA ÚNICA FIGURA para uma atividade pedagógica infantil.

OBJETO OU PERSONAGEM:
${descricao}

ESTILO:
${estilo}

REGRAS OBRIGATÓRIAS:
- Mostrar somente um objeto, animal, alimento, brinquedo, pessoa ou personagem principal.
- Manter o elemento inteiro e centralizado.
- Usar fundo branco puro.
- Não criar cenário.
- Não criar moldura.
- Não adicionar sombras fortes.
- Não adicionar outros objetos decorativos.
- Não escrever nenhuma palavra.
- Não escrever letras.
- Não escrever números.
- Não criar legenda.
- Não criar título.
- Não criar marca-d'água.
- Não mostrar a resposta escrita.
- Usar contorno nítido e formas fáceis de reconhecer.
- Criar uma ilustração educativa apropriada para crianças.
- Manter boa nitidez para impressão em folha A4.
- A figura deve funcionar bem em tamanho pequeno dentro de um exercício.
- Evitar detalhes excessivos.
- Não cortar nenhuma parte importante do objeto.
`.trim();

    const resultado = await openai.images.generate({
      model: "gpt-image-2",
      prompt,
      size: "1024x1024",
      quality: "low",
      output_format: "jpeg",
      output_compression: 75,
    });

    const imagemBase64 =
      resultado.data?.[0]?.b64_json;

    if (!imagemBase64) {
      return NextResponse.json(
        {
          erro:
            "A figura não foi retornada pela inteligência artificial.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imagem: `data:image/jpeg;base64,${imagemBase64}`,
    });
  } catch (error) {
    console.error(
      "Erro ao gerar imagem da atividade:",
      error
    );

    const mensagem =
      error instanceof Error
        ? error.message
        : "Não foi possível gerar a figura.";

    return NextResponse.json(
      { erro: mensagem },
      { status: 500 }
    );
  }
}