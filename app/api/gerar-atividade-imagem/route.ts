import OpenAI from "openai";
import { NextResponse } from "next/server";
import { gerarPromptAlfabetizacaoImagem } from "../prompts/alfabetizacaoImagem";

export const runtime = "nodejs";
export const maxDuration = 180;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type CorpoRequisicao = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  pedido?: string;

  quantidadeQuestoes?: number | null;

  tipoAtividade?: string | null;

  nivelCacaPalavras?: string | null;
  palavrasCacaPalavras?: string;

  tipoPistaCruzadinha?: string | null;
  palavrasCruzadinha?: string;

  tipoOrdenacao?: string | null;

  quantidadeAutoditado?: number | null;
  palavrasAutoditado?: string;
};


type ItemCruzadinha = {
  palavra: string;
  pista: string;
};

type DirecaoCruzadinha = "H" | "V";

type PalavraPosicionada = ItemCruzadinha & {
  palavraGrade: string;
  linha: number;
  coluna: number;
  direcao: DirecaoCruzadinha;
  numero?: number;
};

type CelulaCruzadinha = {
  letra: string;
  palavras: number[];
};

type GradeCruzadinha = Array<Array<CelulaCruzadinha | null>>;

function removerAcentos(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarPalavraGrade(valor: string) {
  return removerAcentos(valor)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function limparPalavraExibicao(valor: string) {
  return valor
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[\-–—,.;:!?]+|[\-–—,.;:!?]+$/g, "");
}

function escaparXml(valor: string) {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function quebrarTexto(valor: string, maximo = 58) {
  const palavras = valor.trim().split(/\s+/).filter(Boolean);
  const linhas: string[] = [];
  let atual = "";

  for (const palavra of palavras) {
    const candidato = atual ? `${atual} ${palavra}` : palavra;
    if (candidato.length <= maximo) {
      atual = candidato;
    } else {
      if (atual) linhas.push(atual);
      atual = palavra;
    }
  }

  if (atual) linhas.push(atual);
  return linhas.length ? linhas : [""];
}

function extrairPalavrasInformadas(valor: string) {
  return valor
    .split(/[\n,;|]+/)
    .map(limparPalavraExibicao)
    .filter(Boolean);
}

function deduplicarItens(itens: ItemCruzadinha[]) {
  const vistos = new Set<string>();
  const resultado: ItemCruzadinha[] = [];

  for (const item of itens) {
    const palavra = limparPalavraExibicao(String(item.palavra || ""));
    const pista = String(item.pista || "").trim();
    const chave = normalizarPalavraGrade(palavra);

    if (!chave || chave.length < 2 || !pista || vistos.has(chave)) {
      continue;
    }

    vistos.add(chave);
    resultado.push({ palavra, pista });
  }

  return resultado;
}

function dentro(linha: number, coluna: number, tamanho: number) {
  return linha >= 0 && coluna >= 0 && linha < tamanho && coluna < tamanho;
}

function criarGradeVazia(tamanho: number): GradeCruzadinha {
  return Array.from({ length: tamanho }, () =>
    Array.from({ length: tamanho }, () => null)
  );
}

function podePosicionar(
  grade: GradeCruzadinha,
  palavra: string,
  linha: number,
  coluna: number,
  direcao: DirecaoCruzadinha
) {
  const tamanho = grade.length;
  const dl = direcao === "V" ? 1 : 0;
  const dc = direcao === "H" ? 1 : 0;
  const fimLinha = linha + dl * (palavra.length - 1);
  const fimColuna = coluna + dc * (palavra.length - 1);

  if (!dentro(linha, coluna, tamanho) || !dentro(fimLinha, fimColuna, tamanho)) {
    return null;
  }

  const antesLinha = linha - dl;
  const antesColuna = coluna - dc;
  const depoisLinha = fimLinha + dl;
  const depoisColuna = fimColuna + dc;

  if (
    dentro(antesLinha, antesColuna, tamanho) &&
    grade[antesLinha][antesColuna]
  ) {
    return null;
  }

  if (
    dentro(depoisLinha, depoisColuna, tamanho) &&
    grade[depoisLinha][depoisColuna]
  ) {
    return null;
  }

  let cruzamentos = 0;

  for (let i = 0; i < palavra.length; i++) {
    const l = linha + dl * i;
    const c = coluna + dc * i;
    const celula = grade[l][c];

    if (celula) {
      if (celula.letra !== palavra[i]) return null;
      cruzamentos++;
      continue;
    }

    if (direcao === "H") {
      if (
        (dentro(l - 1, c, tamanho) && grade[l - 1][c]) ||
        (dentro(l + 1, c, tamanho) && grade[l + 1][c])
      ) {
        return null;
      }
    } else {
      if (
        (dentro(l, c - 1, tamanho) && grade[l][c - 1]) ||
        (dentro(l, c + 1, tamanho) && grade[l][c + 1])
      ) {
        return null;
      }
    }
  }

  return { cruzamentos };
}

function colocarPalavra(
  grade: GradeCruzadinha,
  palavra: string,
  linha: number,
  coluna: number,
  direcao: DirecaoCruzadinha,
  indicePalavra: number
) {
  const dl = direcao === "V" ? 1 : 0;
  const dc = direcao === "H" ? 1 : 0;

  for (let i = 0; i < palavra.length; i++) {
    const l = linha + dl * i;
    const c = coluna + dc * i;
    const existente = grade[l][c];

    if (existente) {
      existente.palavras.push(indicePalavra);
    } else {
      grade[l][c] = {
        letra: palavra[i],
        palavras: [indicePalavra],
      };
    }
  }
}

function limitesDaGrade(grade: GradeCruzadinha) {
  let minLinha = grade.length;
  let maxLinha = -1;
  let minColuna = grade.length;
  let maxColuna = -1;

  for (let l = 0; l < grade.length; l++) {
    for (let c = 0; c < grade.length; c++) {
      if (!grade[l][c]) continue;
      minLinha = Math.min(minLinha, l);
      maxLinha = Math.max(maxLinha, l);
      minColuna = Math.min(minColuna, c);
      maxColuna = Math.max(maxColuna, c);
    }
  }

  if (maxLinha < 0) {
    return { minLinha: 0, maxLinha: 0, minColuna: 0, maxColuna: 0 };
  }

  return { minLinha, maxLinha, minColuna, maxColuna };
}

function areaAposPosicionamento(
  grade: GradeCruzadinha,
  palavra: string,
  linha: number,
  coluna: number,
  direcao: DirecaoCruzadinha
) {
  const atual = limitesDaGrade(grade);
  const dl = direcao === "V" ? 1 : 0;
  const dc = direcao === "H" ? 1 : 0;
  const fimLinha = linha + dl * (palavra.length - 1);
  const fimColuna = coluna + dc * (palavra.length - 1);

  const minLinha = Math.min(atual.minLinha, linha, fimLinha);
  const maxLinha = Math.max(atual.maxLinha, linha, fimLinha);
  const minColuna = Math.min(atual.minColuna, coluna, fimColuna);
  const maxColuna = Math.max(atual.maxColuna, coluna, fimColuna);

  return (maxLinha - minLinha + 1) * (maxColuna - minColuna + 1);
}

function tentarMontarGrade(itens: ItemCruzadinha[], tamanho: number) {
  const preparados = itens
    .map((item) => ({ ...item, palavraGrade: normalizarPalavraGrade(item.palavra) }))
    .filter((item) => item.palavraGrade.length >= 2 && item.palavraGrade.length <= tamanho - 2)
    .sort((a, b) => b.palavraGrade.length - a.palavraGrade.length);

  if (!preparados.length) return null;

  const grade = criarGradeVazia(tamanho);
  const posicionadas: PalavraPosicionada[] = [];
  const primeira = preparados[0];
  const primeiraLinha = Math.floor(tamanho / 2);
  const primeiraColuna = Math.max(1, Math.floor((tamanho - primeira.palavraGrade.length) / 2));

  colocarPalavra(
    grade,
    primeira.palavraGrade,
    primeiraLinha,
    primeiraColuna,
    "H",
    0
  );

  posicionadas.push({
    ...primeira,
    linha: primeiraLinha,
    coluna: primeiraColuna,
    direcao: "H",
  });

  for (let indice = 1; indice < preparados.length; indice++) {
    const item = preparados[indice];
    let melhor:
      | {
          linha: number;
          coluna: number;
          direcao: DirecaoCruzadinha;
          cruzamentos: number;
          area: number;
        }
      | undefined;

    for (let i = 0; i < item.palavraGrade.length; i++) {
      const letra = item.palavraGrade[i];

      for (let l = 0; l < tamanho; l++) {
        for (let c = 0; c < tamanho; c++) {
          const celula = grade[l][c];
          if (!celula || celula.letra !== letra) continue;

          for (const direcao of ["H", "V"] as DirecaoCruzadinha[]) {
            const linha = direcao === "V" ? l - i : l;
            const coluna = direcao === "H" ? c - i : c;
            const validacao = podePosicionar(
              grade,
              item.palavraGrade,
              linha,
              coluna,
              direcao
            );

            if (!validacao || validacao.cruzamentos < 1) continue;

            const area = areaAposPosicionamento(
              grade,
              item.palavraGrade,
              linha,
              coluna,
              direcao
            );

            if (
              !melhor ||
              validacao.cruzamentos > melhor.cruzamentos ||
              (validacao.cruzamentos === melhor.cruzamentos && area < melhor.area)
            ) {
              melhor = {
                linha,
                coluna,
                direcao,
                cruzamentos: validacao.cruzamentos,
                area,
              };
            }
          }
        }
      }
    }

    if (!melhor) {
      continue;
    }

    const indicePosicionada = posicionadas.length;
    colocarPalavra(
      grade,
      item.palavraGrade,
      melhor.linha,
      melhor.coluna,
      melhor.direcao,
      indicePosicionada
    );

    posicionadas.push({
      ...item,
      linha: melhor.linha,
      coluna: melhor.coluna,
      direcao: melhor.direcao,
    });
  }

  return { grade, posicionadas };
}

function montarGradeCompleta(itens: ItemCruzadinha[]) {
  for (const tamanho of [17, 19, 21, 23, 25]) {
    const resultado = tentarMontarGrade(itens, tamanho);
    if (resultado && resultado.posicionadas.length === itens.length) {
      return resultado;
    }
  }

  return null;
}

function numerarCruzadinha(posicionadas: PalavraPosicionada[]) {
  const ordenadas = [...posicionadas].sort(
    (a, b) =>
      a.linha - b.linha ||
      a.coluna - b.coluna ||
      a.direcao.localeCompare(b.direcao)
  );

  let numero = 1;

  for (const palavra of ordenadas) {
    palavra.numero = numero++;
  }

  const mapa = new Map<string, number>();
  for (const palavra of ordenadas) {
    mapa.set(
      `${palavra.linha}:${palavra.coluna}:${palavra.direcao}`,
      palavra.numero || 0
    );
  }

  for (const palavra of posicionadas) {
    palavra.numero = mapa.get(
      `${palavra.linha}:${palavra.coluna}:${palavra.direcao}`
    );
  }
}

function recortarGrade(
  grade: GradeCruzadinha,
  posicionadas: PalavraPosicionada[]
) {
  const limites = limitesDaGrade(grade);
  const margem = 1;
  const minLinha = Math.max(0, limites.minLinha - margem);
  const maxLinha = Math.min(grade.length - 1, limites.maxLinha + margem);
  const minColuna = Math.max(0, limites.minColuna - margem);
  const maxColuna = Math.min(grade.length - 1, limites.maxColuna + margem);

  const gradeRecortada = grade
    .slice(minLinha, maxLinha + 1)
    .map((linha) => linha.slice(minColuna, maxColuna + 1));

  const palavrasAjustadas = posicionadas.map((palavra) => ({
    ...palavra,
    linha: palavra.linha - minLinha,
    coluna: palavra.coluna - minColuna,
  }));

  return { grade: gradeRecortada, posicionadas: palavrasAjustadas };
}

function validarGrade(
  grade: GradeCruzadinha,
  posicionadas: PalavraPosicionada[],
  quantidadeEsperada?: number | null
) {
  if (!posicionadas.length) return false;

  if (
    quantidadeEsperada !== null &&
    quantidadeEsperada !== undefined &&
    posicionadas.length !== quantidadeEsperada
  ) {
    return false;
  }

  const numeros = posicionadas.map((item) => item.numero);
  if (
    numeros.some((numero) => !numero) ||
    new Set(numeros).size !== posicionadas.length
  ) {
    return false;
  }

  const pistas = posicionadas.map((item) => item.pista.trim().toLowerCase());
  if (new Set(pistas).size !== posicionadas.length) {
    return false;
  }

  for (const palavra of posicionadas) {
    const dl = palavra.direcao === "V" ? 1 : 0;
    const dc = palavra.direcao === "H" ? 1 : 0;

    for (let i = 0; i < palavra.palavraGrade.length; i++) {
      const l = palavra.linha + dl * i;
      const c = palavra.coluna + dc * i;

      if (grade[l]?.[c]?.letra !== palavra.palavraGrade[i]) {
        return false;
      }
    }
  }

  if (posicionadas.length > 1) {
    const participaDeCruzamento = posicionadas.every((palavra) => {
      const dl = palavra.direcao === "V" ? 1 : 0;
      const dc = palavra.direcao === "H" ? 1 : 0;

      return Array.from({ length: palavra.palavraGrade.length }).some((_, i) => {
        const l = palavra.linha + dl * i;
        const c = palavra.coluna + dc * i;
        return (grade[l]?.[c]?.palavras.length || 0) > 1;
      });
    });

    if (!participaDeCruzamento) return false;
  }

  return true;
}

function renderizarCruzadinhaSvg(
  grade: GradeCruzadinha,
  posicionadas: PalavraPosicionada[],
  mostrarRespostas: boolean
) {
  const largura = 1024;
  const altura = 1320;
  const linhas = grade.length;
  const colunas = Math.max(...grade.map((linha) => linha.length));
  // A cruzadinha deve ser o elemento principal da folha.
  // A grade usa quase toda a largura útil e cresce o máximo possível
  // sem ultrapassar a área reservada para as pistas.
  const inicioY = 108;
  const larguraMaxGrade = 980;
  const alturaMaxGrade = 780;
  const tamanhoCelula = Math.max(
    46,
    Math.min(
      76,
      Math.floor(larguraMaxGrade / colunas),
      Math.floor(alturaMaxGrade / linhas)
    )
  );
  const larguraGrade = colunas * tamanhoCelula;
  const alturaGrade = linhas * tamanhoCelula;
  const inicioX = Math.floor((largura - larguraGrade) / 2);

  const mapaNumeros = new Map<string, number[]>();
  for (const palavra of posicionadas) {
    const chave = `${palavra.linha}:${palavra.coluna}`;
    const atuais = mapaNumeros.get(chave) || [];
    atuais.push(palavra.numero || 0);
    mapaNumeros.set(chave, atuais);
  }

  const celulasSvg: string[] = [];
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      const celula = grade[l]?.[c];
      if (!celula) continue;

      const x = inicioX + c * tamanhoCelula;
      const y = inicioY + l * tamanhoCelula;
      const numeros = mapaNumeros.get(`${l}:${c}`) || [];

      celulasSvg.push(
        `<rect x="${x}" y="${y}" width="${tamanhoCelula}" height="${tamanhoCelula}" fill="white" stroke="#111827" stroke-width="1.4"/>`
      );

      if (numeros.length) {
        celulasSvg.push(
          `<text x="${x + 4}" y="${y + 12}" font-family="Arial, sans-serif" font-size="${Math.max(9, Math.floor(tamanhoCelula * 0.18))}" font-weight="700" fill="#111827">${numeros.join("/")}</text>`
        );
      }

      if (mostrarRespostas) {
        celulasSvg.push(
          `<text x="${x + tamanhoCelula / 2}" y="${y + tamanhoCelula * 0.68}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.max(15, Math.floor(tamanhoCelula * 0.52))}" font-weight="700" fill="#111827">${escaparXml(celula.letra)}</text>`
        );
      }
    }
  }

  const horizontais = posicionadas
    .filter((item) => item.direcao === "H")
    .sort((a, b) => (a.numero || 0) - (b.numero || 0));
  const verticais = posicionadas
    .filter((item) => item.direcao === "V")
    .sort((a, b) => (a.numero || 0) - (b.numero || 0));

  const pistasY = inicioY + alturaGrade + 28;
  const colunaEsquerdaX = 64;
  const colunaDireitaX = 536;
  const larguraTexto = 430;

  function blocoPistas(
    titulo: string,
    itens: PalavraPosicionada[],
    x: number
  ) {
    const partes: string[] = [
      `<text x="${x}" y="${pistasY}" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#111827">${titulo}</text>`,
    ];
    let y = pistasY + 30;

    for (const item of itens) {
      const resposta = mostrarRespostas ? ` — ${item.palavra.toUpperCase()}` : "";
      const linhasTexto = quebrarTexto(`${item.numero}. ${item.pista}${resposta}`, 56);
      for (const linhaTexto of linhasTexto) {
        partes.push(
          `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="17" fill="#1f2937">${escaparXml(linhaTexto)}</text>`
        );
        y += 23;
      }
      y += 8;
    }

    return partes.join("\n");
  }

  const titulo = mostrarRespostas ? "CRUZADINHA — CÓPIA DO PROFESSOR" : "CRUZADINHA";
  const comando = mostrarRespostas
    ? "Mesma cruzadinha da versão do aluno, com todas as respostas preenchidas."
    : "Leia as pistas e complete a cruzadinha. As palavras se cruzam pelas letras em comum.";

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}">
  <rect width="100%" height="100%" fill="white"/>
  <text x="512" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#111827">${escaparXml(titulo)}</text>
  <text x="512" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#374151">${escaparXml(comando)}</text>
  ${celulasSvg.join("\n")}
  ${blocoPistas("HORIZONTAIS", horizontais, colunaEsquerdaX)}
  ${blocoPistas("VERTICAIS", verticais, colunaDireitaX)}
  <text x="${largura - 64}" y="${altura - 28}" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">PlanejAI</text>
