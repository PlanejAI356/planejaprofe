type DadosFolha = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  trabalhadoSala: string;
  observacoes: string;
  quantidade: number;
};

type PerfilVariacao = {
  nome: string;
  inicio: string;
  desenvolvimento: string;
  encerramento: string;
  comandosPrioritarios: string[];
  comandosEvitar: string[];
  layoutsPrioritarios: string[];
};

const perfisVariacao: PerfilVariacao[] = [
  {
    nome: "exploracao_visual",
    inicio:
      "Começar com observação, identificação visual ou associação.",
    desenvolvimento:
      "Continuar com comparação, classificação, leitura ou organização.",
    encerramento:
      "Finalizar com aplicação, explicação ou pequena produção.",
    comandosPrioritarios: [
      "Observe",
      "Identifique",
      "Relacione",
      "Compare",
      "Classifique",
    ],
    comandosEvitar: ["Circule", "Complete"],
    layoutsPrioritarios: [
      "grade_imagens",
      "duas_colunas",
      "cartoes",
      "quadro_classificacao",
    ],
  },
  {
    nome: "leitura_e_compreensao",
    inicio:
      "Começar com leitura curta, palavra, frase, legenda ou situação.",
    desenvolvimento:
      "Continuar com compreensão, relação, ordenação e interpretação.",
    encerramento:
      "Finalizar com resposta pessoal, síntese ou produção curta.",
    comandosPrioritarios: [
      "Leia",
      "Descubra",
      "Organize",
      "Explique",
      "Responda",
    ],
    comandosEvitar: ["Pinte", "Copie"],
    layoutsPrioritarios: [
      "texto_com_questoes",
      "imagem_e_legenda",
      "sequencia_vertical",
      "blocos",
    ],
  },
  {
    nome: "desafio_progressivo",
    inicio:
      "Começar com uma atividade rápida de retomada.",
    desenvolvimento:
      "Aumentar gradualmente o raciocínio e a aplicação.",
    encerramento:
      "Finalizar com desafio, problema, produção ou descoberta.",
    comandosPrioritarios: [
      "Descubra",
      "Resolva",
      "Encontre",
      "Analise",
      "Crie",
    ],
    comandosEvitar: ["Marque", "Copie"],
    layoutsPrioritarios: [
      "trilha",
      "desafio_em_etapas",
      "quadro_respostas",
      "pagina_dividida",
    ],
  },
  {
    nome: "pratica_variada",
    inicio:
      "Começar com associação, seleção ou reconhecimento.",
    desenvolvimento:
      "Misturar leitura, escrita, aplicação e raciocínio.",
    encerramento:
      "Finalizar com atividade diferente das anteriores, sem obrigatoriamente usar produção textual.",
    comandosPrioritarios: [
      "Ligue",
      "Separe",
      "Forme",
      "Escolha",
      "Registre",
    ],
    comandosEvitar: ["Circule", "Escreva"],
    layoutsPrioritarios: [
      "colunas",
      "grade",
      "cartoes_horizontais",
      "espacos_de_resposta",
    ],
  },
  {
    nome: "investigacao",
    inicio:
      "Começar com pergunta, imagem, dado, exemplo ou situação-problema.",
    desenvolvimento:
      "Continuar com levantamento de hipóteses, análise e comparação.",
    encerramento:
      "Finalizar com conclusão, justificativa ou aplicação.",
    comandosPrioritarios: [
      "Investigue",
      "Observe",
      "Levante uma hipótese",
      "Compare",
      "Justifique",
    ],
    comandosEvitar: ["Copie", "Decore"],
    layoutsPrioritarios: [
      "situacao_problema",
      "tabela_analise",
      "imagem_com_perguntas",
      "quadro_de_conclusao",
    ],
  },
];

function escolherAleatorio<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

function embaralhar<T>(lista: T[]): T[] {
  return [...lista].sort(() => Math.random() - 0.5);
}

