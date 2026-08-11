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
  if (!imagem || !imagem.startsWith("data:image/")) {
    throw new Error("A imagem da atividade não foi encontrada.");
  }

  const tituloArquivo = limparNomeArquivo(
    opcoes.tituloArquivo || "atividade"
  );

  const cabecalhoHtml =
    cabecalhoElemento?.innerHTML || "";

  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";

  iframe.setAttribute("aria-hidden", "true");

  document.body.appendChild(iframe);

  const janelaImpressao = iframe.contentWindow;
  const documentoImpressao = iframe.contentDocument;

  if (!janelaImpressao || !documentoImpressao) {
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

        <title>${escaparHtml(tituloArquivo)}</title>

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
            font-family: Arial, Helvetica, sans-serif;
            color: #000000;
          }

          body {
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
          }

          .pagina {
            width: 210mm;
            height: 297mm;
            background: #ffffff;
            padding: 10mm;

            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .cabecalho {
            width: 100%;
            flex: 0 0 auto;
            max-height: 38mm;
            margin: 0 0 4mm 0;
            overflow: hidden;
          }

          .cabecalho table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed;
          }

          .cabecalho td,
          .cabecalho th {
            border: 1px solid #000000;
            padding: 1.5mm 2mm;
            vertical-align: middle;
            overflow-wrap: anywhere;
          }

          .cabecalho img {
            max-width: 28mm !important;
            max-height: 20mm !important;
            object-fit: contain;
          }

          .atividade {
            width: 100%;
            flex: 1 1 auto;
            min-height: 0;

            display: flex;
            align-items: flex-start;
            justify-content: center;
            overflow: hidden;
            background: #ffffff;
          }

          .atividade img {
            display: block;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            object-fit: contain;
            object-position: top center;
            margin: 0 auto;
            background: #ffffff;
          }

          @media print {
            html,
            body {
              width: 210mm;
              height: 297mm;
            }

            .pagina {
              break-inside: avoid;
              page-break-inside: avoid;
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

            function imprimir() {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 250);
            }

            if (!imagem) {
              imprimir();
              return;
            }

            if (imagem.complete) {
              imprimir();
              return;
            }

            imagem.onload = imprimir;
            imagem.onerror = imprimir;
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
    { once: true }
  );
}