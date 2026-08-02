type DadosComplete = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  observacoes: string;
  quantidade: number;
  palavras: string[];
  tipoEspecifico: string;
};

export function gerarPromptComplete(
  dados: DadosComplete
) {
  const tipo =
    dados.tipoEspecifico === "complete_frases"
      ? "complete_frases"
      : "complete_palavras";

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
- Usar palavras muito simples e conhecidas.
- Priorizar letras iniciais, vogais, sílabas simples e associação visual.
- Usar comandos muito curtos.
- Evitar frases longas.
`
    : ehAnosIniciais
      ? `
REGRAS DOS ANOS INICIAIS:
- Para 1º, 2º e 3º anos, priorizar sílabas, palavras, frases curtas e banco de palavras.
- Para 4º e 5º anos, ampliar frases, conceitos e interpretação.
- Adequar o tamanho das lacunas à resposta.
`
      : ehAnosFinais
        ? `
REGRAS DOS ANOS FINAIS:
- Usar conceitos, definições, relações e frases ligadas ao conteúdo.
- Evitar aparência infantil.
- Trabalhar compreensão e aplicação.
`
        : ehEnsinoMedio
          ? `
REGRAS DO ENSINO MÉDIO:
- Usar conceitos específicos e terminologia adequada.
- Criar frases contextualizadas e com maior profundidade.
- Evitar simplificação excessiva.
`
          : ehEJA
            ? `
REGRAS DA EJA:
- Nunca infantilizar.
- Usar frases claras e relacionadas ao cotidiano ou ao conteúdo.
- Valorizar vocabulário funcional e aplicação prática quando pertinente.
`
            : "";

  return `
Você é especialista em criação de atividades do tipo COMPLETE.

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

Quantidade de itens:
${dados.quantidade}

Palavras fornecidas:
${dados.palavras.join(", ") || "Nenhuma"}

Observações:
${dados.observacoes || "Nenhuma"}

Tipo solicitado:
${tipo}

${regrasEtapa}

========================
REGRAS GERAIS
========================

- Criar exatamente UMA atividade.
- Criar exatamente ${dados.quantidade} itens.
- Adequar rigorosamente à etapa e à série.
- Cada item deve possuir apenas UMA resposta correta.
- Não criar frases ambíguas.
- Não criar mais de uma lacuna no mesmo item.
- Não repetir itens.
- Não repetir a mesma resposta sem necessidade.
- Não usar emojis.
- Não gerar imagens.
- Não mostrar a resposta no comando do aluno.
- Não criar frases sem sentido.
- Não usar palavras fora do conteúdo informado.

========================
REGRAS DO CAMPO TEXTO
========================

- O campo "texto" deve conter a palavra ou frase COMPLETA.
- O sistema ocultará automaticamente o trecho indicado no campo "resposta".
- Nunca colocar sublinhados no campo "texto".
- Nunca usar "____" dentro do campo "texto".
- Nunca usar "{{LACUNA}}" dentro do campo "texto".
- A resposta precisa aparecer exatamente dentro do texto.
- Manter acentuação e pontuação corretas.

Exemplo correto:

"texto": "O coração bombeia o sangue para todo o corpo."
"resposta": "coração"

Exemplo incorreto:

"texto": "O ______ bombeia o sangue."
"resposta": "coração"

========================
BANCO DE PALAVRAS
========================

- Usar o campo "palavras" somente quando um banco de palavras for adequado.
- Para alfabetização, o banco de palavras pode ser útil.
- Para Anos Finais, Ensino Médio e EJA, usar banco de palavras apenas quando fizer sentido.
- Se o professor forneceu palavras próprias, usar exatamente essas palavras quando forem compatíveis com a atividade.
- Não incluir palavras que não sejam utilizadas nos itens.
- Não incluir a resposta repetida várias vezes no banco.

========================
COMPLETE PALAVRAS
========================

Quando o tipo for "complete_palavras":

- Trabalhar letras, sílabas ou partes de palavras.
- O campo "texto" deve conter a palavra completa.
- O campo "resposta" deve conter a parte que será ocultada.
- Para alfabetização, variar sílabas iniciais, mediais e finais.
- Não criar palavras inexistentes.

Exemplo:

"texto": "CACHORRO"
"resposta": "CHOR"

========================
COMPLETE FRASES
========================

Quando o tipo for "complete_frases":

- Criar frases completas e contextualizadas.
- O campo "resposta" deve conter uma palavra ou trecho curto.
- Não ocultar partes essenciais demais a ponto de tornar a frase impossível.
- Evitar frases decorativas ou sem relação com o conteúdo.
- Criar apenas uma resposta possível.

========================
GABARITO
========================

O gabarito deve listar as respostas na ordem dos itens.

Exemplo:

1. coração
2. pulmão
3. estômago

========================
CONFERÊNCIA OBRIGATÓRIA
========================

Antes de responder:

1. Verifique se cada resposta aparece exatamente dentro do texto.
2. Verifique se cada item possui apenas uma resposta correta.
3. Verifique se não existem lacunas escritas manualmente no texto.
4. Verifique se a quantidade de itens está correta.
5. Verifique se o banco de palavras contém apenas respostas utilizadas.
6. Corrija qualquer inconsistência antes de retornar o JSON.

========================
JSON
========================

Retorne SOMENTE JSON válido.

Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Complete",
  "subtitulo": "${dados.serie} • ${dados.disciplina}",
  "modoCriacao": "especifica",
  "exercicios": [
    {
      "id": "",
      "numero": 1,
      "tipo": "${tipo}",
      "titulo": "Complete",
      "comando": "Complete corretamente.",
      "conteudoLivre": "",
      "itens": [
        {
          "id": "item-1",
          "texto": "Texto completo com a resposta.",
          "resposta": "parte que será ocultada",
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
      "gabarito": "1. resposta"
    }
  ]
}

REGRAS DO JSON:
- O exercício deve possuir todos os campos.
- Todos os itens devem possuir todos os campos.
- "itens" deve ser uma lista.
- "palavras" deve ser uma lista.
- "pistas", "grade" e "colunas" devem ser listas vazias.
- "imagemNecessaria" deve ser false.
- "imagemDescricao" deve ser string vazia.
- O campo "id" do exercício deve ficar vazio.
- O campo "numero" deve ser 1.
`;
}