export function gerarPromptFolhaAtividades(
  dados: DadosFolha
) {
  const ehEducacaoInfantil =
    dados.etapaEnsino === "Educação Infantil";

  const ehAnosIniciais =
    dados.etapaEnsino ===
    "Ensino Fundamental - Anos Iniciais";

  const ehAnosFinais =
    dados.etapaEnsino ===
    "Ensino Fundamental - Anos Finais";

  const ehEnsinoMedio =
    dados.etapaEnsino === "Ensino Médio";

  const ehEJA = dados.etapaEnsino === "EJA";

  const perfil = escolherAleatorio(perfisVariacao);

  const layoutsSorteados = embaralhar(
    perfil.layoutsPrioritarios
  );

  const comandosSorteados = embaralhar(
    perfil.comandosPrioritarios
  );

  const assinaturaVariacao = `${Date.now()}-${Math.floor(
    Math.random() * 1000000
  )}`;

  const regrasEtapa = ehEducacaoInfantil
    ? `
REGRAS ESPECÍFICAS DA EDUCAÇÃO INFANTIL:
- Priorizar oralidade, observação, associação, movimento, exploração, pintura, recorte, traçado e atividades visuais.
- Usar comandos muito curtos.
- Evitar leitura extensa e excesso de escrita.
- Usar figuras simples, grandes o suficiente para reconhecer e adequadas à faixa etária.
- Não infantilizar de maneira exagerada.
- Não usar prova, nota ou linguagem de avaliação formal.
- Priorizar experiências lúdicas e visuais.
`
    : ehAnosIniciais
      ? `
REGRAS ESPECÍFICAS DOS ANOS INICIAIS:
- Adequar rigorosamente a linguagem à série.
- Para 1º, 2º e 3º anos, usar letra de forma, comandos curtos, consciência fonológica, leitura, escrita, numeramento e apoio visual.
- Para 4º e 5º anos, ampliar interpretação, produção, raciocínio, tabelas, gráficos e resolução de problemas.
- Não infantilizar excessivamente 4º e 5º anos.
- Em atividades de alfabetização, variar reconhecimento, leitura, formação, escrita e compreensão.
`
      : ehAnosFinais
        ? `
REGRAS ESPECÍFICAS DOS ANOS FINAIS:
- Usar linguagem adequada a adolescentes.
- Priorizar compreensão, análise, comparação, aplicação, argumentação e resolução de problemas.
- Evitar atividades com aparência infantil.
- Utilizar textos, tabelas, esquemas, gráficos, mapas e situações-problema quando forem pertinentes.
- Não usar imagens decorativas sem função pedagógica.
`
        : ehEnsinoMedio
          ? `
REGRAS ESPECÍFICAS DO ENSINO MÉDIO:
- Trabalhar com profundidade compatível com o Ensino Médio.
- Priorizar análise, interpretação, argumentação, pensamento científico e aplicação.
- Utilizar situações reais, estudos de caso, gráficos, tabelas, textos e problemas contextualizados.
- Evitar simplificação excessiva.
- Não criar exercícios infantis ou meramente mecânicos.
`
          : ehEJA
            ? `
REGRAS ESPECÍFICAS DA EJA:
- Nunca infantilizar os estudantes.
- Usar linguagem clara, respeitosa e adequada ao público jovem e adulto.
- Relacionar os conteúdos ao cotidiano, trabalho, cidadania, saúde, consumo, tecnologia e participação social quando pertinente.
- Valorizar experiências de vida e conhecimentos prévios.
- Respeitar o nível correspondente à etapa informada.
- Não usar imagens ou atividades com aparência infantilizada.
`
            : "";

  return `
Você é especialista em criação de atividades pedagógicas impressas com aparência de apostila profissional.

Crie uma folha completa, variada, equilibrada e pronta para o sistema diagramar.

DADOS INFORMADOS:
Etapa de ensino: ${dados.etapaEnsino}
Série ou turma: ${dados.serie}
Disciplina: ${dados.disciplina}
Conteúdo ou tema: ${dados.conteudo}
O que foi trabalhado em sala: ${
    dados.trabalhadoSala || "Não informado"
  }
Observações para a IA: ${
    dados.observacoes || "Não informado"
  }
Quantidade solicitada: ${dados.quantidade}

ASSINATURA DE VARIAÇÃO DESTA GERAÇÃO:
${assinaturaVariacao}

PERFIL DE VARIAÇÃO SORTEADO:
${perfil.nome}

ORGANIZAÇÃO PEDAGÓGICA DESTA GERAÇÃO:
- Início: ${perfil.inicio}
- Desenvolvimento: ${perfil.desenvolvimento}
- Encerramento: ${perfil.encerramento}

COMANDOS QUE DEVEM RECEBER PRIORIDADE:
${comandosSorteados.join(", ")}

COMANDOS QUE DEVEM SER EVITADOS NESTA GERAÇÃO:
${perfil.comandosEvitar.join(", ")}

LAYOUTS QUE DEVEM RECEBER PRIORIDADE:
${layoutsSorteados.join(", ")}

${regrasEtapa}

REGRAS GERAIS:
- Responder somente em português do Brasil.
- Respeitar rigorosamente etapa, série, disciplina e conteúdo.
- Criar exatamente ${dados.quantidade} exercícios.
- Cada exercício deve trabalhar uma ação cognitiva ou habilidade específica.
- Não repetir o mesmo tipo de exercício na folha.
- Não repetir a mesma habilidade em exercícios consecutivos.
- Não usar a mesma estrutura de comando em exercícios consecutivos.
- Não começar sempre com "Circule".
- Não terminar obrigatoriamente com produção de texto.
- Não criar sempre a sequência reconhecimento, complete, ligue e produção.
- Usar o perfil de variação sorteado nesta geração.
- Variar exercícios visuais, escritos, orais, interpretativos e de raciocínio conforme a série.
- Alternar exercícios curtos e exercícios que exijam maior elaboração.
- Criar atividades realmente prontas para uso.
- Não gerar instruções genéricas sem apresentar os itens necessários.
- Não mencionar inteligência artificial.
- Não usar emojis no lugar de imagens.
- Não inventar endereços ou links de imagens.
- Não escrever textos dentro das imagens.
- Não repetir excessivamente a mesma palavra em vários exercícios.
- Usar distratores coerentes e adequados à série.
- Evitar respostas ambíguas.
- Não usar caça-palavras ou cruzadinha apenas para preencher quantidade.
- Cada exercício precisa estar pronto para o sistema desenhar.
- Caça-palavras, cruzadinha, tabelas, sequências, colunas, gráficos simples e grades devem ser montados por dados estruturados, nunca como imagem.
- O campo "conteudoLivre" deve ser usado somente quando o tipo não puder ser representado apenas por itens.

REGRAS PARA VARIAÇÃO:
- Escolher habilidades diferentes dentro do conteúdo informado.
- Variar os verbos dos comandos.
- Variar a quantidade de itens entre os exercícios.
- Variar a disposição visual.
- Variar entre respostas por seleção, ligação, escrita, organização, interpretação, cálculo, classificação ou produção.
- Não usar dois layouts iguais em sequência.
- Não usar mais de dois exercícios com o mesmo nível de dificuldade.
- Distribuir os níveis entre facil, medio e desafio.
- A ordem das atividades deve seguir o perfil sorteado, e não um modelo fixo.
- Quando duas atividades trabalharem conteúdos semelhantes, elas devem utilizar ações e layouts diferentes.

REGRAS PARA IMAGENS:
- Usar imagem apenas quando ela tiver função pedagógica.
- Cada objeto, animal, personagem ou elemento deve ser solicitado como imagem individual.
- Nunca solicitar uma imagem única contendo vários objetos para um exercício de seleção.
- Cada item visual deve informar uma "imagemChave".
- "imagemChave" deve conter apenas o nome simples do elemento, como "bola", "gato" ou "árvore".
- "imagemDescricao" deve descrever uma ilustração educativa isolada.
- Não colocar resposta, letra, palavra ou legenda dentro da imagem.
- Não misturar estilos visuais dentro do mesmo exercício.
- Para figuras de alfabetização, preferir objetos de reconhecimento claro.
- Para atividades de pintar, solicitar imagem em preto e branco com contorno.
- Para atividades comuns, solicitar ilustração colorida, limpa e com fundo transparente ou branco.
- Não usar imagem em tabelas, gráficos, caça-palavras ou cruzadinhas simples.
- O sistema procurará primeiro a imagem no banco próprio.
- A descrição servirá para gerar uma nova imagem apenas quando não houver uma imagem pronta.

TIPOS DE EXERCÍCIO PERMITIDOS:
- ditado_ilustrado
- escreva_nome_figuras
- circule_figuras
- pinte_figuras
- marque_figuras
- encontre_intruso
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
- organize_etapas
- compare_elementos
- outro

LAYOUTS PERMITIDOS:
- grade_imagens
- grade_2_colunas
- grade_3_colunas
- imagens_em_circulos
- imagens_com_linhas
- duas_colunas
- colunas_para_ligar
- cartoes
- cartoes_horizontais
- cartoes_verticais
- texto_com_questoes
- imagem_com_perguntas
- imagem_e_legenda
- sequencia_vertical
- sequencia_horizontal
- quadro_classificacao
- quadro_respostas
- quadro_de_conclusao
- tabela_analise
- trilha
- desafio_em_etapas
- situacao_problema
- espacos_de_resposta
- pagina_dividida
- blocos
- grade
- simples

REGRAS DE ESTRUTURA POR TIPO:

DITADO ILUSTRADO / ESCREVA O NOME DAS FIGURAS:
- Um item para cada figura.
- "texto" deve conter a palavra-alvo.
- "resposta" deve conter a resposta correta.
- "imagemNecessaria" deve ser true.
- "imagemChave" deve conter o nome simples da figura.
- "imagemDescricao" deve pedir uma única figura isolada.
- Nunca pedir uma única imagem contendo vários objetos.

CIRCULE / PINTE / MARQUE FIGURAS:
- Criar itens misturando respostas corretas e distratores.
- Cada item visual deve ter uma imagem individual.
- O comando deve informar claramente o critério.
- O campo "respostaCorreta" deve indicar se o item atende ao critério.

ENCONTRE O INTRUSO:
- Criar um conjunto coerente com apenas um elemento diferente.
- Não criar mais de uma resposta possível.
- Informar o motivo no gabarito.

LIGUE COLUNAS / RELACIONE:
- Cada item deve usar "colunaA" e "colunaB".
- Embaralhar logicamente a coluna B.
- Não deixar pares ambíguos.

COMPLETE PALAVRAS / COMPLETE FRASES:
- Cada item deve conter uma lacuna clara.
- A resposta correta deve aparecer em "resposta".
- Não criar mais de uma resposta possível.

CAÇA-PALAVRAS:
- "palavras" deve conter todas as palavras buscadas.
- "grade" deve ser uma lista de linhas com letras separadas por espaço.
- Todas as palavras precisam realmente estar na grade.
- Não usar imagem para a grade.

CRUZADINHA:
- "palavras" deve conter as respostas.
- "pistas" deve conter pistas na mesma ordem.
- "grade" deve representar a estrutura da cruzadinha.
- Todas as palavras devem cruzar quando possível.
- Não usar imagem para a grade.

MÚLTIPLA ESCOLHA:
- Um item por questão.
- "texto" deve conter a pergunta.
- "alternativas" deve conter opções plausíveis.
- Apenas uma resposta deve estar correta.
- Variar a posição da alternativa correta.

VERDADEIRO OU FALSO:
- Um item por afirmação.
- "verdadeiro" deve ser true ou false.
- Misturar afirmações verdadeiras e falsas.

INTERPRETAÇÃO DE TEXTO:
- "textoApoio" deve conter o texto completo.
- "itens" deve conter perguntas variadas.
- Não fazer todas as respostas serem cópias literais do texto.

PROBLEMA MATEMÁTICO:
- Um item por problema.
- Apresentar dados suficientes e coerentes.
- Colocar a resposta correta em "resposta".

SEQUÊNCIA NUMÉRICA:
- Um item por sequência.
- O padrão deve ser claro e adequado à série.

TABELA / GRÁFICO:
- Usar "colunas" para os títulos.
- Usar "itens" para os dados.
- Não solicitar imagem para tabela ou gráfico simples.

PRODUÇÃO DE TEXTO:
- Usar "conteudoLivre" para orientar tema, situação comunicativa, gênero e critérios.
- Não usar produção de texto como encerramento obrigatório de todas as folhas.

FORMATO JSON OBRIGATÓRIO:
Retorne somente um objeto JSON válido.
Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Título curto da folha",
  "subtitulo": "${dados.serie} • ${dados.disciplina}",
  "modoCriacao": "folha",
  "assinaturaVariacao": "${assinaturaVariacao}",
  "perfilVariacao": "${perfil.nome}",
  "estiloVisual": "educativo_limpo",
  "exercicios": [
    {
      "id": "",
      "numero": 1,
      "tipo": "tipo_permitido",
      "habilidade": "habilidade específica trabalhada",
      "nivel": "facil",
      "layout": "layout_permitido",
      "titulo": "Título curto",
      "comando": "Comando claro para o aluno",
      "conteudoLivre": "",
      "itens": [
        {
          "id": "item-1",
          "texto": "",
          "resposta": "",
          "respostaCorreta": null,
          "imagemNecessaria": false,
          "imagemChave": "",
          "imagemDescricao": "",
          "imagemEstilo": "",
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
      "imagemChave": "",
      "imagemDescricao": "",
      "imagemEstilo": "",
      "gabarito": ""
    }
  ]
}

REGRAS DO JSON:
- Todos os exercícios devem possuir todos os campos indicados.
- Todos os itens devem possuir todos os campos indicados.
- "itens" deve sempre ser uma lista.
- "palavras", "pistas", "grade", "colunas" e "alternativas" devem sempre ser listas.
- Use string vazia quando um campo textual não se aplicar.
- Use lista vazia quando uma lista não se aplicar.
- Use false quando imagem não for necessária.
- Use null em "verdadeiro" quando não se aplicar.
- Use null em "respostaCorreta" quando não se aplicar.
- "nivel" deve ser facil, medio ou desafio.
- "layout" deve usar um dos layouts permitidos.
- "numero" deve começar em 1 e seguir em ordem.
- "id" do exercício deve ficar vazio; o sistema criará depois.
- Cada item deve ter um id simples como item-1, item-2 e item-3.
- Não remover campos do JSON.
`;
}