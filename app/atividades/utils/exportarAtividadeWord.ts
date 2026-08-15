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

type DimensoesImagem = {
  largura: number;
  altura: number;
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
    throw new Error("Imagem inválida.");
  }

  const base64 = partes[1];
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);

  for (let indice = 0; indice < binario.length; indice += 1) {
    bytes[indice] = binario.charCodeAt(indice);
  }

  return bytes;
}

async function origemImagemParaDataUrl(src: string) {
  if (!src) {
    return "";
  }

  if (src.startsWith("data:image/")) {
    return src;
  }

  try {
    const resposta = await fetch(src);

    if (!resposta.ok) {
      return "";
    }

    const blob = await resposta.blob();

    return await new Promise<string>(
      (resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = () =>
          resolve(
            String(
              leitor.result || ""
            )
          );

        leitor.onerror = () =>
          reject(
            new Error(
              "Não foi possível ler a logo."
            )
          );

        leitor.readAsDataURL(blob);
      }
    );
  } catch {
    return "";
  }
}

async function carregarImagem(
  src: string
) {
  return await new Promise<HTMLImageElement>(
    (resolve, reject) => {
      const imagem = new Image();

      imagem.onload = () =>
        resolve(imagem);

      imagem.onerror = () =>
        reject(
          new Error(
            "Não foi possível carregar a imagem."
          )
        );

      imagem.src = src;
    }
  );
}

async function normalizarImagemParaPng(
  origem: string,
  fundoBranco = true
) {
  const imagem =
    await carregarImagem(origem);

  const largura =
    imagem.naturalWidth ||
    imagem.width;

  const altura =
    imagem.naturalHeight ||
    imagem.height;

  if (!largura || !altura) {
    throw new Error(
      "A imagem não possui dimensões válidas."
    );
  }

  const canvas =
    document.createElement("canvas");

  canvas.width = largura;
  canvas.height = altura;

  const contexto =
    canvas.getContext("2d");

  if (!contexto) {
    throw new Error(
      "Não foi possível preparar a imagem para o Word."
    );
  }

  if (fundoBranco) {
    contexto.fillStyle = "#ffffff";
    contexto.fillRect(
      0,
      0,
      largura,
      altura
    );
  }

  contexto.drawImage(
    imagem,
    0,
    0,
    largura,
    altura
  );

  return canvas.toDataURL(
    "image/png",
    1
  );
}

async function obterDimensoesImagem(
  dataUrl: string
): Promise<DimensoesImagem> {
  const imagem =
    await carregarImagem(dataUrl);

  return {
    largura:
      imagem.naturalWidth ||
      imagem.width,

    altura:
      imagem.naturalHeight ||
      imagem.height,
  };
}

/*
 * O cabeçalho do Word é NATIVO:
 * tabela + textos editáveis.
 *
 * Somente a LOGO continua sendo imagem,
 * porque a logo é naturalmente uma imagem.
 */
