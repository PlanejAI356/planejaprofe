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
  VerticalAlign,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

type OpcoesExportarAtividadeWord = {
  tituloArquivo?: string;
};

function limparNomeArquivo(nome: string) {
  const nomeLimpo = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return nomeLimpo || "atividade";
}

function dataUrlParaUint8Array(dataUrl: string) {
  const partes = dataUrl.split(",");

  if (partes.length < 2) {
    throw new Error("Imagem da atividade inválida.");
  }

  const base64 = partes[1];
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);

  for (let indice = 0; indice < binario.length; indice += 1) {
    bytes[indice] = binario.charCodeAt(indice);
  }

  return bytes;
}

async function obterDimensoesImagem(dataUrl: string) {
  return new Promise<{
    largura: number;
    altura: number;
  }>((resolve, reject) => {
    const imagem = new Image();

    imagem.onload = () => {
      resolve({
        largura:
          imagem.naturalWidth || imagem.width,
        altura:
          imagem.naturalHeight || imagem.height,
      });
    };

    imagem.onerror = () => {
      reject(
        new Error(
          "Não foi possível carregar a imagem da atividade."
        )
      );
    };

    imagem.src = dataUrl;
  });
}

function textoCelula(
  texto: string,
  opcoes: {
    negrito?: boolean;
    centralizado?: boolean;
    tamanho?: number;
  } = {}
) {
  return new Paragraph({
    alignment: opcoes.centralizado
      ? AlignmentType.CENTER
      : AlignmentType.LEFT,
    spacing: {
      before: 0,
      after: 0,
    },
    children: [
      new TextRun({
        text: texto,
        bold: opcoes.negrito,
        size: opcoes.tamanho ?? 18,
        font: "Arial",
      }),
    ],
  });
}

function criarBordasCelula() {
  return {
    top: {
      style: BorderStyle.SINGLE,
      size: 4,
      color: "000000",
    },
    bottom: {
      style: BorderStyle.SINGLE,
      size: 4,
      color: "000000",
    },
    left: {
      style: BorderStyle.SINGLE,
      size: 4,
      color: "000000",
    },
    right: {
      style: BorderStyle.SINGLE,
      size: 4,
      color: "000000",
    },
  };
}

function criarCelula(
  texto: string,
  largura: number,
  opcoes: {
    negrito?: boolean;
    centralizado?: boolean;
    columnSpan?: number;
  } = {}
) {
  return new TableCell({
    width: {
      size: largura,
      type: WidthType.DXA,
    },
    columnSpan: opcoes.columnSpan,
    verticalAlign: VerticalAlign.CENTER,
    margins: {
      top: 60,
      bottom: 60,
      left: 80,
      right: 80,
    },
    borders: criarBordasCelula(),
    children: [
      textoCelula(texto, {
        negrito: opcoes.negrito,
        centralizado: opcoes.centralizado,
      }),
    ],
  });
}

function extrairTexto(
  elemento: HTMLElement | null,
  rotulo: string
) {
  if (!elemento) return "";

  const textoCompleto =
    elemento.innerText.replace(/\r/g, "");

  const linhas = textoCompleto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  const rotuloNormalizado =
    rotulo.toLowerCase();

  const linha = linhas.find((item) =>
    item.toLowerCase().startsWith(
      rotuloNormalizado
    )
  );

  if (!linha) return "";

  const indice = linha.indexOf(":");

  if (indice < 0) return "";

  return linha.slice(indice + 1).trim();
}

function encontrarImagemLogo(
  cabecalhoElemento: HTMLElement | null
) {
  if (!cabecalhoElemento) return "";

  const imagem =
    cabecalhoElemento.querySelector("img");

  return imagem?.src || "";
}

