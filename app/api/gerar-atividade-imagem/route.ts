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

  quantidadeQuestoes?: number | null;

  tipoAtividade?: string | null;

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

    /*
     * Quantidade de questões agora é realmente opcional.
     * Se o professor não preencher, fica null.
     */
    const quantidadeQuestoes =
      body.quantidadeQuestoes === null ||
      body.quantidadeQuestoes === undefined ||
      body.quantidadeQuestoes === ("" as unknown)
        ? null
        : Math.max(
            1,
            Math.min(
              20,
              Number(body.quantidadeQuestoes)
            )
          );

    /*
     * Tipo de atividade também é realmente opcional.
     * Não transformamos mais automaticamente em "mista".
     */
    const tipoAtividade = String(
      body.tipoAtividade || ""
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

    /*
     * Quantidade do autoditado é independente
     * da quantidade de questões.
     */
    const quantidadeAutoditado =
      body.quantidadeAutoditado === null ||
      body.quantidadeAutoditado === undefined
        ? 6
        : Math.max(
            1,
            Math.min(
              20,
              Number(body.quantidadeAutoditado)
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

    /*
     * NENHUM TIPO SELECIONADO
     */
    if (!tipoAtividade) {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE NÃO DEFINIDO PELO PROFESSOR.

O professor preferiu não escolher um formato específico.

REGRAS:
- Interpretar diretamente o pedido escrito pelo professor.
- Escolher o formato pedagógico mais adequado ao conteúdo.
- Respeitar rigorosamente ${serie}.
- Não assumir automaticamente que a atividade deve ser mista.
- Se o pedido indicar claramente um formato, seguir esse formato.
- Se o pedido não indicar formato, escolher uma organização adequada à série e ao objetivo pedagógico.
`;
    }

    /*
     * CAÇA-PALAVRAS
     */
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

Crie UMA atividade de caça-palavras verdadeira e funcional.

IMPORTANTE:
- Caça-palavras não deve ser tratado como várias questões.
- Não criar questões extras apenas porque existe uma quantidade de questões.
- A atividade principal é o próprio caça-palavras.

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
- Respeitar rigorosamente a dificuldade adequada para ${serie}.

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

Escolha palavras adequadas:
- ao conteúdo solicitado;
- à disciplina;
- e principalmente à série ${serie}.
`
}
`;
    }

    /*
     * AUTODITADO
     */
    if (tipoAtividade === "autoditado") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: AUTODITADO.

Crie uma atividade de autoditado verdadeira.

IMPORTANTE:
- Autoditado não deve ser tratado como várias questões independentes.
- A quantidade abaixo se refere às imagens/palavras do autoditado.

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
- Respeitar rigorosamente a faixa etária e a série ${serie}.

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

Escolha palavras adequadas:
- ao conteúdo;
- à série ${serie};
- e à disciplina ${disciplina}.
`
}
`;
    }

    /*
     * CRUZADINHA
     */
    if (tipoAtividade === "cruzadinha") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: CRUZADINHA.

Crie UMA cruzadinha verdadeira e funcional.

IMPORTANTE:
- A cruzadinha é uma atividade única.
- Não criar várias cruzadinhas apenas para cumprir quantidade de questões.
- As pistas podem ser perguntas, definições ou descrições relacionadas ao conteúdo.
- Quando o professor não fornecer palavras específicas, escolher respostas adequadas ao conteúdo e à série.

REGRAS:

- As palavras devem se cruzar corretamente.
- Numerar as palavras na grade.
- Criar pistas correspondentes à numeração.
- As pistas devem ser adequadas para ${serie}.
- Não mostrar as respostas preenchidas.
- Utilizar quadrinhos bem alinhados.
- Não criar uma simples lista de perguntas fingindo ser uma cruzadinha.
- Conferir se cada resposta cabe corretamente na quantidade de quadrinhos.
`;
    }

    /*
     * COMPLETE
     */
    if (tipoAtividade === "complete") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: COMPLETE.

REGRAS:

- Criar exercícios de completar palavras, frases ou informações.
- Deixar espaços adequados para o estudante escrever.
- Não mostrar as respostas.
- Adequar rigorosamente a dificuldade à série ${serie}.
`;
    }

    /*
     * LIGUE
     */
    if (tipoAtividade === "ligue") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: LIGUE.

REGRAS:

- Criar duas colunas visualmente organizadas.
- O estudante deverá relacionar corretamente os elementos.
- Não desenhar previamente as linhas das respostas.
- Garantir correspondência lógica entre os itens.
- Adequar palavras, imagens e conceitos à série ${serie}.
`;
    }

    /*
     * MÚLTIPLA ESCOLHA
     */
    if (tipoAtividade === "multipla_escolha") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: MÚLTIPLA ESCOLHA.

