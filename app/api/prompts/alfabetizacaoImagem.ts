type DadosAlfabetizacaoImagem = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  pedido: string;
  quantidadeQuestoes: number;
};

export function gerarPromptAlfabetizacaoImagem(
  dados: DadosAlfabetizacaoImagem
) {
  const quantidade = Math.max(
    1,
    Math.min(
      10,
      Number(dados.quantidadeQuestoes || 6)
    )
  );

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

Quantidade de questões:
${quantidade}

OBJETIVO PRINCIPAL:

Transformar o pedido do professor em uma folha de atividade visual,
clara, organizada, pedagogicamente adequada e pronta para o aluno utilizar.

A atividade deve parecer uma folha pedagógica criada por um professor,
e NÃO uma prova tradicional, salvo se o professor pedir explicitamente.

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
- Distribuir as questões de forma equilibrada.
- Quando houver várias questões, utilizar divisões visuais discretas quando necessário.
- Não deixar grandes áreas vazias.
- Não apertar excessivamente os exercícios.
- Deixar espaço suficiente para o estudante responder.
- Manter desenhos, textos e caixas proporcionalmente equilibrados.
- Não deixar nenhum exercício encostado na moldura.
- A última questão também deve permanecer totalmente dentro da borda.

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

A atividade deve ser adequada a:
${dados.serie}

Para Educação Infantil, 1º e 2º ano:
- usar pouco texto;
- utilizar comandos curtos;
- usar imagens maiores quando apropriado;
- priorizar identificação, associação, oralidade, leitura inicial e escrita inicial;
- utilizar LETRA DE FORMA SIMPLES;
- evitar questões discursivas longas;
- evitar interpretação de texto extensa.

Para séries posteriores:
- adequar vocabulário, extensão dos textos e nível de dificuldade;
- não infantilizar a atividade;
- utilizar questões compatíveis com o nível escolar.

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
- não colocar automaticamente o nome do objeto quando ele for a resposta esperada.

COERÊNCIA ENTRE FIGURA E PALAVRA:

Conferir rigorosamente se cada imagem corresponde à palavra, conceito ou resposta esperada.

Não usar figuras ambíguas.

Quando o professor fornecer palavras específicas, respeitar exatamente essas palavras.

COMPLETAR PALAVRAS:

Quando houver exercícios de completar:
- colocar a lacuna exatamente no local correto;
- não revelar a resposta;
- manter espaço suficiente para escrita;
- respeitar o objetivo pedagógico informado.

LIGAR:

Quando houver exercício de ligar:
- colocar os elementos em duas áreas ou colunas;
- misturar a ordem das respostas;
- deixar espaço para o aluno traçar as linhas;
- não desenhar as ligações previamente;
- utilizar figuras reais/desenhadas quando forem necessárias, e não textos como "IMAGEM 1".

TRAÇADO:

Quando houver exercício de cobrir letras:
- mostrar letras grandes pontilhadas;
- utilizar traçado simples e legível;
- incluir espaço para tentativa independente;
- não representar o traçado apenas como letras normais repetidas.

COMANDOS:

Os comandos devem ser curtos, claros e adequados à turma.

Exemplos:
CUBRA A LETRA B.
PINTE OS DESENHOS QUE COMEÇAM COM B.
LIGUE AS FIGURAS ÀS PALAVRAS.
COMPLETE AS PALAVRAS.
MARQUE UM X NA RESPOSTA CORRETA.
ENCONTRE AS PALAVRAS NO CAÇA-PALAVRAS.

QUANTIDADE:

Quando a atividade escolhida permitir várias questões independentes,
criar exatamente ${quantidade} questões principais.

IMPORTANTE:
Se uma configuração específica enviada pelo sistema definir um formato
único, como CAÇA-PALAVRAS, CRUZADINHA ou AUTODITADO,
essa configuração específica tem prioridade sobre a regra de variedade
e sobre a quantidade de questões independentes.

VARIEDADE:

Somente quando o tipo escolhido for atividade mista:
- variar os formatos;
- não repetir o mesmo comando;
- organizar do mais simples para o mais complexo;
- utilizar exercícios com funções pedagógicas diferentes.

PEDIDO PRINCIPAL DO PROFESSOR:

"${dados.pedido}"

A folha deve atender diretamente a esse pedido.

REVISÃO FINAL OBRIGATÓRIA:

Antes de entregar a imagem:
1. Conferir se a atividade corresponde ao pedido.
2. Conferir se nenhuma questão ou elemento ficou incompleto.
3. Conferir rigorosamente todas as palavras.
4. Conferir se imagens e palavras correspondem.
5. Conferir se não há texto cortado.
6. Conferir se não existem elementos fora das margens.
7. Conferir se a atividade é adequada para ${dados.serie}.
8. Conferir se a folha está pronta para impressão.
9. Conferir se não foi criado cabeçalho de identificação.
10. Conferir se o tipo específico solicitado pelo sistema foi respeitado integralmente.

Produza somente a imagem da atividade pedagógica.

Não escreva explicações fora da folha.
Não criar cabeçalho de identificação.
Não criar rodapé.
Não adicionar logotipo ou marca-d'água.
`.trim();
}