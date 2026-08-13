"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  RefreshCw,
  FilePenLine,
  UserRound,
  GraduationCap,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ConfiguracaoAtividadeImagem = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  pedido?: string;
  quantidadeQuestoes?: number | null;
  tipoAtividade?: string | null;
};

type VersaoAtividade = "aluno" | "professor";

export default function ResultadoAtividadePage() {
  const router = useRouter();

  const [imagemAluno, setImagemAluno] = useState("");
  const [imagemProfessor, setImagemProfessor] =
    useState("");

  const [versaoSelecionada, setVersaoSelecionada] =
    useState<VersaoAtividade>("aluno");

  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividadeImagem | null>(
      null
    );

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] =
    useState(true);

  const imagemAtual =
    versaoSelecionada === "professor" &&
    imagemProfessor
      ? imagemProfessor
      : imagemAluno;

  const possuiGabarito =
    typeof imagemProfessor === "string" &&
    imagemProfessor.startsWith("data:image/");

  useEffect(() => {
    try {
      const imagemAlunoSalva =
        localStorage.getItem("atividadeImagem");

      const imagemProfessorSalva =
        localStorage.getItem(
          "atividadeImagemProfessor"
        );

      const configuracaoSalva =
        localStorage.getItem(
          "configuracaoAtividadeImagem"
        );

      if (
        !imagemAlunoSalva ||
        !imagemAlunoSalva.startsWith(
          "data:image/"
        )
      ) {
        setErro(
          "Não encontrei a imagem da atividade. Volte e gere uma nova atividade."
        );
        return;
      }

      setImagemAluno(imagemAlunoSalva);

      if (
        imagemProfessorSalva &&
        imagemProfessorSalva.startsWith(
          "data:image/"
        )
      ) {
        setImagemProfessor(
          imagemProfessorSalva
        );
      }

      if (configuracaoSalva) {
        setConfiguracao(
          JSON.parse(configuracaoSalva)
        );
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

  function selecionarVersao(
    versao: VersaoAtividade
  ) {
    if (
      versao === "professor" &&
      !possuiGabarito
    ) {
      return;
    }

    setVersaoSelecionada(versao);
  }

  function baixarImagem() {
    if (!imagemAtual) return;

    const link =
      document.createElement("a");

    link.href = imagemAtual;

    link.download =
      versaoSelecionada === "professor"
        ? "atividade-planejai-gabarito.png"
        : "atividade-planejai-aluno.png";

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function imprimirSomenteImagem() {
    if (!imagemAtual) return;

    window.print();
  }

  function adicionarCabecalho() {
    if (!imagemAtual) return;

    /*
     * Guarda temporariamente qual versão
     * o professor escolheu antes de ir
     * para a página de finalização.
     */
    localStorage.setItem(
      "atividadeImagemSelecionada",
      imagemAtual
    );

    localStorage.setItem(
      "atividadeVersaoSelecionada",
      versaoSelecionada
    );

    router.push("/atividades/finalizar");
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

  if (erro || !imagemAluno) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
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
    <main className="min-h-screen bg-slate-100">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
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

          .folha-imagem {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          .imagem-atividade {
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
            object-fit: contain !important;
          }
        }
      `}</style>

      <header className="nao-imprimir border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Atividade gerada
            </h1>

            <p className="text-sm text-slate-700">
              Confira a atividade antes de
              adicionar o cabeçalho.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/atividades")
            }
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
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
                {configuracao.serie ||
                  "Turma"}
              </strong>

              {configuracao.disciplina
                ? ` • ${configuracao.disciplina}`
                : ""}

              {configuracao.quantidadeQuestoes
                ? ` • ${configuracao.quantidadeQuestoes} itens`
                : ""}
            </p>
          </div>
        )}

        {possuiGabarito && (
          <div className="nao-imprimir mb-5">
            <div className="mx-auto flex w-fit rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() =>
                  selecionarVersao("aluno")
                }
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 font-bold transition ${
                  versaoSelecionada ===
                  "aluno"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <UserRound size={19} />
                Versão do aluno
              </button>

              <button
                type="button"
                onClick={() =>
                  selecionarVersao(
                    "professor"
                  )
                }
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 font-bold transition ${
                  versaoSelecionada ===
                  "professor"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <GraduationCap size={19} />
                Gabarito do professor
              </button>
            </div>

            <p className="mt-2 text-center text-sm text-slate-500">
              As duas versões utilizam a
              mesma cruzadinha.
            </p>
          </div>
        )}

        <div className="folha-imagem mx-auto w-full max-w-[794px] overflow-hidden bg-white shadow-xl">
          <img
            src={imagemAtual}
            alt={
              versaoSelecionada ===
              "professor"
                ? "Gabarito da atividade gerada pelo PlanejAI"
                : "Atividade pedagógica gerada pelo PlanejAI"
            }
            className="imagem-atividade block h-auto w-full object-contain"
          />
        </div>

        {possuiGabarito && (
          <div className="nao-imprimir mt-3 text-center">
            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                versaoSelecionada ===
                "professor"
                  ? "bg-violet-100 text-violet-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {versaoSelecionada ===
              "professor"
                ? "Visualizando: gabarito do professor"
                : "Visualizando: versão do aluno"}
            </span>
          </div>
        )}

        <div className="nao-imprimir mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() =>
              router.push("/atividades")
            }
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700"
          >
            <RefreshCw size={19} />
            Refazer atividade
          </button>

          <button
            type="button"
            onClick={baixarImagem}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-6 py-3 font-bold text-emerald-700"
          >
            <Download size={19} />
            {versaoSelecionada ===
            "professor"
              ? "Baixar gabarito"
              : "Baixar atividade"}
          </button>

          <button
            type="button"
            onClick={
              imprimirSomenteImagem
            }
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-6 py-3 font-bold text-emerald-700"
          >
            <Printer size={19} />
            {versaoSelecionada ===
            "professor"
              ? "Imprimir gabarito"
              : "Imprimir sem cabeçalho"}
          </button>

          <button
            type="button"
            onClick={adicionarCabecalho}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 font-bold text-white"
          >
            <FilePenLine size={19} />
            Adicionar cabeçalho
          </button>
        </div>
      </section>
    </main>
  );
}