</svg>`.trim();
}

function svgParaDataUrl(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

async function criarItensCruzadinha({
  etapaEnsino,
  serie,
  disciplina,
  pedido,
  quantidadeQuestoes,
  tipoPistaCruzadinha,
  palavrasCruzadinha,
}: {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  pedido: string;
  quantidadeQuestoes: number | null;
  tipoPistaCruzadinha: string;
  palavrasCruzadinha: string;
}) {
  const informadas = extrairPalavrasInformadas(palavrasCruzadinha);
  const quantidade = Math.max(
    informadas.length || 0,
    quantidadeQuestoes ?? (informadas.length || 10)
  );

  const palavrasObrigatorias = informadas.length
    ? `PALAVRAS OBRIGATÓRIAS:\n${informadas.map((p) => `- ${p}`).join("\n")}`
    : "O professor não informou palavras obrigatórias. Escolha palavras diretamente relacionadas ao conteúdo.";

  const resposta = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Você cria dados para cruzadinhas escolares em português do Brasil. Responda somente JSON válido.",
      },
      {
        role: "user",
        content: `
Crie os dados de UMA cruzadinha escolar.

Etapa: ${etapaEnsino}
Série/turma: ${serie}
Disciplina: ${disciplina}
Pedido do professor: ${pedido}
Formato das pistas: ${tipoPistaCruzadinha}
Quantidade desejada: ${quantidade}

