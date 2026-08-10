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

  tipoPistaCruzadinha?: string | null;
  palavrasCruzadinha?: string;

  tipoOrdenacao?: string | null;

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

    const tipoPistaCruzadinha = String(
      body.tipoPistaCruzadinha || "perguntas"
    )
      .trim()
      .toLowerCase();

    const palavrasCruzadinha = String(
      body.palavrasCruzadinha || ""
    ).trim();

    const tipoOrdenacao = String(
      body.tipoOrdenacao || "automatico"
    )
      .trim()
      .toLowerCase();

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
- Usar uma quantidade moderada de palavras adequada à série.
- Distribuir as palavras em POSIÇÕES DIFERENTES da grade.
- Utilizar palavras na horizontal, vertical e algumas diagonais simples.
- Não utilizar palavras invertidas.
- Não colocar várias palavras completas uma embaixo da outra.
- Não concentrar todas as palavras no mesmo canto ou nas mesmas linhas.
- Misturar letras distratoras entre as palavras para que elas não fiquem imediatamente visíveis.
- Manter o desafio fácil, mas o estudante ainda deve precisar procurar as palavras.
- Adequar o tamanho da grade à idade dos estudantes.
`;
      }

      if (nivelCacaPalavras === "medio") {
        regrasNivel = `
NÍVEL MÉDIO:
- Criar uma grade de tamanho intermediário.
- Distribuir as palavras por diferentes regiões da grade.
- Usar palavras na horizontal, vertical e diagonal.
- Pode utilizar algumas palavras invertidas, sem exagerar.
- Não organizar palavras completas em linhas consecutivas.
- Acrescentar letras distratoras suficientes para aumentar o desafio.
- Evitar padrões visuais que entreguem facilmente onde estão as palavras.
`;
      }

      if (nivelCacaPalavras === "dificil") {
        regrasNivel = `
NÍVEL DIFÍCIL:
- Criar uma grade maior.
- Utilizar várias palavras.
- Distribuir as palavras por toda a grade.
- Usar horizontal, vertical e diagonal.
- Utilizar também palavras invertidas.
- Permitir cruzamento e sobreposição de letras quando isso continuar funcional.
- Acrescentar mais letras distratoras.
- Evitar qualquer organização em linhas ou blocos previsvisíveis.
- O caça-palavras deve ser desafiador, mas solucionável.
`;
      }

      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: CAÇA-PALAVRAS.

Crie UMA atividade de caça-palavras verdadeira, funcional e bem distribuída.

IMPORTANTE:
- Caça-palavras não deve ser tratado como várias questões.
- Não criar questões extras apenas porque existe uma quantidade de questões.
- A atividade principal é o próprio caça-palavras.

${regrasNivel}

REGRAS OBRIGATÓRIAS DO CAÇA-PALAVRAS:

- Todas as palavras apresentadas ao estudante devem realmente existir dentro da grade.
- Cada palavra da lista deve aparecer UMA VEZ de forma completa e correta, salvo cruzamentos naturais.
- Não inventar palavras na lista que não estejam na grade.
- Não colocar palavras incompletas.
- Não trocar, omitir ou duplicar letras dentro das palavras.
- Respeitar rigorosamente a ortografia correta em português do Brasil.
- Respeitar acentos e sinais gráficos quando fizerem parte da grafia correta da palavra.
- Se o professor informar as palavras, copiar EXATAMENTE a grafia fornecida por ele.
- Conferir LETRA POR LETRA cada palavra da lista dentro da grade antes de finalizar.
- Conferir novamente palavras com acento, nomes próprios e termos científicos.
- Espalhar as palavras por diferentes linhas, colunas e regiões da grade.
- Não colocar uma sequência de palavras completas uma embaixo da outra.
- Não deixar a localização das palavras óbvia pela diagramação.
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
- Preservar a escrita correta e completa de cada palavra.
- Conferir cada palavra da lista contra a grade antes de gerar a imagem final.
- É permitido acrescentar outras palavras somente se necessário para completar pedagogicamente a atividade.
`
    : `
O professor não informou palavras específicas.

Escolha palavras adequadas:
- ao conteúdo solicitado;
- à disciplina;
- e principalmente à série ${serie}.

Antes de montar a grade, confira a ortografia correta de todas as palavras escolhidas.
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
      let regraTipoPista = "";

      if (tipoPistaCruzadinha === "perguntas") {
        regraTipoPista = `