function textoVisivel(
  elemento: HTMLElement | null
) {
  if (!elemento) {
    return "";
  }

  const clone =
    elemento.cloneNode(
      true
    ) as HTMLElement;

  const originais =
    Array.from(
      elemento.querySelectorAll(
        "input, textarea"
      )
    ) as (
      | HTMLInputElement
      | HTMLTextAreaElement
    )[];

  const clones =
    Array.from(
      clone.querySelectorAll(
        "input, textarea"
      )
    ) as (
      | HTMLInputElement
      | HTMLTextAreaElement
    )[];

  clones.forEach(
    (campo, indice) => {
      const valor =
        originais[indice]?.value ||
        "";

      campo.replaceWith(
        document.createTextNode(
          valor
        )
      );
    }
  );

  return (
    clone.innerText ||
    clone.textContent ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();
}

function obterValorAposRotulo(
  elemento: HTMLElement | null,
  rotulo: string
) {
  if (!elemento) {
    return "";
  }

  const candidatos =
    Array.from(
      elemento.querySelectorAll(
        "td, th, div, label"
      )
    ) as HTMLElement[];

  const alvo =
    rotulo
      .toLocaleLowerCase(
        "pt-BR"
      )
      .replace(/\s+/g, " ")
      .trim();

  for (const candidato of candidatos) {
    const texto =
      textoVisivel(
        candidato
      );

    const normalizado =
      texto
        .toLocaleLowerCase(
          "pt-BR"
        )
        .replace(/\s+/g, " ")
        .trim();

    if (
      !normalizado.startsWith(
        alvo
      )
    ) {
      continue;
    }

    const campo =
      candidato.querySelector(
        "input, textarea"
      ) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;

    if (campo?.value?.trim()) {
      return campo.value.trim();
    }

    const separador =
      texto.indexOf(":");

    if (separador >= 0) {
      return texto
        .slice(
          separador + 1
        )
        .trim();
    }
  }

  return "";
}

function criarParagrafoCabecalho(
  rotulo: string,
  valor = "",
  centralizado = false,
  negritoRotulo = true
) {
  return new Paragraph({
    alignment:
      centralizado
        ? AlignmentType.CENTER
        : AlignmentType.LEFT,

    spacing: {
      before: 0,
      after: 0,
    },

    children: [
      new TextRun({
        text: rotulo,
        bold: negritoRotulo,
        size: 18,
      }),

      ...(valor
        ? [
            new TextRun({
              text: valor,
              size: 18,
            }),
          ]
        : []),
    ],
  });
}

async function criarCabecalhoWord(
  elemento: HTMLElement | null
): Promise<Table | null> {
  if (!elemento) {
    return null;
  }

  const componente =
    obterValorAposRotulo(
      elemento,
      "Componente Curricular:"
    );

  const professor =
    obterValorAposRotulo(
      elemento,
      "Professor(a):"
    );

  const turno =
    obterValorAposRotulo(
      elemento,
      "Turno:"
    );

  const serie =
    obterValorAposRotulo(
      elemento,
      "Série:"
    );

  const objeto =
    obterValorAposRotulo(
      elemento,
      "Objeto(s) de Conhecimento:"
    );

  const aluno =
    obterValorAposRotulo(
      elemento,
      "Aluno(a):"
    );

  const data =
    obterValorAposRotulo(
      elemento,
      "DATA"
    );

  const nota =
    obterValorAposRotulo(
      elemento,
      "NOTA"
    );

  const textoCompleto =
    textoVisivel(
      elemento
    );

  const titulo =
    (
      textoCompleto.match(
        /ESCOLA\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ0-9\s.-]+?(?=Componente|Professor|Turno|Série|Objeto|Aluno|DATA|NOTA)/i
      )?.[0] ||
      "ESCOLA MUNICIPAL AQUILES DE LISBOA"
    )
      .replace(/\s+/g, " ")
      .trim();

  let logoRun:
    | ImageRun
    | null = null;

  const logo =
    elemento.querySelector(
      "img"
    ) as HTMLImageElement | null;

  if (logo?.src) {
    try {
      const dataUrl =
        await origemImagemParaDataUrl(
          logo.src
        );

      if (dataUrl) {
        const png =
          await normalizarImagemParaPng(
            dataUrl,
            true
          );

        const dimensoes =
          await obterDimensoesImagem(
            png
          );

        const escala =
          Math.min(
            85 /
              dimensoes.largura,
            70 /
              dimensoes.altura
          );

        logoRun =
          new ImageRun({
            data:
              dataUrlParaUint8Array(
                png
              ),
            type: "png",
            transformation: {
              width:
                Math.max(
                  1,
                  Math.floor(
                    dimensoes.largura *
                      escala
                  )
                ),
              height:
                Math.max(
                  1,
                  Math.floor(
                    dimensoes.altura *
                      escala
                  )
                ),
            },
          });
      }
    } catch {
      /*
       * Se a logo falhar, o cabeçalho
       * continua sendo exportado.
       */
    }
  }

  const bordas =
    criarBordasPretas(4);

  const semBordas = {
    top: {
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
    right: {
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

  const tabelaCentro =
    new Table({
      width: {
        size: 100,
        type:
          WidthType.PERCENTAGE,
      },

      rows: [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              borders: bordas,
              children: [
                new Paragraph({
                  alignment:
                    AlignmentType.CENTER,
                  spacing: {
                    before: 0,
                    after: 0,
                  },
                  children: [
                    new TextRun({
                      text: titulo,
                      bold: true,
                      size: 18,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        new TableRow({
          children: [
            new TableCell({
              borders: bordas,
              children: [
                criarParagrafoCabecalho(
                  "Componente Curricular: ",
                  componente
                ),
              ],
            }),
            new TableCell({
              borders: bordas,
              children: [
                criarParagrafoCabecalho(
                  "Professor(a): ",
                  professor
                ),
              ],
            }),
          ],
        }),

        new TableRow({
          children: [
            new TableCell({
              borders: bordas,
              children: [
                criarParagrafoCabecalho(
                  "Turno: ",
                  turno
                ),
              ],
            }),
            new TableCell({
              borders: bordas,
              children: [
                criarParagrafoCabecalho(
                  "Série: ",
                  serie
                ),
              ],
            }),
          ],
        }),

        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              borders: bordas,
              children: [
                criarParagrafoCabecalho(
                  "Objeto(s) de Conhecimento: ",
                  objeto
                ),
              ],
            }),
          ],
        }),

        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              borders: bordas,
              children: [
                criarParagrafoCabecalho(
                  "Aluno(a): ",
                  aluno
                ),
              ],
            }),
          ],
        }),
      ],
    });

  const tabelaDireita =
    new Table({
      width: {
        size: 100,
        type:
          WidthType.PERCENTAGE,
      },

      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: bordas,
              verticalAlign:
                VerticalAlign.CENTER,
              children: [
                criarParagrafoCabecalho(
                  "DATA",
                  "",
                  true,
                  false
                ),
                criarParagrafoCabecalho(
                  data ||
                    "____/____/2025",
                  "",
                  true,
                  false
                ),
              ],
            }),
          ],
        }),

        new TableRow({
          children: [
            new TableCell({
              borders: bordas,
              verticalAlign:
                VerticalAlign.CENTER,
              children: [
                criarParagrafoCabecalho(
                  "NOTA",
                  "",
                  true,
                  true
                ),
                criarParagrafoCabecalho(
                  nota || "______",
                  "",
                  true,
                  false
                ),
              ],
            }),
          ],
        }),
      ],
    });

  return new Table({
    width: {
      size: 100,
      type:
        WidthType.PERCENTAGE,
    },

    borders: semBordas,

    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 18,
              type:
                WidthType.PERCENTAGE,
            },
            borders: semBordas,
            verticalAlign:
              VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment:
                  AlignmentType.CENTER,
                spacing: {
                  before: 0,
                  after: 0,
                },
                children:
                  logoRun
                    ? [logoRun]
                    : [],
              }),
            ],
          }),

          new TableCell({
            width: {
              size: 67,
              type:
                WidthType.PERCENTAGE,
            },
            borders: semBordas,
            children: [
              tabelaCentro,
            ],
          }),

          new TableCell({
            width: {
              size: 15,
              type:
                WidthType.PERCENTAGE,
            },
            borders: semBordas,
            children: [
              tabelaDireita,
            ],
          }),
        ],
      }),
    ],
  });
}

