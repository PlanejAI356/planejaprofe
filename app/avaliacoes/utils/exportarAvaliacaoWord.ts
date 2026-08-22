"use client";

import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalAlign,
  WidthType,
} from "docx";

import { saveAs } from "file-saver";

type OpcoesExportacaoWord = {
  tituloArquivo?: string;
  duasColunas?: boolean;
};

type TipoImagemWord =
  | "png"
  | "jpg"
  | "gif"
  | "bmp";

/*
 * A biblioteca docx usa half-points:
 * 22 = 11 pt
 * 24 = 12 pt
 */
const TAMANHO_FONTE_AVALIACAO = 24;
const TAMANHO_FONTE_CABECALHO = 24;

function limparNomeArquivo(nome: string) {
  const nomeLimpo = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return nomeLimpo || "avaliacao";
}

function obterAlinhamento(
  elemento: HTMLElement
) {
  const alinhamento =
    elemento.style.textAlign;

  if (alinhamento === "center") {
    return AlignmentType.CENTER;
  }

  if (alinhamento === "right") {
    return AlignmentType.RIGHT;
  }

  if (alinhamento === "justify") {
    return AlignmentType.JUSTIFIED;
  }

  return AlignmentType.LEFT;
}

function obterTipoImagem(
  contentType: string,
  endereco: string
): TipoImagemWord {
  const tipo = contentType.toLowerCase();
  const url = endereco.toLowerCase();

  if (
    tipo.includes("jpeg") ||
    tipo.includes("jpg") ||
    url.includes(".jpg") ||
    url.includes(".jpeg")
  ) {
    return "jpg";
  }

  if (
    tipo.includes("gif") ||
    url.includes(".gif")
  ) {
    return "gif";
  }

  if (
    tipo.includes("bmp") ||
    url.includes(".bmp")
  ) {
    return "bmp";
  }

  return "png";
}

async function carregarDimensoesImagem(
  origem: string
) {
  return new Promise<{
    largura: number;
    altura: number;
  }>((resolve) => {
    const imagem = new Image();

    imagem.onload = () => {
      resolve({
        largura:
          imagem.naturalWidth || 400,
        altura:
          imagem.naturalHeight || 260,
      });
    };

    imagem.onerror = () => {
      resolve({
        largura: 400,
        altura: 260,
      });
    };

    imagem.src = origem;
  });
}

function ajustarDimensoesImagem(
  larguraOriginal: number,
  alturaOriginal: number,
  duasColunas: boolean,
  modoCabecalho = false
) {
  const larguraMaxima = modoCabecalho
    ? 105
    : duasColunas
      ? 225
      : 420;

  const alturaMaxima = modoCabecalho
    ? 82
    : duasColunas
      ? 190
      : 280;

  const proporcao = Math.min(
    larguraMaxima / larguraOriginal,
    alturaMaxima / alturaOriginal,
    1
  );

  return {
    width: Math.max(
      1,
      Math.round(larguraOriginal * proporcao)
    ),
    height: Math.max(
      1,
      Math.round(alturaOriginal * proporcao)
    ),
  };
}

async function criarParagrafoImagem(
  imagem: HTMLImageElement,
  duasColunas: boolean,
  modoCabecalho = false
) {
  const origem =
    imagem.currentSrc || imagem.src;

  if (!origem) {
    return null;
  }

  try {
    const resposta = await fetch(origem);

    if (!resposta.ok) {
      return null;
    }

    const blob = await resposta.blob();
    const dados = new Uint8Array(
      await blob.arrayBuffer()
    );

    const dimensoesOriginais =
      await carregarDimensoesImagem(origem);

    const dimensoes =
      ajustarDimensoesImagem(
        dimensoesOriginais.largura,
        dimensoesOriginais.altura,
        duasColunas,
        modoCabecalho
      );

    const tipo = obterTipoImagem(
      blob.type,
      origem
    );

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        before: modoCabecalho ? 0 : 20,
        after: modoCabecalho ? 0 : 40,
      },
      children: [
        new ImageRun({
          data: dados,
          type: tipo,
          transformation: dimensoes,
        }),
      ],
    });
  } catch (error) {
    console.error(
      "Não foi possível inserir uma imagem no Word:",
      error
    );

    return null;
  }
}

