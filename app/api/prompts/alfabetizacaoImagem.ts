type DadosAlfabetizacaoImagem = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  pedido: string;
  quantidadeQuestoes?: number | null;
};

export function gerarPromptAlfabetizacaoImagem(
  dados: DadosAlfabetizacaoImagem
) {
  const quantidade =
    dados.quantidadeQuestoes !== null &&
    dados.quantidadeQuestoes !== undefined &&
    Number.isFinite(Number(dados.quantidadeQuestoes))
      ? Math.max(
          1,
          Math.min(
            20,
            Number(dados.quantidadeQuestoes)
          )
        )
      : null;

  const regraQuantidade = quantidade
    ? `
QUANTIDADE DE QUESTÕES:

Quando a atividade escolhida permitir várias questões independentes,
criar exatamente ${quantidade} questões principais.

IMPORTANTE:
- Respeitar exatamente a quantidade informada pelo professor.
- Essa quantidade se refere apenas a atividades organizadas em questões.
- Não transformar caça-palavras, cruzadinha, autoditado ou outra atividade visual única em ${quantidade} questões.
`
    : `
QUANTIDADE DE QUESTÕES:

O professor não informou uma quantidade específica de questões.

REGRA:
- Não assumir automaticamente 6 questões.
- Definir uma quantidade pedagogicamente adequada ao tipo de atividade,
  ao conteúdo solicitado e principalmente à série/turma.
- Se o formato for uma atividade visual única, como caça-palavras,
  cruzadinha ou autoditado, não criar questões extras apenas para
  preencher a folha.
`;

  return `
Crie UMA FOLHA DE ATIVIDADE PEDAGÓGICA,
com aparência de material escolar profissional e pronta para impressão.

DADOS:

Etapa de ensino:
${dados.etapaEnsino}

Série ou turma:
${dados.serie}

Disciplina:
${dados.disciplina}

Pedido do professor:
${dados.pedido}

OBJETIVO PRINCIPAL:

Transformar o pedido do professor em uma folha de atividade visual,
clara, organizada, pedagogicamente adequada e pronta para o aluno utilizar.

A atividade deve parecer uma folha pedagógica criada por um professor,
e NÃO uma prova tradicional, salvo se o professor pedir explicitamente.

REGRA PEDAGÓGICA PRINCIPAL:

A SÉRIE OU TURMA INFORMADA É O PRINCIPAL CRITÉRIO PEDAGÓGICO.

A atividade deve ser criada especificamente para:

ETAPA:
${dados.etapaEnsino}

SÉRIE/TURMA:
${dados.serie}

DISCIPLINA:
${dados.disciplina}

É OBRIGATÓRIO:

- respeitar rigorosamente a idade e o nível de escolarização da turma;
- adequar vocabulário;
- adequar tamanho dos enunciados;
- adequar quantidade de leitura;
- adequar dificuldade;
- adequar tamanho e complexidade das respostas;
- adequar as imagens à faixa etária;
- adequar o nível de abstração;
- não criar conteúdo acima do nível da série;
- não infantilizar estudantes de séries mais avançadas;
- não usar atividades excessivamente complexas para crianças pequenas.

FORMATO:

- Criar uma única folha vertical.
- Aparência proporcional a uma folha A4.
- Fundo branco.
- Margens regulares.
- Não cortar nenhum elemento.
- Não deixar texto ou desenho ultrapassar as margens.
- Aproveitar bem a área útil da página.
- Usar quadros ou divisões visuais apenas quando ajudarem na organização.
- Evitar espaços vazios excessivos.
- Evitar excesso de decoração.
- Priorizar clareza e legibilidade.

DIAGRAMAÇÃO:

- Usar bem toda a área útil da folha.
- Manter margens adequadas para impressão.
- O título deve aparecer próximo ao topo.
- Distribuir os exercícios de forma equilibrada.
- Não apertar demais os elementos.
- Deixar espaço suficiente para o aluno responder.
- Manter desenhos e textos proporcionalmente equilibrados.
- Não deixar nenhum exercício encostado nas bordas.
- A atividade deve parecer uma folha pedagógica pronta para impressão.
- Toda a atividade deve ficar visualmente contida dentro da moldura.
- O título deve ficar centralizado ou bem destacado no início da atividade.
- Manter aproximadamente o mesmo espaçamento entre a moldura e o conteúdo em todos os lados.
- Quando houver várias questões, utilizar divisões visuais discretas quando necessário.
- Não deixar grandes áreas vazias.
- Não apertar excessivamente os exercícios.
- A última questão ou elemento também deve permanecer totalmente dentro da borda.

CABEÇALHO:

NÃO criar cabeçalho de identificação dentro da imagem.

NÃO escrever:

- NOME
- ALUNO(A)
- ESCOLA
- TURMA
- DATA
- PROFESSOR(A)
- NOTA

Não criar logotipo, brasão ou identificação institucional.

O sistema PlanejAI poderá acrescentar um cabeçalho posteriormente.

A imagem deve começar pelo título da atividade e pelo conteúdo pedagógico.

TÍTULO:

Criar um título curto e claro relacionado ao pedido do professor.

REGRAS DE ESCRITA:

- Responder em português do Brasil.
- Conferir rigorosamente a ortografia.
- Conferir acentuação.
- Conferir concordância.
- Não criar palavras inexistentes.
- Não cortar palavras.
- Não misturar letras dentro das palavras.
- Não escrever textos borrados ou ilegíveis.
- Todos os comandos devem estar completos.

ADEQUAÇÃO À SÉRIE:

A atividade deve ser adequada especificamente a:
${dados.serie}

Para Educação Infantil:

- priorizar experiências visuais e lúdicas;
- usar pouquíssimo texto;
- utilizar comandos muito curtos;
- utilizar imagens maiores e facilmente reconhecíveis;
- evitar estrutura de prova tradicional;
- priorizar identificação, associação, percepção, oralidade, coordenação e brincadeira.

Para 1º e 2º ano:

- usar pouco texto;
- utilizar comandos curtos;
- usar imagens maiores quando apropriado;
- priorizar identificação, associação, leitura inicial e escrita inicial;
- utilizar LETRA DE FORMA SIMPLES;
- evitar questões discursivas longas;
- evitar interpretação de texto extensa;
- considerar o processo de alfabetização.

Para 3º, 4º e 5º ano:

- utilizar linguagem clara;
- permitir leitura e interpretação compatíveis com a série;
- aumentar gradualmente a complexidade;
- não utilizar linguagem infantilizada;
- manter comandos objetivos.

Para Anos Finais, Ensino Médio e EJA:

- utilizar vocabulário adequado à etapa;
- não infantilizar a apresentação;
- permitir maior complexidade conceitual;
- criar questões e comandos compatíveis com a escolaridade;
- utilizar imagens apenas quando tiverem função pedagógica.

LETRA PARA ALFABETIZAÇÃO:

Quando a atividade envolver alfabetização:

- usar letra de forma simples;
- usar aparência semelhante a Arial ou Helvetica;
- não utilizar Times New Roman para letras de traçado;
- não usar letra cursiva no traçado, salvo se solicitado;
- quando houver letra para cobrir, utilizar letra grande e pontilhada;
- utilizar preferencialmente letras maiúsculas quando adequado à fase de alfabetização.

IMAGENS:

Quando usar imagens:

- criar os desenhos diretamente dentro da folha;
- usar ilustrações simples e facilmente reconhecíveis;
- manter fundo claro ou branco;
- usar contorno nítido;
- evitar desenhos excessivamente detalhados;
- não utilizar marcas-d'água;
- não colocar palavras dentro das figuras;
- não colocar automaticamente o nome do objeto quando ele for a resposta esperada;
- escolher imagens adequadas à idade da turma.

ATIVIDADES DE PINTAR OU COLORIR:

Quando uma questão pedir ao estudante para PINTAR ou COLORIR:

- TODAS as figuras pertencentes àquela questão devem ser apresentadas em PRETO E BRANCO;
- usar somente contornos pretos nítidos sobre fundo branco;
- não preencher nenhuma parte das figuras com cores;
- nenhuma figura dessa questão pode vir previamente colorida;
- isso vale tanto para as respostas corretas quanto para as incorretas;
- não utilizar cores como pista para indicar a resposta;
- criar as figuras com aparência de desenho próprio para colorir;
- deixar áreas internas adequadas para a criança pintar;
- esta regra vale para toda instrução equivalente a "pinte", "colorir" ou "colora";
- outras questões que NÃO peçam pintura podem utilizar imagens coloridas quando pedagogicamente adequado.

COERÊNCIA ENTRE FIGURA E PALAVRA:

Conferir rigorosamente se cada imagem corresponde à palavra,
conceito ou resposta esperada.

Não usar figuras ambíguas.

Quando o professor fornecer palavras específicas,
respeitar exatamente essas palavras.

COMPLETAR PALAVRAS:

Quando houver exercícios de completar:

- colocar a lacuna exatamente no local correto;
- não revelar a resposta;
- manter espaço suficiente para escrita;
- respeitar o objetivo pedagógico informado;
- respeitar o nível da série.

LIGAR:

Quando houver exercício de ligar:

- colocar os elementos em duas áreas ou colunas;
- misturar a ordem das respostas;
- deixar espaço para o aluno traçar as linhas;
- não desenhar as ligações previamente;
- utilizar figuras reais/desenhadas quando forem necessárias;
- não utilizar textos como "IMAGEM 1".

TRAÇADO:

Quando houver exercício de cobrir letras:

- mostrar letras grandes pontilhadas;
- utilizar traçado simples e legível;
- incluir espaço para tentativa independente;
- não representar o traçado apenas como letras normais repetidas.

COMANDOS:

Os comandos devem ser curtos, claros e adequados à turma.

Exemplos para crianças em alfabetização:
CUBRA A LETRA B.
PINTE OS DESENHOS QUE COMEÇAM COM B.
LIGUE AS FIGURAS ÀS PALAVRAS.
COMPLETE AS PALAVRAS.

Para séries posteriores, adaptar os comandos ao nível escolar,
sem utilizar linguagem excessivamente infantil.

${regraQuantidade}

VARIEDADE:

Somente quando a atividade for mista:

- variar os formatos;
- não repetir o mesmo comando;
- organizar do mais simples para o mais complexo;
- utilizar exercícios com funções pedagógicas diferentes;
- respeitar a série selecionada.

PEDIDO PRINCIPAL DO PROFESSOR:

"${dados.pedido}"

A folha deve atender diretamente a esse pedido.

REVISÃO FINAL OBRIGATÓRIA:

Antes de entregar a imagem:

1. Conferir se a atividade corresponde ao pedido.
2. Conferir se a atividade realmente está adequada para ${dados.serie}.
3. Conferir se o nível de dificuldade corresponde à série.
4. Conferir se nenhuma questão ou elemento ficou incompleto.
5. Conferir rigorosamente todas as palavras.
6. Conferir se imagens e palavras correspondem.
7. Conferir se não há texto cortado.
8. Conferir se não existem elementos fora das margens.
9. Conferir se a folha está pronta para impressão.
10. Conferir se não foi criado cabeçalho de identificação.
11. Conferir se qualquer tipo específico solicitado pelo sistema foi respeitado integralmente.
12. Conferir se não foram criadas questões desnecessárias quando o formato solicitado for uma atividade visual única.
13. Se alguma questão pedir para PINTAR ou COLORIR, conferir se TODAS as figuras daquela questão estão em preto e branco e sem nenhum preenchimento colorido.

Produza somente a imagem da atividade pedagógica.

Não escreva explicações fora da folha.
Não criar cabeçalho de identificação.
Não criar rodapé.
Não adicionar logotipo ou marca-d'água.
`.trim();
}