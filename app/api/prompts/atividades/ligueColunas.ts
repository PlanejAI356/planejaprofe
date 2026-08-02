type DadosLigueColunas = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  observacoes: string;
  quantidade: number;
};

export function gerarPromptLigueColunas(
  dados: DadosLigueColunas
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
- Usar poucos pares.
- Priorizar associações simples, visuais e concretas.
- Trabalhar objetos, animais, cores, formas e elementos do cotidiano.
- Usar comandos muito curtos.
`
    : ehAnosIniciais
      ? `
REGRAS DOS ANOS INICIAIS:
- Para 1º, 2º e 3º anos, usar relações simples e objetivas.
- Para 4º e 5º anos, ampliar conceitos, funções, características e classificações.
- Manter linguagem clara e adequada à série.
`
      : ehAnosFinais
        ? `
REGRAS DOS ANOS FINAIS:
- Usar conceitos, funções, características, exemplos e classificações.
- Evitar aparência infantil.
- Criar relações que exijam compreensão do conteúdo.
`
        : ehEnsinoMedio
          ? `
REGRAS DO ENSINO MÉDIO:
- Trabalhar relações conceituais mais aprofundadas.
- Utilizar termos científicos, históricos, geográficos ou filosóficos quando pertinente.
- Evitar simplificação excessiva.
`
          : ehEJA
            ? `
REGRAS DA EJA:
- Nunca infantilizar.
- Usar relações claras, úteis e ligadas ao conteúdo ou ao cotidiano.
- Valorizar aplicação prática quando pertinente.
`
            : "";

  return `
Você é especialista em criação de atividades do tipo LIGUE AS COLUNAS.

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

Quantidade de pares:
${dados.quantidade}

Observações:
${dados.observacoes || "Nenhuma"}

${regrasEtapa}

========================
REGRAS GERAIS
========================

- Criar exatamente UMA atividade.
- Criar exatamente ${dados.quantidade} pares.
- Cada item deve preencher "colunaA" e "colunaB".
- Não repetir itens.
- Não repetir respostas.
- Não criar pares ambíguos.
- Não criar duas respostas possíveis para o mesmo item.
- Adequar rigorosamente à etapa e à série.
- Usar linguagem clara e natural.
- Não usar emojis.
- Não mostrar o gabarito no comando do aluno.

========================
COLUNA A
========================

A coluna A pode conter:

- conceitos;
- palavras;
- nomes;
- exemplos;
- perguntas curtas;
- imagens, somente quando realmente necessárias.

Quando houver imagem:

- "imagemNecessaria" deve ser true;
- a imagem deve ser pequena;
- deve conter apenas um objeto;
- fundo branco ou transparente;
- sem texto;
- sem letras;
- sem números;
- sem moldura;
- centralizada;
- estilo livro didático.

O campo "colunaA" deve conter o texto do primeiro elemento.

========================
COLUNA B
========================

A coluna B deve conter:

- definições;
- características;
- funções;
- correspondências;
- respostas;
- explicações curtas.

O campo "colunaB" deve conter a correspondência correta do item.

========================
EMBARALHAMENTO
========================

- Os pares devem ser corretos no JSON.
- O sistema exibirá a coluna B em ordem separada.
- Mesmo assim, não organizar os itens de forma previsível.
- Evitar correspondências óbvias apenas pelo tamanho das frases.
- Não usar a mesma palavra-chave nas duas colunas quando isso entregar a resposta.

========================
GABARITO
========================

O gabarito deve informar a correspondência de todos os pares.

Exemplo:

1-A
2-C
3-B
4-D

========================
CONFERÊNCIA OBRIGATÓRIA
========================

Antes de responder:

1. Verifique se existem exatamente ${dados.quantidade} pares.
2. Verifique se cada item possui coluna A e coluna B.
3. Verifique se não existem respostas duplicadas.
4. Verifique se nenhuma relação é ambígua.
5. Verifique se o gabarito corresponde aos pares reais.
6. Corrija qualquer inconsistência antes de retornar o JSON.

========================
JSON
========================

Retorne SOMENTE JSON válido.

Não use markdown.
Não use crases.
Não escreva explicações antes ou depois.

{
  "titulo": "Ligue as colunas",
  "subtitulo": "${dados.serie} • ${dados.disciplina}",
  "modoCriacao": "especifica",
  "exercicios": [
    {
      "id": "",
      "numero": 1,
      "tipo": "ligue_colunas",
      "titulo": "Ligue as colunas",
      "comando": "Relacione corretamente os elementos das duas colunas.",
      "conteudoLivre": "",
      "itens": [
        {
          "id": "item-1",
          "texto": "",
          "resposta": "",
          "imagemNecessaria": false,
          "imagemDescricao": "",
          "colunaA": "Elemento da coluna A",
          "colunaB": "Correspondência correta",
          "alternativas": [],
          "verdadeiro": null
        }
      ],
      "textoApoio": "",
      "palavras": [],
      "pistas": [],
      "grade": [],
      "colunas": [
        "COLUNA A",
        "COLUNA B"
      ],
      "imagemNecessaria": false,
      "imagemDescricao": "",
      "gabarito": "1-A; 2-C; 3-B"
    }
  ]
}

REGRAS DO JSON:
- O exercício deve possuir todos os campos.
- Todos os itens devem possuir todos os campos.
- "itens" deve ser uma lista.
- "palavras", "pistas" e "grade" devem ser listas vazias.
- "colunas" deve conter exatamente "COLUNA A" e "COLUNA B".
- O campo "id" do exercício deve ficar vazio.
- O campo "numero" deve ser 1.
`;
}