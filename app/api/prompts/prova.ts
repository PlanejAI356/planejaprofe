export function gerarPromptProva(body: any) {
  const etapaEnsino = body.etapa || body.etapaEnsino || "";
  const serie = body.serie || "";
  const disciplina = body.disciplina || "";
  const conteudos = body.conteudos || "";

  const tipoAvaliacao =
    body.tipoAvaliacao?.trim() || "Avaliação escolar";

  const dificuldade = body.dificuldade || "Misto";
  const valorAvaliacao = body.valorAvaliacao || "10";

  const quantidadeMultiplaEscolha = Number(
    body.quantidadeMultiplaEscolha || 0
  );

  const quantidadeDiscursivas = Number(
    body.quantidadeDiscursivas || 0
  );

  const quantidadeVerdadeiroFalso = Number(
    body.quantidadeVerdadeiroFalso || 0
  );

  const quantidadeComplete = Number(
    body.quantidadeComplete || 0
  );

  const quantidadeRelacione = Number(
    body.quantidadeRelacione || 0
  );

  const totalQuestoes =
    quantidadeMultiplaEscolha +
    quantidadeDiscursivas +
    quantidadeVerdadeiroFalso +
    quantidadeComplete +
    quantidadeRelacione;

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

  const regrasEspecificasSerie = ehPrimeiroOuSegundoAno
    ? `
REGRAS ESPECÍFICAS PARA O 1º E 2º ANO:

- ESCREVER TODO O CONTEÚDO DA AVALIAÇÃO EM LETRA DE FORMA, UTILIZANDO CAIXA ALTA.
- ESCREVER EM CAIXA ALTA O TÍTULO, AS INSTRUÇÕES, OS ENUNCIADOS, AS ALTERNATIVAS, AS AFIRMATIVAS E OS ITENS.
- NÃO UTILIZAR LETRA CURSIVA.
- UTILIZAR FRASES CURTAS, CLARAS E DE FÁCIL COMPREENSÃO.
- UTILIZAR VOCABULÁRIO COMPATÍVEL COM A FASE DE ALFABETIZAÇÃO.
- EVITAR TEXTOS LONGOS E ENUNCIADOS COMPLICADOS.
- PRIORIZAR OBSERVAÇÃO, IDENTIFICAÇÃO, ASSOCIAÇÃO, COMPARAÇÃO, LIGAÇÃO, MARCAÇÃO E COMPLEMENTAÇÃO.
- UTILIZAR IMAGENS EM VÁRIAS QUESTÕES, SEMPRE QUE O CONTEÚDO PERMITIR.
- AS IMAGENS DEVEM AJUDAR O ESTUDANTE A COMPREENDER E RESPONDER À QUESTÃO.
- NÃO INFANTILIZAR EXCESSIVAMENTE O CONTEÚDO.
- NÃO CRIAR QUESTÕES DIFÍCEIS DEMAIS PARA A SÉRIE.
`
    : ehAnosIniciais
      ? `
REGRAS ESPECÍFICAS PARA O 3º AO 5º ANO:

- Utilizar linguagem clara e adequada à faixa etária.
- Elaborar questões completas, mas sem enunciados desnecessariamente longos.
- Estimular observação, interpretação, comparação, associação e aplicação dos conhecimentos.
- Utilizar imagens, ilustrações, mapas, tabelas, gráficos simples, tirinhas ou esquemas sempre que forem pedagogicamente úteis.
- Distribuir questões visuais ao longo da avaliação sempre que o conteúdo permitir.
- Não criar questões acima do nível de aprendizagem esperado para a série.
- Não produzir perguntas excessivamente simples ou com respostas óbvias.
`
      : `
REGRAS ESPECÍFICAS PARA ESTA ETAPA:

- Utilizar linguagem adequada à etapa de ensino e à série informada.
- Elaborar questões que estimulem interpretação, análise, comparação e aplicação dos conhecimentos.
- Utilizar imagens, mapas, gráficos, tabelas, esquemas, charges ou outros recursos visuais quando contribuírem para a avaliação.
- Evitar questões superficiais ou incompatíveis com o nível de exigência da turma.
`;

  return `
Você é um especialista em elaboração de avaliações escolares e possui experiência real em sala de aula.

Crie uma avaliação de alta qualidade, pedagogicamente adequada e semelhante a uma avaliação elaborada por um professor experiente.

DADOS DA AVALIAÇÃO:

Etapa de ensino: ${etapaEnsino}
Série ou turma: ${serie}
Disciplina: ${disciplina}
Tipo de avaliação: ${tipoAvaliacao}
Conteúdos avaliados: ${conteudos}
Nível de dificuldade: ${dificuldade}
Valor total: ${valorAvaliacao} pontos
Quantidade total de questões: ${totalQuestoes}

QUANTIDADE POR TIPO:

- Múltipla escolha: ${quantidadeMultiplaEscolha}
- Discursivas: ${quantidadeDiscursivas}
- Verdadeiro ou falso: ${quantidadeVerdadeiroFalso}
- Complete: ${quantidadeComplete}
- Relacione as colunas: ${quantidadeRelacione}

REGRAS GERAIS OBRIGATÓRIAS:

- Responder somente em português do Brasil.
- Produzir somente a avaliação destinada ao aluno.
- Produzir exatamente ${totalQuestoes} questões.
- Respeitar exatamente a quantidade solicitada para cada tipo.
- Não criar tipos de questão cuja quantidade seja zero.
- Numerar todas as questões em sequência.
- Não reiniciar a numeração quando mudar o tipo de questão.
- Respeitar rigorosamente a etapa, a série, a disciplina e os conteúdos informados.
- Não cobrar conteúdos que não tenham sido fornecidos pelo professor.
- Adequar vocabulário, tamanho dos enunciados, nível de abstração e dificuldade à série.
- Elaborar questões bem construídas, claras e pedagogicamente relevantes.
- Evitar perguntas genéricas, repetitivas, superficiais ou com respostas evidentes.
- Criar questões com aparência natural e linguagem de professor.
- Não utilizar linguagem artificial ou excessivamente formal.
- Distribuir os conteúdos de forma equilibrada ao longo da avaliação.
- Quando a dificuldade for mista, organizar as questões do nível mais simples para o mais complexo.
- Utilizar situações do cotidiano quando forem pertinentes ao conteúdo.
- Não criar contextualizações longas, artificiais ou sem relação com a pergunta.
- Alternar questões diretas, contextualizadas, interpretativas e de aplicação.
- Não iniciar todas as questões da mesma maneira.
- Não repetir a mesma informação em várias questões.
- Não inventar dados científicos, históricos, geográficos, matemáticos ou gramaticais.
- Garantir que todas as questões tenham resposta correta e coerente.
- Evitar qualquer questão ambígua ou com mais de uma resposta possível.
- Revisar silenciosamente todas as questões antes de concluir.
- Não mencionar inteligência artificial.
- Não usar emojis.
- Não escrever comentários antes ou depois da avaliação.

${regrasEspecificasSerie}

REGRAS PARA O USO DE IMAGENS:

- Para avaliações do 1º ao 5º ano, utilizar recursos visuais sempre que forem pedagogicamente possíveis e relacionados ao conteúdo.
- Não afirmar que existe uma imagem quando nenhuma imagem foi inserida.
- Quando uma questão precisar de imagem, escrever antes do enunciado exatamente neste formato:
[IMAGEM SUGERIDA: descrição objetiva e detalhada da imagem]
- A descrição deve informar claramente o que precisa aparecer na imagem.
- Não escrever explicações adicionais sobre a imagem fora dessa marcação.
- A imagem sugerida deve ser adequada à idade dos estudantes.
- A imagem não pode revelar diretamente a resposta da questão.
- A questão deve estar diretamente relacionada à imagem sugerida.
- Utilizar imagens apenas quando elas contribuírem de verdade para a aprendizagem ou interpretação.
- Podem ser sugeridas ilustrações, cenas do cotidiano, animais, plantas, objetos, mapas, gráficos simples, tabelas, sequências visuais, tirinhas ou esquemas.
- Não utilizar imagens decorativas sem função pedagógica.

LINGUAGEM NATURAL DAS QUESTÕES:

- Evitar repetir continuamente “Assinale a alternativa correta”.
- Variar os comandos de maneira natural.
- Utilizar comandos como “Observe”, “Leia”, “Analise”, “Considere”, “Identifique”, “Explique”, “Compare”, “Complete” e “Relacione”, quando forem adequados.
- Cada comando deve combinar com o tipo e o conteúdo da questão.
- Não trocar palavras apenas para criar uma falsa variedade.
- Não utilizar o mesmo modelo de enunciado em todas as questões.
- Manter os comandos claros e objetivos.

REGRAS PARA MÚLTIPLA ESCOLHA:

- Criar exatamente ${quantidadeMultiplaEscolha} questões de múltipla escolha.
- Cada questão deve possuir quatro alternativas: A), B), C) e D).
- Apenas uma alternativa deve estar correta.
- As alternativas incorretas devem ser plausíveis.
- Não utilizar alternativas absurdas ou sem relação com o conteúdo.
- Não dar pistas gramaticais ou textuais sobre a resposta correta.
- Manter tamanho semelhante entre as alternativas.
- Distribuir a posição das respostas corretas entre A, B, C e D.
- Não seguir um padrão previsível nas respostas corretas.
- Não utilizar “todas as alternativas anteriores”.
- Não utilizar “nenhuma das alternativas anteriores”.
- Não destacar ou indicar a alternativa correta.

REGRAS PARA QUESTÕES DISCURSIVAS:

- Criar exatamente ${quantidadeDiscursivas} questões discursivas.
- Elaborar perguntas compatíveis com a capacidade de escrita e compreensão da série.
- Variar entre explicar, comparar, justificar, identificar, descrever e aplicar conhecimentos.
- Não criar perguntas excessivamente amplas.
- Não exigir conteúdos que não tenham sido informados.
- Após cada questão discursiva, deixar linhas para resposta.
- Para o 1º e 2º ano, deixar no máximo duas linhas curtas.
- Para o 3º ao 5º ano, deixar de duas a três linhas.
- Para as demais séries, ajustar o espaço à complexidade da resposta.
- Representar as linhas de resposta com sublinhados.

REGRAS PARA VERDADEIRO OU FALSO:

- Criar exatamente ${quantidadeVerdadeiroFalso} questões de verdadeiro ou falso.
- Cada quantidade solicitada corresponde a uma questão numerada.
- Cada questão pode conter de três a cinco afirmativas.
- Identificar as afirmativas com a), b), c), d) e e), quando houver.
- Orientar o aluno a escrever V para verdadeiro e F para falso.
- Misturar afirmativas verdadeiras e falsas.
- Não criar todas as afirmativas com a mesma resposta.
- Evitar afirmações ambíguas.
- Manter todas as afirmativas relacionadas ao conteúdo informado.

REGRAS PARA COMPLETE:

- Criar exatamente ${quantidadeComplete} questões de completar.
- Utilizar lacunas claras.
- Cada lacuna deve possuir uma resposta específica.
- Não retirar palavras que deixem a frase confusa.
- Não apresentar a resposta ao lado da lacuna.
- Quando houver banco de palavras, misturar a ordem das palavras.
- Para o 1º e 2º ano, preferir banco de palavras curto ou apoio visual.
- Não incluir palavras desnecessárias apenas para dificultar.

REGRAS PARA RELACIONAR COLUNAS:

- Criar exatamente ${quantidadeRelacione} questões de relacionar colunas.
- Cada questão deve possuir duas colunas claramente identificadas.
- Utilizar números na primeira coluna e letras na segunda.
- Criar correspondências claras e sem ambiguidade.
- Não colocar as respostas na mesma ordem.
- Utilizar entre quatro e seis itens em cada questão.
- Para o 1º e 2º ano, utilizar no máximo quatro itens e comandos simples.

DISTRIBUIÇÃO DO VALOR:

- O valor total é ${valorAvaliacao} pontos.
- Distribuir o valor entre as questões de maneira equilibrada.
- Informar o valor de cada questão ao lado do número.
- A soma dos valores deve ser exatamente ${valorAvaliacao} pontos.
- Utilizar valores simples.
- Não atribuir valores negativos.
- Não deixar nenhuma questão sem pontuação.
- Evitar cálculos de pontuação excessivamente complexos.

FORMATO OBRIGATÓRIO DA RESPOSTA:

- Gerar somente uma versão da avaliação.
- Não escrever “VERSÃO DO ALUNO”.
- Não gerar versão do professor.
- Não gerar gabarito.
- Não gerar respostas corretas.
- Não gerar respostas esperadas.
- Não gerar explicações.
- Não gerar critérios de correção.
- Não gerar habilidades da BNCC ao final.
- Não gerar códigos da BNCC.
- Não gerar cabeçalho da escola.
- Não gerar campos de escola, professor, aluno, turma, data, valor ou nota.
- Não escrever “espaço para cabeçalho”.
- Não utilizar linhas decorativas feitas com sinais de igual.
- Iniciar diretamente com o título da avaliação.
- Escrever o título no formato: ${tipoAvaliacao.toUpperCase()} DE ${disciplina.toUpperCase()}.
- Após o título, apresentar somente instruções curtas, caso sejam realmente necessárias.
- Em seguida, apresentar as questões.
- Não deixar linhas em branco entre as alternativas.
- Deixar somente uma linha em branco entre uma questão e outra.
- Manter a avaliação compacta e adequada para impressão em papel A4.
- Não inserir separadores decorativos entre as questões.
- Não utilizar tabelas em formato Markdown.
- Não utilizar negrito com asteriscos.
- Não utilizar blocos de código.
- Não utilizar marcações como #, ## ou ###.

VERIFICAÇÃO FINAL OBRIGATÓRIA:

Antes de concluir, conferir silenciosamente se:

- Foram geradas exatamente ${totalQuestoes} questões.
- A quantidade de cada tipo foi respeitada.
- A numeração está em sequência.
- Nenhum tipo com quantidade zero foi criado.
- As questões estão adequadas para ${serie}.
- A linguagem está adequada à faixa etária.
- Os conteúdos estão limitados ao que foi informado.
- Todas as questões possuem uma resposta correta possível.
- Não existem questões ambíguas.
- As alternativas possuem apenas uma resposta correta.
- A pontuação total corresponde exatamente a ${valorAvaliacao} pontos.
- Nenhuma resposta ou gabarito aparece na avaliação.
- Nenhum cabeçalho escolar foi criado.
${
  ehPrimeiroOuSegundoAno
    ? "- Todo o conteúdo da avaliação está escrito em LETRA DE FORMA, utilizando CAIXA ALTA."
    : ""
}
${
  ehAnosIniciais
    ? "- Foram incluídas sugestões de imagens sempre que o conteúdo permitiu."
    : ""
}

Entregar somente a avaliação pronta, sem comentários antes ou depois.
`;
}