function criarRunsDoNo(
  no: Node,
  formatoHerdado: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
  } = {},
  tamanhoFonte = TAMANHO_FONTE_AVALIACAO
): TextRun[] {
  if (no.nodeType === Node.TEXT_NODE) {
    const texto =
      no.textContent?.replace(/\u00a0/g, " ") ||
      "";

    if (!texto.trim()) {
      return [];
    }

    return [
      new TextRun({
        text: texto,
        bold: formatoHerdado.bold,
        italics: formatoHerdado.italics,
        underline: formatoHerdado.underline
          ? {
              type: UnderlineType.SINGLE,
            }
          : undefined,
        size: tamanhoFonte,
        font: "Times New Roman",
      }),
    ];
  }

  if (!(no instanceof HTMLElement)) {
    return [];
  }

  if (no.tagName === "BR") {
    return [
      new TextRun({
        break: 1,
      }),
    ];
  }

  const formatoAtual = {
    bold:
      formatoHerdado.bold ||
      no.tagName === "B" ||
      no.tagName === "STRONG" ||
      no.style.fontWeight === "700" ||
      no.style.fontWeight === "bold",
    italics:
      formatoHerdado.italics ||
      no.tagName === "I" ||
      no.tagName === "EM" ||
      no.style.fontStyle === "italic",
    underline:
      formatoHerdado.underline ||
      no.tagName === "U" ||
      no.style.textDecoration.includes(
        "underline"
      ),
  };

  return Array.from(no.childNodes).flatMap(
    (filho) =>
      criarRunsDoNo(
        filho,
        formatoAtual,
        tamanhoFonte
      )
  );
}

function elementoEhLinhaResposta(
  elemento: HTMLElement
) {
  return (
    elemento.style.borderBottom.includes(
      "solid"
    ) ||
    elemento.getAttribute("style")?.includes(
      "border-bottom"
    )
  );
}

function criarParagrafoTexto(
  elemento: HTMLElement,
  opcoes: {
    titulo?: boolean;
    espacamentoDepois?: number;
    tamanhoFonte?: number;
  } = {}
) {
  const tamanhoFonte =
    opcoes.tamanhoFonte ??
    TAMANHO_FONTE_AVALIACAO;

  const runs =
    criarRunsDoNo(
      elemento,
      {},
      tamanhoFonte
    );

  const ehLinhaResposta =
    elementoEhLinhaResposta(elemento);

  if (ehLinhaResposta) {
    return new Paragraph({
      spacing: {
        before: 20,
        after: 20,
      },
      border: {
        bottom: {
          color: "475569",
          size: 6,
          style: BorderStyle.SINGLE,
        },
      },
      children: [
        new TextRun({
          text: " ",
          size: tamanhoFonte,
          font: "Times New Roman",
        }),
      ],
    });
  }

  return new Paragraph({
    alignment: opcoes.titulo
      ? AlignmentType.CENTER
      : obterAlinhamento(elemento),
    keepNext: opcoes.titulo || undefined,
    spacing: {
      before: opcoes.titulo ? 80 : 0,
      after:
        opcoes.espacamentoDepois ??
        (opcoes.titulo ? 160 : 40),
      line: 276,
    },
    children:
      runs.length > 0
        ? runs.map((run, indice) => {
            if (
              opcoes.titulo &&
              run instanceof TextRun
            ) {
              return new TextRun({
                text:
                  elemento.innerText.trim(),
                bold: true,
                size: 30,
                font: "Times New Roman",
              });
            }

            return run;
          })
        : [
            new TextRun({
              text: " ",
              size: tamanhoFonte,
              font: "Times New Roman",
            }),
          ],
  });
}

function elementoTemBorda(
  elemento: HTMLElement
) {
  const estilo = elemento.style;

  return Boolean(
    estilo.border ||
    estilo.borderTop ||
    estilo.borderRight ||
    estilo.borderBottom ||
    estilo.borderLeft
  );
}

