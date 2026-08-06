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

  const pedidoLivre = String(
    body.pedidoPersonalizado ||
      body.conteudo ||
      ""
  ).trim();

  const trabalhadoSala = String(
    body.trabalhadoSala || ""
  ).trim();

  const pedidoPersonalizado = pedidoLivre;

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

  if (!pedidoLivre) {
    throw new Error(
      "O pedido da atividade é obrigatório."
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
- A atividade deve parecer uma folha pronta, e não um rascunho ou lista de sugestões.
- Não devolver instruções para o professor completar manualmente depois.
- Não usar expressões como "o professor pode", "adicione uma imagem", "escolha palavras" ou "complete conforme desejar".
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
- Para ligar texto a texto, cada item deve usar "colunaA" e "colunaB".
- Para ligar palavra a figura, usar "colunaA" para a palavra, deixar "colunaB" vazio e preencher os campos de imagem do item.
- Os pares devem ser objetivos e sem ambiguidade.
- A ordem visual poderá ser reorganizada pelo sistema.
- Nunca escrever "FIGURA DE..." como conteúdo da coluna.

COMPLETE PALAVRAS / COMPLETE FRASES:
- Cada item deve conter uma lacuna clara em "texto".
- A resposta correta completa deve aparecer em "resposta".
- Exemplo correto: "texto": "_OLA", "resposta": "BOLA".
- Quando houver figura, preencher os campos de imagem do item.
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
Pedido completo do professor: ${pedidoLivre}
Conteúdo informado no campo técnico: ${conteudo || "Não separado"}
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
- Cada exercício deve usar um "tipo" permitido para a série selecionada.
- Não repetir o valor de "tipo" entre exercícios, salvo quando solicitado pelo professor.
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

  const regraModo = `
PEDIDO DO PROFESSOR:
${pedidoLivre}

REGRAS DE INTERPRETAÇÃO DO PEDIDO:
- O texto acima é a instrução principal e deve ser interpretado por completo.
- Identificar automaticamente o conteúdo, o objetivo pedagógico e os formatos de exercício solicitados ou mais adequados.
- Não exigir que o professor informe separadamente conteúdo, tipo de atividade ou necessidade de imagens.
- Cumprir o pedido sem copiar frases explicativas do professor para a folha.
- Adaptar tudo rigorosamente à etapa, à série e à disciplina selecionadas.
- Criar EXATAMENTE ${quantidadeQuestoes} questões principais.
- Cada questão principal deve corresponder a um objeto do array "exercicios".
- Não transformar os itens internos de uma única questão em questões adicionais.
- Se o professor mencionar outra quantidade no texto, prevalece a quantidade selecionada no sistema: ${quantidadeQuestoes}.
- Quando o pedido for genérico, escolher automaticamente uma sequência pedagógica variada.
- Quando o pedido indicar um formato específico, respeitar esse formato e completar a folha com coerência.
- Entregar todos os textos, palavras, alternativas, pares, lacunas, pistas, grades e respostas necessários.
- Nunca deixar uma questão apenas com título e comando, sem material para o aluno realizar.
- Nunca devolver marcadores como "FIGURA 1", "IMAGEM 2", "INSERIR DESENHO" ou textos semelhantes.
- Para qualquer figura necessária, preencher "imagemNecessaria": true e escrever uma descrição concreta em "imagemDescricao".
- A descrição da imagem deve nomear um único objeto, como "bola infantil colorida isolada em fundo branco".
- Não colocar a descrição da imagem em "texto", "colunaA" ou "colunaB".
- Em atividades de ligar palavras a figuras, guardar a palavra em "colunaA" e a figura no próprio item por meio de "imagemNecessaria" e "imagemDescricao".
- Em atividades de completar palavras com figuras, usar "texto" para a palavra incompleta, "resposta" para a palavra correta e os campos de imagem para a figura.
- Para Educação Infantil, 1º e 2º ano, priorizar aparência de folha pedagógica visual, com pouco texto e elementos grandes.
- Quando o pedido tratar de uma letra do alfabeto, considerar letra tracejada, identificação da letra, figuras iniciadas pela letra, completar palavras, ligar e leitura curta.
- Revisar cada palavra para garantir que corresponda à letra ou ao critério solicitado.

REGRAS DE VARIEDADE:
- Não repetir o mesmo tipo de exercício em duas questões, salvo quando o professor pedir explicitamente.
- Não repetir o mesmo comando com palavras diferentes.
- Não criar duas questões de circule, duas questões de complete ou duas questões de ligar na mesma folha.
- Cada questão deve cumprir uma função pedagógica diferente.
- Organizar a sequência do mais simples para o mais complexo.
- Para 6 questões, buscar esta variedade quando adequada:
  1. reconhecimento;
  2. tracejado ou escrita;
  3. associação com imagens;
  4. completar;
  5. leitura ou identificação;
  6. síntese ou desafio curto.
- Quando não for possível usar seis tipos diferentes, variar pelo menos o objetivo e o formato visual.

TIPOS PERMITIDOS POR ETAPA:

EDUCAÇÃO INFANTIL:
- letra_tracejada
- tracejado
- circule_figuras
- pinte_figuras
- marque_figuras
- ligue_colunas
- escreva_nome_figuras
- ditado_ilustrado
- complete_palavras
- sequencia
- classificacao_visual

1º E 2º ANO:
- letra_tracejada
- tracejado
- circule_figuras
- pinte_figuras
- marque_figuras
- ligue_colunas
- escreva_nome_figuras
- ditado_ilustrado
- complete_palavras
- complete_frases
- multipla_escolha_visual
- leitura_curta
- caca_palavras_simples
- cruzadinha_simples
- ordem_alfabetica
- sequencia
- classificacao_visual

3º AO 5º ANO:
- multipla_escolha
- verdadeiro_falso
- complete_palavras
- complete_frases
- ligue_colunas
- relacione
- classificacao
- tabela
- caca_palavras
- cruzadinha
- interpretacao_texto
- problema_matematico
- producao_texto_curta
- organize_etapas
- ordem_alfabetica

6º ANO EM DIANTE:
- multipla_escolha
- verdadeiro_falso
- complete_frases
- relacione
- classificacao
- tabela
- interpretacao_texto
- discursiva
- problema_matematico
- producao_texto
- organize_etapas
- analise
- estudo_de_caso

REGRAS DE ADEQUAÇÃO:
- Educação Infantil, 1º e 2º ano não devem receber questões discursivas longas, estudo de caso ou textos extensos.
- Educação Infantil não deve receber verdadeiro ou falso como formato principal.
- 1º e 2º ano devem ter comandos curtos, vocabulário simples e apoio visual sempre que necessário.
- Do 3º ano em diante, não usar letra tracejada, salvo quando o professor solicitar explicitamente.
- Ensino Fundamental Anos Finais, Ensino Médio e EJA não devem receber atividades infantis.
- Usar somente tipos compatíveis com a série selecionada.
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