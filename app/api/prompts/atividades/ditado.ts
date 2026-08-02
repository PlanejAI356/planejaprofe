type DadosDitado = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  observacoes: string;
  quantidade: number;
  palavras: string[];
};

export function gerarPromptDitado(
  dados: DadosDitado
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
- Usar objetos extremamente conhecidos pelas crianças.
- Priorizar animais, frutas, brinquedos, cores, alimentos e objetos do cotidiano.
- Palavras curtas.
`
    : ehAnosIniciais
      ? `
- Adequar a quantidade de sílabas à série.
- Variar palavras simples e compostas.
- Trabalhar consciência fonológica.
`
      : ehAnosFinais
        ? `
- Trabalhar vocabulário relacionado ao conteúdo estudado.
`
        : ehEnsinoMedio
          ? `
- Utilizar terminologia científica adequada ao conteúdo.
`
          : ehEJA
            ? `
- Nunca infantilizar.
- Priorizar palavras relacionadas ao cotidiano e ao conteúdo.
`
            : "";

  return `
Você é especialista em alfabetização e produção de atividades ilustradas.

Crie UMA atividade de DITADO ILUSTRADO pronta para impressão.

DADOS

Etapa:
${dados.etapaEnsino}

Série:
${dados.serie}

Disciplina:
${dados.disciplina}

Tema:
${dados.conteudo}

Quantidade:
${dados.quantidade}

Palavras fornecidas:
${dados.palavras.join(", ") || "Nenhuma"}

Observações:
${dados.observacoes || "Nenhuma"}

${regrasEtapa}

========================
REGRAS
========================

- Criar apenas UMA atividade.

- Criar exatamente ${dados.quantidade} figuras.

- Se houver palavras fornecidas pelo professor, utilizar exatamente essas palavras.

- Nunca alterar a escrita das palavras.

- Caso não existam palavras fornecidas, escolher palavras relacionadas ao conteúdo.

- Cada item deve representar apenas UMA palavra.

- Nunca colocar duas figuras na mesma imagem.

- Nunca gerar colagem.

- Nunca gerar cenário.

- Nunca gerar fundo colorido.

- Nunca gerar texto dentro da imagem.

- Nunca gerar letras.

- Nunca gerar números.

- Nunca gerar molduras.

- Nunca gerar balões.

- Nunca usar emojis.

========================
IMAGEM
========================

Toda imagem deverá ser descrita assim:

- pequena

- centralizada

- um único objeto

- fundo branco

- sem texto

- sem letras

- sem números

- sem pessoas (quando não forem necessárias)

- estilo livro didático

- alta qualidade

- ilustração limpa

- traço simples

- pronta para impressão

Exemplo:

"Ilustração infantil de um cachorro marrom sentado olhando para frente, objeto único, centralizado, sem texto, fundo branco, traço simples, estilo livro didático."

========================
JSON
========================

Retorne SOMENTE JSON válido.

{
  "titulo":"Ditado ilustrado",

  "subtitulo":"${dados.serie} • ${dados.disciplina}",

  "modoCriacao":"especifica",

  "exercicios":[
    {
      "tipo":"ditado_ilustrado",

      "titulo":"Ditado ilustrado",

      "comando":"Observe as figuras e escreva corretamente o nome de cada uma.",

      "itens":[
        {
          "id":"item-1",

          "texto":"",

          "resposta":"",

          "imagemNecessaria":true,

          "imagemDescricao":"",

          "colunaA":"",

          "colunaB":"",

          "alternativas":[],

          "verdadeiro":null
        }
      ]
    }
  ]
}

`;
}