function elementoEhContainerLadoALado(
  elemento: HTMLElement
) {
  const filhos = Array.from(
    elemento.children
  ).filter(
    (item) => item instanceof HTMLElement
  ) as HTMLElement[];

  if (filhos.length !== 2) {
    return false;
  }

  const display =
    elemento.style.display.toLowerCase();

  const classe =
    elemento.className || "";

  return (
    display === "grid" ||
    display === "flex" ||
    Boolean(
      elemento.style.gridTemplateColumns
    ) ||
    /\bgrid\b/.test(classe) ||
    /\bflex\b/.test(classe)
  );
}

function elementoTemFilhosDeBloco(
  elemento: HTMLElement
) {
  return Array.from(
    elemento.children
  ).some((filho) =>
    [
      "DIV",
      "P",
      "TABLE",
      "UL",
      "OL",
      "SECTION",
      "ARTICLE",
    ].includes(filho.tagName)
  );
}

async function converterTabelaHtmlEmWord(
  tabelaHtml: HTMLTableElement,
  duasColunas: boolean,
  tamanhoFonte: number,
  modoCabecalho = false
): Promise<Table> {
  const linhasHtml = Array.from(
    tabelaHtml.querySelectorAll(
      ":scope > tbody > tr, :scope > thead > tr, :scope > tfoot > tr, :scope > tr"
    )
  ) as HTMLTableRowElement[];

  const linhas = await Promise.all(
    linhasHtml.map(async (linhaHtml) => {
      const celulasHtml = Array.from(
        linhaHtml.children
      ).filter(
        (item) =>
          item.tagName === "TD" ||
          item.tagName === "TH"
      ) as HTMLTableCellElement[];

      const celulas = await Promise.all(
        celulasHtml.map(async (celulaHtml) => {
          const conteudo =
            await converterElementoEmBlocos(
              celulaHtml,
              duasColunas,
              false,
              tamanhoFonte,
              modoCabecalho
            );

          return new TableCell({
            verticalAlign:
              VerticalAlign.CENTER,
            margins: {
              top: modoCabecalho ? 0 : 35,
              right: modoCabecalho ? 20 : 55,
              bottom: modoCabecalho ? 0 : 35,
              left: modoCabecalho ? 20 : 55,
            },
            children:
              conteudo.length > 0
                ? conteudo
                : [
                    new Paragraph({
                      children: [],
                    }),
                  ],
          });
        })
      );

      return new TableRow({
        children: celulas,
      });
    })
  );

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: linhas,
  });
}

async function converterContainerLadoALado(
  elemento: HTMLElement,
  duasColunas: boolean,
  tamanhoFonte: number,
  modoCabecalho = false
): Promise<Table> {
  const filhos = Array.from(
    elemento.children
  ).filter(
    (item) => item instanceof HTMLElement
  ) as HTMLElement[];

  const semBordaCelula = {
    top: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
    right: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
    bottom: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
    left: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
  };

  const celulas = await Promise.all(
    filhos.slice(0, 2).map(
      async (filho) => {
        const blocos =
          await converterElementoEmBlocos(
            filho,
            duasColunas,
            false,
            tamanhoFonte,
            modoCabecalho
          );

        return new TableCell({
          width: {
            size: 50,
            type: WidthType.PERCENTAGE,
          },
          verticalAlign:
            VerticalAlign.TOP,
          margins: {
            top: 0,
            right: 45,
            bottom: 0,
            left: 45,
          },
          borders: semBordaCelula,
          children:
            blocos.length > 0
              ? blocos
              : [
                  new Paragraph({
                    children: [],
                  }),
                ],
        });
      }
    )
  );

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      ...semBordaCelula,
      insideHorizontal: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
      },
      insideVertical: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
      },
    },
    rows: [
      new TableRow({
        children: celulas,
      }),
    ],
  });
}

function elementoPossuiConteudoReal(
  elemento: HTMLElement
) {
  const temTexto =
    Boolean(elemento.innerText.trim());

  const temImagem =
    Boolean(
      elemento.querySelector("img")
    );

  const temTabela =
    Boolean(
      elemento.querySelector("table")
    );

  return (
    temTexto ||
    temImagem ||
    temTabela
  );
}