${palavrasObrigatorias}

REGRAS OBRIGATÓRIAS:
- Retorne exatamente um objeto JSON no formato: {"itens":[{"palavra":"...","pista":"..."}]}.
- Cada item deve ter UMA palavra-resposta e UMA pista.
- Preferir palavras únicas, sem espaços, com 3 a 14 caracteres de grade.
- Usar ortografia correta do português do Brasil.
- Evitar respostas repetidas ou quase iguais.
- As pistas devem ser objetivas, não ambíguas e adequadas a ${serie}.
- Se houver palavras obrigatórias, manter todas exatamente como informadas e criar pista para cada uma.
- Se faltar quantidade para chegar a ${quantidade}, completar com palavras do mesmo conteúdo.
- Não colocar a resposta dentro da pista.
- Não numerar as pistas; o código fará a numeração.
`.trim(),
      },
    ],
  });

  const conteudo = resposta.choices[0]?.message?.content || "";
  let parsed: { itens?: ItemCruzadinha[] };

  try {
    parsed = JSON.parse(conteudo) as { itens?: ItemCruzadinha[] };
  } catch {
    throw new Error("Não foi possível organizar as palavras e pistas da cruzadinha.");
  }

  let itens = deduplicarItens(Array.isArray(parsed.itens) ? parsed.itens : []);

  if (informadas.length) {
    const mapa = new Map(
      itens.map((item) => [normalizarPalavraGrade(item.palavra), item])
    );

    const obrigatoriasComPista: ItemCruzadinha[] = [];
    for (const palavra of informadas) {
      const chave = normalizarPalavraGrade(palavra);
      const correspondente = mapa.get(chave);
      if (!correspondente) {
        throw new Error(`Não foi possível criar uma pista segura para a palavra "${palavra}".`);
      }
      obrigatoriasComPista.push({
        palavra,
        pista: correspondente.pista,
      });
    }

    const extras = itens.filter(
      (item) => !informadas.some((p) => normalizarPalavraGrade(p) === normalizarPalavraGrade(item.palavra))
    );

    itens = deduplicarItens([...obrigatoriasComPista, ...extras]);
  }

  if (itens.length < 2) {
    throw new Error("A cruzadinha precisa de pelo menos duas palavras válidas.");
  }

  const limite = Math.min(quantidade, 20);
  const selecionados = itens.slice(0, limite);

  if (selecionados.length !== limite) {
    throw new Error(
      `A inteligência artificial retornou ${selecionados.length} palavras válidas, mas eram necessárias ${limite}.`
    );
  }

  return selecionados;
}

async function gerarCruzadinhaDeterministica(args: {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  pedido: string;
  quantidadeQuestoes: number | null;
  tipoPistaCruzadinha: string;
  palavrasCruzadinha: string;
}) {
  let itens = await criarItensCruzadinha(args);

  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const montada = montarGradeCompleta(itens);

    if (montada) {
      numerarCruzadinha(montada.posicionadas);
      const recortada = recortarGrade(montada.grade, montada.posicionadas);

      const quantidadeEsperada =
        args.quantidadeQuestoes ??
        (args.palavrasCruzadinha
          ? extrairPalavrasInformadas(args.palavrasCruzadinha).length
          : itens.length);

      if (
        recortada.posicionadas.length !== quantidadeEsperada ||
        !validarGrade(
          recortada.grade,
          recortada.posicionadas,
          quantidadeEsperada
        )
      ) {
        if (!args.palavrasCruzadinha) {
          itens = await criarItensCruzadinha({
            ...args,
            pedido: `${args.pedido}
