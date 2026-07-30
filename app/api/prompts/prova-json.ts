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
    const incluirBncc = Boolean(body.incluirBncc);

const incluirTextoApoio = Boolean(
  body.incluirTextoApoio
);

const regrasBncc = incluirBncc
  ? `
HABILIDADES DA BNCC:

- Antes de elaborar a avaliação, identifique a habilidade da BNCC mais adequada ao conteúdo.
- Inclua somente o código da habilidade correspondente.
- Não invente códigos.
- Quando houver mais de um conteúdo, utilize as habilidades compatíveis.
`
  : "";

const regrasTextoApoio = incluirTextoApoio
  ? `
TEXTO DE APOIO:

- Antes das questões, crie um texto de apoio relacionado aos conteúdos.
- O texto deve ser adequado à série.
- O texto servirá de base para uma ou mais questões sempre que possível.
`
  : "";

  const regrasDificuldade =
  dificuldade === "Mais fáceis"
    ? `
REGRAS DE DIFICULDADE:

- Criar questões muito acessíveis para a série.
- Usar comandos diretos e objetivos.
- Priorizar reconhecimento, identificação e compreensão básica.
- Evitar pegadinhas, textos longos e raciocínios complexos.
`
    : dificuldade === "Fáceis"
      ? `
REGRAS DE DIFICULDADE:

- Criar questões fáceis, adequadas à série.
- Priorizar compreensão direta e aplicação simples.
- Usar contextualizações curtas.
- Evitar exigência de análise profunda.
`
      : dificuldade === "Médias"
        ? `
REGRAS DE DIFICULDADE:

- Criar questões de nível intermediário.
- Combinar compreensão, interpretação e aplicação.
- Exigir atenção e raciocínio compatíveis com a série.
- Evitar questões excessivamente simples ou muito complexas.
`
        : dificuldade === "Difíceis"
          ? `
REGRAS DE DIFICULDADE:

- Criar questões desafiadoras, mas adequadas à série.
- Exigir interpretação, comparação, análise e aplicação.
- Utilizar situações-problema e contextualizações relevantes.
- Não cobrar conteúdos além dos informados.
`
          : dificuldade === "Mais difíceis"
            ? `
REGRAS DE DIFICULDADE:

- Criar questões de alta complexidade para a série.
- Exigir análise, interpretação, argumentação, comparação e aplicação em novos contextos.
- Utilizar situações-problema mais elaboradas.
- Manter comandos claros e sem ambiguidades.
- Não transformar dificuldade em texto excessivamente longo.
`
            : `
REGRAS DE DIFICULDADE:

- Criar uma avaliação com dificuldade mista.
- Distribuir questões fáceis, médias e difíceis.
- Começar com questões mais acessíveis e aumentar gradualmente a complexidade.
- Manter todas as questões adequadas à série e aos conteúdos informados.
`;

  const sugestaoProfessor =
    String(body.sugestaoProfessor || "").trim();

  const questaoAtual =
    body.questaoAtual
      ? JSON.stringify(body.questaoAtual, null, 2)
      : "";

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

 const ehPrimeiroAoTerceiroAno =
  ehPrimeiroAno ||
  ehSegundoAno ||
  ehTerceiroAno;

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
  ehPrimeiroAoTerceiroAno
    ? `
REGRAS ESPECÍFICAS PARA O 1º, 2º E 3º ANO:

- Toda avaliação deve contribuir para o processo de alfabetização e letramento.
- Adaptar a linguagem, os comandos e o tamanho dos textos à série escolhida.
- Escrever título, enunciados, alternativas, afirmativas e itens em CAIXA ALTA.
- Utilizar frases curtas, comandos diretos e vocabulário conhecido pelos estudantes.
- Evitar textos longos, explicações abstratas e comandos com várias solicitações.
- Criar questões semelhantes às utilizadas por professores alfabetizadores.
- Mesmo em Matemática, Ciências, História, Geografia e outras disciplinas, utilizar leitura de palavras, frases curtas, imagens, associação e interpretação simples.
- O foco na alfabetização não deve substituir o conteúdo da disciplina.
- O estudante deve aprender e demonstrar o conteúdo enquanto desenvolve leitura, escrita, interpretação e compreensão.
- Não criar avaliações formadas apenas por definições ou perguntas conceituais.
- Priorizar observação, reconhecimento, leitura, associação, comparação, ordenação, complementação e produção curta.

PROGRESSÃO POR SÉRIE:

- Para o 1º ano, utilizar palavras, sílabas, imagens, frases muito curtas e comandos simples.
- Para o 2º ano, utilizar frases curtas, pequenos enunciados, leitura de palavras e interpretação simples.
- Para o 3º ano, utilizar pequenos textos, situações curtas, interpretação, organização de ideias e respostas breves.
- Não aplicar ao 1º ano o mesmo nível de leitura exigido no 3º ano.

ESTRATÉGIAS DE ALFABETIZAÇÃO E LETRAMENTO:

- reconhecer letras, números, formas, seres, objetos e situações;
- identificar letras iniciais e finais;
- reconhecer ou formar sílabas;
- completar palavras e frases curtas;
- associar imagens a palavras ou pequenas frases;
- reconhecer palavras que não pertencem a determinado grupo;
- identificar rimas quando o conteúdo for de Língua Portuguesa;
- organizar palavras, imagens, acontecimentos ou etapas em sequência;
- interpretar pequenas cenas;
- identificar informações explícitas;
- relacionar palavra e significado;
- relacionar elemento e função;
- selecionar a frase que corresponde a uma imagem;
- produzir respostas curtas;
- utilizar banco de palavras quando ele facilitar a leitura e a escrita.

REGRAS OBRIGATÓRIAS PARA APOIO VISUAL:

1º ANO
- Todas as questões devem utilizar imagem.
- Todas devem possuir:
  "imagemNecessaria": true
- Todas devem possuir "descricaoImagem".

2º ANO
- Utilizar imagem em até 8 questões.
- Nunca ultrapassar o número total de questões.

3º ANO
- Utilizar imagem em até 5 questões.
- Nunca ultrapassar o número total de questões.

4º ANO
- Utilizar imagem somente quando ela realmente ajudar na compreensão da questão.

5º ANO
- Utilizar imagem somente quando ela realmente ajudar na compreensão da questão.

PADRÃO DAS IMAGENS

- Criar ilustrações educativas simples.
- Utilizar desenho em preto e branco.
- Fundo totalmente branco.
- Traços grossos e bem definidos.
- Estilo atividade escolar para impressão.
- Estilo semelhante às atividades encontradas em livros didáticos dos anos iniciais.
- Sem sombras.
- Sem cenário desnecessário.
- Sem excesso de detalhes.
- Sem personagens realistas.
- Sem elementos decorativos.
- Sem texto, letras, números ou respostas dentro da imagem.
- A imagem deve facilitar a compreensão da questão.
- Nunca revelar a resposta.
- A descrição deve ser suficiente para que o sistema gere automaticamente uma ilustração simples e adequada à série.

FORMATOS RECOMENDADOS:

- observar a imagem e marcar;
- ligar imagem e palavra;
- completar com apoio de imagem;
- ordenar uma sequência ilustrada;
- marcar a palavra correspondente;
- identificar o elemento diferente;
- relacionar elementos;
- verdadeiro ou falso com frases curtas;
- responder com uma palavra ou frase breve;
- interpretar uma pequena cena.

- Para questões discursivas do 1º e 2º ano, usar no máximo 2 linhas.
- Para questões discursivas do 3º ano, usar no máximo 3 linhas.
`
    : ehAnosIniciais
      ? `
REGRAS ESPECÍFICAS PARA O 3º AO 5º ANO:

- Utilizar linguagem clara, objetiva e adequada à faixa etária.
- Estimular observação, interpretação, comparação, associação, aplicação e explicação.
- Evitar questões excessivamente simples ou acima do nível da série.
- Alternar questões diretas com questões contextualizadas.
- Não utilizar textos longos sem necessidade.
- Marcar "imagemNecessaria": true quando uma imagem, mapa, gráfico, tabela simples, tirinha ou esquema for pedagogicamente útil.
- O recurso visual deve contribuir para o raciocínio e não apenas decorar a questão.

ESTRATÉGIAS PEDAGÓGICAS RECOMENDADAS PARA O 3º AO 5º ANO:

- interpretação de textos curtos;
- leitura de imagens, tirinhas e pequenas cenas;
- uso de tabelas e gráficos simples;
- comparação e classificação;
- identificação de causas e consequências;
- completar frases ou conceitos;
- relacionar informações;
- aplicação do conteúdo em situações do cotidiano;
- resolução de situações-problema;
- produção de respostas curtas;
- explicação de procedimentos ou fenômenos;
- ordenação de fatos, etapas ou acontecimentos.
`
      : `
REGRAS ESPECÍFICAS PARA ESTA ETAPA:

- Utilizar linguagem adequada à etapa e à série.
- Estimular interpretação, análise, comparação, aplicação, justificativa e argumentação.
- Evitar perguntas superficiais, meramente decorativas ou incompatíveis com o nível da turma.
- Alternar questões diretas com situações contextualizadas.
- Utilizar textos, mapas, gráficos, tabelas, esquemas ou imagens quando esses recursos contribuírem para a aprendizagem avaliada.
- Marcar "imagemNecessaria": true somente quando o recurso visual tiver função pedagógica real.
- Não criar contextualizações longas apenas para tornar a questão aparentemente difícil.

ESTRATÉGIAS PEDAGÓGICAS RECOMENDADAS:

- interpretação de textos, notícias ou situações do cotidiano;
- análise de gráficos, tabelas, mapas e esquemas;
- estudos de caso;
- situações-problema;
- comparação entre conceitos, processos ou acontecimentos;
- identificação de causas, consequências e relações;
- aplicação do conteúdo em novos contextos;
- justificativa de respostas;
- análise de fenômenos;
- argumentação fundamentada;
- leitura crítica de informações.
`;

  return `
Você é um professor brasileiro extremamente experiente, especialista em avaliação da aprendizagem.

Você conhece profundamente a BNCC, os livros didáticos utilizados nas escolas brasileiras e a realidade das salas de aula do Ensino Fundamental, do Ensino Médio e da EJA.

Sua função não é simplesmente criar perguntas.

Sua função é elaborar uma avaliação pedagógica de alta qualidade, equilibrada, variada e adequada à idade dos estudantes.

Antes de escrever cada questão, pense silenciosamente como um professor experiente:

- O que esta questão pretende avaliar?
- A questão realmente permite verificar essa aprendizagem?
- A linguagem está adequada à série?
- O comando está claro e objetivo?
- A questão está coerente com os conteúdos informados?
- O formato escolhido é adequado à aprendizagem avaliada?

Evite avaliações robotizadas, repetitivas ou compostas apenas por perguntas conceituais.

Crie uma avaliação de alta qualidade e devolva SOMENTE um objeto JSON válido.

PRINCÍPIOS PEDAGÓGICOS DA AVALIAÇÃO:

- A avaliação deve verificar aprendizagens reais e não apenas memorização.
- As questões devem apresentar variedade de comandos, contextos e níveis de raciocínio.
- Não repetir o mesmo modelo de pergunta com pequenas mudanças.
- Utilizar linguagem natural, semelhante à utilizada por professores brasileiros.
- Respeitar a faixa etária, a etapa de ensino e o desenvolvimento dos estudantes.
- Distribuir os conteúdos de maneira equilibrada.
- Contextualizar as questões quando isso contribuir para a compreensão.
- Evitar contextualizações artificiais, longas ou sem relação com o que será avaliado.
- Utilizar recursos visuais somente quando tiverem função pedagógica.
- Cada questão deve avaliar uma aprendizagem claramente identificável.
- A avaliação deve parecer preparada por um professor, e não gerada automaticamente.

DADOS DA AVALIAÇÃO:

Etapa de ensino: ${etapaEnsino}
Série ou turma: ${serie}
Disciplina: ${disciplina}
Tipo de avaliação: ${tipoAvaliacao}
Conteúdos avaliados: ${conteudos}
Dificuldade: ${dificuldade}
Valor total: ${valorAvaliacao} pontos
Quantidade total de questões: ${totalQuestoes}


${regrasBncc}

${regrasTextoApoio}

${regrasDificuldade}

${
  sugestaoProfessor
    ? `
