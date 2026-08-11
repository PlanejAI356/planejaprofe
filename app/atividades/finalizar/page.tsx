"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Download,
  Italic,
  Save,
  Underline,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
} from "docx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

type ConfiguracaoAtividadeImagem = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  pedido?: string;
  quantidadeQuestoes?: number;
};

export default function FinalizarAtividadePage() {
  const router = useRouter();
  const cabecalhoRef = useRef<HTMLDivElement>(null);
  const paginaRef = useRef<HTMLDivElement>(null);

  const [imagem, setImagem] = useState("");
  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividadeImagem | null>(null);
  const [cabecalho, setCabecalho] = useState("");
  const [cabecalhoSalvo, setCabecalhoSalvo] =
    useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [baixandoPDF, setBaixandoPDF] = useState(false);

  useEffect(() => {
    try {
      const imagemSalva =
        localStorage.getItem("atividadeImagem");

      const configuracaoSalva =
        localStorage.getItem(
          "configuracaoAtividadeImagem"
        );

      const cabecalhoSalvoLocal =
        localStorage.getItem("cabecalhoAtividade") ||
        localStorage.getItem("cabecalhoAvaliacao") ||
        "";

      if (
        !imagemSalva ||
        !imagemSalva.startsWith("data:image/")
      ) {
        setErro(
          "Não encontrei a atividade gerada. Volte e gere uma nova atividade."
        );
        return;
      }

      setImagem(imagemSalva);

      if (configuracaoSalva) {
        setConfiguracao(
          JSON.parse(configuracaoSalva)
        );
      }

      setCabecalho(cabecalhoSalvoLocal);
      setCabecalhoSalvo(
        Boolean(cabecalhoSalvoLocal.trim())
      );
    } catch (error) {
      console.error(
        "Erro ao carregar a atividade:",
        error
      );

      setErro(
        "Não foi possível carregar os dados da atividade."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  const resumo = useMemo(() => {
    if (!configuracao) return "";

    return [
      configuracao.serie,
      configuracao.disciplina,
      configuracao.quantidadeQuestoes
        ? `${configuracao.quantidadeQuestoes} questões`
        : "",
    ]
      .filter(Boolean)
      .join(" • ");
  }, [configuracao]);

  function executarComando(
    comando: string,
    valor?: string
  ) {
    document.execCommand(
      comando,
      false,
      valor
    );

    cabecalhoRef.current?.focus();

    const html =
      cabecalhoRef.current?.innerHTML || "";

    setCabecalho(html);
    setCabecalhoSalvo(false);
  }

  function salvarCabecalho() {
    const novoCabecalho =
      cabecalhoRef.current?.innerHTML || "";

    const somenteTexto =
      cabecalhoRef.current?.innerText.trim() || "";

    if (!somenteTexto) {
      localStorage.removeItem("cabecalhoAtividade");

      setCabecalho("");
      setCabecalhoSalvo(false);
      setMensagem("Cabeçalho removido.");
      return;
    }

    localStorage.setItem(
      "cabecalhoAtividade",
      novoCabecalho
    );

    setCabecalho(novoCabecalho);
    setCabecalhoSalvo(true);

    setMensagem(
      "Cabeçalho salvo. Ele aparecerá nas próximas atividades."
    );
  }

  function obterHtmlCabecalho() {
    return (
      cabecalhoRef.current?.innerHTML ||
      cabecalho ||
      ""
    );
  }


  async function baixarPDF() {
    if (!paginaRef.current || !imagem) {
      alert("Nenhuma atividade foi encontrada.");
      return;
    }

    if (baixandoPDF) {
      return;
    }

    try {
      setBaixandoPDF(true);

      const conteudoPagina = paginaRef.current.innerHTML;

      const janelaImpressao = window.open(
        "",
        "_blank",
        "width=900,height=1100"
      );

      if (!janelaImpressao) {
        alert(
          "O navegador bloqueou a janela de impressão. Permita pop-ups para o PlanejAI e tente novamente."
        );
        return;
      }

      janelaImpressao.document.open();
      janelaImpressao.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="utf-8" />
            <title>Atividade PlanejAI</title>

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
                margin: 0;
                padding: 0;
                overflow: hidden;
                background: #ffffff;
                font-family: Arial, Helvetica, sans-serif;
                color: #000000;
              }

              .folha {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 7mm;
                overflow: hidden;
                border: 1px solid #000000;
                background: #ffffff;

                display: flex;
                flex-direction: column;
              }

              .cabecalho-preview {
                width: 100%;
                flex: 0 0 auto;
                margin-bottom: 3mm;
                overflow: hidden;
              }

              .cabecalho-preview table {
                width: 100% !important;
                border-collapse: collapse !important;
              }

              .cabecalho-preview td,
              .cabecalho-preview th {
                border: 1px solid #000000;
              }

              .cabecalho-preview img {
                max-width: 120px;
                max-height: 80px;
                object-fit: contain;
              }

              .folha > img {
                display: block;
                width: 100%;
                flex: 1 1 auto;
                min-height: 0;
                height: 100%;
                object-fit: contain;
                object-position: top center;
                margin: 0 auto;
              }
            </style>
          </head>

          <body>
            <div class="folha">
              ${conteudoPagina}
            </div>

            <script>
              window.addEventListener("load", function () {
                var imagens = Array.from(document.images);

                Promise.all(
                  imagens.map(function (img) {
                    if (img.complete) {
                      return Promise.resolve();
                    }

                    return new Promise(function (resolve) {
                      img.onload = resolve;
                      img.onerror = resolve;
                    });
                  })
                ).then(function () {
                  setTimeout(function () {
                    window.focus();
                    window.print();
                  }, 300);
                });
              });

              window.addEventListener("afterprint", function () {
                window.close();
              });
            <\/script>
          </body>
        </html>
      `);
      janelaImpressao.document.close();
    } catch (error) {
      console.error(
        "Erro ao preparar PDF:",
        error
      );

      alert(
        "Não foi possível preparar o PDF."
      );
    } finally {
      setBaixandoPDF(false);
    }
  }

  async function capturarPaginaComoPng() {
    if (!paginaRef.current) {
      throw new Error("A folha da atividade não foi encontrada.");
    }

    const elemento = paginaRef.current;

    /*
     * html2canvas captura a própria folha que o professor está vendo,
     * incluindo cabeçalho, tabela, logo, borda e imagem da atividade.
     * É mais estável do que montar SVG com foreignObject.
     */
    const canvas = await html2canvas(elemento, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    });

    const blobPng = await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Não foi possível criar a imagem da folha."
                )
              );
              return;
            }

            resolve(blob);
          },
          "image/png",
          1
        );
      }
    );

    return new Uint8Array(
      await blobPng.arrayBuffer()
    );
  }

  async function baixarWord() {
    if (!paginaRef.current || !imagem) {
      alert("Nenhuma atividade foi encontrada.");
      return;
    }

    try {
      /*
       * O Word recebe a folha completa como uma única imagem:
       * cabeçalho + borda + atividade.
       *
       * Assim o arquivo fica visualmente igual à prévia da tela
       * e não perde formatação do cabeçalho.
       */
      const bytesPagina =
        await capturarPaginaComoPng();

      const documento = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  width: 11906,
                  height: 16838,
                },
                margin: {
                  top: 200,
                  right: 200,
                  bottom: 200,
                  left: 200,
                },
              },
            },

            children: [
              new Paragraph({
                alignment: "center",
                spacing: {
                  before: 0,
                  after: 0,
                },
                children: [
                  new ImageRun({
                    data: bytesPagina,
                    transformation: {
                      width: 735,
                      height: 1040,
                    },
                    type: "png",
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const arquivo =
        await Packer.toBlob(documento);

      saveAs(
        arquivo,
        `atividade-planejai-${Date.now()}.docx`
      );
    } catch (error) {
      console.error(
        "Erro ao gerar Word:",
        error
      );

      alert(
        "Não foi possível gerar o arquivo Word."
      );
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-semibold text-emerald-700">
          Preparando atividade...
        </p>
      </main>
    );
  }

  if (erro || !imagem) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-red-700">
            {erro ||
              "Atividade não encontrada."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/atividades")
            }
            className="mt-5 cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white"
          >
            Voltar para atividades
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <style jsx global>{`
        .cabecalho-editor table,
        .cabecalho-preview table {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        .cabecalho-editor td,
        .cabecalho-editor th,
        .cabecalho-preview td,
        .cabecalho-preview th {
          border: 1px solid #000;
        }

        .cabecalho-editor img,
        .cabecalho-preview img {
          max-width: 120px;
          max-height: 80px;
          object-fit: contain;
        }

        .cabecalho-editor:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>

      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Finalizar atividade
            </h1>

            <p className="text-sm text-slate-700">
              Edite o cabeçalho e baixe a atividade em Word ou PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/atividades/resultado"
              )
            }
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
          >
            <ArrowLeft size={19} />
            Voltar para a atividade
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        {resumo && (
          <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
            {resumo}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-950">
              Cabeçalho da escola
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Copie o cabeçalho usado pela escola e cole na área abaixo. Você pode editar antes de baixar.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <button
                type="button"
                title="Negrito"
                onClick={() =>
                  executarComando("bold")
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <Bold size={18} />
              </button>

              <button
                type="button"
                title="Itálico"
                onClick={() =>
                  executarComando("italic")
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <Italic size={18} />
              </button>

              <button
                type="button"
                title="Sublinhado"
                onClick={() =>
                  executarComando("underline")
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <Underline size={18} />
              </button>

              <div className="mx-1 h-7 w-px bg-slate-300" />

              <button
                type="button"
                title="Alinhar à esquerda"
                onClick={() =>
                  executarComando(
                    "justifyLeft"
                  )
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <AlignLeft size={18} />
              </button>

              <button
                type="button"
                title="Centralizar"
                onClick={() =>
                  executarComando(
                    "justifyCenter"
                  )
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <AlignCenter size={18} />
              </button>

              <button
                type="button"
                title="Alinhar à direita"
                onClick={() =>
                  executarComando(
                    "justifyRight"
                  )
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <AlignRight size={18} />
              </button>
            </div>

            <div
  ref={cabecalhoRef}
  contentEditable
  suppressContentEditableWarning
  data-placeholder="COLE AQUI O CABEÇALHO DA SUA ESCOLA"
  onInput={() => {
    setCabecalhoSalvo(false);
    setMensagem("");
  }}
  onBlur={() => {
    const htmlAtual =
      cabecalhoRef.current?.innerHTML || "";

    setCabecalho(htmlAtual);
  }}
  className="cabecalho-editor mt-3 min-h-[130px] w-full overflow-x-auto rounded-lg border border-dashed border-slate-300 px-5 py-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
  dangerouslySetInnerHTML={{
    __html: cabecalho,
  }}
/>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p
                className={`text-xs font-semibold ${
                  cabecalhoSalvo
                    ? "text-emerald-700"
                    : "text-slate-500"
                }`}
              >
                {cabecalhoSalvo
                  ? "Cabeçalho salvo. Ele aparecerá nas próximas atividades."
                  : "Você pode alterar o cabeçalho desta atividade antes de baixar."}
              </p>

              <button
                type="button"
                onClick={salvarCabecalho}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-50"
              >
                <Save size={16} />
                Salvar cabeçalho
              </button>
            </div>

            {mensagem && (
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                {mensagem}
              </p>
            )}
          </div>

          <div className="bg-slate-100 p-4 sm:p-6">
            <div
              ref={paginaRef}
              className="mx-auto w-full max-w-[794px] border border-black bg-white p-5 shadow-md sm:p-6"
            >
              {cabecalho.trim() && (
                <div
                  className="cabecalho-preview mb-4 overflow-hidden"
                  dangerouslySetInnerHTML={{
                    __html: cabecalho,
                  }}
                />
              )}

              <img
                src={imagem}
                alt="Atividade pedagógica final"
                className="block h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={baixarWord}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <Download size={18} />
              Baixar Word
            </button>

            <button
              type="button"
              onClick={baixarPDF}
              disabled={baixandoPDF}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={18} />
              {baixandoPDF ? "Gerando PDF..." : "Baixar PDF"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}