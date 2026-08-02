type DadosVerdadeiroFalso = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  observacoes: string;
  quantidade: number;
};

export function gerarPromptVerdadeiroFalso(
  dados: DadosVerdadeiroFalso
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
- Evitar atividade formal de verdadeiro ou falso.
- Usar somente quando fizer sentido para a faixa etária.
- Criar frases muito curtas e simples.
- Priorizar observação e conhecimentos do cotidiano.
`
    : ehAnosIniciais
      ? `
REGRAS DOS ANOS INICIAIS:
- Para 1º e 2º anos, usar afirmativas curtas e linguagem simples.
- Para 3º, 4º e 5º anos, ampliar compreensão, comparação e aplicação.
- Evitar frases longas demais.
`
      : ehAnosFinais
        ? `
REGRAS DOS ANOS FINAIS:
- Trabalhar conceitos, relações, características e aplicações.
- Evitar aparência infantil.
- Criar afirmativas que exijam compreensão do conteúdo.
`
        : ehEnsinoMedio
          ? `
REGRAS DO ENSINO MÉDIO:
- Criar afirmativas com maior profundidade conceitual.
- Trabalhar análise, relações e aplicação.
- Evitar simplificação excessiva.
`
          : ehEJA
            ? `
REGRAS DA EJA:
- Nunca infantilizar.
- Usar linguagem clara e respeitosa.
- Relacionar o conteúdo ao cotidiano, trabalho, cidadania ou aplicação prática quando pertinente.
`
            : "";

  return `
Você é especialista em elaboração de atividades de VERDADEIRO OU FALSO.

Crie UMA atividade completa, coerente e pronta para impressão.

DADOS

Etapa:
${dados.etapaEnsino}

Série:
${dados.serie}

Disciplina:
${dados.disciplina}

Conteúdo:
${dados.conteudo}

Quantidade de afirmativas:
${dados.quantidade}

Observações:
${dados.observacoes || "Nenhuma"}

${regrasEtapa}

========================
REGRAS GERAIS
========================

- Criar exatamente UMA atividade.
- Criar exatamente ${dados.quantidade} afirmativas.
- Misturar afirmativas verdadeiras e falsas.
- Evitar padrões previsíveis.
- Não criar todas as respostas iguais.
- Não colocar várias respostas iguais em sequência sem necessidade.
- Adequar rigorosamente à etapa e à série.
- Não criar frases ambíguas.
- Não criar afirmativas com duas ideias independentes.
- Não usar emojis.
- Não revelar a resposta no texto da afirmativa.
- Usar linguagem clara, natural e com aparência de atividade elaborada por professor.

========================
AFIRMATIVAS VERDADEIRAS
========================

- Devem estar completamente corretas.
- Não usar generalizações que possam gerar exceções.
- Não simplificar o conteúdo a ponto de torná-lo incorreto.
- Manter coerência com o nível da turma.

========================
AFIRMATIVAS FALSAS
========================

- Devem conter apenas UM erro principal.
- O erro deve ser identificável pelo estudante.
- Não criar frases absurdas.
- Não usar pegadinhas baseadas somente em palavras pequenas.
- Não alterar vários conceitos ao mesmo tempo.
- A frase deve continuar gramaticalmente correta.

========================
CAMPO VERDADEIRO
========================

- Usar true quando a afirmativa for verdadeira.
- Usar false quando a afirmativa for falsa.
- Nunca usar strings como "V", "F", "verdadeiro" ou "falso".
- Nunca usar null nesse tipo de exercício.

========================
GABARITO
========================

O gabarito deve informar:

- número do item;
- V ou F;
- correção breve das afirmativas falsas.

Exemplo:

1. V
2. F — A fotossíntese ocorre principalmente nas folhas.
3. V

========================
CONFERÊNCIA OBRIGATÓRIA
========================

Antes de responder:

1. Verifique se existem exatamente ${dados.quantidade} afirmativas.
2. Verifique se há respostas verdadeiras e falsas.
3. Verifique se não existe padrão previsível.
4. Verifique se nenhuma afirmativa é ambígua.
5. Verifique se cada afirmativa falsa possui apenas um erro principal.
6. Verifique se o campo "verdadeiro" contém somente true ou false.
7. Verifique se o gabarito corresponde aos itens.
8. Corrija qualquer inconsistência antes de retornar o JSON.

========================
JSON
========================

Retorne SOMENTE JSON válido.

Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Verdadeiro ou falso",
  "subtitulo": "${dados.serie} • ${dados.disciplina}",
  "modoCriacao": "especifica",
  "exercicios": [
    {
      "id": "",
      "numero": 1,
      "tipo": "verdadeiro_falso",
      "titulo": "Verdadeiro ou falso",
      "comando": "Leia as afirmativas e marque V para verdadeiro ou F para falso.",
      "conteudoLivre": "",
      "itens": [
        {
          "id": "item-1",
          "texto": "Afirmativa completa",
          "resposta": "",
          "imagemNecessaria": false,
          "imagemDescricao": "",
          "colunaA": "",
          "colunaB": "",
          "alternativas": [],
          "verdadeiro": true
        }
      ],
      "textoApoio": "",
      "palavras": [],
      "pistas": [],
      "grade": [],
      "colunas": [],
      "imagemNecessaria": false,
      "imagemDescricao": "",
      "gabarito": "1. V"
    }
  ]
}

REGRAS DO JSON:
- O exercício deve possuir todos os campos.
- Todos os itens devem possuir todos os campos.
- "itens" deve ser uma lista.
- "verdadeiro" deve ser sempre true ou false.
- "alternativas", "palavras", "pistas", "grade" e "colunas" devem ser listas vazias.
- O campo "id" do exercício deve ficar vazio.
- O campo "numero" deve ser 1.
`;
}