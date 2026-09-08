import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CorpoRequisicao = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  conteudos?: string;
  dificuldade?: string | null;
  quantidadeQuestoes?: number | null;
  pedido?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CorpoRequisicao;

    const {
      etapaEnsino,
      serie,
      disciplina,
      conteudos,
      dificuldade,
      quantidadeQuestoes,
      pedido,
    } = body;

    const textoOriginal = pedido?.trim() || conteudos?.trim() || "";

    if (!etapaEnsino || !serie || !disciplina || !textoOriginal) {
      return NextResponse.json(
        {
          erro:
            "Preencha etapa de ensino, série, disciplina e o conteúdo da avaliação.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY não configurada.");

      return NextResponse.json(
        {
          erro: "A inteligência artificial não está configurada no servidor.",
        },
        { status: 500 }
      );
    }

    const instrucao = `
Você é uma assistente pedagógica do PlanejAI.

Sua tarefa é MELHORAR o pedido escrito pelo professor para a criação de uma avaliação escolar.

IMPORTANTE:
- Não crie a avaliação.
- Não escreva as questões.
- Não produza gabarito.
- Não explique o que você fez.
- Não use títulos como "Descrição melhorada".
- Retorne somente o pedido aprimorado.

A versão melhorada deve:
- preservar a intenção original do professor;
- organizar melhor os conteúdos que deverão ser avaliados;
- ser clara, objetiva e útil para orientar a geração da avaliação;
- respeitar rigorosamente a etapa de ensino e a série/turma;
- adequar dificuldade, linguagem e profundidade ao nível escolar;
- acrescentar detalhes pedagógicos úteis quando o pedido estiver muito simples;
- não inventar conteúdos diferentes dos informados pelo professor;
- permanecer editável pelo professor antes da geração;
- ter no máximo 1200 caracteres.

DADOS DA AVALIAÇÃO:

Etapa de ensino: ${etapaEnsino}
Série/turma: ${serie}
Disciplina: ${disciplina}
Dificuldade: ${dificuldade || "não definida"}
Quantidade de questões: ${quantidadeQuestoes ?? "não definida"}

Pedido/conteúdo original do professor:
${textoOriginal}
`.trim();

    const respostaOpenAI = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          input: instrucao,
        }),
      }
    );

    const dados = await respostaOpenAI.json();

    if (!respostaOpenAI.ok) {
      console.error("Erro retornado pela OpenAI:", dados);

      return NextResponse.json(
        {
          erro:
            dados?.error?.message ||
            "Não foi possível melhorar a descrição da avaliação.",
        },
        { status: respostaOpenAI.status }
      );
    }

    const descricao =
      typeof dados?.output_text === "string"
        ? dados.output_text.trim()
        : "";

    if (!descricao) {
      console.error(
        "A OpenAI respondeu, mas não retornou output_text:",
        dados
      );

      return NextResponse.json(
        {
          erro: "A IA não retornou a descrição melhorada.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      descricao: descricao.slice(0, 1200),
    });
  } catch (error) {
    console.error(
      "Erro em /api/melhorar-descricao-avaliacao:",
      error
    );

    return NextResponse.json(
      {
        erro: "Ocorreu um erro ao melhorar a descrição da avaliação.",
      },
      { status: 500 }
    );
  }
}