A cruzadinha anterior não passou na validação. Gere exatamente ${quantidadeEsperada} palavras diferentes, com muitas letras em comum entre si, para que TODAS possam ser cruzadas.`,
          });
          continue;
        }

        throw new Error(
          `Não foi possível montar uma cruzadinha válida com exatamente ${quantidadeEsperada} palavras. Tente informar palavras com mais letras em comum.`
        );
      }

      const svgAluno = renderizarCruzadinhaSvg(
        recortada.grade,
        recortada.posicionadas,
        false
      );
      const svgProfessor = renderizarCruzadinhaSvg(
        recortada.grade,
        recortada.posicionadas,
        true
      );

      return {
        imagem: svgParaDataUrl(svgAluno),
        imagemProfessor: svgParaDataUrl(svgProfessor),
        cruzadinha: {
          palavras: recortada.posicionadas.map((item) => ({
            numero: item.numero,
            palavra: item.palavra,
            pista: item.pista,
            direcao: item.direcao,
            linha: item.linha,
            coluna: item.coluna,
            quantidadeLetras: item.palavraGrade.length,
          })),
        },
      };
    }

    // Se todas as palavras não couberem, pede um novo conjunto com melhor capacidade de cruzamento.
    if (!args.palavrasCruzadinha) {
      itens = await criarItensCruzadinha({
        ...args,
        pedido: `${args.pedido}\nEscolha palavras com letras em comum entre si para facilitar cruzamentos reais.`,
      });
    } else {
      break;
    }
  }

  throw new Error(
    "Não foi possível montar uma cruzadinha em que todas as palavras se cruzem corretamente. Tente usar palavras com mais letras em comum."
  );
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CorpoRequisicao;

    const etapaEnsino = String(
      body.etapaEnsino || ""
    ).trim();

    const serie = String(
      body.serie || ""
    ).trim();

    const disciplina = String(
      body.disciplina || ""
    ).trim();

    const pedido = String(
      body.pedido || ""
    ).trim();

    /*
     * Quantidade de questões agora é realmente opcional.
     * Se o professor não preencher, fica null.
     */
    const quantidadeQuestoes =
      body.quantidadeQuestoes === null ||
      body.quantidadeQuestoes === undefined ||
      body.quantidadeQuestoes === ("" as unknown)
        ? null
        : Math.max(
            1,
            Math.min(
              20,
              Number(body.quantidadeQuestoes)
            )
          );

    /*
     * Tipo de atividade também é realmente opcional.
     * Não transformamos mais automaticamente em "mista".
     */
    const tipoAtividade = String(
      body.tipoAtividade || ""
    )
      .trim()
      .toLowerCase();

    const nivelCacaPalavras = String(
      body.nivelCacaPalavras || "facil"
    )
      .trim()
      .toLowerCase();

    const palavrasCacaPalavras = String(
      body.palavrasCacaPalavras || ""
    ).trim();

    const tipoPistaCruzadinha = String(
      body.tipoPistaCruzadinha || "perguntas"
    )
      .trim()
      .toLowerCase();

    const palavrasCruzadinha = String(
      body.palavrasCruzadinha || ""
    ).trim();

    const tipoOrdenacao = String(
      body.tipoOrdenacao || "automatico"
    )
      .trim()
      .toLowerCase();

    /*
     * Quantidade do autoditado é independente
     * da quantidade de questões.
     */
    const quantidadeAutoditado =
      body.quantidadeAutoditado === null ||
      body.quantidadeAutoditado === undefined
        ? 6
        : Math.max(
            1,
            Math.min(
              20,
              Number(body.quantidadeAutoditado)
            )
          );

    const palavrasAutoditado = String(
      body.palavrasAutoditado || ""
    ).trim();

    if (!etapaEnsino) {
      return NextResponse.json(
        {
          erro:
            "A etapa de ensino não foi informada.",
        },
        { status: 400 }
      );
    }

    if (!serie) {
      return NextResponse.json(
        {
          erro:
            "A série ou turma não foi informada.",
        },
        { status: 400 }
      );
    }

    if (!disciplina) {
      return NextResponse.json(
        {
          erro:
            "A disciplina não foi informada.",
        },
        { status: 400 }
      );
    }

    if (!pedido) {
      return NextResponse.json(
        {
          erro:
            "Descreva a atividade que deseja criar.",
        },
        { status: 400 }
      );
    }


    /*
     * CRUZADINHA: fluxo especial e determinístico.
     * A IA cria apenas palavras/pistas em JSON.
     * A grade, os cruzamentos, a numeração e o gabarito são montados pelo código.
     */
    if (tipoAtividade === "cruzadinha") {
      const cruzadinha = await gerarCruzadinhaDeterministica({
        etapaEnsino,
        serie,
        disciplina,
        pedido,
        quantidadeQuestoes,
        tipoPistaCruzadinha,
        palavrasCruzadinha,
      });

      return NextResponse.json({
        ...cruzadinha,
        promptFinal:
          "Cruzadinha gerada por fluxo determinístico: palavras e pistas em JSON + grade validada pelo código.",
      });
    }

    /*
     * PROMPT BASE
     */
    const promptBase =
      gerarPromptAlfabetizacaoImagem({
        etapaEnsino,
        serie,
        disciplina,
        pedido,
        quantidadeQuestoes,
      });

    /*
     * REGRAS ESPECÍFICAS DE CADA TIPO
     */
    let regrasTipoAtividade = "";

    /*
     * NENHUM TIPO SELECIONADO
     */
    if (!tipoAtividade) {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE NÃO DEFINIDO PELO PROFESSOR.

O professor preferiu não escolher um formato específico.

REGRAS:
- Interpretar diretamente o pedido escrito pelo professor.
- Escolher o formato pedagógico mais adequado ao conteúdo.
- Respeitar rigorosamente ${serie}.
- Não assumir automaticamente que a atividade deve ser mista.
- Se o pedido indicar claramente um formato, seguir esse formato.
- Se o pedido não indicar formato, escolher uma organização adequada à série e ao objetivo pedagógico.
`;
    }

    /*
     * CAÇA-PALAVRAS
     */
    if (tipoAtividade === "caca_palavras") {
      let regrasNivel = "";

      if (nivelCacaPalavras === "facil") {
        regrasNivel = `
NÍVEL FÁCIL:
- Criar uma grade pequena e visualmente limpa.
- Usar uma quantidade moderada de palavras adequada à série.
- Distribuir as palavras em POSIÇÕES DIFERENTES da grade.
- Utilizar palavras na horizontal, vertical e algumas diagonais simples.
- Não utilizar palavras invertidas.
- Não colocar várias palavras completas uma embaixo da outra.
- Não concentrar todas as palavras no mesmo canto ou nas mesmas linhas.
- Misturar letras distratoras entre as palavras para que elas não fiquem imediatamente visíveis.
- Manter o desafio fácil, mas o estudante ainda deve precisar procurar as palavras.
- Adequar o tamanho da grade à idade dos estudantes.
`;
      }

      if (nivelCacaPalavras === "medio") {
        regrasNivel = `
NÍVEL MÉDIO:
- Criar uma grade de tamanho intermediário.
- Distribuir as palavras por diferentes regiões da grade.
- Usar palavras na horizontal, vertical e diagonal.
- Pode utilizar algumas palavras invertidas, sem exagerar.
- Não organizar palavras completas em linhas consecutivas.
- Acrescentar letras distratoras suficientes para aumentar o desafio.
- Evitar padrões visuais que entreguem facilmente onde estão as palavras.
`;
      }

      if (nivelCacaPalavras === "dificil") {
        regrasNivel = `
NÍVEL DIFÍCIL:
- Criar uma grade maior.
- Utilizar várias palavras.
- Distribuir as palavras por toda a grade.
- Usar horizontal, vertical e diagonal.
- Utilizar também palavras invertidas.
- Permitir cruzamento e sobreposição de letras quando isso continuar funcional.
- Acrescentar mais letras distratoras.
- Evitar qualquer organização em linhas ou blocos previsvisíveis.
- O caça-palavras deve ser desafiador, mas solucionável.
`;
      }

      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: CAÇA-PALAVRAS.

Crie UMA atividade de caça-palavras verdadeira, funcional e bem distribuída.

IMPORTANTE:
- Caça-palavras não deve ser tratado como várias questões.
- Não criar questões extras apenas porque existe uma quantidade de questões.
- A atividade principal é o próprio caça-palavras.

${regrasNivel}

REGRAS OBRIGATÓRIAS DO CAÇA-PALAVRAS:

- Todas as palavras apresentadas ao estudante devem realmente existir dentro da grade.
- Cada palavra da lista deve aparecer UMA VEZ de forma completa e correta, salvo cruzamentos naturais.
- Não inventar palavras na lista que não estejam na grade.
- Não colocar palavras incompletas.
- Não trocar, omitir ou duplicar letras dentro das palavras.
- Respeitar rigorosamente a ortografia correta em português do Brasil.
- Respeitar acentos e sinais gráficos quando fizerem parte da grafia correta da palavra.
- Se o professor informar as palavras, copiar EXATAMENTE a grafia fornecida por ele.
- Conferir LETRA POR LETRA cada palavra da lista dentro da grade antes de finalizar.
- Conferir novamente palavras com acento, nomes próprios e termos científicos.
- Espalhar as palavras por diferentes linhas, colunas e regiões da grade.
- Não colocar uma sequência de palavras completas uma embaixo da outra.
- Não deixar a localização das palavras óbvia pela diagramação.
- Colocar um comando claro, como "Encontre as palavras no caça-palavras".
- Mostrar abaixo ou acima da grade a lista de palavras que devem ser encontradas.
- Utilizar letras maiúsculas, nítidas e centralizadas.
- A grade deve ter células regulares e alinhadas.
- Não mostrar as respostas destacadas.
- Não circular ou marcar as palavras encontradas.
- A folha deve permanecer adequada para impressão em preto e branco.
- Respeitar rigorosamente a dificuldade adequada para ${serie}.

${
  palavrasCacaPalavras
    ? `
PALAVRAS INFORMADAS PELO PROFESSOR:

${palavrasCacaPalavras}

REGRA MUITO IMPORTANTE:

- Utilizar obrigatoriamente todas as palavras informadas pelo professor.
- Não substituir essas palavras por outras.
- Preservar a escrita correta e completa de cada palavra.
- Conferir cada palavra da lista contra a grade antes de gerar a imagem final.
- É permitido acrescentar outras palavras somente se necessário para completar pedagogicamente a atividade.
`
    : `
O professor não informou palavras específicas.

Escolha palavras adequadas:
- ao conteúdo solicitado;
- à disciplina;
- e principalmente à série ${serie}.

Antes de montar a grade, confira a ortografia correta de todas as palavras escolhidas.
`
}
`;
    }

    /*
     * AUTODITADO
     */
    if (tipoAtividade === "autoditado") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: AUTODITADO.

Crie uma atividade de autoditado verdadeira.

IMPORTANTE:
- Autoditado não deve ser tratado como várias questões independentes.
- A quantidade abaixo se refere às imagens/palavras do autoditado.

QUANTIDADE:

- Utilizar exatamente ${quantidadeAutoditado} imagens/palavras.

REGRAS OBRIGATÓRIAS DO AUTODITADO:

- Cada item deve apresentar uma figura clara e facilmente reconhecível.
- Abaixo de cada figura, colocar uma linha ou espaço adequado para o estudante escrever o nome.
- Não escrever o nome da figura junto da imagem.
- Não revelar a resposta.
- Não usar legendas com a palavra que o aluno deverá escrever.
- As figuras devem ser simples, escolares, nítidas e adequadas à idade.
- Evitar imagens ambíguas.
- Organizar os itens com bom espaçamento.
- Para alfabetização, priorizar figuras de objetos, animais, alimentos ou elementos conhecidos pelas crianças.
- As imagens devem ser pequenas o suficiente para caber bem na folha, mas grandes o suficiente para serem reconhecidas.
- Respeitar rigorosamente a faixa etária e a série ${serie}.

${
  palavrasAutoditado
    ? `
PALAVRAS INFORMADAS PELO PROFESSOR:

${palavrasAutoditado}

REGRA MUITO IMPORTANTE:

- Criar imagens correspondentes às palavras informadas.
- Utilizar obrigatoriamente as palavras fornecidas pelo professor, respeitando o limite solicitado.
- Não mostrar as palavras escritas ao aluno.
`
    : `
O professor não informou palavras específicas.

Escolha palavras adequadas:
- ao conteúdo;
- à série ${serie};
- e à disciplina ${disciplina}.
`
}
`;
    }

    /*
     * CRUZADINHA
     */
    if (tipoAtividade === "cruzadinha") {
      let regraTipoPista = "";

      if (tipoPistaCruzadinha === "perguntas") {
        regraTipoPista = `
FORMATO DAS PISTAS: PERGUNTAS.
- Criar perguntas curtas e claras sobre o conteúdo.
- Cada resposta da pergunta deve ser uma palavra que entra na grade.
`;
      }

      if (tipoPistaCruzadinha === "definicoes") {
        regraTipoPista = `
FORMATO DAS PISTAS: DEFINIÇÕES.
- Criar definições curtas e objetivas.
- Cada definição deve levar a uma única palavra-resposta.
`;
      }

      if (tipoPistaCruzadinha === "imagens") {
        regraTipoPista = `
FORMATO DAS PISTAS: IMAGENS.
- Utilizar imagens simples, claras e reconhecíveis como pistas.
- Cada imagem deve representar inequivocamente a palavra-resposta.
- Não escrever a resposta junto da imagem.
- Usar esse formato apenas quando as palavras puderem ser representadas visualmente de forma clara.
`;
      }

      if (tipoPistaCruzadinha === "mista") {
        regraTipoPista = `
FORMATO DAS PISTAS: MISTA.
- Misturar perguntas, definições e imagens somente quando cada formato fizer sentido.
- Manter as pistas claras e adequadas à série.
- Não usar imagem como pista se ela puder gerar ambiguidade.
`;
      }

      const regraQuantidadeCruzadinha =
        quantidadeQuestoes !== null
          ? `
QUANTIDADE DE PALAVRAS/PISTAS:
- Utilizar exatamente ${quantidadeQuestoes} palavras com suas respectivas pistas.
- Nesta atividade, a quantidade informada pelo professor significa quantidade de palavras/pistas da cruzadinha.
`
          : `
QUANTIDADE DE PALAVRAS/PISTAS:
- O professor não informou uma quantidade.
- Escolher uma quantidade que caiba bem na folha e seja adequada à série ${serie}.
`;

      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: CRUZADINHA.

Crie UMA cruzadinha verdadeira, funcional e pedagogicamente coerente.

${regraTipoPista}

${regraQuantidadeCruzadinha}

IMPORTANTE:
- A cruzadinha é uma atividade única.
- Não criar várias cruzadinhas para cumprir quantidade.
- A numeração da grade deve corresponder exatamente à numeração das pistas.
- Cada pista deve ter uma única resposta correta.
- Todas as respostas precisam realmente existir na grade.
- As palavras precisam se cruzar de verdade, compartilhando letras compatíveis.
- Não criar palavras isoladas que não participem da estrutura quando for possível cruzá-las.
- Não criar uma simples lista de perguntas fingindo ser uma cruzadinha.
- Não mostrar nenhuma resposta preenchida.
- Utilizar quadrinhos regulares, alinhados e em quantidade exata para cada resposta.
- Conferir letra por letra se cada resposta cabe nos quadrinhos.
- Conferir rigorosamente ortografia, acentuação e grafia das palavras.
- As pistas devem ser adequadas à idade e ao nível de ${serie}.
- Não utilizar pistas ambíguas.

${
  palavrasCruzadinha
    ? `
PALAVRAS INFORMADAS PELO PROFESSOR:

${palavrasCruzadinha}

REGRAS PARA ESSAS PALAVRAS:
- Utilizar obrigatoriamente as palavras informadas, respeitando a quantidade solicitada quando houver.
- Não trocar essas palavras por outras.
- Preservar a grafia correta.
- Criar pistas coerentes com cada palavra.
- Organizar as palavras para que se cruzem corretamente na grade.
`
    : `
O professor não informou palavras específicas.

Escolha palavras:
- diretamente relacionadas ao conteúdo;
- adequadas à disciplina ${disciplina};
- adequadas à série ${serie};
- e que permitam construir uma cruzadinha funcional.
`
}

REVISÃO OBRIGATÓRIA DA CRUZADINHA:
1. Conferir cada pista.
2. Conferir cada resposta.
3. Conferir a ortografia.
4. Conferir a quantidade de quadrinhos.
5. Conferir todos os cruzamentos.
6. Conferir se a numeração da grade corresponde às pistas.
7. Conferir se nenhuma resposta foi revelada.
`;
    }

    /*
     * COMPLETE
     */
    if (tipoAtividade === "complete") {
  regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: COMPLETE.

REGRAS:

- Criar exercícios de completar palavras, frases ou informações.
- Deixar espaços adequados para o estudante escrever.
- Não mostrar as respostas.
- Adequar rigorosamente a dificuldade à série ${serie}.

REGRAS OBRIGATÓRIAS PARA PALAVRAS COM LETRAS FALTANDO:

- Antes de criar cada item, definir mentalmente a PALAVRA COMPLETA E CORRETA.
- Depois, retirar somente a letra ou sílaba que o aluno deverá completar.
- A parte visível da palavra precisa continuar correta e na ordem certa.
- Nunca remover letras extras.
- Nunca trocar letras.
- Nunca inventar palavras.
- Nunca apresentar uma palavra incompleta de forma que pareça erro ortográfico.

EXEMPLOS CORRETOS:

BALEIA → _ALEIA
BRINQUEDO → _RINQUEDO
BOLA → _OLA
BOCA → _OCA

IMPORTANTE:

- O espaço vazio representa exatamente a parte que o aluno deve escrever.
- Se a atividade pedir completar com a letra B, retirar somente a letra B.
- Conferir cada palavra completa antes de remover a letra.
- Conferir novamente cada palavra depois de montar a atividade.
- A imagem deve corresponder corretamente à palavra.
`;
}

    /*
     * LIGUE
     */
    if (tipoAtividade === "ligue") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: LIGUE.

