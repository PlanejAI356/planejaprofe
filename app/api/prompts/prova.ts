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

  const ehPrimeiroAoTerceiroAno =
    ehPrimeiroAno ||
    ehSegundoAno ||
    ehTerceiroAno;

  const regrasEspecificasSerie =
    ehPrimeiroAoTerceiroAno
      ? `
REGRAS ESPECÍFICAS PARA O 1º AO 3º ANO:

- ESCREVER OS COMANDOS, ENUNCIADOS, ALTERNATIVAS, AFIRMATIVAS E ITENS DAS QUESTÕES EM LETRA DE FORMA, UTILIZANDO CAIXA ALTA.
- OS TÍTULOS TAMBÉM PODEM SER ESCRITOS EM CAIXA ALTA.
- NÃO UTILIZAR LETRA CURSIVA.
- UTILIZAR FRASES CLARAS E VOCABULÁRIO COMPATÍVEL COM A FASE DE ALFABETIZAÇÃO.
- PARA O 1º E 2º ANO, PRIORIZAR TEXTOS MAIS CURTOS E ACESSÍVEIS, SEM PREJUDICAR O SENTIDO.
- PARA O 3º ANO, OS TEXTOS PODEM SER MAIS DESENVOLVIDOS, MAS DEVEM CONTINUAR ADEQUADOS À FLUÊNCIA LEITORA ESPERADA.
- PRIORIZAR OBSERVAÇÃO, IDENTIFICAÇÃO, ASSOCIAÇÃO, COMPARAÇÃO, INTERPRETAÇÃO, MARCAÇÃO E COMPLEMENTAÇÃO.
- UTILIZAR IMAGENS EM VÁRIAS QUESTÕES, SEMPRE QUE O CONTEÚDO PERMITIR E A IMAGEM TIVER FUNÇÃO PEDAGÓGICA.
- NÃO INFANTILIZAR EXCESSIVAMENTE O CONTEÚDO.
- NÃO CRIAR QUESTÕES DIFÍCEIS DEMAIS PARA A SÉRIE.
`
      : ehAnosIniciais
        ? `
REGRAS ESPECÍFICAS PARA O 4º E 5º ANO:

- Utilizar escrita normal, respeitando as regras ortográficas do português.
- Não escrever enunciados, alternativas, afirmativas ou textos inteiros em caixa alta.
- Utilizar maiúsculas apenas no início das frases, em nomes próprios, siglas e demais casos previstos pela norma.
- Os títulos podem permanecer em caixa alta.
- Utilizar linguagem clara e adequada à faixa etária.
- Elaborar questões completas, interpretativas e pedagogicamente relevantes.
- Utilizar textos mais desenvolvidos, com informações suficientes para sustentar questões de compreensão e interpretação.
- Estimular observação, interpretação, comparação, associação, inferência e aplicação dos conhecimentos.
- Utilizar imagens, ilustrações, mapas, tabelas, gráficos simples, tirinhas ou esquemas quando forem pedagogicamente úteis.
- Não criar questões acima do nível de aprendizagem esperado para a série.
- Não produzir perguntas excessivamente simples ou com respostas óbvias.
`
        : `
REGRAS ESPECÍFICAS PARA ESTA ETAPA:

- Utilizar escrita normal, respeitando as regras ortográficas do português.
- Não escrever enunciados, alternativas, afirmativas ou textos inteiros em caixa alta.
- Utilizar maiúsculas apenas no início das frases, em nomes próprios, siglas e demais casos previstos pela norma.
- Os títulos podem permanecer em caixa alta.
- Utilizar linguagem adequada à etapa de ensino e à série informada.
- Elaborar questões que estimulem interpretação, análise, comparação, inferência e aplicação dos conhecimentos.
- Quando houver texto-base, utilizar textos mais desenvolvidos, informativos e compatíveis com a complexidade da série.
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


REGRAS OBRIGATÓRIAS PARA TEXTOS E QUESTÕES BASEADAS EM TEXTO:

- Sempre que utilizar um texto na avaliação, criar um TÍTULO PRÓPRIO, significativo e diretamente relacionado ao assunto do texto.
- NUNCA utilizar “TEXTO DE APOIO”, “TEXTO BASE”, “TEXTO PARA AS QUESTÕES” ou expressões semelhantes como título do texto.
- Apresentar primeiro o título próprio e, logo abaixo, o texto.
- O título deve parecer um título real de texto, e não uma instrução ao aluno.
- O texto deve possuir começo, desenvolvimento e conclusão ou fechamento coerente, conforme o gênero textual e a série.
- Não gerar textos excessivamente curtos, genéricos ou formados apenas por poucas frases soltas.
- Para o 1º e 2º ano, manter textos curtos, claros e adequados à alfabetização.
- Para o 3º ano, produzir textos de extensão moderada e com informações suficientes para interpretação.
- A partir do 4º ano, quando houver texto-base, produzir textos substanciais e bem desenvolvidos, preferencialmente com vários parágrafos quando o gênero permitir.
- Para os anos finais do Ensino Fundamental, Ensino Médio e EJA, aumentar progressivamente a densidade de informações, o vocabulário e a profundidade do texto, sempre respeitando a etapa.
- O texto deve conter informações suficientes para permitir questões de localização de informação, compreensão, interpretação, inferência, vocabulário em contexto, relação entre ideias e compreensão global, conforme a série.
- Não alongar o texto artificialmente com repetições ou informações irrelevantes.
- Quando várias questões utilizarem o mesmo texto, apresentar o texto apenas uma vez e fazer referência natural a ele nas questões seguintes.
- Toda questão apresentada como baseada em um texto deve poder ser respondida a partir das informações, ideias ou inferências legitimamente sustentadas por esse texto.
- Não criar questões supostamente relacionadas ao texto cuja resposta dependa de informação que o texto não apresenta.
- Variar o nível das questões sobre o texto: algumas podem localizar informações explícitas e outras podem exigir interpretação ou inferência, conforme a faixa etária.
- Não fornecer no enunciado da questão a própria resposta encontrada no texto.
- Se o professor COLAR ou FORNECER integralmente um texto nos conteúdos ou nas orientações, preservar esse texto e utilizá-lo como base das questões, sem reescrevê-lo desnecessariamente.
- Se o professor fornecer apenas o título ou o nome de uma obra/texto específico, sem fornecer seu conteúdo, NÃO inventar trechos e NÃO afirmar que está reproduzindo o original.
- Quando apenas o título de uma obra protegida for informado sem o texto, criar, quando pedagogicamente adequado, um texto ORIGINAL sobre o mesmo tema ou contexto, sem copiar ou imitar trechos da obra, e deixar as questões baseadas somente no texto original gerado.
- Se o texto solicitado for claramente de domínio público e seu conteúdo for conhecido com segurança, ele poderá ser utilizado; se houver dúvida, preferir um texto original.
- Não atribuir a autores reais textos inventados pelo sistema.

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

ORDEM E VARIEDADE DAS QUESTÕES:

- Não agrupar todas as questões do mesmo tipo.
- Misturar os diferentes tipos de questões ao longo da avaliação.
- Intercalar múltipla escolha, discursiva, verdadeiro ou falso, completar e relacionar sempre que houver mais de um tipo solicitado.
- Não colocar primeiro todas as questões de marcar e depois todas as questões de escrever.
- Manter a numeração em sequência, independentemente do tipo da questão.
- Variar a ordem dos tipos de questões em cada nova avaliação.
- Não utilizar sempre a mesma sequência.
- Uma nova avaliação sobre o mesmo conteúdo deve apresentar uma ordem diferente da avaliação anterior.
- Variar também os comandos, os contextos e a estrutura dos enunciados.
- Evitar que duas avaliações sobre o mesmo conteúdo fiquem praticamente iguais.
- Mesmo misturando os tipos, manter uma progressão de dificuldade.
- Iniciar com uma questão mais acessível.
- Distribuir questões de dificuldade intermediária ao longo da avaliação.
- Colocar questões que exigem maior interpretação ou elaboração mais para o meio ou para o final.
- Não deixar todas as questões discursivas consecutivas.
- Não deixar todas as questões com imagem consecutivas.
- Quando houver somente um tipo de questão solicitado, utilizar apenas esse tipo.

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
- Nunca utilizar as expressões “mais correta” ou “melhor resposta”.
- A questão deve possuir apenas uma resposta correta, sem grau de comparação.
- Manter as alternativas curtas, claras e com tamanhos semelhantes.
- Evitar uma alternativa visivelmente maior ou mais detalhada que as demais.

REGRAS PARA QUESTÕES DISCURSIVAS:

- Criar exatamente ${quantidadeDiscursivas} questões discursivas.
- Elaborar perguntas compatíveis com a capacidade de leitura, compreensão e escrita da série.
- Variar entre explicar, comparar, justificar, identificar, descrever e aplicar conhecimentos.
- Não criar perguntas excessivamente amplas.
- Não exigir conteúdos que não tenham sido informados.
- Não utilizar duas perguntas diferentes dentro do mesmo enunciado, exceto quando forem diretamente relacionadas.
- Para respostas curtas, deixar duas linhas.
- Para questões que pedem explicação ou descrição, deixar três linhas.
- Para questões que pedem comparação ou justificativa, deixar quatro linhas.
- Representar as linhas de resposta com sublinhados.
- Não deixar sempre a mesma quantidade de linhas em todas as discursivas.

REGRAS PARA VERDADEIRO OU FALSO:

- Criar exatamente ${quantidadeVerdadeiroFalso} questões de verdadeiro ou falso.
- Cada quantidade solicitada corresponde a uma questão numerada.
- Cada questão pode conter de três a cinco afirmativas.
- Antes das afirmativas, escrever uma orientação curta para o aluno indicar V ou F.
- Não utilizar letras a), b), c), d) ou e) antes das afirmativas.
- Cada afirmativa deve começar exatamente com:
  (     )
- Escrever somente uma afirmativa por linha.
- Não colocar espaço para resposta no final da frase.
- Não utilizar sublinhados depois da afirmativa.
- Misturar afirmativas verdadeiras e falsas.
- Não criar todas as afirmativas com a mesma resposta.
- Não seguir padrões previsíveis, como V, F, V, F.
- Evitar afirmações ambíguas.
- Manter todas as afirmativas relacionadas aos conteúdos informados.

REGRAS PARA COMPLETE:

- Criar exatamente ${quantidadeComplete} questões de completar.
- Utilizar lacunas claras.
- Cada lacuna deve possuir uma resposta específica.
- Não retirar palavras que deixem a frase confusa.
- Não apresentar a resposta ao lado da lacuna.
- Quando houver banco de palavras, misturar a ordem das palavras.
- Não colocar palavras no banco que não serão utilizadas.
- Não repetir a mesma palavra em duas lacunas, salvo quando isso for pedagogicamente necessário.
- Quando houver mais de três lacunas, dividir a atividade em frases ou itens menores.
- Evitar textos longos com muitas lacunas seguidas.
- Preferir frases independentes e visualmente organizadas.
- Para o 1º ao 3º ano, utilizar banco de palavras curto ou apoio visual quando isso for adequado à habilidade avaliada.

REGRAS PARA RELACIONAR COLUNAS:

- Criar exatamente ${quantidadeRelacione} questões de relacionar colunas.
- Cada questão deve possuir duas colunas claramente identificadas.
- Utilizar números na primeira coluna e letras na segunda.
- Criar correspondências claras e sem ambiguidade.
- Não colocar as respostas na mesma ordem.
- Utilizar entre quatro e seis itens em cada questão.
- Para o 1º ao 3º ano, utilizar no máximo quatro itens quando a complexidade da atividade exigir maior apoio ao estudante.
- Manter textos curtos em cada item.
- Evitar itens muito longos que dificultem a organização em colunas.
- Não utilizar tabelas em formato Markdown.

DISTRIBUIÇÃO DO VALOR:

- O valor total da avaliação é ${valorAvaliacao} pontos.
- Não informar o valor ao lado de cada questão.
- Não utilizar formatos como:
  1) (1,0)
  2) (0,5)
- Apresentar apenas a numeração:
  1)
  2)
- A distribuição da pontuação será feita posteriormente na versão do professor.

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
- Nenhuma resposta ou gabarito aparece na avaliação.
- Nenhum cabeçalho escolar foi criado.
- Nenhuma questão apresenta valor ao lado da numeração.
- Os diferentes tipos de questão estão distribuídos ao longo da avaliação.
- As questões não foram agrupadas por tipo.
- A sequência utilizada não segue sempre o mesmo padrão.
- As afirmativas de verdadeiro ou falso começam com (     ).
- Nenhuma afirmativa de verdadeiro ou falso utiliza letras ou sublinhado no final.
- As questões discursivas possuem quantidade de linhas proporcional à resposta esperada.
- As questões de completar não possuem textos excessivamente longos.
- Todo texto utilizado possui título próprio e significativo.
- Nenhum texto utiliza “TEXTO DE APOIO” ou expressão semelhante como título.
- Os textos possuem extensão e profundidade adequadas à série.
- As questões baseadas em texto podem ser respondidas ou inferidas legitimamente a partir do próprio texto.
${
  ehPrimeiroAoTerceiroAno
    ? "- Os comandos, enunciados, alternativas, afirmativas e itens das questões estão em LETRA DE FORMA e CAIXA ALTA, conforme a regra do 1º ao 3º ano."
    : "- Os enunciados, alternativas, afirmativas e textos estão em escrita normal, sem uso indevido de caixa alta."
}
${
  ehAnosIniciais
    ? "- Foram incluídas sugestões de imagens sempre que o conteúdo permitiu."
    : ""
}

Entregar somente a avaliação pronta, sem comentários antes ou depois.
`;
}