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
Crie UMA FOLHA DE ATIVIDADE PEDAGÓGICA DE ALFABETIZAÇÃO,
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
bonita, clara, organizada e pronta para o aluno utilizar.

A atividade deve parecer uma folha pedagógica criada por um professor,
e NÃO uma prova tradicional.

FORMATO:

- Criar uma única folha vertical.
- Aparência proporcional a uma folha A4.
- Fundo branco.
- Margens regulares.
- Não cortar nenhum elemento.
- Não deixar texto ou desenho ultrapassar as margens.
- Organizar exatamente ${quantidade} questões principais.
- Distribuir as questões de forma equilibrada pela folha.
- Usar quadros ou divisões visuais quando isso melhorar a organização.
- Evitar espaços vazios excessivos.
- Evitar excesso de decoração.
- Priorizar clareza e legibilidade.

DDIAGRAMAÇÃO:

- Usar bem toda a área útil da folha.
- Manter apenas margens normais de impressão.
- O título da atividade pode começar próximo ao topo da folha.
- Distribuir as questões uniformemente.
- Não deixar grandes espaços vazios.
- Não apertar demais os exercícios.
- Aproveitar bem a largura e a altura da página.
- Deixar espaço suficiente para a criança responder.
- Manter desenhos e textos proporcionalmente equilibrados.
- Não deixar nenhum exercício encostado nas bordas.

CABEÇALHO:

NÃO criar cabeçalho de identificação dentro da imagem.

NÃO escrever:

- NOME
- ALUNO(A)
- ESCOLA
- TURMA
- DATA
- PROFESSOR

Não reservar espaço para cabeçalho.

O cabeçalho será acrescentado em outra página pelo sistema PlanejAI.

A imagem deve conter somente o título e a atividade pedagógica.

Não criar:

- linhas para preenchimento;
- caixas;
- molduras;
- logotipos;
- brasões;
- textos institucionais;
- títulos dentro desse espaço.

O título da atividade deve começar somente abaixo da área reservada.

A atividade deve ser diagramada considerando que o PlanejAI poderá inserir um cabeçalho personalizado nessa área.

TÍTULO:

Criar um título curto e claro relacionado ao pedido.

Exemplo:
ATIVIDADE COM A LETRA B

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

LETRA PARA ALFABETIZAÇÃO:

- Usar LETRA DE FORMA SIMPLES.
- Usar fonte visual semelhante a Arial ou Helvetica.
- NÃO usar Times New Roman na letra destinada ao traçado.
- NÃO usar letra cursiva no traçado, salvo se o professor pedir.
- Quando houver letra para cobrir, ela deve ser grande e PONTILHADA.
- A letra pontilhada deve ter formato simples e fácil para a criança copiar.
- Não transformar a letra pontilhada em uma fonte serifada.
- Usar preferencialmente letras maiúsculas para ${dados.serie}
  quando adequado à fase de alfabetização.

QUESTÕES:

Criar exatamente ${quantidade} questões principais.

As questões devem ser variadas.

Quando o pedido envolver uma LETRA DO ALFABETO,
priorizar combinações como:

1. COBRIR OU TRACEJAR A LETRA.
2. IDENTIFICAR OU CIRCULAR A LETRA.
3. PINTAR FIGURAS CUJOS NOMES COMEÇAM COM A LETRA.
4. LIGAR FIGURAS ÀS PALAVRAS.
5. COMPLETAR PALAVRAS COM A LETRA.
6. MARCAR A ALTERNATIVA CORRETA.
7. LER FRASES CURTAS E LOCALIZAR A LETRA.
8. FORMAR PALAVRAS OU SÍLABAS SIMPLES.

Não é obrigatório usar todos os formatos.
Escolher apenas os mais adequados ao pedido e à série.

VARIEDADE:

- Não repetir o mesmo comando em duas questões.
- Não criar duas questões praticamente iguais.
- Não fazer toda a folha apenas com múltipla escolha.
- Não fazer toda a folha apenas com tracejado.
- Organizar do mais simples para o mais complexo.
- Cada questão deve ter uma função pedagógica diferente.

IMAGENS:

Quando usar imagens:

- Criar os desenhos diretamente dentro da folha.
- Usar ilustrações infantis simples.
- Fundo claro ou branco.
- Contorno nítido.
- Objetos fáceis de reconhecer.
- Não usar imagens excessivamente detalhadas.
- Não usar marcas-d'água.
- Não usar textos dentro dos desenhos.
- Não colocar o nome do objeto automaticamente,
  a menos que a própria questão precise mostrar a palavra.

COERÊNCIA ENTRE LETRA E FIGURA:

Se a atividade for sobre uma letra específica,
conferir rigorosamente cada palavra.

Exemplo para letra B:

CORRETOS:
BOLA
BARCO
BANANA
BALEIA
BONECA
BISCOITO
BALDE
BOI
BICICLETA
BORBOLETA

Distratores podem começar com outra letra SOMENTE quando a questão
pedir que o aluno identifique quais começam com B.

Nunca colocar uma palavra que começa com outra letra
em uma atividade que diga:
"Ligue as palavras que começam com B".

COMPLETAR PALAVRAS:

Quando criar questão de completar uma letra:

Usar exemplos como:

_OLA
_ARCO
_ANANA
_ALEIA
_ALDE

A lacuna deve estar exatamente no local da letra que falta.

Não criar:

B_LA

se o objetivo for completar especificamente a letra inicial B.

LIGAR:

Quando criar questão de ligar:

- Colocar figuras em um lado.
- Colocar palavras no outro lado.
- Misturar a ordem das palavras.
- Deixar espaço visual para o aluno traçar as linhas.
- Não escrever "IMAGEM 1".
- Não escrever "FIGURA 2".
- Mostrar a figura real.

PINTAR OU CIRCULAR:

Quando criar questão como:

"PINTE OS DESENHOS QUE COMEÇAM COM A LETRA B"

usar aproximadamente 4 a 6 figuras.

Misturar:

- figuras corretas;
- figuras distratoras.

Exemplo:

BOLA
BALEIA
CASA
BANANA
GATO
BARCO

Assim a criança realmente precisa identificar.

TRAÇADO:

Quando criar exercício de cobrir letra:

- mostrar uma letra grande pontilhada;
- mostrar de 4 a 8 letras menores pontilhadas;
- incluir linhas abaixo para a criança tentar escrever sozinha;
- não escrever apenas:
  B B B B B
  como texto comum.

COMANDOS:

Os comandos devem ser curtos.

Exemplos adequados:

CUBRA A LETRA B.

PINTE OS DESENHOS QUE COMEÇAM COM B.

LIGUE AS FIGURAS ÀS PALAVRAS.

COMPLETE AS PALAVRAS COM B.

MARQUE UM X NA RESPOSTA CORRETA.

LEIA E CIRCULE A LETRA B.

Evitar comandos longos e explicativos.

IDADE E SÉRIE:

A atividade deve ser adequada a:

${dados.serie}

Para Educação Infantil, 1º e 2º ano:

- usar pouco texto;
- usar imagens maiores;
- usar comandos simples;
- priorizar identificação, associação, oralidade,
  leitura inicial e escrita inicial;
- não criar questões discursivas longas;
- não criar interpretação de texto extensa.

Se o professor pedir algo diferente,
respeitar o pedido desde que seja pedagogicamente adequado.

IMPORTANTE:

O pedido principal do professor é:

"${dados.pedido}"

A folha deve atender diretamente a esse pedido.

REVISÃO FINAL OBRIGATÓRIA:

Antes de entregar a imagem:

1. Conferir se existem exatamente ${quantidade} questões.
2. Conferir se nenhuma questão ficou incompleta.
3. Conferir se todas as palavras estão corretas.
4. Conferir se imagens e palavras correspondem corretamente.
5. Conferir se a letra trabalhada está correta em toda a folha.
6. Conferir se não há texto cortado.
7. Conferir se não há elementos fora da página.
8. Conferir se a letra de traçado é simples e não serifada.
9. Conferir se a atividade é adequada para ${dados.serie}.
10. Conferir se a folha está pronta para impressão.
11. Conferir se o espaço superior reservado para o cabeçalho permanece vazio.

Produza somente a imagem da atividade pedagógica.

Não escreva explicações fora da folha.

Não criar cabeçalho de identificação.

Não criar rodapé.

Não adicionar logotipo ou marca-d'água.

A folha será finalizada pelo sistema PlanejAI, que poderá inserir um cabeçalho personalizado no espaço reservado no topo.
`.trim();
}