REGRAS:

- Criar duas colunas visualmente organizadas.
- O estudante deverá relacionar corretamente os elementos.
- Não desenhar previamente as linhas das respostas.
- Garantir correspondência lógica entre os itens.
- Adequar palavras, imagens e conceitos à série ${serie}.
`;
    }

    /*
     * MÚLTIPLA ESCOLHA
     */
    if (tipoAtividade === "multipla_escolha") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: MÚLTIPLA ESCOLHA.

REGRAS:

- Criar questões com alternativas claras.
- Utilizar alternativas A, B, C e D quando adequado à série.
- Apenas uma alternativa deve ser correta por questão.
- Não destacar a resposta correta.
- Respeitar rigorosamente o nível de ${serie}.
`;
    }

    /*
     * VERDADEIRO OU FALSO
     */
    if (tipoAtividade === "verdadeiro_falso") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: VERDADEIRO OU FALSO.

REGRAS:

- Criar afirmações claras relacionadas ao conteúdo.
- Colocar espaço para o estudante marcar V ou F.
- Misturar afirmações verdadeiras e falsas.
- Não mostrar o gabarito.
- Adequar linguagem e dificuldade à série ${serie}.
`;
    }

    /*
     * LEITURA E ESCRITA
     */
    if (tipoAtividade === "leitura_escrita") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: LEITURA E ESCRITA.

REGRAS:

- Criar atividade adequada ao nível de leitura da turma.
- Incluir pequenos textos, palavras ou frases quando pertinente.
- Criar espaços adequados para resposta escrita.
- Evitar textos longos para estudantes em alfabetização.
- Para séries posteriores, aumentar a complexidade de forma adequada.
- Respeitar rigorosamente ${serie}.
`;
    }

    /*
     * ATIVIDADE MISTA
     */
    if (tipoAtividade === "mista") {
      regrasTipoAtividade = `
TIPO DE ATIVIDADE: ATIVIDADE MISTA.

REGRAS:

- Misturar diferentes formatos de exercícios.
- Variar os tipos de questão.
- Escolher formatos adequados à série, disciplina e conteúdo.
- Não repetir o mesmo modelo em todas as questões.
- Organizar do mais simples para o mais complexo.
- Respeitar rigorosamente ${serie}.
`;
    }

    /*
     * ORDENAR
     */
    if (tipoAtividade === "ordene") {
      let regraOrdenacao = "";

      if (tipoOrdenacao === "processo") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: ETAPAS DE UM PROCESSO.
- Utilizar somente um processo que possua etapas reais e reconhecidas.
- Embaralhar as etapas para o estudante ordenar.
`;
      }

      if (tipoOrdenacao === "acontecimentos") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: SEQUÊNCIA DE ACONTECIMENTOS.
- Utilizar acontecimentos que tenham uma sequência lógica ou temporal verdadeira.
- Embaralhar os acontecimentos antes de apresentá-los.
`;
      }

      if (tipoOrdenacao === "cronologica") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: ORDEM CRONOLÓGICA.