function removerVaziosDoCabecalho(
  raiz: HTMLElement
) {
  const elementos =
    Array.from(
      raiz.querySelectorAll<HTMLElement>(
        "div, p, span, section, article"
      )
    ).reverse();

  elementos.forEach((elemento) => {
    if (
      !elementoPossuiConteudoReal(
        elemento
      )
    ) {
      elemento.remove();
    }
  });

  raiz
    .querySelectorAll("br")
    .forEach((br) => {
      const pai =
        br.parentElement;

      if (
        pai &&
        !pai.innerText.trim() &&
        !pai.querySelector("img")
      ) {
        br.remove();
      }
    });
}

async function converterElementoEmBlocos(
  elemento: HTMLElement,
  duasColunas: boolean,
  titulo = false,
  tamanhoFonte = TAMANHO_FONTE_AVALIACAO,
  modoCabecalho = false
): Promise<Array<Paragraph | Table>> {
  const blocos: Array<
    Paragraph | Table
  > = [];

  if (elemento.tagName === "TABLE") {
    return [
      await converterTabelaHtmlEmWord(
        elemento as HTMLTableElement,
        duasColunas,
        tamanhoFonte,
        modoCabecalho
      ),
    ];
  }

  if (elemento.tagName === "IMG") {
    const imagem =
      await criarParagrafoImagem(
        elemento as HTMLImageElement,
        duasColunas,
        modoCabecalho
      );

    return imagem ? [imagem] : [];
  }

  if (
    elementoEhContainerLadoALado(
      elemento
    )
  ) {
    return [
      await converterContainerLadoALado(
        elemento,
        duasColunas,
        tamanhoFonte,
        modoCabecalho
      ),
    ];
  }

  /*
   * Caixas simples (por exemplo, banco de palavras)
   * ficam inteiras para não perder palavras.
   */
  if (
    elementoTemBorda(elemento) &&
    !elementoTemFilhosDeBloco(elemento)
  ) {
    return [
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                margins: {
                  top: 35,
                  right: 55,
                  bottom: 35,
                  left: 55,
                },
                children: [
                  criarParagrafoTexto(
                    elemento,
                    {
                      titulo,
                      tamanhoFonte,
                      espacamentoDepois: 0,
                    }
                  ),
                ],
              }),
            ],
          }),
        ],
      }),
    ];
  }

  const filhos =
    Array.from(elemento.children)
      .filter(
        (item) =>
          item instanceof HTMLElement
      ) as HTMLElement[];

  /*
   * Conteúdo inline permanece em um único parágrafo.
   * Isso evita duplicar COLUNA A/COLUNA B e evita
   * que o banco de palavras seja achatado.
   */
  if (
    filhos.length === 0 ||
    !elementoTemFilhosDeBloco(elemento)
  ) {
    const temTexto =
      Boolean(elemento.innerText.trim());

    if (
      modoCabecalho &&
      !temTexto &&
      !elemento.querySelector("img")
    ) {
      return [];
    }

    if (temTexto) {
      blocos.push(
        criarParagrafoTexto(elemento, {
          titulo,
          tamanhoFonte,
          espacamentoDepois: 20,
        })
      );
    }

    const imagens =
      Array.from(
        elemento.querySelectorAll(
          ":scope > img"
        )
      ) as HTMLImageElement[];

    for (const imagem of imagens) {
      const paragrafoImagem =
        await criarParagrafoImagem(
          imagem,
          duasColunas,
          modoCabecalho
        );

      if (paragrafoImagem) {
        blocos.push(paragrafoImagem);
      }
    }

    return blocos;
  }

  for (
    let indice = 0;
    indice < filhos.length;
    indice += 1
  ) {
    const filho = filhos[indice];

    const subBlocos =
      await converterElementoEmBlocos(
        filho,
        duasColunas,
        titulo && indice === 0,
        tamanhoFonte,
        modoCabecalho
      );

    blocos.push(...subBlocos);
  }

  return blocos;
}

function limparDocumentoClonado(
  elemento: HTMLElement
) {
  elemento
    .querySelectorAll(
      [
        "button",
        "[data-nao-exportar]",
        ".nao-exportar",
      ].join(",")
    )
    .forEach((item) => item.remove());

  elemento
    .querySelectorAll<HTMLElement>(
      "[contenteditable='true']"
    )
    .forEach((item) => {
      item.removeAttribute(
        "contenteditable"
      );
    });
}