REGRAS:

- Criar questões com alternativas claras.
- Utilizar alternativas A, B, C e D quando adequado à série.
- Apenas uma alternativa deve ser correta por questão.
- Não destacar a resposta correta.
- Respeitar rigorosamente o nível de ${serie}.
`;
    }

    /*
     * VERDADEIRO OU FALSO
     */
    if (tipoAtividade === "verdadeiro_falso") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: VERDADEIRO OU FALSO.

REGRAS:

- Criar afirmações claras relacionadas ao conteúdo.
- Colocar espaço para o estudante marcar V ou F.
- Misturar afirmações verdadeiras e falsas.
- Não mostrar o gabarito.
- Adequar linguagem e dificuldade à série ${serie}.
`;
    }

    /*
     * LEITURA E ESCRITA
     */
    if (tipoAtividade === "leitura_escrita") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: LEITURA E ESCRITA.

REGRAS:

- Criar atividade adequada ao nível de leitura da turma.
- Incluir pequenos textos, palavras ou frases quando pertinente.
- Criar espaços adequados para resposta escrita.
- Evitar textos longos para estudantes em alfabetização.
- Para séries posteriores, aumentar a complexidade de forma adequada.
- Respeitar rigorosamente ${serie}.
`;
    }

    /*
     * ATIVIDADE MISTA
     */
    if (tipoAtividade === "mista") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE: ATIVIDADE MISTA.

REGRAS:

- Misturar diferentes formatos de exercícios.
- Variar os tipos de questão.
- Escolher formatos adequados à série, disciplina e conteúdo.
- Não repetir o mesmo modelo em todas as questões.
- Organizar do mais simples para o mais complexo.
- Respeitar rigorosamente ${serie}.
`;
    }

    /*
     * ORDENAR
     */
    if (tipoAtividade === "ordene") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: ORDENE / SEQUÊNCIA.

REGRAS:

- Criar atividades em que o estudante organize elementos em uma ordem correta.
- A ordem pode ser temporal, numérica, alfabética, lógica, textual ou relacionada a etapas de um processo.
- Não apresentar os itens já na ordem correta.
- Deixar espaço adequado para o estudante registrar a sequência.
- Utilizar imagens quando forem pedagogicamente úteis.
- Adequar a complexidade à série ${serie}.
- Para crianças pequenas, priorizar sequências simples e visuais.
- Para séries posteriores, permitir sequências conceituais ou processos mais complexos.
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

REGRA FINAL DE SÉRIE:

A atividade é destinada especificamente a:

${serie}

Não ignore essa informação.

Antes de gerar a folha, confira se:
- vocabulário;
- dificuldade;
- quantidade de leitura;
- tamanho dos comandos;
- tipo de resposta;
- imagens;
- conceitos;
- e organização visual

são realmente apropriados para ${serie}.

REGRA FINAL DE CONFIGURAÇÃO:

Quando o professor escolher um tipo específico,
essa configuração tem prioridade.

Quando nenhum tipo for escolhido,
interpretar o pedido livremente e selecionar o formato mais adequado,
sem assumir automaticamente "atividade mista".
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