function criarBordasPretas(
  tamanho = 5
) {
  return {
    top: {
      style:
        BorderStyle.SINGLE,
      size: tamanho,
      color: "000000",
    },

    bottom: {
      style:
        BorderStyle.SINGLE,
      size: tamanho,
      color: "000000",
    },

    left: {
      style:
        BorderStyle.SINGLE,
      size: tamanho,
      color: "000000",
    },

    right: {
      style:
        BorderStyle.SINGLE,
      size: tamanho,
      color: "000000",
    },
  };
}

export async function exportarAtividadeWord(
  cabecalhoElemento:
    | HTMLElement
    | null,
  imagem: string,
  opcoes:
    OpcoesExportarAtividadeWord = {}
) {
  if (
    !imagem ||
    !imagem.startsWith(
      "data:image/"
    )
  ) {
    throw new Error(
      "A imagem da atividade não foi encontrada."
    );
  }

  const tituloArquivo =
    limparNomeArquivo(
      opcoes.tituloArquivo ||
        "atividade-planejai"
    );

  /*
   * ==================================================
   * MESMAS REGRAS DA TELA/PDF
   * ==================================================
   *
   * A4 vertical
   * margem externa ~ 8 mm
   * cabeçalho no topo
   * atividade abaixo
   * uma única borda envolvendo cabeçalho + atividade
   * imagem inteira
   * sem cortar
   * sem deformar
   * maior tamanho possível
   */

  const larguraPaginaPx = 794;
  const alturaPaginaPx = 1123;

  /*
   * Aproximadamente 8 mm a 96 DPI.
   */
  const margemPx = 30;

  const larguraUtil =
    larguraPaginaPx -
    margemPx * 2;

  const alturaUtil =
    alturaPaginaPx -
    margemPx * 2;

  /*
   * Primeiro normalizamos a atividade
   * para PNG.
   *
   * Isso também resolve Word com SVG.
   */
  const atividadePng =
    await normalizarImagemParaPng(
      imagem,
      true
    );

  const dimensoesAtividade =
    await obterDimensoesImagem(
      atividadePng
    );

  /*
   * Cabeçalho NATIVO do Word:
   * tabela e textos editáveis.
   */
  const cabecalhoWord =
    await criarCabecalhoWord(
      cabecalhoElemento
    );

  /*
   * Reserva aproximada do cabeçalho.
   * A imagem da atividade continua
   * sendo encaixada proporcionalmente.
   */
  const alturaCabecalhoWord =
    cabecalhoWord
      ? 145
      : 0;

  const espacoEntre =
    cabecalhoWord
      ? 4
      : 0;

  /*
   * Borda interna da atividade.
   */
  const respiroBorda = 10;

  const larguraDisponivelAtividade =
    Math.max(
      100,
      larguraUtil -
        respiroBorda
    );

  const alturaDisponivelAtividade =
    Math.max(
      100,
      alturaUtil -
        alturaCabecalhoWord -
        espacoEntre -
        respiroBorda
    );

  /*
   * Encaixe automático:
   *
   * usa a menor proporção possível
   * para a atividade entrar inteira.
   */
  const escalaAtividade =
    Math.min(
      larguraDisponivelAtividade /
        dimensoesAtividade.largura,

      alturaDisponivelAtividade /
        dimensoesAtividade.altura
    );

  const larguraAtividade =
    Math.max(
      1,
      Math.floor(
        dimensoesAtividade.largura *
          escalaAtividade
      )
    );

  const alturaAtividade =
    Math.max(
      1,
      Math.floor(
        dimensoesAtividade.altura *
          escalaAtividade
      )
    );

  const atividadeRun =
    new ImageRun({
      data:
        dataUrlParaUint8Array(
          atividadePng
        ),
      type: "png",
      transformation: {
        width:
          larguraAtividade,
        height:
          alturaAtividade,
      },
    });

  /*
   * A atividade NÃO recebe uma borda própria.
   *
   * Cabeçalho + atividade ficam dentro
   * da mesma borda externa da folha,
   * igual à tela de finalização e ao PDF.
   */
  const paragrafoAtividade =
    new Paragraph({
      alignment:
        AlignmentType.CENTER,

      spacing: {
        before: 0,
        after: 0,
      },

      children: [
        atividadeRun,
      ],
    });

  /*
   * Conteúdo que ficará dentro da
   * borda externa da A4.
   */
  const conteudoFolha: (
    | Paragraph
    | Table
  )[] = [];

  if (cabecalhoWord) {
    conteudoFolha.push(
      cabecalhoWord
    );

    conteudoFolha.push(
      new Paragraph({
        spacing: {
          before: 0,
          after: 20,
        },
        children: [],
      })
    );
  }

  conteudoFolha.push(
    paragrafoAtividade
  );

  /*
   * Uma única célula grande cria a
   * borda externa da folha.
   *
   * Cabeçalho + atividade ficam
   * dentro da MESMA borda.
   */
  const quadroFolha =
    new Table({
      width: {
        size: 100,
        type:
          WidthType.PERCENTAGE,
      },

      rows: [
        new TableRow({
          height: {
            value: 15500,
            rule:
              HeightRule.ATLEAST,
          },

          children: [
            new TableCell({
              verticalAlign:
                VerticalAlign.TOP,

              borders:
                criarBordasPretas(6),

              margins: {
                top: 80,
                bottom: 80,
                left: 80,
                right: 80,
              },

              children:
                conteudoFolha,
            }),
          ],
        }),
      ],
    });

  const documento =
    new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: 11906,
                height: 16838,
              },

              /*
               * Aproximadamente 8 mm.
               */
              margin: {
                top: 454,
                right: 454,
                bottom: 454,
                left: 454,
              },
            },
          },

          children: [
            quadroFolha,
          ],
        },
      ],
    });

  const arquivo =
    await Packer.toBlob(
      documento
    );

  saveAs(
    arquivo,
    `${tituloArquivo}.docx`
  );
}