FORMATO DAS PISTAS: PERGUNTAS.
- Criar perguntas curtas e claras sobre o conteúdo.
- Cada resposta da pergunta deve ser uma palavra que entra na grade.
`;
      }

      if (tipoPistaCruzadinha === "definicoes") {
        regraTipoPista = `
FORMATO DAS PISTAS: DEFINIÇÕES.
- Criar definições curtas e objetivas.
- Cada definição deve levar a uma única palavra-resposta.
`;
      }

      if (tipoPistaCruzadinha === "imagens") {
        regraTipoPista = `
FORMATO DAS PISTAS: IMAGENS.
- Utilizar imagens simples, claras e reconhecíveis como pistas.
- Cada imagem deve representar inequivocamente a palavra-resposta.
- Não escrever a resposta junto da imagem.
- Usar esse formato apenas quando as palavras puderem ser representadas visualmente de forma clara.
`;
      }

      if (tipoPistaCruzadinha === "mista") {
        regraTipoPista = `
FORMATO DAS PISTAS: MISTA.
- Misturar perguntas, definições e imagens somente quando cada formato fizer sentido.
- Manter as pistas claras e adequadas à série.
- Não usar imagem como pista se ela puder gerar ambiguidade.
`;
      }

      const regraQuantidadeCruzadinha =
        quantidadeQuestoes !== null
          ? `
QUANTIDADE DE PALAVRAS/PISTAS:
- Utilizar exatamente ${quantidadeQuestoes} palavras com suas respectivas pistas.
- Nesta atividade, a quantidade informada pelo professor significa quantidade de palavras/pistas da cruzadinha.
`
          : `
QUANTIDADE DE PALAVRAS/PISTAS:
- O professor não informou uma quantidade.
- Escolher uma quantidade que caiba bem na folha e seja adequada à série ${serie}.
`;

      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: CRUZADINHA.

Crie UMA cruzadinha verdadeira, funcional e pedagogicamente coerente.

${regraTipoPista}

${regraQuantidadeCruzadinha}

IMPORTANTE:
- A cruzadinha é uma atividade única.
- Não criar várias cruzadinhas para cumprir quantidade.
- A numeração da grade deve corresponder exatamente à numeração das pistas.
- Cada pista deve ter uma única resposta correta.
- Todas as respostas precisam realmente existir na grade.
- As palavras precisam se cruzar de verdade, compartilhando letras compatíveis.
- Não criar palavras isoladas que não participem da estrutura quando for possível cruzá-las.
- Não criar uma simples lista de perguntas fingindo ser uma cruzadinha.
- Não mostrar nenhuma resposta preenchida.
- Utilizar quadrinhos regulares, alinhados e em quantidade exata para cada resposta.
- Conferir letra por letra se cada resposta cabe nos quadrinhos.
- Conferir rigorosamente ortografia, acentuação e grafia das palavras.
- As pistas devem ser adequadas à idade e ao nível de ${serie}.
- Não utilizar pistas ambíguas.

${
  palavrasCruzadinha
    ? `
PALAVRAS INFORMADAS PELO PROFESSOR:

${palavrasCruzadinha}

REGRAS PARA ESSAS PALAVRAS:
- Utilizar obrigatoriamente as palavras informadas, respeitando a quantidade solicitada quando houver.
- Não trocar essas palavras por outras.
- Preservar a grafia correta.
- Criar pistas coerentes com cada palavra.
- Organizar as palavras para que se cruzem corretamente na grade.
`
    : `
O professor não informou palavras específicas.

Escolha palavras:
- diretamente relacionadas ao conteúdo;
- adequadas à disciplina ${disciplina};
- adequadas à série ${serie};
- e que permitam construir uma cruzadinha funcional.
`
}

REVISÃO OBRIGATÓRIA DA CRUZADINHA:
1. Conferir cada pista.
2. Conferir cada resposta.
3. Conferir a ortografia.
4. Conferir a quantidade de quadrinhos.
5. Conferir todos os cruzamentos.
6. Conferir se a numeração da grade corresponde às pistas.
7. Conferir se nenhuma resposta foi revelada.
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
      let regraOrdenacao = "";

      if (tipoOrdenacao === "processo") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: ETAPAS DE UM PROCESSO.
- Utilizar somente um processo que possua etapas reais e reconhecidas.
- Embaralhar as etapas para o estudante ordenar.
`;
      }

      if (tipoOrdenacao === "acontecimentos") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: SEQUÊNCIA DE ACONTECIMENTOS.
