import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CorpoRequisicao = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  tipoAtividade?: string | null;
  pedido?: string;
  quantidadeQuestoes?: number | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CorpoRequisicao;

    const {
      etapaEnsino,
      serie,
      disciplina,
      tipoAtividade,
      pedido,
      quantidadeQuestoes,
    } = body;

    if (!etapaEnsino || !serie || !disciplina || !pedido?.trim()) {
      return NextResponse.json(
        {
          erro: "Preencha etapa de ensino, série, disciplina e descrição.",
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

Sua tarefa é MELHORAR a descrição escrita pelo professor antes da geração de uma atividade.

Não crie a atividade.
Não crie questões.
Não gere gabarito.
Não explique o que você fez.
Não use títulos como "Descrição melhorada".
Retorne somente a descrição aprimorada.

A descrição final deve:
- manter a intenção original do professor;
- ser clara, objetiva e pedagogicamente útil;
- respeitar rigorosamente a etapa e a série informadas;
- adequar vocabulário, dificuldade e comandos à idade dos alunos;
- acrescentar detalhes úteis quando o pedido estiver muito curto;
- não inventar conteúdos que mudem o objetivo original;
- poder ser editada pelo professor depois;
- ter no máximo 1200 caracteres.

Dados:
Etapa de ensino: ${etapaEnsino}
Série/turma: ${serie}
Disciplina: ${disciplina}
Tipo de atividade: ${tipoAtividade || "não definido"}
Quantidade de questões: ${
      quantidadeQuestoes ?? "não definida"
    }

Descrição original do professor:
${pedido.trim()}
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
            "Não foi possível melhorar a descrição.",
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
          erro: "A IA não retornou uma descrição melhorada.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      descricao: descricao.slice(0, 1200),
    });
  } catch (error) {
    console.error(
      "Erro em /api/melhorar-descricao-atividade:",
      error
    );

    return NextResponse.json(
      {
        erro: "Ocorreu um erro ao melhorar a descrição.",
      },
      { status: 500 }
    );
  }
}