PEDIDO ESPECÍFICO DO PROFESSOR:

${sugestaoProfessor}

QUESTÃO ATUAL QUE DEVE SER ALTERADA:

${questaoAtual}

REGRAS PARA O PEDIDO DO PROFESSOR:
- Gere somente uma nova versão da questão apresentada.
- Preserve o mesmo tipo de questão, salvo quando o professor pedir explicitamente outro tipo.
- Atenda exatamente à alteração solicitada.
- Não copie a questão atual sem mudanças.
- Mantenha o conteúdo, a série e a dificuldade informados.
`
    : ""
}

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
"habilidadesBncc": [],
"textoApoio": "",
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
- A propriedade "habilidadesBncc" deve ser um array de códigos da BNCC quando essa opção estiver ativada.
- Quando a opção de BNCC não estiver ativada, usar "habilidadesBncc": [].
- A propriedade "textoApoio" deve conter o texto produzido quando essa opção estiver ativada.
- Quando a opção de texto de apoio não estiver ativada, usar "textoApoio": "".
- Não inventar códigos da BNCC.
- Quando uma propriedade não se aplicar, usar array vazio, string vazia, false ou 0.
- Não gerar gabarito, resposta correta, explicação ou critério de correção.
- Não incluir cabeçalho escolar.
- Não incluir valor individual da questão.
- Não escrever linhas feitas com sublinhados.

${regrasEspecificasSerie}

REGRAS GERAIS DAS QUESTÕES:
QUALIDADE DOS ENUNCIADOS

- Escrever enunciados claros, objetivos e naturais.
- Evitar comandos ambíguos ou com dupla interpretação.
- Não utilizar linguagem robotizada.
- Variar a forma de iniciar os enunciados.
- Evitar começar muitas questões com "Marque", "Assinale", "Explique" ou "Qual".
- Utilizar verbos variados, como identificar, observar, relacionar, comparar, completar, interpretar, justificar, descrever, analisar e reconhecer.
- Sempre adequar o tamanho do enunciado à série.
- Quando utilizar situações do cotidiano, elas devem ser naturais e relacionadas ao conteúdo.
- O enunciado deve avaliar o conteúdo e não a dificuldade de leitura.

ESTRATÉGIAS PEDAGÓGICAS POR DISCIPLINA:
- Língua Portuguesa: utilizar interpretação, gêneros textuais, poemas, tirinhas, ortografia, formação de palavras, sílabas, rimas, leitura de imagens e produção curta, conforme a série.
- Matemática: utilizar situações-problema, cálculo, comparação, sequências, medidas, figuras geométricas, gráficos, tabelas e interpretação de dados, conforme o conteúdo.
- Ciências e Biologia: utilizar situações do cotidiano, observação de fenômenos, experimentos descritos, esquemas, ciclos, classificação, imagens, gráficos e relações entre ciência, saúde e ambiente.
- História: utilizar fontes históricas, linhas do tempo, imagens, acontecimentos, relações de causa e consequência, mudanças, permanências e comparação entre períodos.
- Geografia: utilizar mapas, paisagens, gráficos, tabelas, localização, comparação de espaços, relações sociedade-natureza e situações do cotidiano.
- Arte: utilizar imagens, obras, elementos visuais, processos de criação, contextos culturais e leitura de produções artísticas.
- Educação Física: utilizar práticas corporais, regras, saúde, movimento, jogos, esportes, danças, lutas e situações de convivência.
- Ensino Religioso: utilizar diversidade cultural e religiosa, valores, símbolos, tradições, respeito e convivência, sem favorecer uma religião.
- Inglês: utilizar vocabulário contextualizado, pequenos diálogos, associação entre imagem e palavra, leitura curta e estruturas compatíveis com a série.
- Filosofia: utilizar situações-problema, conceitos, textos curtos, comparação de ideias, reflexão e argumentação adequada à etapa.
- Computação: utilizar pensamento computacional, padrões, sequências, algoritmos, cultura digital, segurança, dados e resolução de problemas.
- Não force uma estratégia que não combine com o conteúdo informado.
- A disciplina deve orientar o formato das questões, mas as quantidades de cada tipo definidas pelo professor devem ser respeitadas.
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
PLANEJAMENTO INTERNO DA AVALIAÇÃO:
ANTES DE ESCREVER A PRIMEIRA QUESTÃO:

- Analise todos os conteúdos informados pelo professor.
- Defina mentalmente quais conteúdos aparecerão em cada questão.
- Escolha o melhor tipo de questão para avaliar cada aprendizagem.
- Defina quais questões utilizarão imagens de acordo com as regras da série.
- Garanta variedade de comandos durante toda a avaliação.
- Evite concentrar muitas questões sobre o mesmo conteúdo.
- Faça a avaliação parecer elaborada por um professor experiente e não por um modelo de inteligência artificial.
- Antes de escrever as questões, distribua mentalmente os conteúdos entre elas.
- Não concentre todas as questões no primeiro conteúdo informado.
- Quando houver mais de um conteúdo, garantir que todos apareçam na avaliação.
DISTRIBUIÇÃO DOS CONTEÚDOS

- Distribuir os conteúdos de forma proporcional entre as questões.
- Evitar que um conteúdo apareça muitas vezes enquanto outro apareça apenas uma vez.
- Quando houver poucos conteúdos, aprofundar cada um com estratégias diferentes.
- Quando houver muitos conteúdos, garantir que todos sejam contemplados pelo menos uma vez, sempre que a quantidade de questões permitir.
- Variar o tipo de questão utilizado para cada conteúdo.
- Sempre que possível, integrar dois conteúdos relacionados em uma mesma questão de forma natural.
- Evitar avaliar exatamente a mesma aprendizagem em questões diferentes.
- Mesmo quando houver várias questões do mesmo tipo, variar o formato pedagógico.

EXEMPLOS DE VARIAÇÃO DENTRO DO MESMO TIPO:

- Uma questão de múltipla escolha pode utilizar uma situação do cotidiano.
- Outra pode utilizar uma imagem.
- Outra pode apresentar uma pequena descrição.
- Outra pode exigir comparação.
- Outra pode envolver interpretação de tabela, gráfico, mapa ou esquema.

- Uma questão discursiva pode solicitar identificação.
- Outra pode solicitar explicação.
- Outra pode solicitar comparação.
- Outra pode solicitar justificativa.
- Outra pode solicitar aplicação em uma situação prática.

- Uma questão de verdadeiro ou falso pode avaliar conceitos.
- Outra pode avaliar relações de causa e consequência.
- Outra pode avaliar etapas, características ou situações do cotidiano.

- Uma questão de completar pode utilizar frases independentes.
- Outra pode utilizar palavras de um banco.
- Outra pode completar uma sequência, classificação ou pequeno conceito.

- Uma questão de relacionar pode associar conceito e definição.
- Outra pode associar imagem e palavra.
- Outra pode associar elemento e função.
- Outra pode associar fato e consequência.

REGRAS CONTRA REPETIÇÃO:

- Não repetir o mesmo início de enunciado em várias questões.
- Não substituir apenas uma palavra para criar uma nova questão.
- Não repetir as mesmas alternativas em questões diferentes.
- Não criar várias perguntas cuja resposta seja praticamente igual.
- Não utilizar o mesmo contexto em toda a avaliação.
- Não iniciar todas as questões com "qual", "o que é", "explique" ou "marque".
- Alternar verbos de comando de acordo com a série.
PROCESSO DE DECISÃO PARA USO DE IMAGENS

Antes de criar cada questão, siga esta sequência:

1. Pense qual é a melhor forma de avaliar aquela aprendizagem.
2. Decida se uma imagem realmente melhora a compreensão da questão.
3. Somente depois defina "imagemNecessaria".
4. Nunca utilize imagens apenas para deixar a avaliação mais bonita.
5. Cada imagem deve possuir uma função pedagógica clara.
6. Quando utilizar imagem, ela deve complementar o enunciado e nunca substituir totalmente a leitura.
7. A imagem deve ser compatível com a idade e a série dos estudantes.
8. Evite repetir o mesmo tipo de imagem em várias questões da mesma avaliação.
9. Priorize imagens de objetos, animais, plantas, mapas, cenas, esquemas, gráficos simples, sequências e situações do cotidiano.
10. A descrição da imagem deve ser suficiente para gerar automaticamente uma ilustração de qualidade.
VARIEDADE NAS QUESTÕES COM IMAGEM

Quando utilizar imagens, variar o formato das questões durante a avaliação.

Evitar repetir várias questões iguais.

Utilizar diferentes estratégias, como:

- observar e marcar a alternativa correta;
- identificar um elemento da imagem;
- ligar imagem e palavra;
- relacionar imagem e função;
- ordenar uma sequência ilustrada;
- comparar duas imagens;
- identificar diferenças ou semelhanças;
- completar uma frase utilizando a imagem;
- interpretar uma pequena cena;
- classificar elementos apresentados na imagem;
- identificar partes de um objeto, animal, planta ou corpo humano;
- interpretar mapas, gráficos, tabelas ou esquemas quando adequado ao conteúdo;
- utilizar imagens em situações-problema.

Não repetir o mesmo modelo de questão com imagem várias vezes na mesma avaliação.

REGRAS PARA IMAGENS:

- Quando a questão realmente precisar de apoio visual, usar:
  "imagemNecessaria": true
- Nesse caso, preencher obrigatoriamente "descricaoImagem".
- A descrição deve ser extremamente detalhada.
- Descrever todos os elementos que devem aparecer na ilustração.
- Informar a posição dos principais elementos quando necessário.
- Informar quantidade, características, formato, tamanho relativo e aparência dos objetos.
- Informar o contexto da cena quando existir.
- A descrição deve ser suficiente para gerar a imagem sem necessidade de informações adicionais.
- Descrever apenas o que deve aparecer na ilustração.
- Nunca descrever a resposta correta.
- Nunca pedir textos, letras, números ou alternativas dentro da imagem.
- Sempre imaginar que a imagem será utilizada em uma atividade escolar impressa para crianças.
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
QUALIDADE DAS ALTERNATIVAS

- As alternativas incorretas devem representar erros comuns cometidos pelos estudantes.
- Evitar alternativas absurdas ou obviamente erradas.
- Todas as alternativas devem possuir tamanho semelhante.
- Evitar que a resposta correta seja sempre a mais longa.
- Evitar repetir palavras que revelem facilmente a resposta correta.
- As alternativas devem exigir leitura e raciocínio antes da escolha.
- Quando possível, utilizar alternativas que representem diferentes formas de pensar sobre o conteúdo.
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
REVISÃO SILENCIOSA DE CADA QUESTÃO

Antes de finalizar cada questão, verifique:

- O comando está claro?
- Existe apenas uma interpretação possível?
- A linguagem está adequada à série?
- A questão realmente avalia o conteúdo?
- Existe apenas uma resposta correta?
- A imagem ajuda na aprendizagem?
- A questão parece elaborada por um professor experiente?

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