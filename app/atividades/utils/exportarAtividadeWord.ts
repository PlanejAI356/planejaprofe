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

function dataUrlParaUint8Array(
  dataUrl: string
) {
  const partes = dataUrl.split(",");

  if (partes.length < 2) {
    throw new Error(
      "Imagem inválida."
    );
  }

  const base64 = partes[1];

  const binario =
    atob(base64);

  const bytes =
    new Uint8Array(
      binario.length
    );

  for (
    let indice = 0;
    indice < binario.length;
    indice += 1
  ) {
    bytes[indice] =
      binario.charCodeAt(
        indice
      );
  }

  return bytes;
}

function obterTipoImagem(
  dataUrl: string
): "png" | "jpg" | "gif" | "bmp" {
  if (
    dataUrl.startsWith(
      "data:image/jpeg"
    ) ||
    dataUrl.startsWith(
      "data:image/jpg"
    )
  ) {
    return "jpg";
  }

  if (
    dataUrl.startsWith(
      "data:image/gif"
    )
  ) {
    return "gif";
  }

  if (
    dataUrl.startsWith(
      "data:image/bmp"
    )
  ) {
    return "bmp";
  }

  return "png";
}

async function obterDimensoesImagem(
  dataUrl: string
) {
  return new Promise<DimensoesImagem>(
    (resolve, reject) => {
      const imagem = new Image();

      imagem.onload = () => {
        resolve({
          largura:
            imagem.naturalWidth ||
            imagem.width,

          altura:
            imagem.naturalHeight ||
            imagem.height,
        });
      };

      imagem.onerror = () => {
        reject(
          new Error(
            "Não foi possível carregar a imagem."
          )
        );
      };

      imagem.src = dataUrl;
    }
  );
}

/*
 * Converte uma imagem externa para
 * data URL.
 *
 * Isso ajuda principalmente quando
 * o cabeçalho possui logo.
 */
async function imagemParaDataUrl(
  src: string
) {
  if (
    src.startsWith(
      "data:image/"
    )
  ) {
    return src;
  }

  try {
    const resposta =
      await fetch(src);

    if (!resposta.ok) {
      return src;
    }

    const blob =
      await resposta.blob();

    return await new Promise<string>(
      (resolve, reject) => {
        const leitor =
          new FileReader();

        leitor.onload = () => {
          resolve(
            String(
              leitor.result ||
                src
            )
          );
        };

        leitor.onerror =
          reject;

        leitor.readAsDataURL(
          blob
        );
      }
    );
  } catch {
    return src;
  }
}

/*
 * Copia os estilos calculados de um
 * elemento para o clone.
 *
 * Isso é importante para manter o
 * cabeçalho visualmente igual ao que
 * aparece na página.
 */
function copiarEstilos(
  origem: Element,
  destino: Element
) {
  const estilos =
    window.getComputedStyle(
      origem
    );

  const destinoHtml =
    destino as HTMLElement;

  for (
    let indice = 0;
    indice < estilos.length;
    indice += 1
  ) {
    const propriedade =
      estilos.item(indice);

    if (!propriedade) {
      continue;
    }

    try {
      destinoHtml.style.setProperty(
        propriedade,
        estilos.getPropertyValue(
          propriedade
        ),
        estilos.getPropertyPriority(
          propriedade
        )
      );
    } catch {
      // Alguns estilos não podem
      // ser copiados. Ignoramos.
    }
  }

  const filhosOrigem =
    Array.from(
      origem.children
    );

  const filhosDestino =
    Array.from(
      destino.children
    );

  filhosOrigem.forEach(
    (filho, indice) => {
      const cloneFilho =
        filhosDestino[indice];

      if (!cloneFilho) {
        return;
      }

      copiarEstilos(
        filho,
        cloneFilho
      );
    }
  );
}

/*
 * Cria uma imagem PNG do cabeçalho
 * exatamente como ele aparece na tela.
 */