async function criarCelulaLogo(
  cabecalhoElemento: HTMLElement | null
) {
  const srcLogo =
    encontrarImagemLogo(cabecalhoElemento);

  if (!srcLogo) {
    return new TableCell({
      rowSpan: 4,
      width: {
        size: 1700,
        type: WidthType.DXA,
      },
      verticalAlign: VerticalAlign.CENTER,
      borders: criarBordasCelula(),
      children: [
        textoCelula("", {
          centralizado: true,
        }),
      ],
    });
  }

  try {
    let dadosLogo: Uint8Array;

    if (srcLogo.startsWith("data:image/")) {
      dadosLogo =
        dataUrlParaUint8Array(srcLogo);
    } else {
      const resposta =
        await fetch(srcLogo);

      if (!resposta.ok) {
        throw new Error(
          "Não foi possível carregar o logo."
        );
      }

      dadosLogo = new Uint8Array(
        await resposta.arrayBuffer()
      );
    }

    return new TableCell({
      rowSpan: 4,
      width: {
        size: 1700,
        type: WidthType.DXA,
      },
      verticalAlign: VerticalAlign.CENTER,
      borders: criarBordasCelula(),
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 0,
            after: 0,
          },
          children: [
            new ImageRun({
              data: dadosLogo,
              type: "png",
              transformation: {
                width: 88,
                height: 68,
              },
            }),
          ],
        }),
      ],
    });
  } catch {
    return new TableCell({
      rowSpan: 4,
      width: {
        size: 1700,
        type: WidthType.DXA,
      },
      verticalAlign: VerticalAlign.CENTER,
      borders: criarBordasCelula(),
      children: [
        textoCelula("", {
          centralizado: true,
        }),
      ],
    });
  }
}

async function criarTabelaCabecalho(
  cabecalhoElemento: HTMLElement | null
) {
  const nomeEscola =
    cabecalhoElemento
      ?.querySelector("table")
      ?.innerText
      .split("\n")
      .map((linha) => linha.trim())
      .find(
        (linha) =>
          linha &&
          !linha.includes(":") &&
          linha.toLowerCase() !== "data" &&
          linha.toLowerCase() !== "nota"
      ) || "";

  const componente =
    extrairTexto(
      cabecalhoElemento,
      "Componente Curricular"
    );

  const professor =
    extrairTexto(
      cabecalhoElemento,
      "Professor(a)"
    );

  const turno =
    extrairTexto(
      cabecalhoElemento,
      "Turno"
    );

  const serie =
    extrairTexto(
      cabecalhoElemento,
      "Série"
    );

  const objetos =
    extrairTexto(
      cabecalhoElemento,
      "Objeto(s) de Conhecimento"
    );

  const aluno =
    extrairTexto(
      cabecalhoElemento,
      "Aluno(a)"
    );

  const celulaLogo =
    await criarCelulaLogo(
      cabecalhoElemento
    );

  const larguraTotal = 10300;
  const larguraLogo = 1700;
  const larguraMeio1 = 3400;
  const larguraMeio2 = 3000;
  const larguraFinal = 2200;

  return new Table({
    width: {
      size: larguraTotal,
      type: WidthType.DXA,
    },
    columnWidths: [
      larguraLogo,
      larguraMeio1,
      larguraMeio2,
      larguraFinal,
    ],
    rows: [
      new TableRow({
        children: [
          celulaLogo,
          new TableCell({
            columnSpan: 3,
            verticalAlign:
              VerticalAlign.CENTER,
            borders: criarBordasCelula(),
            margins: {
              top: 50,
              bottom: 50,
              left: 80,
              right: 80,
            },
            children: [
              textoCelula(
                nomeEscola,
                {
                  negrito: true,
                  centralizado: true,
                  tamanho: 20,
                }
              ),
            ],
          }),
        ],
      }),

      new TableRow({
        children: [
          criarCelula(
            `Componente Curricular: ${componente}`,
            larguraMeio1,
            {
              negrito: true,
            }
          ),
          criarCelula(
            `Professor(a): ${professor}`,
            larguraMeio2,
            {
              negrito: true,
            }
          ),
          criarCelula(
            "DATA\n____/____/______",
            larguraFinal,
            {
              centralizado: true,
            }
          ),
        ],
      }),

      new TableRow({
        children: [
          criarCelula(
            `Turno: ${turno}`,
            larguraMeio1,
            {
              negrito: true,
            }
          ),
          criarCelula(
            `Série: ${serie}`,
            larguraMeio2,
            {
              negrito: true,
            }
          ),
          criarCelula(
            "NOTA",
            larguraFinal,
            {
              centralizado: true,
              negrito: true,
            }
          ),
        ],
      }),

      new TableRow({
        children: [
          criarCelula(
            `Objeto(s) de Conhecimento: ${objetos}`,
            larguraMeio1 + larguraMeio2,
            {
              negrito: true,
              columnSpan: 2,
            }
          ),
          criarCelula(
            "",
            larguraFinal
          ),
        ],
      }),

      new TableRow({
        children: [
          criarCelula(
            `Aluno(a): ${aluno}`,
            larguraMeio1 + larguraMeio2,
            {
              negrito: true,
              columnSpan: 2,
            }
          ),
          criarCelula(
            "",
            larguraFinal
          ),
        ],
      }),
    ],
  });
}