function textoCabecalhoLimpo(texto: string) {
  return texto.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function valorDepoisDoRotulo(
  texto: string,
  rotulo: string,
  proximos: string[] = []
) {
  const esc = (v: string) =>
    v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const fim = proximos.length
    ? `(?=${proximos.map(esc).join("|")}|$)`
    : "$";

  return (
    texto.match(
      new RegExp(
        `${esc(rotulo)}\\s*:?\\s*(.*?)\\s*${fim}`,
        "i"
      )
    )?.[1]?.trim() || ""
  );
}

function pCabecalho(
  rotulo: string,
  valor = "",
  centro = false,
  negritoValor = false
) {
  return new Paragraph({
    alignment: centro
      ? AlignmentType.CENTER
      : AlignmentType.LEFT,
    spacing: { before: 0, after: 0, line: 240 },
    children: [
      ...(rotulo
        ? [
            new TextRun({
              text: `${rotulo}: `,
              bold: true,
              size: TAMANHO_FONTE_CABECALHO,
              font: "Times New Roman",
            }),
          ]
        : []),
      new TextRun({
        text: valor || " ",
        bold: negritoValor,
        size: TAMANHO_FONTE_CABECALHO,
        font: "Times New Roman",
      }),
    ],
  });
}

async function criarCabecalhoWord(
  cabecalhoElemento: HTMLElement | null,
  _duasColunas: boolean
) {
  const clone =
    cabecalhoElemento?.cloneNode(true) as
      | HTMLElement
      | undefined;

  if (!clone) {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [] })],
            }),
          ],
        }),
      ],
    });
  }

  limparDocumentoClonado(clone);
  removerVaziosDoCabecalho(clone);

  const texto = textoCabecalhoLimpo(clone.innerText);

  const componente =
    valorDepoisDoRotulo(texto, "Componente Curricular", [
      "Professor(a)", "Professor", "Data", "Turno",
    ]) ||
    valorDepoisDoRotulo(texto, "Componente", [
      "Professor(a)", "Professor", "Data", "Turno",
    ]);

  const professor =
    valorDepoisDoRotulo(texto, "Professor(a)", [
      "Data", "Turno", "Série", "Serie",
    ]) ||
    valorDepoisDoRotulo(texto, "Professor", [
      "Data", "Turno", "Série", "Serie",
    ]);

  const turno = valorDepoisDoRotulo(texto, "Turno", [
    "Série", "Serie", "Objeto(s) de Conhecimento",
    "Objetos de Conhecimento",
  ]);

  const serie =
    valorDepoisDoRotulo(texto, "Série", [
      "Objeto(s) de Conhecimento",
      "Objetos de Conhecimento", "Nota",
    ]) ||
    valorDepoisDoRotulo(texto, "Serie", [
      "Objeto(s) de Conhecimento",
      "Objetos de Conhecimento", "Nota",
    ]);

  const objeto =
    valorDepoisDoRotulo(texto, "Objeto(s) de Conhecimento", [
      "Nota", "Aluno(a)", "Aluno",
    ]) ||
    valorDepoisDoRotulo(texto, "Objetos de Conhecimento", [
      "Nota", "Aluno(a)", "Aluno",
    ]);

  const aluno =
    valorDepoisDoRotulo(texto, "Aluno(a)", ["Aluno"]) ||
    valorDepoisDoRotulo(texto, "Aluno");

  const data =
    valorDepoisDoRotulo(texto, "Data", [
      "Turno", "Série", "Serie",
    ]) || "____/____/______";

  /*
   * O nome da escola costuma estar no bloco de texto
   * maior/centralizado do cabeçalho. Primeiro tentamos
   * seletores semânticos; depois procuramos um texto
   * que contenha ESCOLA.
   */
  const campoEscola =
    clone.querySelector(
      "[data-campo='escola'], [data-field='escola']"
    ) as HTMLElement | null;

  const candidatoEscola =
    Array.from(
      clone.querySelectorAll<HTMLElement>(
        "div, p, td, th, span"
      )
    ).find((el) =>
      /\bESCOLA\b/i.test(el.innerText.trim())
    );

  const escola =
    textoCabecalhoLimpo(
      campoEscola?.innerText ||
      candidatoEscola?.innerText ||
      "ESCOLA"
    );

  const img =
    clone.querySelector("img") as
      | HTMLImageElement
      | null;

  const logo = img
    ? await criarParagrafoImagem(img, false, true)
    : null;

  const b = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "000000",
  };

  const bordas = {
    top: b, right: b, bottom: b, left: b,
  };

  const criarCelula = (
    children: Array<Paragraph | Table>,
    largura: number,
    opts: {
      columnSpan?: number;
      rowSpan?: number;
    } = {}
  ) =>
    new TableCell({
      width: {
        size: largura,
        type: WidthType.PERCENTAGE,
      },
      columnSpan: opts.columnSpan,
      rowSpan: opts.rowSpan,
      verticalAlign: VerticalAlign.CENTER,
      margins: {
        top: 15,
        right: 35,
        bottom: 15,
        left: 35,
      },
      borders: bordas,
      children:
        children.length
          ? children
          : [new Paragraph({ children: [] })],
    });

  /*
   * Modelo da escola:
   * logo em coluna vertical à esquerda;
   * escola no topo;
   * componente/professor/data;
   * turno/série/nota;
   * objeto;
   * aluno.
   */
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        children: [
          criarCelula(
            logo ? [logo] : [],
            18,
            { rowSpan: 5 }
          ),
          criarCelula(
            [pCabecalho("", escola, true, true)],
            82,
            { columnSpan: 3 }
          ),
        ],
      }),
      new TableRow({
        children: [
          criarCelula(
            [pCabecalho("Componente Curricular", componente)],
            37
          ),
          criarCelula(
            [pCabecalho("Professor(a)", professor)],
            30
          ),
          criarCelula(
            [
              pCabecalho("", "DATA", true),
              pCabecalho("", data, true),
            ],
            15
          ),
        ],
      }),
      new TableRow({
        children: [
          criarCelula(
            [pCabecalho("Turno", turno)],
            37
          ),
          criarCelula(
            [pCabecalho("Série", serie)],
            30
          ),
          criarCelula(
            [pCabecalho("", "NOTA", true, true)],
            15,
            { rowSpan: 2 }
          ),
        ],
      }),
      new TableRow({
        children: [
          criarCelula(
            [pCabecalho("Objeto(s) de Conhecimento", objeto)],
            67,
            { columnSpan: 2 }
          ),
        ],
      }),
      new TableRow({
        children: [
          criarCelula(
            [pCabecalho("Aluno(a)", aluno)],
            82,
            { columnSpan: 3 }
          ),
        ],
      }),
    ],
  });
}

