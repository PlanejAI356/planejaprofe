import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const descricao = String(body.descricao || "").trim();

    if (!descricao) {
      return NextResponse.json(
        { erro: "A descrição da imagem não foi informada." },
        { status: 400 }
      );
    }

    if (descricao.length > 1500) {
      return NextResponse.json(
        { erro: "A descrição da imagem está muito longa." },
        { status: 400 }
      );
    }

    const prompt = `
Crie uma ilustração didática para uma avaliação escolar.

DESCRIÇÃO:
${descricao}

REGRAS OBRIGATÓRIAS:
- Produzir uma imagem educativa, clara e adequada para estudantes.
- Usar fundo branco ou muito claro.
- Manter composição simples e fácil de interpretar.
- Não incluir moldura decorativa.
- Não incluir título, legenda, letras, números, nomes ou qualquer texto na imagem.
- Não mostrar a resposta da questão de forma explícita.
- Evitar excesso de elementos.
- Manter boa nitidez para impressão em papel A4.
- Usar estilo de ilustração didática, não fotografia, salvo quando a descrição exigir realismo científico.
`.trim();

    const resultado = await openai.images.generate({
      model: "gpt-image-2",
      prompt,
      size: "1024x1024",
      quality: "low",
      output_format: "jpeg",
      output_compression: 70,
    });

    const imagemBase64 = resultado.data?.[0]?.b64_json;

    if (!imagemBase64) {
      return NextResponse.json(
        { erro: "A imagem não foi retornada pela inteligência artificial." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imagem: `data:image/jpeg;base64,${imagemBase64}`,
    });
  } catch (error) {
    console.error("Erro ao gerar imagem da avaliação:", error);

    const mensagem =
      error instanceof Error
        ? error.message
        : "Não foi possível gerar a imagem.";

    return NextResponse.json(
      { erro: mensagem },
      { status: 500 }
    );
  }
}