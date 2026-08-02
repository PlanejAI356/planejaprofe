type DadosRevisao = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  trabalhadoSala: string;
  observacoes: string;
  quantidade: number;
};

export function gerarPromptRevisaoAtividades(
  dados: DadosRevisao
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

  const ehEJA =
    dados.etapaEnsino === "EJA";

  const regrasEtapa = ehEducacaoInfantil
    ? `
REGRAS ESPECÍFICAS DA EDUCAÇÃO INFANTIL:
- Priorizar oralidade, observação, associação, movimento, exploração, pintura, recorte, traçado e atividades visuais.
- Usar comandos muito curtos.
- Evitar leitura extensa e excesso de escrita.
- Usar imagens pequenas, nítidas e fáceis de reconhecer.
- Não usar prova, nota ou linguagem de avaliação formal.
`
    : ehAnosIniciais
      ? `
REGRAS ESPECÍFICAS DOS ANOS INICIAIS:
- Adequar rigorosamente a linguagem à série.
- Para 1º, 2º e 3º anos, usar comandos curtos, imagens pequenas, leitura, escrita, consciência fonológica e numeramento.
- Para 4º e 5º anos, ampliar interpretação, produção, raciocínio, tabelas, gráficos e problemas.
- Não infantilizar excessivamente 4º e 5º anos.
`
      : ehAnosFinais
        ? `
REGRAS ESPECÍFICAS DOS ANOS FINAIS:
- Usar linguagem adequada a adolescentes.
- Priorizar compreensão, análise, comparação, aplicação, argumentação e resolução de problemas.
- Evitar atividades com aparência infantil.
- Usar textos, tabelas, esquemas, gráficos e situações-problema quando forem pertinentes.
`
        : ehEnsinoMedio
          ? `
REGRAS ESPECÍFICAS DO ENSINO MÉDIO:
- Trabalhar com profundidade compatível com o Ensino Médio.
- Priorizar análise, interpretação, argumentação, pensamento científico e aplicação.
- Utilizar estudos de caso, gráficos, tabelas, textos e problemas contextualizados.
- Evitar simplificação excessiva.
`
          : ehEJA
            ? `
REGRAS ESPECÍFICAS DA EJA:
- Nunca infantilizar os estudantes.
- Usar linguagem clara, respeitosa e adequada ao público jovem e adulto.
- Relacionar os conteúdos ao cotidiano, trabalho, cidadania, saúde, consumo e tecnologia quando pertinente.
- Valorizar conhecimentos prévios e experiências de vida.
`
            : "";

  return `
Você é especialista em criação de folhas de revisão escolar.

Crie uma REVISÃO completa, variada, equilibrada e pronta para o professor revisar.

DADOS INFORMADOS:
Etapa de ensino: ${dados.etapaEnsino}
Série ou turma: ${dados.serie}
Disciplina: ${dados.disciplina}
Conteúdos: ${dados.conteudo}
O que foi trabalhado em sala: ${
    dados.trabalhadoSala || "Não informado"
  }
Observações para a IA: ${
    dados.observacoes || "Não informado"
  }
Quantidade solicitada: ${dados.quantidade}

${regrasEtapa}

REGRAS GERAIS:
- Responder somente em português do Brasil.
- Criar exatamente ${dados.quantidade} exercícios.
- Distribuir todos os conteúdos informados de forma equilibrada.
- Misturar reconhecimento, compreensão, aplicação, análise e síntese.
- Não repetir o mesmo tipo de exercício.
- Não colocar dois exercícios muito parecidos em sequência.
- Não transformar toda a revisão em múltipla escolha.
- Organizar do mais simples para o mais complexo.
- O último exercício deve ser uma síntese, desafio ou aplicação.
- Criar exercícios completos, nunca instruções genéricas.
- Não escrever frases como "observe as informações" sem apresentar as informações necessárias.
- Usar comandos claros, naturais e com linguagem de professor.
- Não mencionar inteligência artificial.
- Não usar emojis no lugar das imagens.
- Não inventar links de imagens.
- Usar imagens somente quando realmente ajudarem na compreensão.
- Quando uma imagem for necessária, pedir uma figura pequena, isolada, centralizada, sem texto e com fundo branco ou transparente.
- Caça-palavras, cruzadinha, tabelas, gráficos e grades devem ser montados por dados estruturados, nunca como imagem.
- Não incluir o gabarito dentro do comando destinado ao aluno.

TIPOS DE EXERCÍCIO PERMITIDOS:
- ditado_ilustrado
- escreva_nome_figuras
- circule_figuras
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

REGRAS POR TIPO:

DITADO ILUSTRADO / ESCREVA O NOME DAS FIGURAS:
- Um item para cada figura.
- "texto" deve conter a palavra-alvo.
- "resposta" deve conter a resposta correta.
- "imagemNecessaria" deve ser true.
- "imagemDescricao" deve pedir apenas uma imagem pequena e isolada.

LIGUE AS COLUNAS / RELACIONE:
- Cada item deve preencher "colunaA" e "colunaB".
- Não criar relações ambíguas.
- Embaralhar logicamente a coluna B.

COMPLETE PALAVRAS / COMPLETE FRASES:
- Cada item deve possuir apenas uma resposta correta.
- "texto" deve conter a palavra ou frase completa.
- "resposta" deve conter somente a parte que será ocultada.

CAÇA-PALAVRAS:
- "palavras" deve conter todas as palavras procuradas.
- "grade" deve ser uma lista de linhas com letras separadas por espaço.
- Todas as palavras devem aparecer realmente na grade.
- Não gerar a grade como imagem.

CRUZADINHA:
- "palavras" deve conter as respostas.
- "pistas" deve possuir uma pista para cada palavra.
- "grade" deve representar a estrutura da cruzadinha.
- Não gerar a cruzadinha como imagem.

MÚLTIPLA ESCOLHA:
- Cada item deve ter uma pergunta completa.
- Criar exatamente quatro alternativas.
- Apenas uma alternativa deve estar correta.
- As alternativas incorretas devem ser plausíveis.

VERDADEIRO OU FALSO:
- Cada item deve conter uma afirmativa.
- "verdadeiro" deve ser true ou false.
- Misturar afirmativas verdadeiras e falsas.

INTERPRETAÇÃO DE TEXTO:
- "textoApoio" deve conter o texto completo.
- Criar perguntas variadas.
- Não fazer todas as respostas serem cópias literais do texto.

PROBLEMAS MATEMÁTICOS:
- Fornecer dados suficientes.
- Criar situações coerentes e adequadas à série.
- Colocar a resposta correta no campo "resposta".

TABELAS E GRÁFICOS:
- Usar "colunas" para os títulos.
- Usar "itens" para os dados.
- Não gerar tabela ou gráfico simples como imagem.

FORMATO JSON OBRIGATÓRIO:
Retorne somente um objeto JSON válido.
Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Revisão de ${dados.disciplina}",
  "subtitulo": "${dados.serie} • ${dados.conteudo}",
  "modoCriacao": "revisao",
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
- Todos os exercícios devem possuir todos os campos.
- Todos os itens devem possuir todos os campos.
- "itens" deve ser sempre uma lista.
- "palavras", "pistas", "grade", "colunas" e "alternativas" devem ser sempre listas.
- Use string vazia quando um campo textual não se aplicar.
- Use lista vazia quando uma lista não se aplicar.
- Use false quando imagem não for necessária.
- Use null em "verdadeiro" quando não se aplicar.
- Os exercícios devem começar no número 1 e seguir em ordem.
- O campo "id" do exercício deve ficar vazio.
- Os itens devem usar ids como "item-1", "item-2" e assim por diante.
- O gabarito deve ser completo e coerente com todos os exercícios.
`;
}