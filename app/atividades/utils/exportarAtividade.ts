type OpcoesExportarAtividade = {
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

function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function exportarAtividade(
  cabecalhoElemento: HTMLElement | null,
  imagem: string,
  opcoes: OpcoesExportarAtividade = {}
) {
  if (
    !imagem ||
    !imagem.startsWith("data:image/")
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
   * IMPORTANTE:
   *
   * Não reconstruímos o cabeçalho.
   * Pegamos exatamente o HTML que está
   * aparecendo no editor da página.
   */
  const cabecalhoHtml =
    cabecalhoElemento?.innerHTML || "";

  const iframe =
    document.createElement("iframe");

  /*
   * Não usar width/height = 0.
   *
   * Precisamos que o navegador consiga
   * calcular corretamente a altura real
   * do cabeçalho e o espaço restante.
   */
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "794px";
  iframe.style.height = "1123px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";

  iframe.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.appendChild(iframe);

  const janelaImpressao =
    iframe.contentWindow;

  const documentoImpressao =
    iframe.contentDocument;

  if (
    !janelaImpressao ||
    !documentoImpressao
  ) {
    iframe.remove();

    throw new Error(
      "Não foi possível preparar a atividade para exportação."
    );
  }

  documentoImpressao.open();

  documentoImpressao.write(`
<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
/>

<title>${escaparHtml(
    tituloArquivo
  )}</title>

<style>

@page {
  size: A4 portrait;
  margin: 0;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 210mm;
  height: 297mm;

  margin: 0 !important;
  padding: 0 !important;

  background: #ffffff !important;

  overflow: hidden !important;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  color: #000000;
}

/*
 * FOLHA A4
 *
 * O documento inteiro permanece
 * rigorosamente dentro de uma página.
 */
.pagina {
  width: 210mm;
  height: 297mm;

  margin: 0;
  padding: 8mm;

  background: #ffffff;

  display: flex;
  flex-direction: column;

  overflow: hidden;
}

/*
 * CABEÇALHO
 *
 * Mantemos exatamente o HTML que
 * veio da tela.
 *
 * Apenas normalizamos medidas para
 * que ele caiba corretamente no A4.
 */
.cabecalho {
  width: 100%;

  flex: 0 0 auto;

  margin: 0 0 2mm 0;
  padding: 0;

  overflow: visible;

  background: #ffffff;
}

.cabecalho table {
  width: 100% !important;

  max-width: 100% !important;

  border-collapse: collapse !important;

  table-layout: fixed;
}

.cabecalho td,
.cabecalho th {
  border: 1px solid #000000;

  padding: 1mm 1.3mm;

  vertical-align: middle;

  overflow-wrap: anywhere;
  word-break: normal;

  line-height: 1.08;
}

.cabecalho p {
  margin-top: 0;
  margin-bottom: 1mm;
}

.cabecalho img {
  max-width: 28mm !important;
  max-height: 20mm !important;

  width: auto !important;
  height: auto !important;

  object-fit: contain;

  display: block;
}

/*
 * ÁREA DA ATIVIDADE
 *
 * Usa TODO o espaço restante depois
 * que o cabeçalho é renderizado.
 *
 * A borda fica ao redor da atividade,
 * criando o acabamento profissional.
 */
.atividade {
  width: 100%;

  flex: 1 1 0;

  min-height: 0;

  border: 1px solid #222222;

  padding: 1.5mm;

  display: flex;

  align-items: flex-start;
  justify-content: center;

  overflow: hidden;

  background: #ffffff;
}

/*
 * A imagem nunca é deformada.
 */
.atividade img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: top center;
  margin: 0 auto;
  background: #ffffff;

  /* deixa o fundo da atividade mais branco no PDF */
  filter: brightness(1.08) contrast(1.06);
}

@media print {

  html,
  body {
    width: 210mm !important;
    height: 297mm !important;
  }

  .pagina {
    width: 210mm !important;
    height: 297mm !important;

    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .cabecalho,
  .atividade {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
}

</style>

</head>

<body>

<div class="pagina">

  ${
    cabecalhoHtml.trim()
      ? `
        <div class="cabecalho">
          ${cabecalhoHtml}
        </div>
      `
      : ""
  }

  <div class="atividade">

    <img
      id="atividade-imagem"
      src="${imagem}"
      alt="Atividade pedagógica"
    />

  </div>

</div>

<script>

(function () {

  const imagem =
    document.getElementById(
      "atividade-imagem"
    );

  const atividade =
    document.querySelector(
      ".atividade"
    );

  let imprimindo = false;

  /*
   * Mede o espaço REAL que sobrou
   * depois do cabeçalho.
   *
   * Depois aumenta a imagem o máximo
   * possível sem:
   *
   * - cortar;
   * - deformar;
   * - passar da borda;
   * - passar para outra página.
   */
  function ajustarImagem() {

    if (
      !imagem ||
      !atividade
    ) {
      return;
    }

    const estilo =
      window.getComputedStyle(
        atividade
      );

    const paddingHorizontal =
      parseFloat(
        estilo.paddingLeft || "0"
      ) +
      parseFloat(
        estilo.paddingRight || "0"
      );

    const paddingVertical =
      parseFloat(
        estilo.paddingTop || "0"
      ) +
      parseFloat(
        estilo.paddingBottom || "0"
      );

    const larguraDisponivel =
      atividade.clientWidth -
      paddingHorizontal;

    const alturaDisponivel =
      atividade.clientHeight -
      paddingVertical;

    const larguraOriginal =
      imagem.naturalWidth;

    const alturaOriginal =
      imagem.naturalHeight;

    if (
      larguraDisponivel <= 0 ||
      alturaDisponivel <= 0 ||
      larguraOriginal <= 0 ||
      alturaOriginal <= 0
    ) {
      return;
    }

    const escalaPelaLargura =
      larguraDisponivel /
      larguraOriginal;

    const escalaPelaAltura =
      alturaDisponivel /
      alturaOriginal;

    /*
     * Usamos a menor escala.
     *
     * Assim a atividade inteira
     * permanece dentro do quadro.
     *
     * Permitimos ampliar imagens
     * menores para aproveitar melhor
     * a folha.
     */
    const escala =
      Math.min(
        escalaPelaLargura,
        escalaPelaAltura
      );

    const larguraFinal =
      Math.floor(
        larguraOriginal * escala
      );

    const alturaFinal =
      Math.floor(
        alturaOriginal * escala
      );

    imagem.style.width =
      larguraFinal + "px";

    imagem.style.height =
      alturaFinal + "px";

    imagem.style.maxWidth =
      "100%";

    imagem.style.maxHeight =
      "100%";

    imagem.style.objectFit =
      "contain";

    imagem.style.objectPosition =
      "top center";

    imagem.style.margin =
      "0 auto";
  }

  function imprimir() {

    if (imprimindo) {
      return;
    }

    imprimindo = true;

    ajustarImagem();

    requestAnimationFrame(
      function () {

        requestAnimationFrame(
          function () {

            ajustarImagem();

            setTimeout(
              function () {

                window.focus();
                window.print();

              },
              150
            );

          }
        );

      }
    );
  }

  if (!imagem) {
    imprimir();
    return;
  }

  if (
    imagem.complete &&
    imagem.naturalWidth > 0
  ) {
    imprimir();
    return;
  }

  imagem.onload = imprimir;

  imagem.onerror =
    function () {
      window.focus();
      window.print();
    };

})();

<\/script>

</body>

</html>
  `);

  documentoImpressao.close();

  const removerIframe = () => {
    setTimeout(() => {
      iframe.remove();
    }, 500);
  };

  janelaImpressao.addEventListener(
    "afterprint",
    removerIframe,
    {
      once: true,
    }
  );

  /*
   * Segurança:
   * caso algum navegador não dispare
   * afterprint, o iframe não fica
   * preso indefinidamente na página.
   */
  setTimeout(() => {
    if (
      document.body.contains(iframe)
    ) {
      iframe.remove();
    }
  }, 120000);
}