- Utilizar fatos ou eventos que tenham datas ou sequência temporal real.
- Não inventar datas nem relações cronológicas.
`;
      }

      if (tipoOrdenacao === "menor_maior") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: MENOR PARA MAIOR / MAIOR PARA MENOR.
- Usar apenas elementos que possam ser comparados objetivamente pelo critério informado.
- O comando deve dizer claramente se a ordem é crescente ou decrescente.
`;
      }

      if (tipoOrdenacao === "historia") {
        regraOrdenacao = `
CRITÉRIO ESCOLHIDO: SEQUÊNCIA DE UMA HISTÓRIA.
- Criar uma sequência narrativa curta e coerente.
- Embaralhar cenas, frases ou acontecimentos.
- A sequência correta deve ser dedutível pelo estudante.
`;
      }

      if (tipoOrdenacao === "automatico") {
        regraOrdenacao = `
CRITÉRIO: O PLANEJAI DEVE ESCOLHER.
- Examinar o conteúdo e identificar uma sequência REAL que possa ser ordenada.
- Preferir processos, ciclos com começo pedagógico definido, acontecimentos, sequência narrativa, ordem cronológica ou comparação objetiva.
- Se o conteúdo geral não tiver uma ordem natural, escolher dentro dele um aspecto que realmente possua uma sequência.
- NÃO inventar uma ordem artificial apenas para usar o formato Ordene.
`;
      }

      regrasTipoAtividade = `
TIPO DE ATIVIDADE OBRIGATÓRIO: ORDENE / SEQUÊNCIA.

${regraOrdenacao}

REGRAS OBRIGATÓRIAS:

- A atividade só pode pedir ordenação quando existir um critério de ordem real, claro e pedagogicamente justificável.
- NÃO inventar sequência para conjuntos que não possuem ordem natural.
- Exemplo do que NÃO fazer: numerar sistemas do corpo humano como se houvesse uma ordem universal entre eles.
- Não atribuir números de resposta aos itens antes do aluno resolver.
- Os itens devem aparecer EMBARALHADOS.
- Deve existir somente um espaço claro para o aluno registrar a ordem: quadrinho vazio, linha ou numeração a preencher.
- Não colocar a resposta correta ao lado, dentro ou acima do item.
- O comando deve explicar exatamente o critério: cronológico, etapas do processo, crescente, sequência da história etc.
- Não usar comandos vagos como "coloque na ordem correta" sem explicar qual ordem.
- Se houver imagens, elas devem ser claras e necessárias para compreender a sequência.
- A sequência deve ser adequada à série ${serie}.
- Para crianças pequenas, usar poucas etapas e forte apoio visual.
- Para séries posteriores, permitir processos conceituais mais complexos.
- Conferir se existe UMA sequência correta e justificável antes de finalizar.

${
  quantidadeQuestoes !== null
    ? `