export async function exportarAtividadeWord(
  cabecalhoElemento: HTMLElement | null,
  imagem: string,
  opcoes: OpcoesExportarAtividadeWord = {}
) {
  if (!imagem || !imagem.startsWith("data:image/")) {
    throw new Error(
      "A imagem da atividade não foi encontrada."
    );
  }

  const tituloArquivo =
    limparNomeArquivo(
      opcoes.tituloArquivo || "atividade"
    );

  const tabelaCabecalho =
    await criarTabelaCabecalho(
      cabecalhoElemento
    );

  const dadosImagem =
    dataUrlParaUint8Array(imagem);

  const dimensoes =
    await obterDimensoesImagem(imagem);

  /*
   * Área útil aproximada abaixo do cabeçalho.
   * Mantemos a proporção original para a atividade não cortar.
   */
  const larguraMaxima = 585;
  const alturaMaxima = 690;

  const proporcao = Math.min(
    larguraMaxima / dimensoes.largura,
    alturaMaxima / dimensoes.altura,
    1
  );

  const larguraFinal =
    Math.max(
      1,
      Math.round(
        dimensoes.largura * proporcao
      )
    );

  const alturaFinal =
    Math.max(
      1,
      Math.round(
        dimensoes.altura * proporcao
      )
    );

  const documento = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
            },
            margin: {
              top: 300,
              right: 300,
              bottom: 300,
              left: 300,
            },
          },
        },

        children: [
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                height: {
                  value: 15600,
                  rule: HeightRule.ATLEAST,
                },
                children: [
                  new TableCell({
                    verticalAlign:
                      VerticalAlign.TOP,
                    margins: {
                      top: 140,
                      right: 140,
                      bottom: 140,
                      left: 140,
                    },
                    borders: {
                      top: {
                        style:
                          BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                      right: {
                        style:
                          BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                      bottom: {
                        style:
                          BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                      left: {
                        style:
                          BorderStyle.SINGLE,
                        size: 6,
                        color: "000000",
                      },
                    },
                    children: [
                      tabelaCabecalho,

                      new Paragraph({
                        spacing: {
                          before: 80,
                          after: 50,
                        },
                        border: {
                          bottom: {
                            style:
                              BorderStyle.SINGLE,
                            size: 5,
                            color: "000000",
                          },
                        },
                        children: [
                          new TextRun({
                            text: "",
                          }),
                        ],
                      }),

                      new Paragraph({
                        alignment:
                          AlignmentType.CENTER,
                        spacing: {
                          before: 20,
                          after: 0,
                        },
                        children: [
                          new ImageRun({
                            data: dadosImagem,
                            type: "png",
                            transformation: {
                              width:
                                larguraFinal,
                              height:
                                alturaFinal,
                            },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
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