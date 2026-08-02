type DadosFolha = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  trabalhadoSala: string;
  observacoes: string;
  quantidade: number;
};

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

  const regrasEtapa = ehEducacaoInfantil
    ? `
REGRAS ESPECÍFICAS DA EDUCAÇÃO INFANTIL:
- Priorizar oralidade, observação, associação, movimento, exploração, pintura, recorte, traçado e atividades visuais.
- Usar comandos muito curtos.
- Evitar leitura extensa e excesso de escrita.
- Usar imagens pequenas, nítidas e fáceis de reconhecer.
- Não infantilizar de forma exagerada.
- Não usar prova, nota ou linguagem de avaliação formal.
`
    : ehAnosIniciais
      ? `
REGRAS ESPECÍFICAS DOS ANOS INICIAIS:
- Adequar rigorosamente a linguagem à série.
- Para 1º, 2º e 3º anos, usar letra de forma, comandos curtos, imagens pequenas, consciência fonológica, leitura, escrita, numeramento e atividades concretas.
- Para 4º e 5º anos, ampliar interpretação, produção, raciocínio, tabelas, gráficos e resolução de problemas.
- Não infantilizar excessivamente 4º e 5º anos.
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
            : "";

  return `
Você é especialista em criação de folhas de atividades pedagógicas impressas.

Crie uma sequência completa, variada, equilibrada e pronta para revisão.

DADOS INFORMADOS:
Etapa de ensino: ${dados.etapaEnsino}
Série ou turma: ${dados.serie}
Disciplina: ${dados.disciplina}
Conteúdo ou tema: ${dados.conteudo}
O que foi trabalhado em sala: ${dados.trabalhadoSala || "Não informado"}
Observações para a IA: ${dados.observacoes || "Não informado"}
Quantidade solicitada: ${dados.quantidade}

${regrasEtapa}

REGRAS GERAIS:
- Responder somente em português do Brasil.
- Respeitar rigorosamente etapa, série, disciplina e conteúdo.
- Criar exatamente ${dados.quantidade} exercícios.
- Criar atividades realmente prontas para uso.
- Não gerar textos genéricos como "observe as informações" sem apresentar o material necessário.
- Não repetir o mesmo tipo de exercício.
- Não colocar dois exercícios muito parecidos em sequência.
- Organizar do mais simples para o mais complexo.
- Começar com reconhecimento ou retomada.
- Desenvolver compreensão e aplicação.
- Finalizar com desafio, síntese ou produção.
- Usar comandos claros, naturais e com linguagem de professor.
- Não mencionar inteligência artificial.
- Não inventar links de imagens.
- Não usar emojis no lugar das imagens.
- Não escrever textos dentro das imagens.
- Quando uma imagem for necessária, pedir uma figura pequena, isolada, centralizada, sem fundo ou com fundo branco, sem letras e sem elementos extras.
- Caça-palavras, cruzadinha, tabelas, sequências, colunas, gráficos simples e grades devem ser montados por dados estruturados, nunca como imagem.
- O campo "conteudoLivre" deve ser usado somente quando o tipo não puder ser representado apenas por itens.
- Em alfabetização, variar leitura, escrita, sílabas, palavras e compreensão.
- Em Matemática, variar representação, cálculo, sequência, comparação e problema.
- Em Ciências e Humanas, variar identificação, relação, interpretação, análise e explicação.
- Não usar caça-palavras ou cruzadinha apenas para preencher quantidade.
- Cada exercício precisa estar pronto para o sistema desenhar.

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

REGRAS DE ESTRUTURA POR TIPO:

DITADO ILUSTRADO / ESCREVA O NOME DAS FIGURAS:
- Um item para cada figura.
- "texto" deve conter a palavra-alvo.
- "resposta" deve conter a resposta correta.
- "imagemNecessaria": true em cada item.
- "imagemDescricao" deve pedir uma única figura pequena, isolada, centralizada, sem texto e fundo branco ou transparente.
- Nunca pedir uma única imagem contendo vários objetos.

CIRCULE FIGURAS:
- Criar itens misturando respostas corretas e distratores.
- Cada item visual deve ter imagem individual.
- O comando deve dizer claramente o critério.

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
- Apenas uma resposta correta.

VERDADEIRO OU FALSO:
- Um item por afirmação.
- "verdadeiro" deve ser true ou false.
- Misturar afirmações verdadeiras e falsas.

INTERPRETAÇÃO DE TEXTO:
- "textoApoio" deve conter o texto completo.
- "itens" deve conter perguntas variadas.
- Não fazer todas as respostas serem cópias literais.

PROBLEMA MATEMÁTICO:
- Um item por problema.
- Dados suficientes e coerentes.
- Resposta correta em "resposta".

SEQUÊNCIA NUMÉRICA:
- Um item por sequência.
- O padrão deve ser claro e adequado à série.

TABELA / GRÁFICO:
- Usar "colunas" para os títulos.
- Usar "itens" para os dados.
- Não pedir imagem para tabela ou gráfico simples.

PRODUÇÃO DE TEXTO:
- Usar "conteudoLivre" para orientar tema, situação comunicativa, gênero e critérios.

FORMATO JSON OBRIGATÓRIO:
Retorne somente um objeto JSON válido.
Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Título curto da folha",
  "subtitulo": "${dados.serie} • ${dados.disciplina}",
  "modoCriacao": "folha",
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
- "itens" deve sempre ser uma lista.
- "palavras", "pistas", "grade", "colunas" e "alternativas" devem sempre ser listas.
- Use string vazia quando um campo textual não se aplicar.
- Use lista vazia quando uma lista não se aplicar.
- Use false quando imagem não for necessária.
- Use null em "verdadeiro" quando não se aplicar.
- "numero" deve começar em 1 e seguir em ordem.
- "id" do exercício deve ficar vazio; o sistema criará depois.
- Cada item deve ter um id simples como "item-1", "item-2".
`;
}