- Utilizar acontecimentos que tenham uma sequência lógica ou temporal verdadeira.
- Embaralhar os acontecimentos antes de apresentá-los.
`;
      }

      if (tipoOrdenacao === "cronologica") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: ORDEM CRONOLÓGICA.
- Utilizar fatos ou eventos que tenham datas ou sequência temporal real.
- Não inventar datas nem relações cronológicas.
`;
      }

      if (tipoOrdenacao === "menor_maior") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: MENOR PARA MAIOR / MAIOR PARA MENOR.
- Usar apenas elementos que possam ser comparados objetivamente pelo critério informado.
- O comando deve dizer claramente se a ordem é crescente ou decrescente.
`;
      }

      if (tipoOrdenacao === "historia") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: SEQUÊNCIA DE UMA HISTÓRIA.
- Criar uma sequência narrativa curta e coerente.
- Embaralhar cenas, frases ou acontecimentos.
- A sequência correta deve ser dedutível pelo estudante.
`;
      }

      if (tipoOrdenacao === "automatico") {
        regraOrdenacao = `
CRITÉRIO: O PLANEJAI DEVE ESCOLHER.
- Examinar o conteúdo e identificar uma sequência REAL que possa ser ordenada.
- Preferir processos, ciclos com começo pedagógico definido, acontecimentos, sequência narrativa, ordem cronológica ou comparação objetiva.
- Se o conteúdo geral não tiver uma ordem natural, escolher dentro dele um aspecto que realmente possua uma sequência.
- NÃO inventar uma ordem artificial apenas para usar o formato Ordene.
`;
      }

      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: ORDENE / SEQUÊNCIA.

${regraOrdenacao}

REGRAS OBRIGATÓRIAS:

- A atividade só pode pedir ordenação quando existir um critério de ordem real, claro e pedagogicamente justificável.
- NÃO inventar sequência para conjuntos que não possuem ordem natural.
- Exemplo do que NÃO fazer: numerar sistemas do corpo humano como se houvesse uma ordem universal entre eles.
- Não atribuir números de resposta aos itens antes do aluno resolver.
- Os itens devem aparecer EMBARALHADOS.
- Deve existir somente um espaço claro para o aluno registrar a ordem: quadrinho vazio, linha ou numeração a preencher.
- Não colocar a resposta correta ao lado, dentro ou acima do item.
- O comando deve explicar exatamente o critério: cronológico, etapas do processo, crescente, sequência da história etc.
- Não usar comandos vagos como "coloque na ordem correta" sem explicar qual ordem.
- Se houver imagens, elas devem ser claras e necessárias para compreender a sequência.
- A sequência deve ser adequada à série ${serie}.
- Para crianças pequenas, usar poucas etapas e forte apoio visual.
- Para séries posteriores, permitir processos conceituais mais complexos.
- Conferir se existe UMA sequência correta e justificável antes de finalizar.

${
  quantidadeQuestoes !== null
    ? `
QUANTIDADE:
- Utilizar ${quantidadeQuestoes} itens/etapas SOMENTE se essa quantidade fizer sentido para a sequência real.
- Nunca inventar etapas extras apenas para atingir o número informado.
`
    : `
QUANTIDADE:
- Escolher uma quantidade de itens/etapas adequada à sequência real e à série.
`
}
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

REGRA FINAL DE QUALIDADE:

- Conferir ortografia e acentuação de TODAS as palavras antes de gerar a imagem.
- Não criar palavras inexistentes, letras trocadas ou palavras incompletas.
- Em atividades com grade, conferir letra por letra antes de finalizar.
- Nunca revelar respostas que o estudante deve descobrir.
- Nunca inventar uma relação pedagógica que não exista apenas para encaixar o conteúdo no formato escolhido.

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