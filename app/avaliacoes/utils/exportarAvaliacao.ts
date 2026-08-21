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

  /*
   * Na tela nova o cabeçalho exibido dentro da folha
   * usa .cabecalho-preview. Mantemos também
   * [data-placeholder] para compatibilidade.
   */
  const cabecalho =
    documentoClonado.querySelector<HTMLElement>(
      ".cabecalho-preview, [data-placeholder]"
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

  /*
   * A folha da tela já possui borda.
   * Aqui forçamos somente UMA borda preta,
   * sem criar uma segunda borda no body.
   */
  documentoClonado.style.border =
    "1px solid #000000";

  documentoClonado.style.boxShadow =
    "none";

  documentoClonado.style.width =
    "100%";

  documentoClonado.style.maxWidth =
    "100%";

  documentoClonado.style.minHeight =
    "0";

  documentoClonado.style.margin =
    "0";

  documentoClonado.style.padding =
    "4mm";

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
            margin: 6mm;
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
              "Times New Roman",
              Times,
              serif;
            font-size: 12pt;
            line-height: 1.15;
          }

          body {
            width: 100%;
          }

          .documento-exportacao {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: #ffffff;
          }

          .documento-exportacao,
          .documento-exportacao * {
            box-shadow: none !important;
          }

          .documento-exportacao > * {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            border: 1px solid #000000 !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }

          .cabecalho-avaliacao-exportacao {
            width: 100% !important;
            max-width: 100% !important;

            margin: 0 0 2.5mm 0 !important;

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

            padding: 1mm 1.5mm;

            vertical-align: middle;

            overflow-wrap: anywhere;

            font-family:
              "Times New Roman",
              Times,
              serif !important;

            font-size: 12pt !important;
            line-height: 1.15 !important;
          }

          .cabecalho-avaliacao-exportacao img {
            max-width: 32mm !important;
            max-height: 24mm !important;

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

            font-family:
              "Times New Roman",
              Times,
              serif !important;

            font-size: 12pt !important;
            line-height: 1.15 !important;

            overflow: visible !important;
          }

          .conteudo-avaliacao-exportacao,
          .conteudo-avaliacao-exportacao * {
            font-family:
              "Times New Roman",
              Times,
              serif !important;
          }

          .conteudo-avaliacao-exportacao p,
          .conteudo-avaliacao-exportacao div,
          .conteudo-avaliacao-exportacao h1,
          .conteudo-avaliacao-exportacao h2,
          .conteudo-avaliacao-exportacao h3,
          .conteudo-avaliacao-exportacao h4,
          .conteudo-avaliacao-exportacao h5,
          .conteudo-avaliacao-exportacao h6 {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            line-height: 1.15 !important;
          }

          .conteudo-avaliacao-exportacao h1,
          .conteudo-avaliacao-exportacao h2,
          .conteudo-avaliacao-exportacao h3,
          .conteudo-avaliacao-exportacao h4,
          .conteudo-avaliacao-exportacao h5,
          .conteudo-avaliacao-exportacao h6 {
            font-size: 12pt !important;
          }

          .conteudo-avaliacao-exportacao ul,
          .conteudo-avaliacao-exportacao ol {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            padding-left: 7mm !important;
          }

          .conteudo-avaliacao-exportacao li {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.15 !important;
          }

          .conteudo-avaliacao-exportacao img {
            max-width: 100% !important;
            height: auto !important;

            object-fit: contain;
          }

          .conteudo-avaliacao-exportacao p {
            orphans: 2;
            widows: 2;
          }

          .conteudo-avaliacao-exportacao table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .conteudo-avaliacao-exportacao td,
          .conteudo-avaliacao-exportacao th {
            padding: 1mm 1.5mm !important;
            line-height: 1.15 !important;
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