export async function exportarAvaliacaoWord(
  cabecalhoElemento:
    | HTMLElement
    | null,
  avaliacaoElemento: HTMLElement,
  opcoes: OpcoesExportacaoWord = {}
) {
  const tituloArquivo =
    limparNomeArquivo(
      opcoes.tituloArquivo ||
        "avaliacao"
    );

  const duasColunas =
    Boolean(opcoes.duasColunas);

  const avaliacaoClonada =
    avaliacaoElemento.cloneNode(
      true
    ) as HTMLElement;

  limparDocumentoClonado(
    avaliacaoClonada
  );

  const cabecalhoWord =
    await criarCabecalhoWord(
      cabecalhoElemento,
      duasColunas
    );

  const filhosOriginais =
    Array.from(
      avaliacaoElemento.children
    ) as HTMLElement[];

  const filhosClonados =
    Array.from(
      avaliacaoClonada.children
    ) as HTMLElement[];

  async function converterIndices(
    indices: number[]
  ) {
    const resultado: Array<
      Paragraph | Table
    > = [];

    for (const indice of indices) {
      const filho =
        filhosClonados[indice];

      if (!filho) {
        continue;
      }

      const blocos =
        await converterElementoEmBlocos(
          filho,
          duasColunas,
          indice === 0,
          TAMANHO_FONTE_AVALIACAO,
          false
        );

      resultado.push(...blocos);
    }

    return resultado;
  }

  const semBordas = {
    top: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
    right: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
    bottom: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
    left: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
    insideHorizontal: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
    insideVertical: {
      style: BorderStyle.NONE,
      size: 0,
      color: "FFFFFF",
    },
  };

  let conteudoAvaliacaoWord:
    Array<Paragraph | Table> = [];

  if (
    duasColunas &&
    filhosOriginais.length > 0
  ) {
    const centros =
      filhosOriginais.map((filho) => {
        const rect =
          filho.getBoundingClientRect();

        return (
          rect.left +
          rect.width / 2
        );
      });

    const minimo =
      Math.min(...centros);

    const maximo =
      Math.max(...centros);

    const meio =
      minimo + (maximo - minimo) / 2;

    let esquerda: number[] = [];
    let direita: number[] = [];

    if (maximo - minimo >= 20) {
      centros.forEach(
        (centro, indice) => {
          if (centro <= meio) {
            esquerda.push(indice);
          } else {
            direita.push(indice);
          }
        }
      );
    }

    /*
     * Fallback para layouts em que o navegador
     * não informa posições horizontais distintas.
     */
    if (direita.length === 0) {
      const metade =
        Math.ceil(
          filhosClonados.length / 2
        );

      esquerda =
        filhosClonados
          .slice(0, metade)
          .map((_, indice) => indice);

      direita =
        filhosClonados
          .slice(metade)
          .map(
            (_, indice) =>
              indice + metade
          );
    }

    const colunaEsquerda =
      await converterIndices(esquerda);

    const colunaDireita =
      await converterIndices(direita);

    conteudoAvaliacaoWord = [
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: semBordas,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: {
                  size: 50,
                  type:
                    WidthType.PERCENTAGE,
                },
                verticalAlign:
                  VerticalAlign.TOP,
                margins: {
                  top: 0,
                  right: 70,
                  bottom: 0,
                  left: 0,
                },
                borders: {
                  ...semBordas,
                  right: {
                    style:
                      BorderStyle.SINGLE,
                    size: 4,
                    color: "CBD5E1",
                  },
                },
                children:
                  colunaEsquerda.length > 0
                    ? colunaEsquerda
                    : [
                        new Paragraph({
                          children: [],
                        }),
                      ],
              }),
              new TableCell({
                width: {
                  size: 50,
                  type:
                    WidthType.PERCENTAGE,
                },
                verticalAlign:
                  VerticalAlign.TOP,
                margins: {
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 70,
                },
                borders: semBordas,
                children:
                  colunaDireita.length > 0
                    ? colunaDireita
                    : [
                        new Paragraph({
                          children: [],
                        }),
                      ],
              }),
            ],
          }),
        ],
      }),
    ];
  } else {
    conteudoAvaliacaoWord =
      await converterIndices(
        filhosClonados.map(
          (_, indice) => indice
        )
      );
  }

  if (
    conteudoAvaliacaoWord.length === 0
  ) {
    conteudoAvaliacaoWord.push(
      criarParagrafoTexto(
        avaliacaoClonada,
        {
          titulo: true,
        }
      )
    );
  }


  /*
   * Uma única borda externa envolve:
   * cabeçalho + conteúdo da avaliação.
   */
  const quadroAvaliacao =
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              verticalAlign:
                VerticalAlign.TOP,
              margins: {
                top: 100,
                right: 110,
                bottom: 100,
                left: 110,
              },
              borders: {
                top: {
                  style:
                    BorderStyle.SINGLE,
                  size: 8,
                  color: "000000",
                },
                right: {
                  style:
                    BorderStyle.SINGLE,
                  size: 8,
                  color: "000000",
                },
                bottom: {
                  style:
                    BorderStyle.SINGLE,
                  size: 8,
                  color: "000000",
                },
                left: {
                  style:
                    BorderStyle.SINGLE,
                  size: 8,
                  color: "000000",
                },
              },
              children: [
                cabecalhoWord,

                new Paragraph({
                  spacing: {
                    before: 0,
                    after: 10,
                  },
                  children: [],
                }),

                ...conteudoAvaliacaoWord,
              ],
            }),
          ],
        }),
      ],
    });

  const documento = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 400,
              right: 400,
              bottom: 400,
              left: 400,
            },
          },
          column: {
            count: 1,
          },
        },
        children: [
          quadroAvaliacao,
        ],
      },
    ],
  });

  const arquivo =
    await Packer.toBlob(documento);

  saveAs(
    arquivo,
    `${tituloArquivo}.docx`
  );
}