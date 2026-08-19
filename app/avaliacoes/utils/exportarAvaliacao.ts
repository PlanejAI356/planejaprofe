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

    const possuiImagem =
      Boolean(cabecalho.querySelector("img"));

    if (
      !cabecalho.innerText.trim() &&
      !possuiImagem
    ) {
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
            color: #000000 !important;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          body {
            width: 100%;
          }

          /*
           * Borda externa da folha impressa.
           * Ela aparece também ao salvar como PDF.
           */
          body::before {
            content: "";
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            border: 1px solid #000000;
            pointer-events: none;
            z-index: 9999;
          }

          .documento-exportacao {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 4mm;
            background: #ffffff;
          }

          .documento-exportacao,
          .documento-exportacao * {
            box-shadow: none !important;
          }

          .cabecalho-avaliacao-exportacao {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 0 5mm 0 !important;
            page-break-inside: avoid;
            break-inside: avoid;
            overflow: visible !important;
          }

          .cabecalho-avaliacao-exportacao table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
          }

          .cabecalho-avaliacao-exportacao td,
          .cabecalho-avaliacao-exportacao th {
            border: 1px solid #000000;
            padding: 1.5mm 2mm;
            vertical-align: middle;
            overflow-wrap: anywhere;
            line-height: 1.2;
          }

          .cabecalho-avaliacao-exportacao img {
            max-width: 30mm !important;
            max-height: 22mm !important;
            width: auto !important;
            height: auto !important;
            object-fit: contain;
          }

          .conteudo-avaliacao-exportacao {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #000000 !important;
            overflow: visible !important;
          }

          .conteudo-avaliacao-exportacao img {
            max-width: 100% !important;
            height: auto !important;
            object-fit: contain;
          }

          .conteudo-avaliacao-exportacao p {
            orphans: 3;
            widows: 3;
          }

          .conteudo-avaliacao-exportacao table {
            max-width: 100% !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          button,
          [data-nao-exportar],
          .nao-exportar {
            display: none !important;
          }

          @media print {
            html,
            body {
              width: auto !important;
              height: auto !important;
              overflow: visible !important;
            }

            .documento-exportacao {
              width: 100% !important;
              max-width: 100% !important;
              overflow: visible !important;
            }

            .cabecalho-avaliacao-exportacao {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .conteudo-avaliacao-exportacao {
              overflow: visible !important;
            }
          }
        </style>
      </head>

      <body>
        <div class="documento-exportacao">
          ${documentoClonado.outerHTML}
        </div>

        <script>
          (function () {
            function imprimir() {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 500);
            }

            const imagens =
              Array.from(
                document.images || []
              );

            if (imagens.length === 0) {
              imprimir();
              return;
            }

            let carregadas = 0;

            function finalizarImagem() {
              carregadas += 1;

              if (
                carregadas >= imagens.length
              ) {
                imprimir();
              }
            }

            imagens.forEach(function (imagem) {
              if (imagem.complete) {
                finalizarImagem();
                return;
              }

              imagem.addEventListener(
                "load",
                finalizarImagem,
                {
                  once: true,
                }
              );

              imagem.addEventListener(
                "error",
                finalizarImagem,
                {
                  once: true,
                }
              );
            });
          })();
        <\/script>
      </body>
    </html>
  `);

  documentoImpressao.close();

  janelaImpressao.addEventListener(
    "afterprint",
    () => {
      setTimeout(() => {
        iframe.remove();
      }, 300);
    },
    {
      once: true,
    }
  );
}