"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Download,
  FilePenLine,
  GraduationCap,
  Printer,
  RefreshCw,
  Sparkles,
  UserRound,
  X,
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

type VersaoAtividade =
  | "aluno"
  | "professor";

export default function ResultadoAtividadePage() {
  const router = useRouter();

  const [
    imagemAluno,
    setImagemAluno,
  ] = useState("");

  const [
    imagemProfessor,
    setImagemProfessor,
  ] = useState("");

  const [
    versaoSelecionada,
    setVersaoSelecionada,
  ] =
    useState<VersaoAtividade>(
      "aluno"
    );

  const [
    configuracao,
    setConfiguracao,
  ] =
    useState<ConfiguracaoAtividadeImagem | null>(
      null
    );

  const [erro, setErro] =
    useState("");

  const [
    testeGratisAtivo,
    setTesteGratisAtivo,
  ] = useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    mostrarCorrecao,
    setMostrarCorrecao,
  ] = useState(false);

  const [
    descricaoErro,
    setDescricaoErro,
  ] = useState("");

  const [
    corrigindo,
    setCorrigindo,
  ] = useState(false);

  const [
  mostrarSucessoCorrecao,
  setMostrarSucessoCorrecao,
] = useState(false);

  const imagemAtual =
    versaoSelecionada ===
      "professor" &&
    imagemProfessor
      ? imagemProfessor
      : imagemAluno;

  const possuiGabarito =
    typeof imagemProfessor ===
      "string" &&
    imagemProfessor.startsWith(
      "data:image/"
    );

  useEffect(() => {
    try {
      const testeGratis =
        localStorage.getItem(
          "testeGratisAtivo"
        ) === "true";

      setTesteGratisAtivo(
        testeGratis
      );

      const imagemAlunoSalva =
        localStorage.getItem(
          "atividadeImagem"
        );

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

      setImagemAluno(
        imagemAlunoSalva
      );

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
        try {
          setConfiguracao(
            JSON.parse(
              configuracaoSalva
            )
          );
        } catch (error) {
          console.error(
            "Erro ao carregar configuração:",
            error
          );

          setConfiguracao(null);
        }
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

    setVersaoSelecionada(
      versao
    );
  }

  function avisarRecursoPremium() {
    alert(
      "🔒 Este recurso está disponível no PlanejAI Premium.\n\nNo teste grátis você pode gerar e visualizar a atividade completa. Assine o Premium para baixar, imprimir e adicionar cabeçalho."
    );
  }

  function baixarImagem() {
    if (testeGratisAtivo) {
      avisarRecursoPremium();
      return;
    }

    if (!imagemAtual) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = imagemAtual;

    link.download =
      versaoSelecionada ===
      "professor"
        ? "atividade-planejai-gabarito.png"
        : "atividade-planejai-aluno.png";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  }

  function imprimirSomenteImagem() {
    if (testeGratisAtivo) {
      avisarRecursoPremium();
      return;
    }

    if (!imagemAtual) {
      return;
    }

    window.print();
  }

  function adicionarCabecalho() {
    if (testeGratisAtivo) {
      avisarRecursoPremium();
      return;
    }

    if (!imagemAtual) {
      alert(
        "Não foi possível localizar a atividade."
      );

      return;
    }

    try {
      localStorage.setItem(
        "atividadeVersaoSelecionada",
        versaoSelecionada
      );

      localStorage.removeItem(
        "atividadeImagemSelecionada"
      );

      router.push(
        "/atividades/finalizar"
      );
    } catch (error) {
      console.error(
        "Erro ao abrir finalização da atividade:",
        error
      );

      alert(
        "Não foi possível abrir a página de cabeçalho."
      );
    }
  }

  function abrirCorrecao() {
    setDescricaoErro("");

    setMostrarCorrecao(
      true
    );
  }

  function fecharCorrecao() {
    if (corrigindo) {
      return;
    }

    setMostrarCorrecao(
      false
    );

    setDescricaoErro("");
  }

  async function solicitarCorrecao() {
    const instrucao =
      descricaoErro.trim();

    if (!instrucao) {
      alert(
        "Descreva o erro que você encontrou na atividade."
      );

      return;
    }

    if (!imagemAtual) {
      alert(
        "Não foi possível localizar a atividade."
      );

      return;
    }

    try {
      setCorrigindo(true);

      const resposta =
        await fetch(
          "/api/gerar-atividade-imagem/corrigir",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                imagem:
                  imagemAtual,

                correcao:
                  instrucao,
              }),
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível corrigir a atividade."
        );
      }

      if (
        !dados.imagem ||
        !String(
          dados.imagem
        ).startsWith(
          "data:image/"
        )
      ) {
        throw new Error(
          "A inteligência artificial não retornou uma imagem corrigida."
        );
      }

      if (
        versaoSelecionada ===
        "professor"
      ) {
        setImagemProfessor(
          dados.imagem
        );

        localStorage.setItem(
          "atividadeImagemProfessor",
          dados.imagem
        );
      } else {
        setImagemAluno(
          dados.imagem
        );

        localStorage.setItem(
          "atividadeImagem",
          dados.imagem
        );
      }

      setMostrarCorrecao(
        false
      );

      setDescricaoErro("");

      setMostrarSucessoCorrecao(true);
    } catch (error) {
      console.error(
        "Erro ao corrigir atividade:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível corrigir a atividade."
      );
    } finally {
      setCorrigindo(false);
    }
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

  if (
    erro ||
    !imagemAluno
  ) {
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
              Confira a atividade antes
              de adicionar o cabeçalho.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/atividades"
              )
            }
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
          >
            <ArrowLeft
              size={19}
            />

            Voltar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        <div className="nao-imprimir mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {configuracao ? (
              <p className="px-1 text-sm text-slate-600">
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
            ) : (
              <div />
            )}

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={
                  abrirCorrecao
                }
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Sparkles
                  size={18}
                />

                Corrigir erro com IA
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/atividades"
                  )
                }
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw
                  size={18}
                />

                Refazer atividade
              </button>

            </div>
          </div>

          {possuiGabarito && (
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">

              <button
                type="button"
                onClick={() =>
                  selecionarVersao(
                    "aluno"
                  )
                }
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  versaoSelecionada ===
                  "aluno"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <UserRound
                  size={18}
                />

                Versão do aluno
              </button>

              <button
                type="button"
                onClick={() =>
                  selecionarVersao(
                    "professor"
                  )
                }
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  versaoSelecionada ===
                  "professor"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                <GraduationCap
                  size={18}
                />

                Cópia do professor
              </button>

            </div>
          )}
        </div>

        <div className="folha-imagem mx-auto w-full max-w-[794px] overflow-hidden bg-white shadow-xl">
          <img
            src={imagemAtual}
            alt={
              versaoSelecionada ===
              "professor"
                ? "Cópia do professor com gabarito da atividade gerada pelo PlanejAI"
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
                ? "Visualizando: cópia do professor"
                : "Visualizando: versão do aluno"}
            </span>
          </div>
        )}

        <div className="nao-imprimir mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">

          <button
            type="button"
            onClick={
              baixarImagem
            }
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-6 py-3 font-bold transition ${
              testeGratisAtivo
                ? "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
                : "border-emerald-600 bg-white text-emerald-700"
            }`}
          >
            <Download
              size={19}
            />

            {versaoSelecionada ===
            "professor"
              ? testeGratisAtivo
                ? "🔒 Baixar cópia do professor"
                : "Baixar cópia do professor"
              : testeGratisAtivo
                ? "🔒 Baixar atividade"
                : "Baixar atividade"}
          </button>

          <button
            type="button"
            onClick={
              imprimirSomenteImagem
            }
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-6 py-3 font-bold transition ${
              testeGratisAtivo
                ? "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
                : "border-emerald-600 bg-white text-emerald-700"
            }`}
          >
            <Printer
              size={19}
            />

            {versaoSelecionada ===
            "professor"
              ? testeGratisAtivo
                ? "🔒 Imprimir gabarito"
                : "Imprimir gabarito"
              : testeGratisAtivo
                ? "🔒 Imprimir sem cabeçalho"
                : "Imprimir sem cabeçalho"}
          </button>

          <button
            type="button"
            onClick={
              adicionarCabecalho
            }
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-7 py-3 font-bold transition ${
              testeGratisAtivo
                ? "bg-slate-300 text-slate-600 hover:bg-slate-400"
                : "bg-emerald-600 text-white"
            }`}
          >
            <FilePenLine
              size={19}
            />

            {testeGratisAtivo
              ? "🔒 Adicionar cabeçalho"
              : "Adicionar cabeçalho"}
          </button>

        </div>
      </section>

      {mostrarCorrecao && (
        <div className="nao-imprimir fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-200 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Sparkles
                    size={22}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Corrigir erro com IA
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Informe somente o erro
                    que você encontrou na atividade.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={
                  fecharCorrecao
                }
                disabled={
                  corrigindo
                }
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Fechar"
              >
                <X
                  size={20}
                />
              </button>

            </div>

            <div className="p-5">

              <div className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                <AlertCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <p className="text-sm leading-6 text-amber-900">
                  Descreva exatamente o
                  que deve ser corrigido.
                  A IA será orientada a
                  <strong>
                    {" "}
                    não alterar nenhuma
                    outra parte da atividade.
                  </strong>
                </p>

              </div>

              <label
                htmlFor="descricao-correcao"
                className="text-sm font-bold text-slate-800"
              >
                Qual erro você encontrou?
              </label>

              <textarea
                id="descricao-correcao"
                value={
                  descricaoErro
                }
                disabled={
                  corrigindo
                }
                maxLength={500}
                onChange={(
                  evento
                ) =>
                  setDescricaoErro(
                    evento.target.value
                  )
                }
                placeholder='Ex.: Na primeira questão está escrito "CACHORO". Corrija para "CACHORRO".'
                className="mt-2 min-h-[140px] w-full resize-none rounded-xl border border-slate-300 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              />

              <div className="mt-1 text-right text-xs text-slate-400">
                {
                  descricaoErro.length
                }
                /500
              </div>

            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  fecharCorrecao
                }
                disabled={
                  corrigindo
                }
                className="cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  solicitarCorrecao
                }
                disabled={
                  !descricaoErro.trim() ||
                  corrigindo
                }
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {corrigindo ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />

                    Corrigindo...
                  </>
                ) : (
                  <>
                    <Sparkles
                      size={18}
                    />

                    Corrigir somente este erro
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      )}

      {mostrarSucessoCorrecao && (
        <div className="nao-imprimir fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl sm:p-8">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Sparkles size={38} />
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
              Correção concluída!
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-600">
              Confira a atividade para confirmar se o erro foi corrigido corretamente.
            </p>

            <div className="my-6 h-px w-full bg-slate-200" />

            <button
              type="button"
              onClick={() =>
                setMostrarSucessoCorrecao(false)
              }
              className="w-full cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 text-base font-extrabold text-white transition hover:bg-emerald-700"
            >
              OK
            </button>

          </div>
        </div>
            )}
    </main>
  );
}