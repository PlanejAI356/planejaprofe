export type TipoQuestaoJson =
  | "multipla_escolha"
  | "discursiva"
  | "verdadeiro_falso"
  | "complete"
  | "relacione";

type QuantidadesQuestoes = {
  multiplaEscolha: number;
  discursivas: number;
  verdadeiroFalso: number;
  complete: number;
  relacione: number;
};

function normalizarQuantidade(valor: unknown) {
  const numero = Number(valor || 0);

  if (!Number.isFinite(numero) || numero < 0) {
    return 0;
  }

  return Math.floor(numero);
}

function embaralharTipos(
  quantidades: QuantidadesQuestoes
): TipoQuestaoJson[] {
  const tipos: TipoQuestaoJson[] = [
    ...Array(quantidades.multiplaEscolha).fill(
      "multipla_escolha"
    ),
    ...Array(quantidades.discursivas).fill(
      "discursiva"
    ),
    ...Array(quantidades.verdadeiroFalso).fill(
      "verdadeiro_falso"
    ),
    ...Array(quantidades.complete).fill(
      "complete"
    ),
    ...Array(quantidades.relacione).fill(
      "relacione"
    ),
  ];

  for (let indice = tipos.length - 1; indice > 0; indice -= 1) {
    const posicaoAleatoria = Math.floor(
      Math.random() * (indice + 1)
    );

    [tipos[indice], tipos[posicaoAleatoria]] = [
      tipos[posicaoAleatoria],
      tipos[indice],
    ];
  }

  return tipos;
}

function nomeTipo(tipo: TipoQuestaoJson) {
  const nomes: Record<TipoQuestaoJson, string> = {
    multipla_escolha: "Múltipla escolha",
    discursiva: "Discursiva",
    verdadeiro_falso: "Verdadeiro ou falso",
    complete: "Complete",
    relacione: "Relacione as colunas",
  };

  return nomes[tipo];
}

