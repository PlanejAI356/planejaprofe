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

function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function prepararDocumentoClonado(
  documentoClonado: HTMLElement
) {
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

  const cabecalho =
    documentoClonado.querySelector<HTMLElement>(
      "[data-placeholder]"
    );

  if (cabecalho) {
    cabecalho.classList.add(
      "cabecalho-avaliacao-exportacao"
    );

    cabecalho.removeAttribute(
      "data-placeholder"
    );

    cabecalho.removeAttribute(
      "contenteditable"
    );

    if (!cabecalho.innerText.trim()) {
      cabecalho.innerHTML = "";
    }
  }

  const editaveis = Array.from(
    documentoClonado.querySelectorAll<HTMLElement>(
      "[contenteditable='true']"
    )
  );

  const conteudoAvaliacao =
    editaveis.find(
      (item) => item !== cabecalho
    ) || null;

  if (conteudoAvaliacao) {
    conteudoAvaliacao.classList.add(
      "conteudo-avaliacao-exportacao"
    );
  }

  documentoClonado
    .querySelectorAll<HTMLElement>(
      "[contenteditable='true']"
    )
    .forEach((item) => {
      item.removeAttribute(
        "contenteditable"
      );
    });

  documentoClonado
    .querySelectorAll<HTMLParagraphElement>(
      "p"
    )
    .forEach((paragrafo) => {
      const texto = paragrafo.innerText
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

      const ehMensagemCabecalho =
        texto.includes(
          "copie o cabeçalho usado pela escola"
        ) ||
        texto.includes(
          "cabeçalho salvo. ele aparecerá"
        );

      if (ehMensagemCabecalho) {
        const bloco =
          paragrafo.parentElement;

        if (bloco) {
          bloco.remove();
        } else {
          paragrafo.remove();
        }
      }
    });
}

export async function exportarAvaliacao(
  elemento: HTMLElement,
  opcoes: OpcoesExportacao = {}
) {
  const tituloArquivo = limparNomeArquivo(
    opcoes.tituloArquivo || "avaliacao"
  );

  const iframe =
    document.createElement("iframe");

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

  prepararDocumentoClonado(
    documentoClonado
  );

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

        ${estilosPagina}

        <style>
          @page {
            size: A4 portrait;
            margin: 7mm;
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
            font-size: 10.5pt;
            line-height: 1.24;
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

          .cabecalho-avaliacao-exportacao {
            display: block !important;
            width: 100% !important;
            min-height: 78px !important;
            margin: 0 0 7px !important;
            padding: 6px 8px !important;
            border: 1px solid #64748b !important;
            border-radius: 3px !important;
            background: #ffffff !important;
            text-align: center !important;
            overflow: hidden !important;
            box-shadow: none !important;
          }

          .conteudo-avaliacao-exportacao {
            min-height: auto !important;
            font-size: 10.5pt !important;
            line-height: 1.24 !important;
            color: #000000 !important;
          }

          .conteudo-avaliacao-exportacao > div {
            margin-top: 0 !important;
            margin-bottom: 6px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .conteudo-avaliacao-exportacao > div:first-child {
            margin: 4px 0 8px !important;
            text-align: center !important;
            font-size: 14pt !important;
            line-height: 1.15 !important;
            font-weight: 700 !important;
          }

          .conteudo-avaliacao-exportacao p {
            margin-top: 0 !important;
            margin-bottom: 2px !important;
            line-height: 1.24 !important;
          }

          .conteudo-avaliacao-exportacao strong {
            font-weight: 700 !important;
          }

          .conteudo-avaliacao-exportacao img {
            display: block !important;
            width: auto !important;
            max-width: 290px !important;
            max-height: 230px !important;
            height: auto !important;
            margin: 3px auto 4px !important;
            object-fit: contain !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .conteudo-avaliacao-exportacao.columns-2 {
            column-gap: 14px !important;
            column-rule: 1px solid #cbd5e1 !important;
          }

          .conteudo-avaliacao-exportacao.columns-2 img {
            max-width: 210px !important;
            max-height: 190px !important;
          }

          .conteudo-avaliacao-exportacao div[style*="height:28px"] {
            height: 20px !important;
          }

          .conteudo-avaliacao-exportacao div[style*="margin-bottom:20px"] {
            margin-bottom: 6px !important;
          }

          .conteudo-avaliacao-exportacao div[style*="margin:16px 0"] {
            margin: 3px 0 4px !important;
          }

          .conteudo-avaliacao-exportacao div[style*="margin:8px 0"] {
            margin: 3px 0 !important;
          }

          .conteudo-avaliacao-exportacao div[style*="padding:8px"] {
            padding: 5px !important;
          }

          .conteudo-avaliacao-exportacao div[style*="gap:24px"] {
            gap: 12px !important;
          }

          #documento-exportacao button,
          #documento-exportacao .nao-exportar,
          #documento-exportacao [data-nao-exportar] {
            display: none !important;
          }

          .questao-avaliacao,
          [data-questao-avaliacao] {
            margin-bottom: 6px !important;
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
            html,
            body {
              width: 100% !important;
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