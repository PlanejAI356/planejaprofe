type DadosMultiplaEscolha = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  observacoes: string;
  quantidade: number;
};

export function gerarPromptMultiplaEscolha(
  dados: DadosMultiplaEscolha
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
- Evitar múltipla escolha formal.
- Usar apenas quando realmente fizer sentido.
- Priorizar perguntas muito simples, com apoio visual e poucas alternativas.
- Usar comandos curtos.
`
    : ehAnosIniciais
      ? `
REGRAS DOS ANOS INICIAIS:
- Para 1º e 2º anos, usar perguntas curtas e alternativas simples.
- Para 3º, 4º e 5º anos, ampliar compreensão, interpretação e aplicação.
- Evitar alternativas longas demais.
`
      : ehAnosFinais
        ? `
REGRAS DOS ANOS FINAIS:
- Criar questões contextualizadas.
- Trabalhar compreensão, análise e aplicação.
- Evitar perguntas puramente decorativas.
`
        : ehEnsinoMedio
          ? `
REGRAS DO ENSINO MÉDIO:
- Criar questões com maior profundidade.
- Priorizar análise, interpretação, aplicação e raciocínio.
- Usar linguagem compatível com o nível da etapa.
`
          : ehEJA
            ? `
REGRAS DA EJA:
- Nunca infantilizar.
- Usar situações relacionadas ao cotidiano, trabalho, cidadania e aplicação prática quando pertinente.
- Criar perguntas claras e respeitosas.
`
            : "";

  return `
Você é especialista em elaboração de questões de MÚLTIPLA ESCOLHA.

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

Quantidade de questões:
${dados.quantidade}

Observações:
${dados.observacoes || "Nenhuma"}

${regrasEtapa}

========================
REGRAS GERAIS
========================

- Criar exatamente UMA atividade.
- Criar exatamente ${dados.quantidade} questões.
- Cada questão deve ter exatamente 4 alternativas.
- Apenas UMA alternativa deve estar correta.
- Criar alternativas incorretas plausíveis.
- Não usar alternativas absurdas.
- Não usar "todas as alternativas".
- Não usar "nenhuma das alternativas".
- Variar a posição da resposta correta.
- Não repetir a mesma estrutura em todas as perguntas.
- Adequar rigorosamente à etapa e à série.
- Não usar emojis.
- Não revelar a resposta no enunciado.
- Não deixar pistas óbvias pelo tamanho ou pela linguagem das alternativas.
- Sempre contextualizar quando isso melhorar a qualidade da questão.

========================
ENUNCIADOS
========================

- O campo "texto" deve conter a pergunta completa.
- A pergunta deve ser clara e objetiva.
- Evitar frases excessivamente longas.
- Não criar perguntas ambíguas.
- Não criar perguntas com duas respostas possíveis.
- Não usar linguagem artificial ou excessivamente formal.

========================
ALTERNATIVAS
========================

- O campo "alternativas" deve conter exatamente 4 opções.
- Todas as alternativas devem ter tamanho e estrutura semelhantes.
- Evitar uma alternativa muito maior ou mais detalhada que as demais.
- Evitar repetir palavras do enunciado somente na alternativa correta.
- Evitar alternativas que se anulam de forma óbvia.
- Evitar alternativas com erros gramaticais.
- O campo "resposta" deve conter exatamente o texto da alternativa correta.

========================
IMAGENS
========================

- Usar imagem somente quando realmente ajudar na compreensão.
- Quando houver imagem:
  - "imagemNecessaria" deve ser true;
  - imagem pequena;
  - fundo branco ou transparente;
  - sem texto;
  - sem números;
  - sem letras;
  - um único objeto ou esquema simples;
  - estilo livro didático;
  - pronta para impressão.

========================
GABARITO
========================

O gabarito deve informar:

- número da questão;
- letra correta;
- texto da alternativa correta.

Exemplo:

1. B — Fotossíntese
2. D — Sistema respiratório

========================
CONFERÊNCIA OBRIGATÓRIA
========================

Antes de responder:

1. Verifique se existem exatamente ${dados.quantidade} questões.
2. Verifique se cada questão possui exatamente 4 alternativas.
3. Verifique se apenas uma alternativa está correta.
4. Verifique se a resposta aparece exatamente entre as alternativas.
5. Verifique se a posição da resposta correta varia.
6. Verifique se não existem questões ambíguas.
7. Corrija qualquer inconsistência antes de retornar o JSON.

========================
JSON
========================

Retorne SOMENTE JSON válido.

Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Múltipla escolha",
  "subtitulo": "${dados.serie} • ${dados.disciplina}",
  "modoCriacao": "especifica",
  "exercicios": [
    {
      "id": "",
      "numero": 1,
      "tipo": "multipla_escolha",
      "titulo": "Múltipla escolha",
      "comando": "Marque a alternativa correta.",
      "conteudoLivre": "",
      "itens": [
        {
          "id": "item-1",
          "texto": "Pergunta completa",
          "resposta": "Texto da alternativa correta",
          "imagemNecessaria": false,
          "imagemDescricao": "",
          "colunaA": "",
          "colunaB": "",
          "alternativas": [
            "Alternativa A",
            "Alternativa B",
            "Alternativa C",
            "Alternativa D"
          ],
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
      "gabarito": "1. B — Texto da alternativa correta"
    }
  ]
}

REGRAS DO JSON:
- O exercício deve possuir todos os campos.
- Todos os itens devem possuir todos os campos.
- "itens" deve ser uma lista.
- "alternativas" deve possuir exatamente 4 elementos.
- "palavras", "pistas", "grade" e "colunas" devem ser listas vazias.
- O campo "id" do exercício deve ficar vazio.
- O campo "numero" deve ser 1.
`;
}