export function gerarPromptProvaJson(body: any) {
  const etapaEnsino =
    body.etapa || body.etapaEnsino || "";

  const serie = body.serie || "";
  const disciplina = body.disciplina || "";
  const conteudos = body.conteudos || "";

  const tipoAvaliacao =
    body.tipoAvaliacao?.trim() ||
    "Avaliação escolar";

  const dificuldade =
    body.dificuldade || "Misto";

  const valorAvaliacao =
    body.valorAvaliacao || "10";

  const quantidades: QuantidadesQuestoes = {
    multiplaEscolha: normalizarQuantidade(
      body.quantidadeMultiplaEscolha
    ),
    discursivas: normalizarQuantidade(
      body.quantidadeDiscursivas
    ),
    verdadeiroFalso: normalizarQuantidade(
      body.quantidadeVerdadeiroFalso
    ),
    complete: normalizarQuantidade(
      body.quantidadeComplete
    ),
    relacione: normalizarQuantidade(
      body.quantidadeRelacione
    ),
  };

  const totalQuestoes =
    quantidades.multiplaEscolha +
    quantidades.discursivas +
    quantidades.verdadeiroFalso +
    quantidades.complete +
    quantidades.relacione;

  const serieNormalizada = serie
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const ehPrimeiroAno =
    serieNormalizada.includes("1º ano") ||
    serieNormalizada.includes("1° ano") ||
    serieNormalizada.includes("1 ano") ||
    serieNormalizada.includes("primeiro ano");

  const ehSegundoAno =
    serieNormalizada.includes("2º ano") ||
    serieNormalizada.includes("2° ano") ||
    serieNormalizada.includes("2 ano") ||
    serieNormalizada.includes("segundo ano");

  const ehTerceiroAno =
    serieNormalizada.includes("3º ano") ||
    serieNormalizada.includes("3° ano") ||
    serieNormalizada.includes("3 ano") ||
    serieNormalizada.includes("terceiro ano");

  const ehQuartoAno =
    serieNormalizada.includes("4º ano") ||
    serieNormalizada.includes("4° ano") ||
    serieNormalizada.includes("4 ano") ||
    serieNormalizada.includes("quarto ano");

  const ehQuintoAno =
    serieNormalizada.includes("5º ano") ||
    serieNormalizada.includes("5° ano") ||
    serieNormalizada.includes("5 ano") ||
    serieNormalizada.includes("quinto ano");

  const ehPrimeiroOuSegundoAno =
    ehPrimeiroAno || ehSegundoAno;

  const ehAnosIniciais =
    ehPrimeiroAno ||
    ehSegundoAno ||
    ehTerceiroAno ||
    ehQuartoAno ||
    ehQuintoAno;

  const ordemTipos =
    embaralharTipos(quantidades);

  const ordemFormatada = ordemTipos
    .map(
      (tipo, indice) =>
        `${indice + 1}. ${nomeTipo(tipo)}`
    )
    .join("\n");

  const regrasEspecificasSerie =
    ehPrimeiroOuSegundoAno
      ? `
REGRAS ESPECÍFICAS PARA O 1º E 2º ANO:

- Escrever título, enunciados, alternativas, afirmativas e itens em CAIXA ALTA.
- Utilizar frases curtas e vocabulário compatível com a alfabetização.
- Evitar textos longos e comandos complicados.
- Priorizar identificação, observação, associação, comparação e complementação.
- Marcar imagemNecessaria como true em várias questões quando o conteúdo permitir.
- As imagens devem ajudar na compreensão, sem revelar a resposta.
- Não infantilizar excessivamente o conteúdo.
`
      : ehAnosIniciais
        ? `
REGRAS ESPECÍFICAS PARA O 3º AO 5º ANO:

- Utilizar linguagem clara e adequada à faixa etária.
- Estimular observação, interpretação, comparação, associação e aplicação.
- Marcar imagemNecessaria como true quando uma imagem, mapa, gráfico, tabela simples, tirinha ou esquema for pedagogicamente útil.
- Não criar perguntas excessivamente simples nem acima do nível da série.
`
        : `
REGRAS ESPECÍFICAS PARA ESTA ETAPA:

- Utilizar linguagem adequada à etapa e à série.
- Estimular interpretação, análise, comparação e aplicação.
- Marcar imagemNecessaria como true somente quando o recurso visual contribuir realmente para a questão.
- Evitar perguntas superficiais ou incompatíveis com o nível da turma.
`;

  return `
Você é especialista em elaboração de avaliações escolares e possui experiência real em sala de aula.

Crie uma avaliação de alta qualidade e devolva SOMENTE um objeto JSON válido.

DADOS DA AVALIAÇÃO:

Etapa de ensino: ${etapaEnsino}
Série ou turma: ${serie}
Disciplina: ${disciplina}
Tipo de avaliação: ${tipoAvaliacao}
Conteúdos avaliados: ${conteudos}
Dificuldade: ${dificuldade}
Valor total: ${valorAvaliacao} pontos
Quantidade total de questões: ${totalQuestoes}

QUANTIDADES OBRIGATÓRIAS:

- Múltipla escolha: ${quantidades.multiplaEscolha}
- Discursivas: ${quantidades.discursivas}
- Verdadeiro ou falso: ${quantidades.verdadeiroFalso}
- Complete: ${quantidades.complete}
- Relacione as colunas: ${quantidades.relacione}

ORDEM OBRIGATÓRIA DOS TIPOS:

${ordemFormatada}

Siga exatamente essa ordem no array "questoes".
Não agrupe os tipos.
Essa sequência foi criada pelo sistema e deve ser respeitada.

FORMATO JSON OBRIGATÓRIO:

{
  "titulo": "${tipoAvaliacao.toUpperCase()} DE ${disciplina.toUpperCase()}",
  "etapaEnsino": "${etapaEnsino}",
  "serie": "${serie}",
  "disciplina": "${disciplina}",
  "tipoAvaliacao": "${tipoAvaliacao}",
  "valorTotal": "${valorAvaliacao}",
  "questoes": [
    {
      "tipo": "multipla_escolha",
      "enunciado": "Texto completo da questão",
      "alternativas": [
        "Alternativa A",
        "Alternativa B",
        "Alternativa C",
        "Alternativa D"
      ],
      "afirmativas": [],
      "bancoPalavras": [],
      "frasesComplete": [],
      "colunaA": [],
      "colunaB": [],
      "linhasResposta": 0,
      "imagemNecessaria": false,
      "descricaoImagem": ""
    }
  ]
}

REGRAS DO JSON:

- Retornar somente JSON válido.
- Não usar blocos de código.
- Não usar crases.
- Não escrever explicações antes ou depois.
- Utilizar aspas duplas em todas as chaves e textos.
- Não inserir comentários.
- Não deixar vírgula depois do último item.
- O array "questoes" deve conter exatamente ${totalQuestoes} objetos.
- Não incluir id nem número da questão; o sistema criará esses dados.
- Todas as propriedades do modelo devem existir em todas as questões.
- Quando uma propriedade não se aplicar, usar array vazio, string vazia, false ou 0.
- Não gerar gabarito, resposta correta, explicação ou critério de correção.
- Não incluir cabeçalho escolar.
- Não incluir valor individual da questão.
- Não escrever linhas feitas com sublinhados.

${regrasEspecificasSerie}

REGRAS GERAIS DAS QUESTÕES:

- Responder somente em português do Brasil.
- Respeitar rigorosamente a série, a disciplina e os conteúdos informados.
- Não cobrar conteúdo que não tenha sido fornecido.
- Criar questões claras, naturais e com linguagem de professor.
- Evitar perguntas genéricas, repetitivas, superficiais ou ambíguas.
- Variar os comandos e as formas de contextualização.
- Não iniciar todas as questões da mesma maneira.
- Distribuir os conteúdos de forma equilibrada.
- Quando a dificuldade for mista, combinar questões fáceis, médias e mais elaboradas.
- Não inventar informações científicas, históricas, geográficas, matemáticas ou gramaticais.
- Cada questão deve possuir uma resposta correta possível.
- Não mencionar inteligência artificial.
- Não usar emojis.

REGRAS PARA IMAGENS:

- Quando a questão realmente precisar de apoio visual, usar:
  "imagemNecessaria": true
- Nesse caso, preencher "descricaoImagem" com uma descrição objetiva e detalhada.
- A descrição deve informar somente o que precisa aparecer na imagem.
- A imagem não pode revelar diretamente a resposta.
- Quando a questão não precisar de imagem, usar:
  "imagemNecessaria": false
  "descricaoImagem": ""
- Nunca escrever [IMAGEM SUGERIDA] dentro do enunciado.
- Nunca afirmar "observe a imagem" quando imagemNecessaria for false.

REGRAS PARA MÚLTIPLA ESCOLHA:

- O tipo deve ser exatamente "multipla_escolha".
- Criar quatro alternativas.
- No array "alternativas", não escrever A), B), C) ou D).
- Apenas uma alternativa deve estar correta.
- As alternativas incorretas devem ser plausíveis.
- Manter tamanhos semelhantes entre as alternativas.
- Não utilizar "todas as alternativas anteriores".
- Não utilizar "nenhuma das alternativas anteriores".
- Não utilizar "mais correta" ou "melhor resposta".
- Usar:
  "afirmativas": []
  "bancoPalavras": []
  "frasesComplete": []
  "colunaA": []
  "colunaB": []
  "linhasResposta": 0

REGRAS PARA DISCURSIVAS:

- O tipo deve ser exatamente "discursiva".
- O enunciado deve conter uma única solicitação principal.
- Variar entre explicar, identificar, descrever, comparar, justificar e aplicar.
- Não criar perguntas excessivamente amplas.
- Definir "linhasResposta" conforme o tamanho esperado:
  2 para resposta curta;
  3 para explicação ou descrição;
  4 para comparação, justificativa ou análise.
- Para o 1º e 2º ano, usar no máximo 2 linhas.
- Usar:
  "alternativas": []
  "afirmativas": []
  "bancoPalavras": []
  "frasesComplete": []
  "colunaA": []
  "colunaB": []

REGRAS PARA VERDADEIRO OU FALSO:

- O tipo deve ser exatamente "verdadeiro_falso".
- O enunciado deve orientar o estudante a marcar V ou F.
- Criar de 3 a 5 afirmativas no array "afirmativas".
- Não colocar letras a), b), c), d) ou e).
- Não colocar (     ) dentro dos textos das afirmativas.
- O sistema adicionará automaticamente (     ) antes de cada afirmativa.
- Misturar afirmativas verdadeiras e falsas sem padrão previsível.
- Evitar afirmações ambíguas.
- Usar:
  "alternativas": []
  "bancoPalavras": []
  "frasesComplete": []
  "colunaA": []
  "colunaB": []
  "linhasResposta": 0

REGRAS PARA COMPLETE:

- O tipo deve ser exatamente "complete".
- O enunciado deve orientar o estudante a completar.
- Criar de 2 a 6 frases curtas no array "frasesComplete".
- Representar cada lacuna dentro das frases com exatamente:
  {{LACUNA}}
- Preencher "bancoPalavras" somente quando ele for pedagogicamente útil.
- Não incluir palavras que não serão usadas.
- Não criar textos longos com muitas lacunas seguidas.
- Usar:
  "alternativas": []
  "afirmativas": []
  "colunaA": []
  "colunaB": []
  "linhasResposta": 0

REGRAS PARA RELACIONAR COLUNAS:

- O tipo deve ser exatamente "relacione".
- O enunciado deve orientar o estudante a relacionar as colunas.
- Criar entre 4 e 6 itens em "colunaA".
- Criar a mesma quantidade de itens em "colunaB".
- Para o 1º e 2º ano, usar no máximo 4 itens.
- Não colocar números em "colunaA".
- Não colocar letras em "colunaB".
- Não colocar as correspondências na mesma ordem.
- Criar correspondências claras e sem ambiguidade.
- Usar:
  "alternativas": []
  "afirmativas": []
  "bancoPalavras": []
  "frasesComplete": []
  "linhasResposta": 0

VERIFICAÇÃO SILENCIOSA ANTES DE RESPONDER:

- O JSON é válido.
- Existem exatamente ${totalQuestoes} questões.
- A ordem dos tipos corresponde exatamente à sequência fornecida.
- A quantidade de cada tipo foi respeitada.
- Todas as propriedades obrigatórias estão presentes.
- Nenhum tipo com quantidade zero foi criado.
- Nenhuma questão apresenta resposta ou gabarito.
- Nenhum enunciado contém [IMAGEM SUGERIDA].
- As questões estão adequadas para ${serie}.
- Os conteúdos estão limitados ao que foi informado.
- As questões não estão agrupadas por tipo.

Entregue somente o JSON.
`;
}