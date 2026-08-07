"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Pencil,
  Printer,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ConfiguracaoAtividadeImagem = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  pedido?: string;
  quantidadeQuestoes?: number;
};

const CABECALHO_PADRAO =
  "<strong>ESCOLA:</strong> ________________________________________________<br>" +
  "<strong>ALUNO(A):</strong> _____________________________________________<br>" +
  "<strong>TURMA:</strong> ____________________ &nbsp;&nbsp;&nbsp; " +
  "<strong>DATA:</strong> ____/____/______";

export default function ResultadoAtividadePage() {
  const router = useRouter();

  const [imagem, setImagem] = useState("");
  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividadeImagem | null>(null);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [mostrarCabecalho, setMostrarCabecalho] =
    useState(false);

  const [cabecalho, setCabecalho] =
    useState(CABECALHO_PADRAO);

  const [cabecalhoSalvo, setCabecalhoSalvo] =
    useState(false);

  useEffect(() => {
    try {
      const imagemSalva =
        localStorage.getItem("atividadeImagem");

      const configuracaoSalva =
        localStorage.getItem(
          "configuracaoAtividadeImagem"
        );

      const cabecalhoSalvoLocal =
        localStorage.getItem(
          "cabecalhoAtividade"
        );

      if (
        !imagemSalva ||
        !imagemSalva.startsWith("data:image/")
      ) {
        setErro(
          "Não encontrei a imagem da atividade. Volte e gere uma nova atividade."
        );
        return;
      }

      setImagem(imagemSalva);

      if (configuracaoSalva) {
        setConfiguracao(
          JSON.parse(configuracaoSalva)
        );
      }

      if (cabecalhoSalvoLocal) {
        setCabecalho(cabecalhoSalvoLocal);
        setCabecalhoSalvo(true);
        setMostrarCabecalho(true);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar atividade:",
        error
      );

      setErro(
        "Não foi possível carregar a atividade gerada."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  function voltarParaAtividades() {
    router.push("/atividades");
  }

  function refazerAtividade() {
    router.push("/atividades");
  }

  function imprimirAtividade() {
    window.print();
  }

  function baixarImagem() {
    if (!imagem) return;

    const link =
      document.createElement("a");

    link.href = imagem;
    link.download =
      "atividade-planejai.jpg";

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function salvarCabecalho() {
    localStorage.setItem(
      "cabecalhoAtividade",
      cabecalho
    );

    setCabecalhoSalvo(true);
    setMostrarCabecalho(true);
  }

  function removerCabecalhoDaFolha() {
    setMostrarCabecalho(false);
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-emerald-700">
          Carregando atividade...
        </p>
      </main>
    );
  }

  if (erro || !imagem) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-red-700">
            {erro ||
              "Atividade não encontrada."}
          </p>

          <button
            type="button"
            onClick={voltarParaAtividades}
            className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white"
          >
            Voltar para atividades
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <style jsx global>{`
        .folha-completa {
          box-sizing: border-box;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .nao-imprimir {
            display: none !important;
          }

          .folha-completa {
            width: 194mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }

          .cabecalho-impressao {
            margin-bottom: 4mm !important;
            padding-bottom: 3mm !important;
            border-bottom: 1px solid #000 !important;
            color: #000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10.5pt !important;
            line-height: 1.55 !important;
          }

          .imagem-atividade {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            max-height: 252mm !important;
            object-fit: contain !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      <header className="nao-imprimir border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Atividade pronta
            </h1>

            <p className="text-sm text-slate-700">
              Confira a folha antes de baixar ou imprimir.
            </p>
          </div>

          <button
            type="button"
            onClick={voltarParaAtividades}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
          >
            <ArrowLeft size={19} />
            Voltar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {configuracao && (
          <div className="nao-imprimir mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              <strong>
                {configuracao.serie || "Turma"}
              </strong>

              {configuracao.disciplina
                ? ` • ${configuracao.disciplina}`
                : ""}

              {configuracao.quantidadeQuestoes
                ? ` • ${configuracao.quantidadeQuestoes} questões`
                : ""}
            </p>
          </div>
        )}

        <div className="nao-imprimir mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">
                Cabeçalho da atividade
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Edite ou cole o cabeçalho utilizado pela sua escola.
              </p>
            </div>

            {!mostrarCabecalho ? (
              <button
                type="button"
                onClick={() =>
                  setMostrarCabecalho(true)
                }
                className="flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 py-2 font-bold text-emerald-700"
              >
                <Pencil size={17} />
                Adicionar cabeçalho
              </button>
            ) : (
              <button
                type="button"
                onClick={removerCabecalhoDaFolha}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-600"
              >
                <X size={17} />
                Ocultar cabeçalho
              </button>
            )}
          </div>

          {mostrarCabecalho && (
            <div className="mt-4">
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(event) => {
                  setCabecalho(
                    event.currentTarget.innerHTML
                  );
                  setCabecalhoSalvo(false);
                }}
                className="min-h-28 rounded-xl border border-slate-300 bg-white p-4 text-sm leading-7 outline-none focus:border-emerald-500"
                dangerouslySetInnerHTML={{
                  __html: cabecalho,
                }}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p
                  className={`text-sm ${
                    cabecalhoSalvo
                      ? "font-semibold text-emerald-700"
                      : "text-slate-500"
                  }`}
                >
                  {cabecalhoSalvo
                    ? "Cabeçalho salvo para as próximas atividades."
                    : "Você pode colar aqui o cabeçalho padrão da escola."}
                </p>

                <button
                  type="button"
                  onClick={salvarCabecalho}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white"
                >
                  <Save size={17} />
                  Salvar cabeçalho
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="folha-completa mx-auto w-full max-w-[794px] bg-white shadow-xl">
          {mostrarCabecalho && (
            <div
              className="cabecalho-impressao px-7 pt-6 text-sm leading-7"
              dangerouslySetInnerHTML={{
                __html: cabecalho,
              }}
            />
          )}

          <img
            src={imagem}
            alt="Atividade pedagógica gerada pelo PlanejAI"
            className="imagem-atividade block h-auto w-full object-contain"
          />
        </div>

        <div className="nao-imprimir mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={refazerAtividade}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700"
          >
            <RefreshCw size={19} />
            Refazer atividade
          </button>

          <button
            type="button"
            onClick={baixarImagem}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-6 py-3 font-bold text-emerald-700"
          >
            <Download size={19} />
            Baixar imagem
          </button>

          <button
            type="button"
            onClick={imprimirAtividade}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 font-bold text-white"
          >
            <Printer size={19} />
            Imprimir ou salvar em PDF
          </button>
        </div>
      </section>
    </main>
  );
}