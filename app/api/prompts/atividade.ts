type ModoCriacao = "automatica" | "personalizada";

type DadosAtividade = {
  modoCriacao?: ModoCriacao;
  etapaEnsino?: string;
  etapa?: string;
  serie?: string;
  disciplina?: string;
  conteudo?: string;
  trabalhadoSala?: string;
  pedidoPersonalizado?: string;
  observacoes?: string;
  quantidadeQuestoes?: number;
  quantidadePaginas?: number;
  fonteAtividade?: string;
  usarMaiusculas?: boolean;
};

export function gerarPromptAtividade(body: DadosAtividade) {
  const modoCriacao: ModoCriacao =
    body.modoCriacao === "personalizada"
      ? "personalizada"
      : "automatica";

  const etapaEnsino = String(
    body.etapaEnsino || body.etapa || ""
  ).trim();

  const serie = String(body.serie || "").trim();
  const disciplina = String(body.disciplina || "").trim();
  const conteudo = String(body.conteudo || "").trim();

  const trabalhadoSala = String(
    body.trabalhadoSala || ""
  ).trim();

  const pedidoPersonalizado = String(
    body.pedidoPersonalizado || ""
  ).trim();

  const observacoes = String(
    body.observacoes || ""
  ).trim();

  const quantidadeQuestoesRecebida = Number(
    body.quantidadeQuestoes || 6
  );

  const quantidadeQuestoes = Number.isFinite(
    quantidadeQuestoesRecebida
  )
    ? Math.max(4, Math.min(10, Math.floor(quantidadeQuestoesRecebida)))
    : 6;

  const quantidadePaginasRecebida = Number(
    body.quantidadePaginas || 1
  );

  const quantidadePaginas = Number.isFinite(
    quantidadePaginasRecebida
  )
    ? Math.max(1, Math.min(3, quantidadePaginasRecebida))
    : 1;

  const fonteAtividade = String(
    body.fonteAtividade || "Times New Roman"
  ).trim();

  const usarMaiusculas =
    body.usarMaiusculas === true ||
    etapaEnsino === "Educação Infantil" ||
    serie === "1º ano" ||
    serie === "2º ano";

  if (!etapaEnsino) {
    throw new Error(
      "A etapa de ensino é obrigatória para gerar a atividade."
    );
  }

  if (!serie) {
    throw new Error(
      "A série ou turma é obrigatória para gerar a atividade."
    );
  }

  if (!disciplina) {
    throw new Error(
      "A disciplina é obrigatória para gerar a atividade."
    );
  }

  if (!conteudo) {
    throw new Error(
      "O conteúdo é obrigatório para gerar a atividade."
    );
  }

  if (
    modoCriacao === "personalizada" &&
    !pedidoPersonalizado
  ) {
    throw new Error(
      "O pedido da atividade personalizada é obrigatório."
    );
  }

  const ehEducacaoInfantil =
    etapaEnsino === "Educação Infantil";

  const ehPrimeiroAno = serie === "1º ano";
  const ehSegundoAno = serie === "2º ano";
  const ehTerceiroAno = serie === "3º ano";
  const ehQuartoOuQuintoAno =
    serie === "4º ano" || serie === "5º ano";

  const ehAnosIniciais =
    etapaEnsino ===
    "Ensino Fundamental - Anos Iniciais";

  const ehAnosFinais =
    etapaEnsino ===
    "Ensino Fundamental - Anos Finais";

  const ehEnsinoMedio =
    etapaEnsino === "Ensino Médio";

  const ehEJA = etapaEnsino === "EJA";

  const quantidadeExercicios = quantidadeQuestoes;

  const regraEscrita = usarMaiusculas
    ? `
REGRA OBRIGATÓRIA DE ESCRITA:
- Escrever TODO o conteúdo visível ao aluno em LETRAS MAIÚSCULAS.
- Isso inclui título, subtítulo, comandos, textos, palavras, frases, alternativas, pistas e itens.
- Preservar corretamente acentos, cedilha e pontuação.
- Não usar letras minúsculas em nenhuma parte destinada ao aluno.
- A fonte de apresentação será ${fonteAtividade}.
`
    : `
REGRA OBRIGATÓRIA DE ESCRITA:
- Usar escrita normal, com letras maiúsculas e minúsculas conforme as regras da língua portuguesa.
- Não escrever todo o material em caixa alta.
- A fonte de apresentação será ${fonteAtividade}.
`;

  const regrasEtapa = ehEducacaoInfantil
    ? `
REGRAS ESPECÍFICAS DA EDUCAÇÃO INFANTIL:
- Criar propostas lúdicas, visuais, motoras, orais e de exploração.
- Usar comandos muito curtos e uma ação por comando.
- Priorizar pintar, ligar, contornar, cobrir, circular, observar, comparar e completar oralmente.
- Evitar leitura extensa, cópia longa e excesso de escrita.
- Usar imagens simples, pequenas, isoladas e fáceis de reconhecer.
- Deixar espaço amplo entre os elementos.
- Não criar avaliação formal, nota, prova ou perguntas discursivas longas.
- Adequar as propostas à turma informada.
`
    : ehPrimeiroAno
      ? `
REGRAS ESPECÍFICAS DO 1º ANO:
- Priorizar alfabetização, consciência fonológica, reconhecimento de letras, sílabas, palavras e imagens.
- Usar comandos curtos e diretos.
- Criar atividades de cobrir, circular, ligar, completar, formar e escrever palavras simples.
- Usar frases muito curtas.
- Oferecer espaço amplo para escrita.
- Usar imagens fáceis de reconhecer quando ajudarem na aprendizagem.
- Não exigir produção textual longa.
`
      : ehSegundoAno
        ? `
REGRAS ESPECÍFICAS DO 2º ANO:
- Priorizar consolidação da alfabetização, leitura de palavras, formação de frases e interpretação muito simples.
- Usar comandos curtos e claros.
- Trabalhar sílabas, palavras, frases curtas e pequenos textos.
- Usar imagens quando forem pedagogicamente úteis.
- Deixar espaço adequado para respostas.
- Não usar textos extensos nem perguntas abstratas.
`
        : ehTerceiroAno
          ? `
REGRAS ESPECÍFICAS DO 3º ANO:
- Usar escrita normal com maiúsculas e minúsculas.
- Trabalhar leitura, interpretação, escrita, cálculo e resolução de problemas conforme a disciplina.
- Utilizar textos curtos e enunciados claros.
- Ampliar gradualmente a autonomia do aluno.
- Evitar atividades excessivamente infantis.
`
          : ehQuartoOuQuintoAno
            ? `
REGRAS ESPECÍFICAS DO 4º E 5º ANO:
- Ampliar interpretação, produção escrita, raciocínio, tabelas, gráficos e resolução de problemas.
- Usar enunciados claros e completos.
- Variar reconhecimento, compreensão e aplicação.
- Não infantilizar o material.
- Utilizar imagens apenas quando realmente ajudarem.
`
            : ehAnosFinais
              ? `
REGRAS ESPECÍFICAS DOS ANOS FINAIS:
- Usar linguagem adequada a adolescentes.
- Priorizar compreensão, análise, comparação, aplicação, argumentação e resolução de problemas.
- Evitar atividades com aparência infantil.
- Utilizar textos, tabelas, esquemas, gráficos, mapas e situações-problema quando forem pertinentes.
`
              : ehEnsinoMedio
                ? `
REGRAS ESPECÍFICAS DO ENSINO MÉDIO:
- Trabalhar com profundidade compatível com o Ensino Médio.
- Priorizar análise, interpretação, argumentação, pensamento científico e aplicação.
- Utilizar situações reais, estudos de caso, gráficos, tabelas, textos e problemas contextualizados.
- Evitar simplificação excessiva.
`
                : ehEJA
                  ? `
REGRAS ESPECÍFICAS DA EJA:
- Nunca infantilizar os estudantes.
- Usar linguagem clara, respeitosa e adequada ao público jovem e adulto.
- Relacionar os conteúdos ao cotidiano, trabalho, cidadania, saúde, consumo, tecnologia e participação social quando pertinente.
- Valorizar experiências de vida e conhecimentos prévios.
- Respeitar o nível correspondente à etapa informada.
`
                  : ehAnosIniciais
                    ? `
REGRAS ESPECÍFICAS DOS ANOS INICIAIS:
- Adequar rigorosamente linguagem, tamanho dos textos e complexidade à série.
- Usar comandos claros e atividades possíveis de realizar de forma autônoma.
- Variar leitura, escrita, raciocínio, observação e aplicação.
`
                    : "";

  const regrasDisciplina = `
REGRAS DE ADAPTAÇÃO À DISCIPLINA:
- Em Língua Portuguesa ou Linguagem, trabalhar leitura, escrita, letras, sílabas, palavras, frases, interpretação e produção conforme a série.
- Em Matemática, variar contagem, representação, comparação, sequência, cálculo, formas, medidas e problemas conforme a série.
- Em Ciências, História e Geografia, variar identificação, classificação, relação, interpretação, observação e explicação.
- Em Educação Física, relacionar a atividade a movimentos, brincadeiras, jogos, regras, corpo, saúde, coordenação e materiais usados na aula.
- Em Arte, priorizar observação, criação, cores, formas, técnicas e expressão.
- Em Ensino Religioso, trabalhar convivência, respeito, valores, diversidade e reflexão sem impor crenças.
- Em Inglês, adequar o vocabulário e os comandos ao nível da turma.
- Em Computação, considerar pensamento computacional, mundo digital e cultura digital conforme a série.
- Não transformar todas as disciplinas em uma lista de perguntas.
`;

  const regrasGerais = `
REGRAS GERAIS:
- Responder somente em português do Brasil.
- Criar uma atividade pronta para o professor usar.
- Respeitar rigorosamente etapa, série, disciplina e conteúdo.
- Não criar uma prova nem imitar o formato de avaliação.
- Não usar campo para valor, nota, gabarito visível ao aluno ou pontuação.
- Organizar os exercícios do mais simples para o mais complexo.
- Variar os formatos de exercício.
- Não repetir o mesmo tipo de exercício em sequência.
- Não preencher páginas com questões muito parecidas.
- Usar comandos naturais, claros e com linguagem de professor.
- Não mencionar inteligência artificial.
- Não inventar informações que não tenham relação com o conteúdo.
- Não inventar links de imagens.
- Não usar emojis como substitutos de imagens.
- Não escrever texto dentro das imagens.
- Quando uma imagem for necessária, solicitar uma figura pequena, isolada, centralizada, nítida, sem letras e com fundo branco ou transparente.
- Nunca solicitar uma única imagem com vários objetos diferentes.
- Caça-palavras, cruzadinhas, tabelas, sequências, colunas e grades devem ser produzidos como dados estruturados, nunca como imagem.
- Cada exercício deve conter todo o material necessário para ser realizado.
- Revisar a coerência pedagógica de cada palavra, frase, alternativa e imagem antes de responder.
- Não misturar palavras que começam com letras diferentes quando o comando pede uma letra específica.
- Em atividades de alfabetização, usar vocabulário simples, concreto, conhecido pelas crianças e fácil de ilustrar.
- Evitar palavras raras, ambíguas ou difíceis de representar visualmente.
- Quando houver distratores, eles devem aparecer somente quando o comando realmente pedir comparação, seleção ou identificação.
- Não escrever comandos como "observe a imagem" quando nenhuma imagem tiver sido solicitada.
- Não usar caça-palavras ou cruzadinha apenas para ocupar espaço.
- Criar EXATAMENTE ${quantidadeQuestoes} questões principais.
- Cada objeto de "exercicios" representa uma questão principal da folha.
- Não juntar duas questões diferentes dentro do mesmo exercício.
- Distribuir as ${quantidadeQuestoes} questões em aproximadamente ${quantidadePaginas} página(s).
- O sistema organizará as quebras de página; crie exercícios com tamanho compatível com a quantidade de páginas.
`;

  const tiposPermitidos = `
TIPOS DE EXERCÍCIO PERMITIDOS:
- letra_tracejada
- tracejado
- pinte
- circule_letras
- circule_figuras
- ditado_ilustrado
- escreva_nome_figuras
- ligue_colunas
- complete_palavras
- complete_frases
- forme_palavras
- separe_silabas
- ordene_palavras
- ordem_alfabetica
- caca_palavras
- cruzadinha
- verdadeiro_falso
- multipla_escolha
- discursiva
- interpretacao_texto
- producao_texto
- problema_matematico
- calculo
- sequencia_numerica
- tabela
- grafico
- classificacao
- relacione
- observe_responda
- mapa_conceitual
- outro
`;

  const regrasPorTipo = `
REGRAS DE ESTRUTURA POR TIPO:

LETRA TRACEJADA / TRACEJADO:
- Usar "letra_tracejada" quando o conteúdo for uma letra do alfabeto para cobrir.
- Usar "tracejado" para números, sílabas, palavras curtas ou outros traçados.
- Em "conteudoLivre", informar somente o símbolo ou modelo que deverá ser desenhado pontilhado, por exemplo: "B".
- Não repetir a letra como texto comum, como "B B B B B".
- O sistema desenhará uma letra grande pontilhada e uma sequência de letras pontilhadas menores.
- Não usar imagem gerada para representar letras tracejadas.

PINTE / CIRCULE FIGURAS:
- Criar itens misturando respostas corretas e distratores quando necessário.
- Cada figura deve ser solicitada individualmente.
- O comando deve informar claramente o critério.

DITADO ILUSTRADO / ESCREVA O NOME DAS FIGURAS:
- Criar um item para cada figura.
- "texto" deve conter a palavra-alvo.
- "resposta" deve conter a resposta correta.
- "imagemNecessaria" deve ser true em cada item.
- "imagemDescricao" deve solicitar uma única figura pequena, isolada, nítida, sem texto e com fundo branco ou transparente.

LIGUE COLUNAS / RELACIONE:
- Cada item deve usar "colunaA" e "colunaB".
- Os pares devem ser objetivos e sem ambiguidade.
- A ordem da coluna B não deve repetir a ordem da coluna A.

COMPLETE PALAVRAS / COMPLETE FRASES:
- Cada item deve conter uma lacuna clara.
- A resposta correta deve aparecer em "resposta".
- Não criar mais de uma resposta possível.

CAÇA-PALAVRAS:
- "palavras" deve conter todas as palavras procuradas.
- "grade" deve ser uma lista de linhas com letras separadas por espaço.
- Todas as palavras precisam realmente estar na grade.
- Não usar imagem para representar a grade.

CRUZADINHA:
- "palavras" deve conter as respostas.
- "pistas" deve conter pistas na mesma ordem.
- "grade" deve representar a estrutura.
- As palavras devem cruzar quando possível.
- Não usar imagem para representar a grade.

MÚLTIPLA ESCOLHA:
- Um item para cada pergunta.
- "texto" deve conter a pergunta.
- "alternativas" deve conter opções plausíveis.
- Deve existir apenas uma resposta correta.

VERDADEIRO OU FALSO:
- Um item para cada afirmação.
- "verdadeiro" deve ser true ou false.
- Misturar afirmações verdadeiras e falsas.

INTERPRETAÇÃO DE TEXTO:
- "textoApoio" deve conter o texto completo.
- "itens" deve conter perguntas variadas e adequadas à série.
- Não fazer todas as respostas serem cópias literais do texto.

PROBLEMA MATEMÁTICO:
- Um item para cada problema.
- Fornecer dados suficientes e coerentes.
- Informar a resposta correta em "resposta".

SEQUÊNCIA NUMÉRICA:
- Um item para cada sequência.
- O padrão deve ser claro e adequado à série.

TABELA / GRÁFICO:
- Usar "colunas" para os títulos.
- Usar "itens" para os dados.
- Não solicitar imagem para tabela ou gráfico simples.

PRODUÇÃO DE TEXTO:
- Usar "conteudoLivre" para informar tema, situação comunicativa, gênero e orientação.
`;

  const dadosProfessor = `
DADOS INFORMADOS PELO PROFESSOR:
Etapa de ensino: ${etapaEnsino}
Série ou turma: ${serie}
Disciplina: ${disciplina}
Conteúdo ou tema: ${conteudo}
O que foi trabalhado em sala: ${trabalhadoSala || "Não informado"}
Observações: ${observacoes || "Não informado"}
Quantidade de questões: ${quantidadeQuestoes}
Quantidade estimada de páginas: ${quantidadePaginas}
Fonte: ${fonteAtividade}
Modo de criação: ${modoCriacao}
`;

  const formatoJson = `
FORMATO JSON OBRIGATÓRIO:
- Retorne somente um objeto JSON válido.
- Não use markdown.
- Não use crases.
- Não escreva explicações antes ou depois do JSON.
- Não inclua comentários no JSON.

{
  "titulo": "Título curto da atividade",
  "subtitulo": "Série, disciplina ou conteúdo",
  "modoCriacao": "${modoCriacao}",
  "fonteAtividade": "${fonteAtividade}",
  "usarMaiusculas": ${usarMaiusculas},
  "quantidadeQuestoes": ${quantidadeQuestoes},
  "quantidadePaginas": ${quantidadePaginas},
  "exercicios": [
    {
      "id": "",
      "numero": 1,
      "tipo": "tipo_permitido",
      "titulo": "Título curto",
      "comando": "Comando claro para o aluno",
      "conteudoLivre": "",
      "itens": [
        {
          "id": "item-1",
          "texto": "",
          "resposta": "",
          "imagemNecessaria": false,
          "imagemDescricao": "",
          "colunaA": "",
          "colunaB": "",
          "alternativas": [],
          "verdadeiro": null
        }
      ],
      "textoApoio": "",
      "palavras": [],
      "pistas": [],
      "grade": [],
      "colunas": [],
      "imagemNecessaria": false,
      "imagemDescricao": "",
      "gabarito": ""
    }
  ]
}

REGRAS DO JSON:
- Todos os exercícios devem possuir todos os campos mostrados no modelo.
- "exercicios" deve conter EXATAMENTE ${quantidadeQuestoes} exercícios.
- "itens" deve sempre ser uma lista.
- "palavras", "pistas", "grade", "colunas" e "alternativas" devem sempre ser listas.
- Usar string vazia quando um campo textual não se aplicar.
- Usar lista vazia quando uma lista não se aplicar.
- Usar false quando imagem não for necessária.
- Usar null em "verdadeiro" quando não se aplicar.
- "numero" deve começar em 1 e seguir em ordem.
- "id" do exercício deve ficar vazio, pois o sistema criará depois.
- Cada item deve ter um id simples, como "item-1" e "item-2".
- O campo "gabarito" deve conter a resposta para uso interno do professor, sem aparecer como exercício para o aluno.
`;

  const regraModo =
    modoCriacao === "personalizada"
      ? `
PEDIDO PERSONALIZADO DO PROFESSOR:
${pedidoPersonalizado}

REGRAS DO MODO PERSONALIZADO:
- Cumprir o pedido do professor com prioridade.
- Respeitar exatamente a quantidade de questões escolhida, salvo quando o próprio pedido determinar uma quantidade diferente de forma explícita.
- Adaptar o pedido à série e à disciplina.
- Não ignorar as regras de escrita e adequação etária.
- Caso o professor solicite seis questões, criar exatamente seis exercícios ou seis itens, conforme o sentido do pedido.
- Caso solicite um único formato, poderá repetir esse formato porque foi uma escolha explícita.
- Ainda assim, entregar o material completo e pronto para uso.
`
      : `
REGRAS DO MODO AUTOMÁTICO:
- Escolher automaticamente os exercícios mais adequados à série, disciplina e conteúdo.
- Criar exatamente ${quantidadeQuestoes} questões principais.
- O professor não escolheu tipos de questões; essa decisão é responsabilidade pedagógica da IA.
- Criar variedade real, sem parecer uma avaliação.
- Começar com reconhecimento ou retomada.
- Desenvolver compreensão e aplicação.
- Finalizar com uma atividade de síntese, criação, resolução ou desafio compatível com a série.
- Para Educação Infantil, 1º e 2º ano, priorizar propostas visuais, alfabetização, escrita inicial, associação e atividades concretas.
- Para séries maiores, ampliar interpretação, análise, aplicação e produção.
- Para Educação Infantil, 1º e 2º ano, montar uma folha visual semelhante a uma atividade pedagógica ilustrada.
- Quando o conteúdo for uma letra do alfabeto, variar entre letra tracejada, identificação visual, imagens que começam com a letra, completar palavras, ligar figuras a palavras e leitura de frases curtas.
- Não usar palavras que contrariem o comando. Exemplo: em uma atividade sobre a letra B, não colocar GATO em uma lista de palavras que começam com B.
- Em exercícios de ligar figuras e palavras, cada figura e cada palavra devem formar pares corretos e sem ambiguidade.
- Em exercícios de completar palavras com uma letra, a palavra incompleta deve ter apenas a lacuna necessária, por exemplo: "_OLA" para BOLA.
- Em exercícios visuais, usar de 3 a 6 itens por questão, conforme o espaço disponível.
`;

  return `
Você é especialista em criação de atividades pedagógicas impressas para professores brasileiros.

Crie uma atividade completa, prática, bonita, variada e pronta para uso.

${dadosProfessor}

${regraEscrita}

${regrasEtapa}

${regrasDisciplina}

${regraModo}

${regrasGerais}

${tiposPermitidos}

${regrasPorTipo}

${formatoJson}
`;
}