type OpcoesExportacao = {
  tituloArquivo?: string;
};

function copiarEstilosDaPagina() {
  return Array.from(
    document.querySelectorAll(
      'link[rel="stylesheet"], style'
    )
  )
    .map((elemento) => elemento.outerHTML)
    .join("\n");
}

function limparNomeArquivo(nome: string) {
  const nomeLimpo = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return nomeLimpo || "avaliacao";
}

export async function exportarAvaliacao(
  elemento: HTMLElement,
  opcoes: OpcoesExportacao = {}
) {
  const tituloArquivo = limparNomeArquivo(
    opcoes.tituloArquivo || "avaliacao"
  );

  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";

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
      "Não foi possível preparar a avaliação para exportação."
    );
  }

  const estilosPagina =
    copiarEstilosDaPagina();

  const documentoClonado =
    elemento.cloneNode(true) as HTMLElement;

  documentoClonado.removeAttribute("id");

  documentoClonado
    .querySelectorAll(
      [
        "button",
        "[data-nao-exportar]",
        ".nao-exportar",
      ].join(",")
    )
    .forEach((item) => item.remove());

  documentoClonado
    .querySelectorAll<HTMLElement>(
      "[contenteditable='true']"
    )
    .forEach((item) => {
      item.removeAttribute(
        "contenteditable"
      );
    });

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

        <title>${tituloArquivo}</title>

        ${estilosPagina}

        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body {
            width: 100%;
            color: #000000;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          #documento-exportacao {
            width: 100% !important;
            max-width: none !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          #documento-exportacao img {
            max-width: 100% !important;
            height: auto !important;
          }

          #documento-exportacao button,
          #documento-exportacao .nao-exportar,
          #documento-exportacao [data-nao-exportar] {
            display: none !important;
          }

          .questao-avaliacao,
          [data-questao-avaliacao] {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .cabecalho-avaliacao,
          [data-cabecalho-avaliacao] {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          textarea,
          input {
            border: 0 !important;
            outline: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          @media print {
            body {
              background: #ffffff !important;
            }

            #documento-exportacao {
              display: block !important;
            }
          }
        </style>
      </head>

      <body>
        <main id="documento-exportacao">
          ${documentoClonado.outerHTML}
        </main>
      </body>
    </html>
  `);

  documentoImpressao.close();

  await new Promise<void>((resolve) => {
    const imagens = Array.from(
      documentoImpressao.images
    );

    if (imagens.length === 0) {
      resolve();
      return;
    }

    let imagensFinalizadas = 0;

    function finalizarImagem() {
      imagensFinalizadas += 1;

      if (
        imagensFinalizadas ===
        imagens.length
      ) {
        resolve();
      }
    }

    imagens.forEach((imagem) => {
      if (imagem.complete) {
        finalizarImagem();
        return;
      }

      imagem.addEventListener(
        "load",
        finalizarImagem,
        { once: true }
      );

      imagem.addEventListener(
        "error",
        finalizarImagem,
        { once: true }
      );
    });
  });

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 500);
  });

  janelaImpressao.focus();
  janelaImpressao.print();

  setTimeout(() => {
    iframe.remove();
  }, 1500);
}