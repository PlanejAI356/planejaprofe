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

async function converterImagemParaDataUrl(src: string) {
  if (!src || src.startsWith("data:image/")) {
    return src;
  }

  try {
    const urlAbsoluta = new URL(src, window.location.href).href;
    const resposta = await fetch(urlAbsoluta);

    if (!resposta.ok) {
      return src;
    }

    const blob = await resposta.blob();

    return await new Promise<string>((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onload = () => {
        resolve(
          typeof leitor.result === "string"
            ? leitor.result
            : src
        );
      };

      leitor.onerror = () => reject(leitor.error);
      leitor.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

async function prepararHtmlCabecalho(
  cabecalhoElemento: HTMLElement | null
) {
  if (!cabecalhoElemento) {
    return "";
  }

  const clone = cabecalhoElemento.cloneNode(
    true
  ) as HTMLElement;

  /*
   * Muito importante:
   * transforma a logo/imagens do cabeçalho
   * em data URL quando possível.
   *
   * Assim a impressão não depende de blob URL,
   * carregamento externo ou do navegador do usuário.
   */
  const imagens = Array.from(
    clone.querySelectorAll("img")
  );

  await Promise.all(
    imagens.map(async (img) => {
      const src =
        img.getAttribute("src") || "";

      if (!src) {
        return;
      }

      const srcPreparado =
        await converterImagemParaDataUrl(src);

      if (srcPreparado) {
        img.setAttribute(
          "src",
          srcPreparado
        );
      }

      img.removeAttribute("loading");
      img.setAttribute(
        "decoding",
        "sync"
      );
    })
  );

  return clone.innerHTML;
}

function aguardarImagem(
  img: HTMLImageElement
) {
  if (
    img.complete &&
    img.naturalWidth > 0
  ) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const finalizar = () => resolve();

    img.addEventListener(
      "load",
      finalizar,
      { once: true }
    );

    img.addEventListener(
      "error",
      finalizar,
      { once: true }
    );

    /*
     * Segurança para não travar a exportação
     * caso algum navegador não dispare evento.
     */
    setTimeout(finalizar, 5000);
  });
}

async function aguardarTudoCarregar(
  documento: Document
) {
  const imagens = Array.from(
    documento.images
  );

  await Promise.all(
    imagens.map(aguardarImagem)
  );

  try {
    if ("fonts" in documento) {
      await documento.fonts.ready;
    }
  } catch {
    // Não impede a impressão.
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 250);
      });
    });
  });
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
   * Em vez de apenas copiar o HTML imediatamente,
   * preparamos o cabeçalho completo, inclusive a logo.
   */
  const cabecalhoHtml =
    await prepararHtmlCabecalho(
      cabecalhoElemento
    );

  const iframe =
    document.createElement("iframe");

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

.pagina {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 8mm;
  background: #ffffff !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.conteudo-folha {
  width: 100%;
  height: 100%;
  min-height: 0;
  border: 1px solid #000000;
  background: #ffffff !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cabecalho {
  width: 100%;
  flex: 0 0 auto;
  margin: 0;
  padding: 3mm 3mm 0 3mm;
  overflow: visible;
  background: #ffffff !important;
}

.cabecalho table {
  display: table !important;
  width: 100% !important;
  max-width: 100% !important;
  border-collapse: collapse !important;
  table-layout: fixed;
  margin: 0 !important;
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
  object-fit: contain !important;
  display: block !important;
}

.atividade {
  width: 100%;
  flex: 1 1 0;
  min-height: 0;
  padding: 3mm;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
  background: #ffffff !important;
}

.atividade img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: top center;
  margin: 0 auto;
  background: #ffffff !important;
  filter:
    brightness(1.02)
    contrast(1.01);
}

@media print {
  html,
  body {
    width: 210mm !important;
    height: 297mm !important;
    background: #ffffff !important;
  }

  .pagina {
    width: 210mm !important;
    height: 297mm !important;
    background: #ffffff !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .conteudo-folha,
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
  <div class="conteudo-folha">

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

  function ajustarImagem() {
    if (!imagem || !atividade) {
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

    const escala =
      Math.min(
        larguraDisponivel /
          larguraOriginal,
        alturaDisponivel /
          alturaOriginal
      );

    imagem.style.width =
      Math.floor(
        larguraOriginal * escala
      ) + "px";

    imagem.style.height =
      Math.floor(
        alturaOriginal * escala
      ) + "px";

    imagem.style.maxWidth = "100%";
    imagem.style.maxHeight = "100%";
    imagem.style.objectFit = "contain";
    imagem.style.objectPosition =
      "top center";
    imagem.style.margin = "0 auto";
  }

  window.__planejaiAjustarImagem =
    ajustarImagem;
})();
<\/script>

</body>
</html>
  `);

  documentoImpressao.close();

  /*
   * CORREÇÃO PRINCIPAL:
   * espera TODAS as imagens do documento,
   * inclusive a logo do cabeçalho.
   */
  await aguardarTudoCarregar(
    documentoImpressao
  );

  const ajustar =
    (
      janelaImpressao as Window & {
        __planejaiAjustarImagem?: () => void;
      }
    ).__planejaiAjustarImagem;

  ajustar?.();

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 200);
      });
    });
  });

  const removerIframe = () => {
    setTimeout(() => {
      if (
        document.body.contains(iframe)
      ) {
        iframe.remove();
      }
    }, 800);
  };

  janelaImpressao.addEventListener(
    "afterprint",
    removerIframe,
    { once: true }
  );

  janelaImpressao.focus();
  janelaImpressao.print();

  /*
   * Segurança:
   * remove o iframe se afterprint
   * não disparar em algum navegador.
   */
  setTimeout(() => {
    if (
      document.body.contains(iframe)
    ) {
      iframe.remove();
    }
  }, 120000);
}