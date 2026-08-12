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
        before: 40,
        after: 80,
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
  } = {}
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
        size: 22,
        font: "Arial",
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
        formatoAtual
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
  } = {}
) {
  const runs =
    criarRunsDoNo(elemento);

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
          size: 22,
          font: "Arial",
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
                font: "Arial",
              });
            }

            return run;
          })
        : [
            new TextRun({
              text: " ",
              size: 22,
              font: "Arial",
            }),
          ],
  });
}

async function converterElementoEmBlocos(
  elemento: HTMLElement,
  duasColunas: boolean,
  titulo = false
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
                ? 120
                : 40,
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
                espacamentoDepois: 40,
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
            ? 120
            : 40,
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
) {
  const cabecalhoClonado =
    cabecalhoElemento?.cloneNode(
      true
    ) as HTMLElement | undefined;

  if (cabecalhoClonado) {
    limparDocumentoClonado(
      cabecalhoClonado
    );
    cabecalhoClonado.removeAttribute(
      "data-placeholder"
    );
  }

  const conteudoCabecalho =
    cabecalhoClonado &&
    (
      cabecalhoClonado.innerText.trim() ||
      cabecalhoClonado.querySelector("img")
    )
      ? await converterElementoEmBlocos(
          cabecalhoClonado,
          duasColunas
        )
      : [
          new Paragraph({
            children: [
              new TextRun({
                text: " ",
                size: 22,
                font: "Arial",
              }),
            ],
          }),
        ];

  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      new TableRow({
        height: {
          value: 900,
          rule: HeightRule.ATLEAST,
        },
        children: [
          new TableCell({
            verticalAlign:
              VerticalAlign.CENTER,
            margins: {
              top: 100,
              right: 120,
              bottom: 100,
              left: 120,
            },
            borders: {
              top: {
                style: BorderStyle.SINGLE,
                size: 8,
                color: "64748B",
              },
              right: {
                style: BorderStyle.SINGLE,
                size: 8,
                color: "64748B",
              },
              bottom: {
                style: BorderStyle.SINGLE,
                size: 8,
                color: "64748B",
              },
              left: {
                style: BorderStyle.SINGLE,
                size: 8,
                color: "64748B",
              },
            },
            children: conteudoCabecalho,
          }),
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
        indice === 0
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

  const documento = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 560,
              right: 560,
              bottom: 560,
              left: 560,
            },
          },
          column: duasColunas
            ? {
                count: 2,
                space: 360,
                separate: true,
              }
            : {
                count: 1,
              },
        },
        children: [
          cabecalhoWord,

          new Paragraph({
            spacing: {
              before: 80,
              after: 80,
            },
            border: {
              bottom: {
                color: "CBD5E1",
                size: 6,
                style:
                  BorderStyle.SINGLE,
              },
            },
            children: [
              new TextRun({
                text: " ",
              }),
            ],
          }),

          ...conteudoWord,
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