QUANTIDADE:
- Utilizar ${quantidadeQuestoes} itens/etapas SOMENTE se essa quantidade fizer sentido para a sequência real.
- Nunca inventar etapas extras apenas para atingir o número informado.
`
    : `
QUANTIDADE:
- Escolher uma quantidade de itens/etapas adequada à sequência real e à série.
`
}
`;
    }

    /*
     * PROMPT FINAL
     */
    const promptFinal = `
${promptBase}

==================================================
CONFIGURAÇÃO ESPECÍFICA ESCOLHIDA PELO PROFESSOR
==================================================

${regrasTipoAtividade}

REGRA FINAL DE SÉRIE:

A atividade é destinada especificamente a:

${serie}

Não ignore essa informação.

Antes de gerar a folha, confira se:
- vocabulário;
- dificuldade;
- quantidade de leitura;
- tamanho dos comandos;
- tipo de resposta;
- imagens;
- conceitos;
- e organização visual

são realmente apropriados para ${serie}.

REGRA FINAL DE QUALIDADE:

- Conferir ortografia e acentuação de TODAS as palavras antes de gerar a imagem.
- Não criar palavras inexistentes, letras trocadas ou palavras incompletas.
- Em atividades com grade, conferir letra por letra antes de finalizar.
- Nunca revelar respostas que o estudante deve descobrir.
- Nunca inventar uma relação pedagógica que não exista apenas para encaixar o conteúdo no formato escolhido.

REGRA FINAL DE CONFIGURAÇÃO:

Quando o professor escolher um tipo específico,
essa configuração tem prioridade.

Quando nenhum tipo for escolhido,
interpretar o pedido livremente e selecionar o formato mais adequado,
sem assumir automaticamente "atividade mista".

==================================================
FORMATO FINAL PARA ENCAIXE EM FOLHA A4
==================================================

A imagem gerada NÃO representa uma folha A4 inteira.

Ela representa SOMENTE O CORPO DA ATIVIDADE que será colocado
abaixo de um cabeçalho externo criado pelo PlanejAI.

PROPORÇÃO DA ÁREA ÚTIL:

- Considerar que a página final será A4 vertical: 210 mm x 297 mm.
- O PlanejAI reservará a parte superior para o cabeçalho.
- A imagem final será vertical.
- Aproveitar praticamente toda a largura disponível.
- Não criar grandes margens laterais.
- Não centralizar a atividade dentro de uma área estreita.
- O conteúdo deve começar próximo à margem esquerda e terminar próximo à margem direita.
- Manter apenas uma margem interna pequena e regular.
- A composição deve ser pensada para preencher visualmente a largura da imagem vertical gerada.
- A atividade deve parecer um bloco vertical um pouco mais baixo e mais largo
  do que uma folha A4 completa.
- NÃO criar uma folha A4 inteira dentro da imagem.

CABEÇALHO:

- NÃO criar cabeçalho escolar.
- NÃO criar campos de Escola, Professor(a), Aluno(a), Data, Turma, Série ou Nota.
- NÃO reservar espaço vazio no topo para cabeçalho.
- O conteúdo da atividade deve começar próximo ao topo da área útil,
  respeitando apenas uma margem interna pequena e regular.

APROVEITAMENTO DO ESPAÇO:

- Usar praticamente toda a área disponível.
- Distribuir as questões de forma equilibrada de cima para baixo.
- Evitar grandes espaços vazios entre as questões.
- Não deixar um grande espaço vazio no topo.
- Não deixar um grande espaço vazio no rodapé.
- Manter margens internas regulares em todos os lados.
- Nenhum texto, desenho, grade, linha ou questão pode ultrapassar as margens.
- Não cortar nenhum elemento.
- Não apertar o conteúdo a ponto de prejudicar a leitura.
- Se houver poucas questões, aumentar de forma equilibrada os espaços de resposta
  e os elementos pedagógicos, sem aumentar exageradamente títulos ou desenhos.
- Se houver muitas questões, reduzir moderadamente os elementos decorativos
  e organizar melhor o conteúdo, sem diminuir demais as letras.

IMPRESSÃO:

- Fundo branco.
- Visual limpo e profissional.
- Priorizar contraste e legibilidade.
- A atividade deve continuar adequada para impressão em preto e branco.
- Evitar fundos coloridos grandes, sombras fortes e decoração que consuma espaço.
- Não criar moldura externa simulando outra folha dentro da página.

REGRA CRÍTICA:

Toda informação pedagógica importante precisa ficar dentro da área central útil.
A composição deve ser pensada para posteriormente ser encaixada pelo PlanejAI
abaixo de um cabeçalho, sem precisar cortar, esticar ou deformar a imagem.
`;

    const resultado =
      await openai.images.generate({
        model: "gpt-image-2",
        prompt: promptFinal,
        size: "1536x1024",
        quality: "medium",
        output_format: "png",
      });

    const imagemBase64 =
      resultado.data?.[0]?.b64_json;

    if (!imagemBase64) {
      return NextResponse.json(
        {
          erro:
            "A atividade não foi retornada pela inteligência artificial.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imagem: `data:image/png;base64,${imagemBase64}`,
      promptFinal,
    });
  } catch (error) {
    console.error(
      "Erro ao gerar atividade em imagem:",
      error
    );

    const mensagem =
      error instanceof Error
        ? error.message
        : "Não foi possível gerar a atividade.";

    return NextResponse.json(
      {
        erro: mensagem,
      },
      {
        status: 500,
      }
    );
  }
}