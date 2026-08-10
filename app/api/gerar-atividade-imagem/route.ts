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

  tipoAtividade?: string;

  nivelCacaPalavras?: string | null;
  palavrasCacaPalavras?: string;

  quantidadeAutoditado?: number | null;
  palavrasAutoditado?: string;
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

    const tipoAtividade = String(
      body.tipoAtividade || "mista"
    )
      .trim()
      .toLowerCase();

    const nivelCacaPalavras = String(
      body.nivelCacaPalavras || "facil"
    )
      .trim()
      .toLowerCase();

    const palavrasCacaPalavras = String(
      body.palavrasCacaPalavras || ""
    ).trim();

    const quantidadeAutoditado = Math.max(
      1,
      Math.min(
        10,
        Number(body.quantidadeAutoditado || 6)
      )
    );

    const palavrasAutoditado = String(
      body.palavrasAutoditado || ""
    ).trim();

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

    /*
     * PROMPT BASE
     */
    const promptBase =
      gerarPromptAlfabetizacaoImagem({
        etapaEnsino,
        serie,
        disciplina,
        pedido,
        quantidadeQuestoes,
      });

    /*
     * REGRAS ESPECÍFICAS DE CADA TIPO
     */
    let regrasTipoAtividade = "";

    if (tipoAtividade === "caca_palavras") {
      let regrasNivel = "";

      if (nivelCacaPalavras === "facil") {
        regrasNivel = `
NÍVEL FÁCIL:
- Criar uma grade pequena e visualmente limpa.
- Usar poucas palavras.
- Priorizar palavras na horizontal e vertical.
- Não utilizar palavras invertidas.
- Evitar excesso de letras distratoras.
- Adequar o tamanho da grade à idade dos estudantes.
`;
      }

      if (nivelCacaPalavras === "medio") {
        regrasNivel = `
NÍVEL MÉDIO:
- Criar uma grade de tamanho intermediário.
- Utilizar mais palavras do que no nível fácil.
- Usar palavras na horizontal, vertical e diagonal.
- Pode utilizar algumas palavras invertidas, sem exagerar.
- Acrescentar letras distratoras suficientes para aumentar o desafio.
`;
      }

      if (nivelCacaPalavras === "dificil") {
        regrasNivel = `
NÍVEL DIFÍCIL:
- Criar uma grade maior.
- Utilizar várias palavras.
- Distribuir palavras na horizontal, vertical e diagonal.
- Utilizar também palavras invertidas.
- Acrescentar mais letras distratoras.
- O caça-palavras deve ser desafiador, mas solucionável.
`;
      }

      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: CAÇA-PALAVRAS.

Crie uma atividade de caça-palavras verdadeira e funcional.

${regrasNivel}

REGRAS OBRIGATÓRIAS DO CAÇA-PALAVRAS:
- Todas as palavras apresentadas ao estudante devem realmente existir dentro da grade.
- Não inventar palavras na lista que não estejam na grade.
- Não colocar palavras incompletas.
- Não trocar letras das palavras.
- Conferir a grade antes de finalizar.
- Colocar um comando claro, como "Encontre as palavras no caça-palavras".
- Mostrar abaixo ou acima da grade a lista de palavras que devem ser encontradas.
- Utilizar letras maiúsculas, nítidas e centralizadas.
- A grade deve ter células regulares e alinhadas.
- Não mostrar as respostas destacadas.
- Não circular ou marcar as palavras encontradas.
- A folha deve permanecer adequada para impressão em preto e branco.

${
  palavrasCacaPalavras
    ? `
PALAVRAS INFORMADAS PELO PROFESSOR:
${palavrasCacaPalavras}

REGRA MUITO IMPORTANTE:
- Utilizar obrigatoriamente todas as palavras informadas pelo professor.
- Não substituir essas palavras por outras.
- É permitido acrescentar outras palavras somente se necessário para completar pedagogicamente a atividade.
`
    : `
O professor não informou palavras específicas.
Escolha palavras adequadas ao conteúdo solicitado, à disciplina e à série.
`
}
`;
    }

    if (tipoAtividade === "autoditado") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: AUTODITADO.

Crie uma atividade de autoditado verdadeira.

QUANTIDADE:
- Utilizar exatamente ${quantidadeAutoditado} imagens/palavras.

REGRAS OBRIGATÓRIAS DO AUTODITADO:
- Cada item deve apresentar uma figura clara e facilmente reconhecível.
- Abaixo de cada figura, colocar uma linha ou espaço adequado para o estudante escrever o nome.
- Não escrever o nome da figura junto da imagem.
- Não revelar a resposta.
- Não usar legendas com a palavra que o aluno deverá escrever.
- As figuras devem ser simples, escolares, nítidas e adequadas à idade.
- Evitar imagens ambíguas.
- Organizar os itens com bom espaçamento.
- Para alfabetização, priorizar figuras de objetos, animais, alimentos ou elementos conhecidos pelas crianças.
- As imagens devem ser pequenas o suficiente para caber bem na folha, mas grandes o suficiente para serem reconhecidas.

${
  palavrasAutoditado
    ? `
PALAVRAS INFORMADAS PELO PROFESSOR:
${palavrasAutoditado}

REGRA MUITO IMPORTANTE:
- Criar imagens correspondentes às palavras informadas.
- Utilizar obrigatoriamente as palavras fornecidas pelo professor, respeitando o limite solicitado.
- Não mostrar as palavras escritas ao aluno.
`
    : `
O professor não informou palavras específicas.
Escolha palavras adequadas ao conteúdo, à série e à disciplina.
`
}
`;
    }

    if (tipoAtividade === "cruzadinha") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: CRUZADINHA.

