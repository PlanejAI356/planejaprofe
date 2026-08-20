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

import { exportarAtividade } from "../utils/exportarAtividade";
import { exportarAtividadeWord } from "../utils/exportarAtividadeWord";

type ConfiguracaoAtividadeImagem = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  pedido?: string;
  quantidadeQuestoes?: number;
};

export default function FinalizarAtividadePage() {
  const router = useRouter();

  const cabecalhoRef =
    useRef<HTMLDivElement>(null);

  const [imagem, setImagem] =
    useState("");

  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividadeImagem | null>(
      null
    );

  const [cabecalho, setCabecalho] =
    useState("");

  const [
    cabecalhoSalvo,
    setCabecalhoSalvo,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [
    versaoSelecionada,
    setVersaoSelecionada,
  ] = useState<"aluno" | "professor">(
    "aluno"
  );

  useEffect(() => {
    try {
      /*
       * A imagem original do aluno já está
       * salva no localStorage.
       */
      const imagemAluno =
        localStorage.getItem(
          "atividadeImagem"
        );

      /*
       * Quando existe gabarito, a cópia
       * do professor fica salva aqui.
       */
      const imagemProfessor =
        localStorage.getItem(
          "atividadeImagemProfessor"
        );

      const configuracaoSalva =
        localStorage.getItem(
          "configuracaoAtividadeImagem"
        );

      /*
       * Descobre qual versão estava sendo
       * visualizada antes de clicar em
       * "Adicionar cabeçalho".
       */
      const versaoSalva =
        localStorage.getItem(
          "atividadeVersaoSelecionada"
        );

      const versaoAtual:
        | "aluno"
        | "professor" =
        versaoSalva === "professor"
          ? "professor"
          : "aluno";

      setVersaoSelecionada(
        versaoAtual
      );

      /*
       * Escolhe a imagem correta.
       *
       * Professor:
       * usa a imagem com gabarito.
       *
       * Aluno:
       * usa a atividade normal.
       *
       * Se por algum motivo não existir
       * imagem do professor, volta para
       * a imagem do aluno.
       */
      const imagemSalva =
        versaoAtual === "professor" &&
        imagemProfessor?.startsWith(
          "data:image/"
        )
          ? imagemProfessor
          : imagemAluno;

      /*
       * Recupera o cabeçalho salvo.
       *
       * Mantemos também cabecalhoAvaliacao
       * como alternativa para não perder
       * cabeçalhos antigos que já tenham
       * sido salvos.
       */
      const cabecalhoSalvoLocal =
        localStorage.getItem(
          "cabecalhoAtividade"
        ) ||
        localStorage.getItem(
          "cabecalhoAvaliacao"
        ) ||
        "";

      if (
        !imagemSalva ||
        !imagemSalva.startsWith(
          "data:image/"
        )
      ) {
        setErro(
          "Não encontrei a atividade gerada. Volte e gere uma nova atividade."
        );

        return;
      }

      setImagem(imagemSalva);

      if (configuracaoSalva) {
        try {
          setConfiguracao(
            JSON.parse(
              configuracaoSalva
            )
          );
        } catch (error) {
          console.error(
            "Erro ao carregar configuração da atividade:",
            error
          );

          setConfiguracao(null);
        }
      }

      setCabecalho(
        cabecalhoSalvoLocal
      );

      setCabecalhoSalvo(
        Boolean(
          cabecalhoSalvoLocal.trim()
        )
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
    if (!configuracao) {
      return "";
    }

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

  function arquivoParaDataUrl(
    arquivo: File
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onload = () => {
        if (typeof leitor.result === "string") {
          resolve(leitor.result);
          return;
        }

        reject(
          new Error(
            "Não foi possível converter a imagem."
          )
        );
      };

      leitor.onerror = () => {
        reject(
          new Error(
            "Não foi possível ler a imagem."
          )
        );
      };

      leitor.readAsDataURL(arquivo);
    });
  }

  async function incorporarImagensDoCabecalho() {
    const editor = cabecalhoRef.current;

    if (!editor) {
      return;
    }

    const imagens = Array.from(
      editor.querySelectorAll<HTMLImageElement>("img")
    );

    for (const imagem of imagens) {
      const origem =
        imagem.getAttribute("src") || "";

      if (
        !origem ||
        origem.startsWith("data:")
      ) {
        continue;
      }

      /*
       * Imagens coladas do Word/Google Docs podem
       * usar endereços temporários. Tentamos
       * incorporá-las como base64 para que não
       * desapareçam depois de salvar ou exportar.
       */
      try {
        const resposta = await fetch(origem);

        if (!resposta.ok) {
          continue;
        }

        const blob = await resposta.blob();

        if (!blob.type.startsWith("image/")) {
          continue;
        }

        const arquivo = new File(
          [blob],
          "imagem-cabecalho",
          {
            type: blob.type,
          }
        );

        imagem.src =
          await arquivoParaDataUrl(arquivo);
      } catch {
        /*
         * Se a origem não puder ser acessada,
         * mantemos o HTML original sem impedir
         * que o cabeçalho seja colado.
         */
      }
    }
  }

  async function processarColagemCabecalho(
    evento: React.ClipboardEvent<HTMLDivElement>
  ) {
    const clipboard =
      evento.clipboardData;

    if (!clipboard) {
      return;
    }

    const itens = Array.from(
      clipboard.items || []
    );

    const arquivosImagem = itens
      .filter(
        (item) =>
          item.kind === "file" &&
          item.type.startsWith("image/")
      )
      .map((item) => item.getAsFile())
      .filter(
        (arquivo): arquivo is File =>
          Boolean(arquivo)
      );

    const htmlColado =
      clipboard.getData("text/html");

    /*
     * Quando o cabeçalho vem do Word/Google Docs,
     * preservamos tabela e formatação e depois
     * tentamos incorporar as imagens.
     */
    if (htmlColado) {
      window.setTimeout(async () => {
        await incorporarImagensDoCabecalho();

        const htmlAtual =
          cabecalhoRef.current
            ?.innerHTML || "";

        setCabecalho(htmlAtual);
        setCabecalhoSalvo(false);
        setMensagem("");
      }, 0);

      return;
    }

    /*
     * Se a área de transferência tiver uma
     * imagem real, convertemos para base64.
     */
    if (arquivosImagem.length > 0) {
      evento.preventDefault();

      try {
        for (const arquivo of arquivosImagem) {
          const dataUrl =
            await arquivoParaDataUrl(
              arquivo
            );

          document.execCommand(
            "insertImage",
            false,
            dataUrl
          );
        }

        const htmlAtual =
          cabecalhoRef.current
            ?.innerHTML || "";

        setCabecalho(htmlAtual);
        setCabecalhoSalvo(false);
        setMensagem("");
      } catch (error) {
        console.error(
          "Erro ao colar imagem no cabeçalho:",
          error
        );

        setMensagem(
          "Não foi possível colar a imagem do cabeçalho."
        );
      }

      return;
    }

    window.setTimeout(() => {
      const htmlAtual =
        cabecalhoRef.current
          ?.innerHTML || "";

      setCabecalho(htmlAtual);
      setCabecalhoSalvo(false);
      setMensagem("");
    }, 0);
  }

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
      cabecalhoRef.current
        ?.innerHTML || "";

    setCabecalho(html);

    setCabecalhoSalvo(false);

    setMensagem("");
  }

  function salvarCabecalho() {
    const novoCabecalho =
      cabecalhoRef.current
        ?.innerHTML || "";

    const somenteTexto =
      cabecalhoRef.current
        ?.innerText.trim() || "";

    /*
     * Permite salvar cabeçalhos que
     * contenham apenas imagem/logo.
     */
    const possuiImagem =
      Boolean(
        cabecalhoRef.current?.querySelector(
          "img"
        )
      );

    if (
      !somenteTexto &&
      !possuiImagem
    ) {
      localStorage.removeItem(
        "cabecalhoAtividade"
      );

      setCabecalho("");

      setCabecalhoSalvo(false);

      setMensagem(
        "Cabeçalho removido."
      );

      return;
    }

    try {
      localStorage.setItem(
        "cabecalhoAtividade",
        novoCabecalho
      );

      setCabecalho(
        novoCabecalho
      );

      setCabecalhoSalvo(true);

      setMensagem(
        "Cabeçalho salvo. Ele aparecerá nas próximas atividades."
      );
    } catch (error) {
      console.error(
        "Erro ao salvar cabeçalho:",
        error
      );

      setMensagem(
        "Não foi possível salvar o cabeçalho."
      );
    }
  }

  async function baixarPDF() {
    if (!imagem) {
      alert(
        "Nenhuma atividade foi encontrada."
      );

      return;
    }

    try {
      await exportarAtividade(
        cabecalhoRef.current,
        imagem,
        {
          tituloArquivo:
            versaoSelecionada ===
            "professor"
              ? "atividade-planejai-gabarito"
              : "atividade-planejai",
        }
      );
    } catch (error) {
      console.error(
        "Erro ao exportar PDF da atividade:",
        error
      );

      alert(
        "Não foi possível preparar o PDF da atividade."
      );
    }
  }

  async function baixarWord() {
    if (!imagem) {
      alert(
        "Nenhuma atividade foi encontrada."
      );

      return;
    }

    try {
      await exportarAtividadeWord(
        cabecalhoRef.current,
        imagem,
        {
          tituloArquivo:
            versaoSelecionada ===
            "professor"
              ? "atividade-planejai-gabarito"
              : "atividade-planejai",
        }
      );
    } catch (error) {
      console.error(
        "Erro ao gerar Word da atividade:",
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
              router.push(
                "/atividades"
              )
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
          content: attr(
            data-placeholder
          );
          color: #94a3b8;
          pointer-events: none;
        }

        .cabecalho-editor p,
        .cabecalho-preview p {
          margin-top: 0;
          margin-bottom: 4px;
        }

        .cabecalho-editor,
        .cabecalho-preview {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
        }

        .cabecalho-editor {
          overflow-x: auto;
        }

        .cabecalho-preview {
          overflow: visible;
        }

        .cabecalho-editor > *,
        .cabecalho-preview > * {
          max-width: 100% !important;
        }
      `}</style>

      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Finalizar atividade
            </h1>

            <p className="text-sm text-slate-700">
              Edite o cabeçalho e baixe
              a atividade em Word ou PDF.
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
              Copie o cabeçalho usado
              pela escola e cole na área
              abaixo. Você pode editar
              antes de baixar.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <button
                type="button"
                title="Negrito"
                onClick={() =>
                  executarComando(
                    "bold"
                  )
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <Bold size={18} />
              </button>

              <button
                type="button"
                title="Itálico"
                onClick={() =>
                  executarComando(
                    "italic"
                  )
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <Italic size={18} />
              </button>

              <button
                type="button"
                title="Sublinhado"
                onClick={() =>
                  executarComando(
                    "underline"
                  )
                }
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
              >
                <Underline
                  size={18}
                />
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
                <AlignLeft
                  size={18}
                />
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
                <AlignCenter
                  size={18}
                />
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
                <AlignRight
                  size={18}
                />
              </button>
            </div>

            <div
              ref={cabecalhoRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="COLE AQUI O CABEÇALHO DA SUA ESCOLA"
              onPaste={
                processarColagemCabecalho
              }
              onInput={() => {
                setCabecalhoSalvo(
                  false
                );

                setMensagem("");
              }}
              onBlur={() => {
                const htmlAtual =
                  cabecalhoRef
                    .current
                    ?.innerHTML || "";

                setCabecalho(
                  htmlAtual
                );
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
                onClick={
                  salvarCabecalho
                }
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
              className="mx-auto flex aspect-[210/297] w-full max-w-[794px] flex-col overflow-hidden bg-white px-[4.76%] py-[3.37%] shadow-md"
              style={{
                boxSizing:
                  "border-box",
              }}
            >
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-black bg-white">
                {cabecalho.trim() && (
                  <div
                    className="cabecalho-preview w-full shrink-0"
                    dangerouslySetInnerHTML={{
                      __html:
                        cabecalho,
                    }}
                  />
                )}

                <div className="flex min-h-0 flex-1 overflow-hidden bg-white p-[1.5%]">
                  <img
                    src={imagem}
                    alt={
                      versaoSelecionada ===
                      "professor"
                        ? "Atividade pedagógica com gabarito"
                        : "Atividade pedagógica final"
                    }
                    className="block h-full w-full bg-white object-contain object-top"
                    style={{
                      filter:
                        "brightness(1.02) contrast(1.01)",
                      transform:
                        "scale(1.08)",
                      transformOrigin:
                        "top center",
                    }}
                  />
                </div>
              </div>
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
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800"
            >
              <Download size={18} />

              Baixar PDF
            </button>
          </div>
        </div>
            </section>
    </main>
  );
}