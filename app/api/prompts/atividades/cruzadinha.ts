type DadosCruzadinha = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  observacoes: string;
  quantidade: number;
  palavras: string[];
};

export function gerarPromptCruzadinha(
  dados: DadosCruzadinha
) {
  const ehInfantil =
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

  const regrasEtapa = ehInfantil
    ? `
REGRAS DA EDUCAÇÃO INFANTIL:
- Usar pouquíssimas palavras.
- Priorizar palavras curtas, conhecidas e fáceis de representar.
- Criar pistas muito simples e orais.
- Evitar cruzamentos complexos.
`
    : ehAnosIniciais
      ? `
REGRAS DOS ANOS INICIAIS:
- Adequar o tamanho das palavras à série.
- Para 1º e 2º anos, usar palavras curtas e pistas muito objetivas.
- Para 3º, 4º e 5º anos, ampliar o vocabulário e a complexidade das pistas.
- Manter a grade clara e legível.
`
      : ehAnosFinais
        ? `
REGRAS DOS ANOS FINAIS:
- Usar vocabulário diretamente relacionado ao conteúdo.
- Criar pistas conceituais e contextualizadas.
- Evitar pistas infantis.
`
        : ehEnsinoMedio
          ? `
REGRAS DO ENSINO MÉDIO:
- Utilizar termos científicos, históricos, geográficos ou conceituais adequados.
- Criar pistas com maior profundidade.
- Evitar simplificação excessiva.
`
          : ehEJA
            ? `
REGRAS DA EJA:
- Nunca infantilizar.
- Usar linguagem clara e respeitosa.
- Relacionar as palavras ao cotidiano e ao conteúdo quando pertinente.
- Criar pistas adequadas ao público jovem e adulto.
`
            : "";

  return `
Você é especialista em criação de cruzadinhas pedagógicas.

Crie UMA CRUZADINHA completa, válida, coerente e pronta para impressão.

DADOS

Etapa:
${dados.etapaEnsino}

Série:
${dados.serie}

Disciplina:
${dados.disciplina}

Tema:
${dados.conteudo}

Quantidade de palavras:
${dados.quantidade}

Palavras fornecidas:
${dados.palavras.join(", ") || "Nenhuma"}

Observações:
${dados.observacoes || "Nenhuma"}

${regrasEtapa}

========================
REGRAS DAS PALAVRAS
========================

- Se o professor forneceu palavras, usar exatamente essas palavras.
- Não substituir nomes próprios.
- Não alterar a grafia apresentada pelo professor.
- Caso não existam palavras fornecidas, escolher palavras diretamente relacionadas ao conteúdo.
- Usar exatamente ${dados.quantidade} palavras, salvo quando o professor fornecer outra quantidade.
- Não repetir palavras.
- Evitar palavras muito longas quando não forem adequadas à série.
- Manter a grafia correta no campo "palavras".
- Dentro da grade, usar letras maiúsculas e sem acentos.

========================
REGRAS DAS PISTAS
========================

- Criar exatamente uma pista para cada palavra.
- As pistas devem aparecer na mesma ordem das palavras.
- Não incluir a resposta dentro da pista.
- Não usar pistas vagas.
- Não criar pistas ambíguas.
- Adequar a linguagem à série.
- Evitar pistas excessivamente longas.
- Para Ciências, História, Geografia e áreas afins, priorizar pistas conceituais.
- Para alfabetização, priorizar pistas simples e diretas.

========================
REGRAS DA GRADE
========================

- Todas as palavras devem realmente aparecer na grade.
- As palavras devem cruzar entre si sempre que possível.
- Não colocar palavras soltas sem necessidade.
- Nenhuma palavra pode ficar quebrada.
- Nenhuma palavra pode ultrapassar os limites da grade.
- Todas as linhas devem ter o mesmo tamanho.
- Cada linha da grade deve ser uma string.
- Separar as células por um único espaço.
- Usar "." para células vazias que o aluno preencherá.
- Usar "#" para células bloqueadas.
- Não mostrar as letras das respostas na grade do aluno.
- Não usar números, emojis ou símbolos diferentes de "." e "#".
- Não gerar a cruzadinha como imagem.
- A grade deve ter tamanho proporcional ao número e ao comprimento das palavras.
- Evitar grades excessivamente grandes.
- Manter espaço suficiente para que a atividade fique legível na impressão.

========================
NUMERAÇÃO
========================

- Numerar as palavras de acordo com a posição inicial na grade.
- Informar no gabarito se cada palavra é horizontal ou vertical.
- Quando duas palavras começarem na mesma célula, podem compartilhar o mesmo número.
- As pistas devem seguir a mesma numeração utilizada no gabarito.

========================
GABARITO
========================

O gabarito deve informar para cada palavra:

- número;
- palavra;
- linha inicial;
- coluna inicial;
- direção;
- pista correspondente.

Exemplo:

1. CÉLULA — linha 2, coluna 3, horizontal.
2. TECIDO — linha 1, coluna 5, vertical.

========================
CONFERÊNCIA OBRIGATÓRIA
========================

Antes de responder:

1. Verifique se todas as palavras estão presentes na grade.
2. Verifique se todas as palavras possuem uma pista.
3. Verifique se todas as linhas possuem o mesmo tamanho.
4. Verifique se nenhuma palavra ultrapassa a grade.
5. Verifique se os cruzamentos utilizam a mesma letra.
6. Verifique se o gabarito corresponde à posição real.
7. Corrija qualquer inconsistência antes de retornar o JSON.

========================
JSON
========================

Retorne SOMENTE JSON válido.

Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Cruzadinha",
  "subtitulo": "${dados.serie} • ${dados.disciplina}",
  "modoCriacao": "especifica",
  "exercicios": [
    {
      "id": "",
      "numero": 1,
      "tipo": "cruzadinha",
      "titulo": "Cruzadinha",
      "comando": "Complete a cruzadinha utilizando as pistas.",
      "conteudoLivre": "",
      "itens": [],
      "textoApoio": "",
      "palavras": [
        "PALAVRA 1",
        "PALAVRA 2"
      ],
      "pistas": [
        "1. Pista correspondente à palavra 1.",
        "2. Pista correspondente à palavra 2."
      ],
      "grade": [
        "# . . . #",
        ". . # . ."
      ],
      "colunas": [],
      "imagemNecessaria": false,
      "imagemDescricao": "",
      "gabarito": "1. PALAVRA 1 — linha 1, coluna 2, horizontal."
    }
  ]
}

REGRAS DO JSON:
- O exercício deve possuir todos os campos.
- "itens" deve ser uma lista vazia.
- "colunas" deve ser uma lista vazia.
- "imagemNecessaria" deve ser false.
- "imagemDescricao" deve ser string vazia.
- O campo "id" deve ficar vazio.
- O campo "numero" deve ser 1.
- "palavras", "pistas" e "grade" devem ser listas.
- A quantidade de pistas deve ser igual à quantidade de palavras.
`;
}