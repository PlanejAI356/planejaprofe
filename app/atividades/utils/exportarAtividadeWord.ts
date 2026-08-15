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

async function blobParaDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      resolve(String(leitor.result || ""));
    };

    leitor.onerror = () => {
      reject(new Error("Não foi possível ler a imagem."));
    };

    leitor.readAsDataURL(blob);
  });
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
      throw new Error("Não foi possível carregar uma imagem do cabeçalho.");
    }

    const blob = await resposta.blob();
    return await blobParaDataUrl(blob);
  } catch (error) {
    console.warn(
      "Não foi possível incorporar uma imagem do cabeçalho:",
      error
    );

    return "";
  }
}

async function carregarImagem(src: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const imagem = new Image();

    imagem.onload = () => resolve(imagem);

    imagem.onerror = () => {
      reject(new Error("Não foi possível carregar a imagem."));
    };

    imagem.src = src;
  });
}

/*
 * Converte PNG/JPG/WEBP/SVG etc. para PNG.
 *
 * O Word passa a receber sempre PNG.
 * Isso evita falha quando a atividade for SVG
 * ou quando o formato original não for aceito
 * pelo ImageRun do DOCX.
 */
async function normalizarImagemParaPng(
  origem: string,
  fundoBranco = true
) {
  const imagem = await carregarImagem(origem);

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
 * Copia os estilos calculados do cabeçalho
 * para o clone. Assim não reconstruímos
 * a tabela do cabeçalho no Word.
 */
function copiarEstilos(
  origem: Element,
  destino: Element
) {
  const estilos =
    window.getComputedStyle(origem);

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
      // Ignora propriedades que o clone não aceita.
    }
  }

  const filhosOrigem =
    Array.from(origem.children);

  const filhosDestino =
    Array.from(destino.children);

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
 * Cria um PNG do cabeçalho REAL que está
 * na tela.
 *
 * Não recriamos os campos.
 * Não trocamos fonte.
 * Não alteramos tabela.
 * Não mudamos logo.
 */
async function criarImagemCabecalho(
  elemento: HTMLElement | null
) {
  if (!elemento) {
    return "";
  }

  const possuiConteudo =
    Boolean(
      elemento.innerText.trim()
    ) ||
    Boolean(
      elemento.querySelector("img")
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

  clone.removeAttribute(
    "contenteditable"
  );

  clone.removeAttribute(
    "data-placeholder"
  );

  clone.style.outline = "none";
  clone.style.boxShadow = "none";
  clone.style.overflow = "visible";
  clone.style.margin = "0";
  clone.style.background = "#ffffff";

  /*
   * Toda imagem do cabeçalho é incorporada
   * no SVG como data URL.
   *
   * Se uma imagem externa não puder ser
   * carregada, ela é removida do clone em vez
   * de derrubar a exportação inteira.
   */
  const imagensOriginais =
    Array.from(
      elemento.querySelectorAll("img")
    );

  const imagensClone =
    Array.from(
      clone.querySelectorAll("img")
    );

  for (
    let indice = 0;
    indice < imagensClone.length;
    indice += 1
  ) {
    const original =
      imagensOriginais[indice];

    const imagemClone =
      imagensClone[indice];

    if (!original || !imagemClone) {
      continue;
    }

    const dataUrl =
      await origemImagemParaDataUrl(
        original.src
      );

    if (dataUrl) {
      imagemClone.setAttribute(
        "src",
        dataUrl
      );
    } else {
      /*
       * Evita canvas contaminado por CORS.
       * O restante do cabeçalho continua.
       */
      imagemClone.removeAttribute(
        "src"
      );
    }
  }

  /*
   * Usa a largura real que o professor
   * está vendo.
   */
  const largura =
    Math.max(
      Math.round(
        elemento
          .getBoundingClientRect()
          .width
      ),
      650
    );

  const medidor =
    document.createElement("div");

  medidor.style.position = "fixed";
  medidor.style.left = "-10000px";
  medidor.style.top = "0";
  medidor.style.width =
    `${largura}px`;
  medidor.style.background =
    "#ffffff";
  medidor.style.zIndex = "-1";
  medidor.style.pointerEvents =
    "none";

  medidor.appendChild(clone);
  document.body.appendChild(
    medidor
  );

  try {
    const altura =
      Math.max(
        Math.ceil(
          clone
            .getBoundingClientRect()
            .height
        ),
        1
      );

    const serializer =
      new XMLSerializer();

    const html =
      serializer.serializeToString(
        clone
      );

    /*
     * Escala 2:
     * cabeçalho mais nítido no Word.
     */
    const escala = 2;

    const larguraCanvas =
      largura * escala;

    const alturaCanvas =
      altura * escala;

    const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${larguraCanvas}"
        height="${alturaCanvas}"
        viewBox="0 0 ${largura} ${altura}"
      >
        <foreignObject
          x="0"
          y="0"
          width="${largura}"
          height="${altura}"
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style="
              width:${largura}px;
              height:${altura}px;
              background:#ffffff;
              margin:0;
              padding:0;
              overflow:visible;
            "
          >
            ${html}
          </div>
        </foreignObject>
      </svg>
    `;

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
      const imagemSvg =
        await carregarImagem(url);

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
        imagemSvg,
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
  } finally {
    medidor.remove();
  }
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
   * Cabeçalho real da tela.
   */
  let imagemCabecalho = "";

  try {
    imagemCabecalho =
      await criarImagemCabecalho(
        cabecalhoElemento
      );
  } catch (error) {
    /*
     * A atividade não deixa de exportar
     * por um erro isolado de captura.
     *
     * O erro real fica no console para
     * diagnóstico.
     */
    console.error(
      "Erro ao capturar cabeçalho para Word:",
      error
    );

    throw new Error(
      "Não foi possível preparar o cabeçalho para o Word."
    );
  }

  let cabecalhoRun:
    | ImageRun
    | null = null;

  let alturaCabecalhoWord = 0;

  if (imagemCabecalho) {
    /*
     * Garante PNG mesmo no cabeçalho.
     */
    imagemCabecalho =
      await normalizarImagemParaPng(
        imagemCabecalho,
        true
      );

    const dimensoesCabecalho =
      await obterDimensoesImagem(
        imagemCabecalho
      );

    /*
     * Cabeçalho usa a largura útil
     * praticamente inteira.
     */
    const escalaCabecalho =
      Math.min(
        larguraUtil /
          dimensoesCabecalho.largura,
        1
      );

    const larguraCabecalho =
      Math.max(
        1,
        Math.floor(
          dimensoesCabecalho.largura *
            escalaCabecalho
        )
      );

    alturaCabecalhoWord =
      Math.max(
        1,
        Math.floor(
          dimensoesCabecalho.altura *
            escalaCabecalho
        )
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
   * Pouco espaço entre cabeçalho
   * e atividade.
   */
  const espacoEntre =
    cabecalhoRun
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

  if (cabecalhoRun) {
    conteudoFolha.push(
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