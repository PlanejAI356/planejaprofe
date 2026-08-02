type DadosCacaPalavras = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  observacoes: string;
  quantidade: number;
  palavras: string[];
};

export function gerarPromptCacaPalavras(
  dados: DadosCacaPalavras
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
- Usar poucas palavras.
- Priorizar palavras curtas e muito conhecidas.
- Usar grade pequena.
- Trabalhar apenas horizontal e vertical.
- Não usar diagonal.
`
    : ehAnosIniciais
      ? `
REGRAS DOS ANOS INICIAIS:
- Adequar o tamanho das palavras à série.
- Para 1º e 2º anos, priorizar horizontal e vertical.
- Para 3º, 4º e 5º anos, permitir diagonal.
- Usar grade clara e com bom espaçamento.
`
      : ehAnosFinais
        ? `
REGRAS DOS ANOS FINAIS:
- Utilizar vocabulário do conteúdo.
- Permitir horizontal, vertical e diagonal.
- Criar nível intermediário.
`
        : ehEnsinoMedio
          ? `
REGRAS DO ENSINO MÉDIO:
- Utilizar termos científicos ou conceituais.
- Criar nível intermediário ou avançado.
- Permitir horizontal, vertical e diagonal.
`
          : ehEJA
            ? `
REGRAS DA EJA:
- Nunca infantilizar.
- Usar vocabulário relacionado ao conteúdo e ao cotidiano.
- Criar grade clara e adequada ao nível da turma.
`
            : "";

  return `
Você é especialista em criação de caça-palavras pedagógicos.

Crie UMA atividade de CAÇA-PALAVRAS completa, válida e pronta para impressão.

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
- As palavras devem ser adequadas à série.
- Não repetir palavras.
- Não usar palavras sem relação com o tema.
- No campo "palavras", manter a grafia correta, com acentos quando existirem.

========================
REGRAS DA GRADE
========================

- Todas as palavras precisam realmente aparecer na grade.
- Nenhuma palavra pode ficar quebrada.
- Nenhuma palavra pode ultrapassar os limites da grade.
- Usar somente LETRAS MAIÚSCULAS na grade.
- Remover acentos apenas dentro da grade.
- Manter acentos normalmente no campo "palavras".
- Cada linha da grade deve ser uma string.
- Separar as letras por um único espaço.
- Todas as linhas devem possuir a mesma quantidade de letras.
- O tamanho da grade deve ser proporcional ao número e ao tamanho das palavras.
- Usar letras aleatórias apenas para preencher os espaços vazios.
- Não exagerar no tamanho da grade.
- Não criar uma grade tão pequena que dificulte encaixar as palavras.
- Não gerar a grade como imagem.
- Não usar emojis.
- Não usar números ou símbolos na grade.

========================
DIREÇÕES
========================

As palavras podem aparecer em:

- horizontal da esquerda para a direita;
- vertical de cima para baixo;
- diagonal descendente;
- diagonal ascendente, apenas quando adequado à série.

Não usar palavras ao contrário para Educação Infantil, 1º ano ou 2º ano.

========================
GABARITO
========================

O gabarito deve informar para cada palavra:

- linha inicial;
- coluna inicial;
- direção.

Exemplo:

GATO: linha 2, coluna 1, horizontal.
CASA: linha 1, coluna 4, vertical.

========================
CONFERÊNCIA OBRIGATÓRIA
========================

Antes de responder:

1. Verifique se todas as palavras estão presentes na grade.
2. Verifique se todas as linhas têm o mesmo tamanho.
3. Verifique se nenhuma palavra está quebrada.
4. Verifique se o gabarito corresponde à posição real.
5. Corrija qualquer inconsistência antes de retornar o JSON.

========================
JSON
========================

Retorne SOMENTE JSON válido.

Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Caça-palavras",
  "subtitulo": "${dados.serie} • ${dados.disciplina}",
  "modoCriacao": "especifica",
  "exercicios": [
    {
      "id": "",
      "numero": 1,
      "tipo": "caca_palavras",
      "titulo": "Caça-palavras",
      "comando": "Encontre no diagrama as palavras relacionadas ao tema.",
      "conteudoLivre": "",
      "itens": [],
      "textoApoio": "",
      "palavras": [
        "PALAVRA 1",
        "PALAVRA 2"
      ],
      "pistas": [],
      "grade": [
        "A B C D E F",
        "G H I J K L"
      ],
      "colunas": [],
      "imagemNecessaria": false,
      "imagemDescricao": "",
      "gabarito": "PALAVRA 1: linha 1, coluna 1, horizontal."
    }
  ]
}

REGRAS DO JSON:
- O exercício deve possuir todos os campos.
- "itens" deve ser uma lista vazia.
- "pistas" deve ser uma lista vazia.
- "colunas" deve ser uma lista vazia.
- "imagemNecessaria" deve ser false.
- "imagemDescricao" deve ser string vazia.
- O campo "id" deve ficar vazio.
- O campo "numero" deve ser 1.
`;
}