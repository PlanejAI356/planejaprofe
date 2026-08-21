"use client";

import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
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
  duasColunas: boolean
) {
  const larguraMaxima = duasColunas
    ? 225
    : 420;

  const alturaMaxima = duasColunas
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
  duasColunas: boolean
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
        duasColunas
      );

    const tipo = obterTipoImagem(
      blob.type,
      origem
    );

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: {
        before: 0,
        after: 20,
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

    if (!texto) {
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
        before: 0,
        after: 0,
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
      before: 0,
      after:
        opcoes.espacamentoDepois ??
        0,
      line: 240,
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
                size: TAMANHO_FONTE_AVALIACAO,
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

async function converterTabelaHtmlEmWord(
  tabelaHtml: HTMLTableElement,
  duasColunas: boolean,
  tamanhoFonte: number
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
          const conteudoCelula =
            await converterElementoEmBlocos(
              celulaHtml,
              duasColunas,
              false,
              tamanhoFonte
            );

          return new TableCell({
            verticalAlign: VerticalAlign.CENTER,
            margins: {
              top: 40,
              right: 60,
              bottom: 40,
              left: 60,
            },
            children:
              conteudoCelula.length > 0
                ? conteudoCelula
                : [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: " ",
                          size: tamanhoFonte,
                          font: "Times New Roman",
                        }),
                      ],
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

async function converterElementoEmBlocos(
  elemento: HTMLElement,
  duasColunas: boolean,
  titulo = false,
  tamanhoFonte = TAMANHO_FONTE_AVALIACAO
): Promise<
  Array<Paragraph | Table>
> {
  const blocos: Array<
    Paragraph | Table
  > = [];

  const filhosElementos =
    Array.from(elemento.children);

  if (filhosElementos.length === 0) {
    blocos.push(
      criarParagrafoTexto(elemento, {
        titulo,
        tamanhoFonte,
      })
    );

    return blocos;
  }

  for (
    let indice = 0;
    indice < filhosElementos.length;
    indice += 1
  ) {
    const filho =
      filhosElementos[indice] as HTMLElement;

    if (filho.tagName === "TABLE") {
      blocos.push(
        await converterTabelaHtmlEmWord(
          filho as HTMLTableElement,
          duasColunas,
          tamanhoFonte
        )
      );
      continue;
    }

    if (filho.tagName === "IMG") {
      const paragrafoImagem =
        await criarParagrafoImagem(
          filho as HTMLImageElement,
          duasColunas
        );

      if (paragrafoImagem) {
        blocos.push(paragrafoImagem);
      }

      continue;
    }

    const imagensDiretas =
      Array.from(
        filho.querySelectorAll(":scope > img")
      ) as HTMLImageElement[];

    if (
      filho.tagName === "P" ||
      filho.tagName === "DIV" ||
      filho.tagName === "SPAN"
    ) {
      const possuiSomenteImagem =
        imagensDiretas.length > 0 &&
        !filho.innerText.trim();

      if (!possuiSomenteImagem) {
        blocos.push(
          criarParagrafoTexto(filho, {
            titulo:
              titulo && indice === 0,
            espacamentoDepois:
              indice ===
              filhosElementos.length - 1
                ? 0
                : 0,
            tamanhoFonte,
          })
        );
      }

      for (const imagem of imagensDiretas) {
        const paragrafoImagem =
          await criarParagrafoImagem(
            imagem,
            duasColunas
          );

        if (paragrafoImagem) {
          blocos.push(paragrafoImagem);
        }
      }

      const subBlocos =
        Array.from(
          filho.children
        ).filter(
          (item) =>
            item.tagName !== "IMG"
        ) as HTMLElement[];

      for (const subBloco of subBlocos) {
        if (
          subBloco.tagName === "P" ||
          subBloco.tagName === "DIV"
        ) {
          blocos.push(
            criarParagrafoTexto(
              subBloco,
              {
                espacamentoDepois: 0,
                tamanhoFonte,
              }
            )
          );
        }
      }

      continue;
    }

    blocos.push(
      criarParagrafoTexto(filho, {
        espacamentoDepois:
          indice ===
          filhosElementos.length - 1
            ? 0
            : 0,
        tamanhoFonte,
      })
    );
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

async function criarCabecalhoWord(
  cabecalhoElemento:
    | HTMLElement
    | null,
  duasColunas: boolean
): Promise<Array<Paragraph | Table>> {
  const cabecalhoClonado =
    cabecalhoElemento?.cloneNode(
      true
    ) as HTMLElement | undefined;

  if (!cabecalhoClonado) {
    return [];
  }

  limparDocumentoClonado(
    cabecalhoClonado
  );

  cabecalhoClonado.removeAttribute(
    "data-placeholder"
  );

  const possuiConteudo = Boolean(
    cabecalhoClonado.innerText.trim() ||
      cabecalhoClonado.querySelector("img")
  );

  if (!possuiConteudo) {
    return [];
  }

  return converterElementoEmBlocos(
    cabecalhoClonado,
    duasColunas,
    false,
    TAMANHO_FONTE_CABECALHO
  );
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

  const blocosCabecalhoWord =
    await criarCabecalhoWord(
      cabecalhoElemento,
      duasColunas
    );

  const filhosAvaliacao =
    Array.from(
      avaliacaoClonada.children
    ) as HTMLElement[];

  const conteudoWord: Array<
    Paragraph | Table
  > = [];

  for (
    let indice = 0;
    indice < filhosAvaliacao.length;
    indice += 1
  ) {
    const filho =
      filhosAvaliacao[indice];

    const blocos =
      await converterElementoEmBlocos(
        filho,
        duasColunas,
        indice === 0,
        TAMANHO_FONTE_AVALIACAO
      );

    conteudoWord.push(...blocos);
  }

  if (conteudoWord.length === 0) {
    conteudoWord.push(
      criarParagrafoTexto(
        avaliacaoClonada,
        {
          titulo: true,
        }
      )
    );
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

  /*
   * Quando "Duas colunas" estiver marcado,
   * o cabeçalho continua em largura inteira
   * e somente as questões ficam em duas colunas.
   */
  let conteudoAvaliacaoWord:
    | Array<Paragraph | Table>
    = conteudoWord;

  if (duasColunas) {
    const metade =
      Math.ceil(
        conteudoWord.length / 2
      );

    const colunaEsquerda =
      conteudoWord.slice(0, metade);

    const colunaDireita =
      conteudoWord.slice(metade);

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
                  right: 90,
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
                  left: 90,
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
                top: 80,
                right: 80,
                bottom: 80,
                left: 80,
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
                ...blocosCabecalhoWord,

                new Paragraph({
                  spacing: {
                    before: 0,
                    after: 40,
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