REGRAS:
- Criar uma cruzadinha verdadeira e funcional.
- As palavras devem se cruzar corretamente.
- Numerar as palavras na grade.
- Criar pistas correspondentes à numeração.
- Não mostrar as respostas preenchidas.
- Utilizar quadrinhos bem alinhados.
- Não criar uma simples lista de perguntas fingindo ser uma cruzadinha.
- Conferir se cada resposta cabe corretamente na quantidade de quadrinhos.
`;
    }

    if (tipoAtividade === "complete") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: COMPLETE.

REGRAS:
- Criar exercícios de completar palavras, frases ou informações.
- Deixar espaços adequados para o estudante escrever.
- Não mostrar as respostas.
- Adequar a dificuldade à série.
`;
    }

    if (tipoAtividade === "ligue") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: LIGUE.

REGRAS:
- Criar duas colunas visualmente organizadas.
- O estudante deverá relacionar corretamente os elementos.
- Não desenhar previamente as linhas das respostas.
- Garantir correspondência lógica entre os itens.
`;
    }

    if (tipoAtividade === "multipla_escolha") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: MÚLTIPLA ESCOLHA.

REGRAS:
- Criar questões com alternativas claras.
- Utilizar alternativas A, B, C e D quando adequado.
- Apenas uma alternativa deve ser correta por questão.
- Não destacar a resposta correta.
`;
    }

    if (tipoAtividade === "verdadeiro_falso") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: VERDADEIRO OU FALSO.

REGRAS:
- Criar afirmações claras relacionadas ao conteúdo.
- Colocar espaço para o estudante marcar V ou F.
- Misturar afirmações verdadeiras e falsas.
- Não mostrar o gabarito.
`;
    }

    if (tipoAtividade === "leitura_escrita") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: LEITURA E ESCRITA.

REGRAS:
- Criar atividade adequada ao nível de leitura da turma.
- Incluir pequenos textos, palavras ou frases quando pertinente.
- Criar espaços adequados para resposta escrita.
- Evitar textos longos para estudantes em alfabetização.
`;
    }

    if (tipoAtividade === "mista") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE: ATIVIDADE MISTA.

REGRAS:
- Misturar diferentes formatos de exercícios.
- Variar os tipos de questão.
- Escolher formatos adequados à série, disciplina e conteúdo.
- Não repetir o mesmo modelo em todas as questões.
`;
    }

    /*
     * PROMPT FINAL
     */
    const promptFinal = `
${promptBase}

==================================================
CONFIGURAÇÃO ESPECÍFICA ESCOLHIDA PELO PROFESSOR
==================================================

${regrasTipoAtividade}

REGRA FINAL:
A configuração escolhida pelo professor tem prioridade.
Não substituir o tipo de atividade solicitado por outro formato.
`;

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
      promptFinal,
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