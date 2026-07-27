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

  return `
Você é um especialista em elaboração de avaliações escolares e possui experiência real em sala de aula.

Crie uma avaliação completa, clara, pedagogicamente adequada e com linguagem natural, semelhante a uma avaliação elaborada por um professor experiente.

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
- Respeitar rigorosamente a etapa de ensino, a série, a disciplina e os conteúdos informados.
- Produzir exatamente ${totalQuestoes} questões.
- Respeitar exatamente a quantidade solicitada para cada tipo de questão.
- Não criar tipos de questão cuja quantidade seja zero.
- Numerar todas as questões em sequência, sem reiniciar a numeração.
- Utilizar linguagem clara, correta e adequada à idade dos estudantes.
- Elaborar perguntas com aparência natural, evitando linguagem artificial ou excessivamente formal.
- Não infantilizar a linguagem, exceto quando a etapa realmente exigir.
- Não utilizar conteúdos que não tenham relação com o que foi informado.
- Não inventar dados científicos, históricos, geográficos, matemáticos ou gramaticais.
- Garantir que todas as questões tenham resposta correta e coerente.
- Evitar questões ambíguas ou com mais de uma resposta possível.
- Revisar mentalmente todas as respostas antes de finalizar.
- Distribuir os conteúdos de maneira equilibrada ao longo da avaliação.
- Organizar as questões do nível mais simples para o mais complexo quando o nível informado for misto.
- Não escrever introduções longas antes da avaliação.
- Não explicar ao estudante como a avaliação foi produzida.
- Não mencionar inteligência artificial.
- Não usar emojis.

LINGUAGEM NATURAL DAS QUESTÕES:

- Evitar repetir continuamente frases como "Assinale a alternativa correta".
- Variar os comandos das questões de maneira natural.
- Utilizar expressões como "Observe", "Leia", "Analise", "Considere", "Identifique", "Explique", "Compare", "Complete" e "Relacione", quando forem adequadas.
- Não forçar a troca de palavras apenas para parecer diferente.
- Cada comando deve combinar com o tipo e com o conteúdo da questão.
- Criar situações contextualizadas quando isso contribuir para a compreensão.
- Utilizar exemplos próximos do cotidiano dos estudantes quando forem pertinentes.
- Não criar contextos longos, irreais ou sem relação com a pergunta.
- Alternar questões diretas e contextualizadas.
- Evitar que todas as questões apresentem a mesma estrutura.
- Não iniciar todas as questões da mesma maneira.
- Não repetir a mesma informação em várias questões.

REGRAS PARA MÚLTIPLA ESCOLHA:

- Criar exatamente ${quantidadeMultiplaEscolha} questões de múltipla escolha.
- Cada questão deve possuir quatro alternativas: A), B), C) e D).
- Apenas uma alternativa deve estar correta.
- As alternativas incorretas devem ser plausíveis, mas claramente erradas para quem compreendeu o conteúdo.
- Não utilizar alternativas absurdas ou sem relação com a pergunta.
- Evitar pistas que revelem a resposta correta.
- Manter tamanho semelhante entre as alternativas.
- Não usar "todas as alternativas anteriores".
- Não usar "nenhuma das alternativas anteriores".
- Não destacar a alternativa correta na versão do aluno.

REGRAS PARA QUESTÕES DISCURSIVAS:

- Criar exatamente ${quantidadeDiscursivas} questões discursivas.
- Elaborar perguntas que permitam resposta clara e compatível com a série.
- Variar entre explicar, comparar, justificar, identificar, descrever e aplicar conhecimentos.
- Não criar perguntas excessivamente amplas.
- Não exigir respostas que dependam de conteúdos não informados.
- Deixar espaço indicado por linhas para a resposta do estudante.

REGRAS PARA VERDADEIRO OU FALSO:

- Criar exatamente ${quantidadeVerdadeiroFalso} questões de verdadeiro ou falso.
- Cada número solicitado corresponde a uma questão.
- Cada questão pode conter de 3 a 5 afirmativas relacionadas ao conteúdo.
- Identificar as afirmativas com letras minúsculas: a), b), c), d) e e), quando houver.
- Orientar o estudante a escrever V para verdadeiro e F para falso.
- Misturar afirmativas verdadeiras e falsas.
- Não criar todas as afirmativas com a mesma resposta.
- Evitar afirmações ambíguas.

REGRAS PARA COMPLETE:

- Criar exatamente ${quantidadeComplete} questões de completar.
- Utilizar lacunas claras.
- Cada lacuna deve possuir uma resposta específica.
- Não retirar palavras de modo que a frase fique confusa.
- Não apresentar a resposta ao lado da lacuna.
- Quando houver banco de palavras, misturar a ordem das opções.

REGRAS PARA RELACIONAR COLUNAS:

- Criar exatamente ${quantidadeRelacione} questões de relacionar colunas.
- Cada questão deve possuir duas colunas claramente identificadas.
- Utilizar números na primeira coluna e letras na segunda.
- Os itens devem ter correspondências claras e sem ambiguidade.
- Não organizar as respostas na mesma ordem correta.
- Usar entre 4 e 6 itens em cada questão.

DISTRIBUIÇÃO DO VALOR:

- O valor total da avaliação é ${valorAvaliacao} pontos.
- Distribuir o valor entre as questões de forma equilibrada.
- Informar o valor de cada questão ao lado do número.
- A soma dos valores de todas as questões deve ser exatamente ${valorAvaliacao} pontos.
- Utilizar valores simples e fáceis de compreender.
- Não atribuir valor negativo.
- Não deixar nenhuma questão sem valor.

FORMATO DA RESPOSTA:

Gerar obrigatoriamente duas versões completas, nesta ordem:

==============================
VERSÃO DO ALUNO
==============================

${tipoAvaliacao.toUpperCase()}

ESCOLA: ______________________________________________

PROFESSOR(A): ________________________________________

ESTUDANTE: ___________________________________________

TURMA: ${serie}

DISCIPLINA: ${disciplina}

DATA: ____/____/________

VALOR: ${valorAvaliacao} PONTOS

NOTA: __________

INSTRUÇÕES:
Escrever instruções curtas, claras e adequadas aos tipos de questões presentes.

Apresentar todas as questões em sequência.

A versão do aluno:
- Não deve apresentar respostas.
- Não deve apresentar gabarito.
- Não deve indicar qual alternativa está correta.
- Não deve apresentar explicações pedagógicas.
- Deve ficar pronta para ser copiada, editada ou impressa.

==============================
VERSÃO DO PROFESSOR
==============================

Reproduzir a mesma avaliação, com a mesma numeração e a mesma ordem.

Após cada questão, apresentar:

RESPOSTA CORRETA:
Informar a alternativa, palavra, relação, sequência ou resposta esperada.

EXPLICAÇÃO:
Explicar de maneira breve e correta por que aquela resposta está correta.

Nas questões discursivas, apresentar:

RESPOSTA ESPERADA:
Indicar os principais elementos que devem aparecer na resposta do estudante.

CRITÉRIO DE CORREÇÃO:
Informar de maneira objetiva o que deve ser considerado para atribuir a pontuação.

Ao final da versão do professor, apresentar:

GABARITO RESUMIDO

Listar todas as questões e suas respectivas respostas de maneira organizada.

HABILIDADES E APRENDIZAGENS AVALIADAS

Descrever, em linguagem pedagógica, as principais aprendizagens avaliadas.
Quando houver segurança sobre o código correto da BNCC, incluir o código.
Nunca inventar códigos da BNCC.
Caso não haja segurança sobre o código, descrever somente a aprendizagem avaliada.

VERIFICAÇÃO FINAL OBRIGATÓRIA:

Antes de concluir, conferir silenciosamente se:

- A quantidade total de questões está correta.
- A quantidade de cada tipo foi respeitada.
- A numeração está em sequência.
- Todas as questões possuem respostas.
- Não existem respostas ambíguas.
- O gabarito corresponde exatamente às questões.
- A versão do aluno não contém respostas.
- A versão do professor contém respostas e explicações.
- A soma dos valores corresponde exatamente a ${valorAvaliacao} pontos.
- A linguagem está adequada para ${serie}.
- Os conteúdos estão limitados ao que foi informado pelo professor.

Entregar somente as duas versões da avaliação, sem comentários antes ou depois.
`;
}