async function criarImagemCabecalho(
  elemento:
    | HTMLElement
    | null
) {
  if (!elemento) {
    return "";
  }

  const possuiConteudo =
    Boolean(
      elemento.innerText.trim()
    ) ||
    Boolean(
      elemento.querySelector(
        "img"
      )
    );

  if (!possuiConteudo) {
    return "";
  }

  const clone =
    elemento.cloneNode(
      true
    ) as HTMLElement;

  copiarEstilos(
    elemento,
    clone
  );

  /*
   * Remove características do editor
   * que não devem aparecer no Word.
   */
  clone.removeAttribute(
    "contenteditable"
  );

  clone.removeAttribute(
    "data-placeholder"
  );

  clone.style.outline =
    "none";

  clone.style.boxShadow =
    "none";

  clone.style.overflow =
    "visible";

  clone.style.margin =
    "0";

  /*
   * Converte os logos/imagens para
   * data URL sempre que possível.
   */
  const imagensOriginais =
    Array.from(
      elemento.querySelectorAll(
        "img"
      )
    );

  const imagensClone =
    Array.from(
      clone.querySelectorAll(
        "img"
      )
    );

  for (
    let indice = 0;
    indice <
    imagensClone.length;
    indice += 1
  ) {
    const original =
      imagensOriginais[indice];

    const imagemClone =
      imagensClone[indice];

    if (
      !original ||
      !imagemClone
    ) {
      continue;
    }

    const novaSrc =
      await imagemParaDataUrl(
        original.src
      );

    imagemClone.setAttribute(
      "src",
      novaSrc
    );
  }

  /*
   * Largura real do cabeçalho na tela.
   *
   * Há uma largura mínima para evitar
   * problemas quando o elemento estiver
   * temporariamente pequeno.
   */
  const largura =
    Math.max(
      Math.round(
        elemento.getBoundingClientRect()
          .width
      ),
      650
    );

  /*
   * Para medir corretamente a altura,
   * colocamos temporariamente o clone
   * fora da tela.
   */
  const medidor =
    document.createElement(
      "div"
    );

  medidor.style.position =
    "fixed";

  medidor.style.left =
    "-10000px";

  medidor.style.top = "0";

  medidor.style.width =
    `${largura}px`;

  medidor.style.background =
    "#ffffff";

  medidor.style.zIndex =
    "-1";

  medidor.style.pointerEvents =
    "none";

  medidor.appendChild(
    clone
  );

  document.body.appendChild(
    medidor
  );

  const altura =
    Math.max(
      Math.ceil(
        clone.getBoundingClientRect()
          .height
      ),
      1
    );

  /*
   * Usamos escala 2 para gerar uma
   * imagem mais nítida no Word.
   */
  const escala = 2;

  const larguraCanvas =
    largura * escala;

  const alturaCanvas =
    altura * escala;

  const serializer =
    new XMLSerializer();

  const html =
    serializer.serializeToString(
      clone
    );

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${larguraCanvas}"
      height="${alturaCanvas}"
      viewBox="0 0 ${largura} ${altura}"
    >
      <foreignObject
        width="100%"
        height="100%"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style="
            width:${largura}px;
            height:${altura}px;
            background:#ffffff;
            margin:0;
            padding:0;
          "
        >
          ${html}
        </div>
      </foreignObject>
    </svg>
  `;

  medidor.remove();

  const blobSvg =
    new Blob(
      [svg],
      {
        type:
          "image/svg+xml;charset=utf-8",
      }
    );

  const url =
    URL.createObjectURL(
      blobSvg
    );

  try {
    const imagem =
      new Image();

    await new Promise<void>(
      (resolve, reject) => {
        imagem.onload = () =>
          resolve();

        imagem.onerror = () =>
          reject(
            new Error(
              "Não foi possível preparar o cabeçalho para o Word."
            )
          );

        imagem.src = url;
      }
    );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      larguraCanvas;

    canvas.height =
      alturaCanvas;

    const contexto =
      canvas.getContext(
        "2d"
      );

    if (!contexto) {
      throw new Error(
        "Não foi possível preparar o cabeçalho."
      );
    }

    contexto.fillStyle =
      "#ffffff";

    contexto.fillRect(
      0,
      0,
      larguraCanvas,
      alturaCanvas
    );

    contexto.scale(
      escala,
      escala
    );

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
  } finally {
    URL.revokeObjectURL(
      url
    );
  }
}

function criarBordasAtividade() {
  return {
    top: {
      style:
        BorderStyle.SINGLE,
      size: 5,
      color: "222222",
    },

    bottom: {
      style:
        BorderStyle.SINGLE,
      size: 5,
      color: "222222",
    },

    left: {
      style:
        BorderStyle.SINGLE,
      size: 5,
      color: "222222",
    },

    right: {
      style:
        BorderStyle.SINGLE,
      size: 5,
      color: "222222",
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
   * A4:
   *
   * 210 x 297 mm.
   *
   * Mantemos margens de cerca de 8 mm,
   * iguais à proposta usada no PDF.
   */
  const larguraPaginaPx =
    794;

  const alturaPaginaPx =
    1123;

  /*
   * Aproximadamente 8 mm em 96 DPI.
   */
  const margemPx = 30;

  const larguraUtil =
    larguraPaginaPx -
    margemPx * 2;

  const alturaUtil =
    alturaPaginaPx -
    margemPx * 2;

  /*
   * CABEÇALHO
   *
   * Não reconstruímos os campos.
   * Capturamos o cabeçalho real.
   */
  const imagemCabecalho =
    await criarImagemCabecalho(
      cabecalhoElemento
    );

  let alturaCabecalhoWord =
    0;

  let cabecalhoRun:
    | ImageRun
    | null = null;

  if (imagemCabecalho) {
    const dimensoesCabecalho =
      await obterDimensoesImagem(
        imagemCabecalho
      );

    const proporcaoCabecalho =
      Math.min(
        larguraUtil /
          dimensoesCabecalho.largura,
        1
      );

    const larguraCabecalho =
      Math.round(
        dimensoesCabecalho.largura *
          proporcaoCabecalho
      );

    alturaCabecalhoWord =
      Math.round(
        dimensoesCabecalho.altura *
          proporcaoCabecalho
      );

    cabecalhoRun =
      new ImageRun({
        data:
          dataUrlParaUint8Array(
            imagemCabecalho
          ),

        type: "png",

        transformation: {
          width:
            larguraCabecalho,

          height:
            alturaCabecalhoWord,
        },
      });
  }

  /*
   * Pequeno espaço entre cabeçalho
   * e atividade.
   */
  const espacoEntre =
    imagemCabecalho
      ? 8
      : 0;

  /*
   * Espaço reservado pela borda e
   * respiro interno da atividade.
   */
  const espacoBorda = 12;

  const alturaDisponivelAtividade =
    Math.max(
      100,

      alturaUtil -
        alturaCabecalhoWord -
        espacoEntre -
        espacoBorda
    );

  const larguraDisponivelAtividade =
    Math.max(
      100,
      larguraUtil -
        espacoBorda
    );

  const dimensoesAtividade =
    await obterDimensoesImagem(
      imagem
    );

  /*
   * Aqui está o encaixe automático.
   *
   * Usamos a menor proporção para a
   * atividade caber inteira no espaço
   * que realmente sobrou.
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

  const dadosAtividade =
    dataUrlParaUint8Array(
      imagem
    );

  const tipoAtividade =
    obterTipoImagem(
      imagem
    );

  /*
   * Quadro profissional em volta
   * da atividade.
   */
  const tabelaAtividade =
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
              verticalAlign:
                VerticalAlign.TOP,

              borders:
                criarBordasAtividade(),

              margins: {
                top: 60,
                bottom: 60,
                left: 60,
                right: 60,
              },

              children: [
                new Paragraph({
                  alignment:
                    AlignmentType.CENTER,

                  spacing: {
                    before: 0,
                    after: 0,
                  },

                  children: [
                    new ImageRun({
                      data:
                        dadosAtividade,

                      type:
                        tipoAtividade,

                      transformation: {
                        width:
                          larguraAtividade,

                        height:
                          alturaAtividade,
                      },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

  const filhosDocumento: (
    | Paragraph
    | Table
  )[] = [];

  /*
   * Cabeçalho exatamente como aparece
   * na tela.
   */
  if (cabecalhoRun) {
    filhosDocumento.push(
      new Paragraph({
        alignment:
          AlignmentType.CENTER,

        spacing: {
          before: 0,
          after: 0,
        },

        children: [
          cabecalhoRun,
        ],
      })
    );

    filhosDocumento.push(
      new Paragraph({
        spacing: {
          before: 0,
          after: 40,
        },

        children: [],
      })
    );
  }

  filhosDocumento.push(
    tabelaAtividade
  );

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

              margin: {
                /*
                 * Aproximadamente
                 * 8 mm.
                 */
                top: 454,
                right: 454,
                bottom: 454,
                left: 454,
              },
            },
          },

          children:
            filhosDocumento,
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