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
    throw new Error(
      "A imagem da atividade não foi encontrada."
    );
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

          /*
           * FOLHA A4
           *
           * A borda envolve CABEÇALHO + ATIVIDADE,
           * como uma única folha.
           */
          .pagina {
            position: relative;

            width: 210mm;
            height: 297mm;

            margin: 0;
            padding: 5mm;

            background: #ffffff;

            display: flex;
            flex-direction: column;

            overflow: hidden;

            border: 1.2px solid #000000;
          }

          /*
           * Segunda linha da borda.
           * Dá o acabamento parecido com a referência.
           */
          .pagina::before {
            content: "";

            position: absolute;
            inset: 2mm;

            border: 0.8px solid #000000;

            pointer-events: none;
            z-index: 0;
          }

          .conteudo-pagina {
            position: relative;
            z-index: 1;

            width: 100%;
            height: 100%;

            display: flex;
            flex-direction: column;

            min-height: 0;
          }

          /*
           * CABEÇALHO
           *
           * Mantém o cabeçalho real do professor.
           * Ele ocupa a MESMA largura útil da atividade.
           */
          .cabecalho {
            width: 100%;

            flex: 0 0 auto;

            margin: 0;
            padding: 0;

            overflow: visible;
          }

          .cabecalho table {
            width: 100% !important;

            border-collapse: collapse !important;
            table-layout: fixed;
          }

          .cabecalho td,
          .cabecalho th {
            border: 1px solid #000000;

            padding: 1mm 1.4mm;

            vertical-align: middle;

            overflow-wrap: anywhere;

            line-height: 1.08;
          }

          .cabecalho img {
            display: block;

            max-width: 27mm !important;
            max-height: 19mm !important;

            width: auto;
            height: auto;

            object-fit: contain;

            margin: 0 auto;
          }

          /*
           * ATIVIDADE
           *
           * Começa logo abaixo do cabeçalho e usa
           * exatamente a mesma largura interna.
           */
          .atividade {
            width: 100%;

            flex: 1 1 0;
            min-height: 0;

            margin-top: 1.5mm;

            display: flex;
            align-items: flex-start;
            justify-content: center;

            overflow: hidden;

            background: #ffffff;
          }

          /*
           * A imagem não é deformada.
           *
           * Primeiro tentamos ocupar toda a largura.
           * Se a altura ficar maior que o espaço restante,
           * o JavaScript reduz proporcionalmente.
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
          }

          @media print {
            html,
            body {
              width: 210mm;
              height: 297mm;
            }

            .pagina {
              width: 210mm;
              height: 297mm;

              break-inside: avoid;
              page-break-inside: avoid;
            }

            .cabecalho,
            .atividade {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>

      <body>
        <div class="pagina">
          <div class="conteudo-pagina">

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
            const imagem = document.getElementById(
              "atividade-imagem"
            );

            const atividade =
              document.querySelector(".atividade");

            /*
             * ENCAIXE AUTOMÁTICO DA ATIVIDADE
             *
             * Não recortamos margens brancas da imagem.
             * O navegador mede o espaço REAL disponível
             * depois que o cabeçalho foi renderizado.
             *
             * A imagem é ampliada o máximo possível,
             * mantendo a proporção original e sem cortar.
             */
            function ajustarImagem() {
              if (!imagem || !atividade) {
                return;
              }

              const larguraDisponivel =
                atividade.clientWidth;

              const alturaDisponivel =
                atividade.clientHeight;

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

              /*
               * Calcula duas escalas:
               * - quanto caberia pela largura;
               * - quanto caberia pela altura.
               *
               * Usa a menor para garantir que a imagem
               * inteira permaneça dentro da área útil.
               */
              const escalaLargura =
                larguraDisponivel / larguraOriginal;

              const escalaAltura =
                alturaDisponivel / alturaOriginal;

              const escala = Math.min(
                escalaLargura,
                escalaAltura
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

              imagem.style.maxWidth = "100%";
              imagem.style.maxHeight = "100%";

              imagem.style.objectFit = "contain";
              imagem.style.objectPosition =
                "top center";

              imagem.style.margin = "0 auto";
            }

            function imprimir() {
              setTimeout(
                function () {
                  window.focus();
                  window.print();
                },
                350
              );
            }

            function prepararEImprimir() {
              /*
               * Espera o navegador terminar de calcular
               * a altura real do cabeçalho e da área
               * restante antes de dimensionar a imagem.
               */
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  ajustarImagem();
                  imprimir();
                });
              });
            }

            if (!imagem) {
                imprimir();
                return;
              }

              const recortada =
                recortarMargensBrancas(imagem);

              if (!recortada) {
                ajustarImagem();
                imprimir();
                return;
              }

              /*
               * Troca pela versão recortada.
               */
              imagem.onload = function () {
                ajustarImagem();
                imprimir();
              };

              imagem.src = recortada;
            }

            if (!imagem) {
              imprimir();
              return;
            }

            if (imagem.complete) {
              prepararEImprimir();
              return;
            }

            imagem.onload =
              prepararEImprimir;

            imagem.onerror =
              imprimir;
          })();
        <\/script>

      </body>
    </html>
  `);

  documentoImpressao.close();

  janelaImpressao.addEventListener(
    "afterprint",
    () => {
      setTimeout(
        () => {
          iframe.remove();
        },
        300
      );
    },
    {
      once: true,
    }
  );
}