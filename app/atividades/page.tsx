"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Loader2,
  LogOut,
  PencilLine,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ModoCriacao = "automatica" | "personalizada";

const seriesPorEtapa: Record<string, string[]> = {
  "Educação Infantil": ["Creche", "Pré I", "Pré II"],
  "Ensino Fundamental - Anos Iniciais": [
    "1º ano",
    "2º ano",
    "3º ano",
    "4º ano",
    "5º ano",
  ],
  "Ensino Fundamental - Anos Finais": [
    "6º ano",
    "7º ano",
    "8º ano",
    "9º ano",
  ],
  "Ensino Médio": [
    "1º ano do Ensino Médio",
    "2º ano do Ensino Médio",
    "3º ano do Ensino Médio",
  ],
  EJA: [
    "EJA - Etapa I",
    "EJA - Etapa II",
    "EJA - Etapa III",
    "EJA - Etapa IV",
  ],
};

const disciplinasPorEtapa: Record<string, string[]> = {
  "Educação Infantil": [
    "Linguagem",
    "Matemática",
    "Natureza e sociedade",
    "Arte",
    "Educação Física",
  ],
  "Ensino Fundamental - Anos Iniciais": [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Ensino Religioso",
    "Inglês",
    "Computação",
  ],
  "Ensino Fundamental - Anos Finais": [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Ensino Religioso",
    "Inglês",
    "Computação",
  ],
  "Ensino Médio": [
    "Língua Portuguesa",
    "Matemática",
    "Biologia",
    "Física",
    "Química",
    "História",
    "Geografia",
    "Filosofia",
    "Sociologia",
    "Arte",
    "Educação Física",
    "Inglês",
  ],
  EJA: [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Inglês",
  ],
};

export default function AtividadesPage() {
  const router = useRouter();

  const [modoCriacao, setModoCriacao] =
    useState<ModoCriacao>("automatica");

  const [etapaEnsino, setEtapaEnsino] = useState("");
  const [serie, setSerie] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [trabalhadoSala, setTrabalhadoSala] = useState("");
  const [pedidoPersonalizado, setPedidoPersonalizado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [quantidadePaginas, setQuantidadePaginas] = useState("1");

  const [erro, setErro] = useState("");
  const [gerando, setGerando] = useState(false);

  const seriesDisponiveis = etapaEnsino
    ? seriesPorEtapa[etapaEnsino] || []
    : [];

  const disciplinasDisponiveis = etapaEnsino
    ? disciplinasPorEtapa[etapaEnsino] || []
    : [];

  function escolherModo(novoModo: ModoCriacao) {
    setModoCriacao(novoModo);
    setPedidoPersonalizado("");
    setErro("");
  }

  function limparCampos() {
    setModoCriacao("automatica");
    setEtapaEnsino("");
    setSerie("");
    setDisciplina("");
    setConteudo("");
    setTrabalhadoSala("");
    setPedidoPersonalizado("");
    setObservacoes("");
    setQuantidadePaginas("1");
    setErro("");
  }

  async function gerarAtividade() {
    setErro("");

    if (!etapaEnsino || !serie || !disciplina || !conteudo.trim()) {
      setErro(
        "Preencha a etapa de ensino, a série ou turma, a disciplina e o conteúdo."
      );
      return;
    }

    if (
      modoCriacao === "personalizada" &&
      !pedidoPersonalizado.trim()
    ) {
      setErro("Descreva como deseja a atividade personalizada.");
      return;
    }

    const usarMaiusculas =
      etapaEnsino === "Educação Infantil" ||
      serie === "1º ano" ||
      serie === "2º ano";

    const configuracao = {
      modoCriacao,
      etapaEnsino,
      serie,
      disciplina,
      conteudo: conteudo.trim(),
      trabalhadoSala: trabalhadoSala.trim(),
      pedidoPersonalizado: pedidoPersonalizado.trim(),
      observacoes: observacoes.trim(),
      quantidadePaginas: Number(quantidadePaginas),
      fonteAtividade: "Times New Roman",
      usarMaiusculas,
    };

    try {
      setGerando(true);

      const resposta = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "atividade_pedagogica",
          ...configuracao,
        }),
      });

      const tipoResposta =
        resposta.headers.get("content-type") || "";

      if (!tipoResposta.includes("application/json")) {
        if (resposta.status === 504) {
          throw new Error(
            "A geração demorou mais que o esperado. Tente novamente."
          );
        }

        throw new Error(
          "O servidor não conseguiu concluir a geração da atividade."
        );
      }

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível gerar a atividade."
        );
      }

      const atividadeGerada = resultado.atividade as
        | {
            titulo?: string;
            subtitulo?: string;
            exercicios?: Array<Record<string, unknown>>;
          }
        | undefined;

      if (
        !atividadeGerada ||
        typeof atividadeGerada !== "object" ||
        !Array.isArray(atividadeGerada.exercicios) ||
        atividadeGerada.exercicios.length === 0
      ) {
        throw new Error(
          "A inteligência artificial não retornou exercícios válidos."
        );
      }

      const momento = Date.now();

      const exerciciosComId = atividadeGerada.exercicios.map(
        (exercicio, indice) => ({
          ...exercicio,
          id:
            typeof exercicio.id === "string" && exercicio.id.trim()
              ? exercicio.id
              : `exercicio-${momento}-${indice + 1}`,
          numero: indice + 1,
        })
      );

      localStorage.setItem(
        "atividadeJson",
        JSON.stringify({
          ...atividadeGerada,
          fonteAtividade: "Times New Roman",
          usarMaiusculas,
          exercicios: exerciciosComId,
        })
      );

      localStorage.setItem(
        "configuracaoAtividade",
        JSON.stringify(configuracao)
      );

      router.push("/atividades/revisao");
    } catch (error) {
      console.error("Erro ao gerar atividade:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao gerar a atividade."
      );
    } finally {
      setGerando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-500 bg-white font-bold text-slate-900 shadow-sm">
              P
            </div>

            <div>
              <h1 className="text-xl font-bold text-emerald-900">
                Nome do Professor
              </h1>

              <p className="text-sm text-slate-700">
                Crie atividades prontas de forma rápida 💚
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              <ArrowLeft size={19} />
              Voltar
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/atividades/minhas-atividades")
              }
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              <ClipboardList size={19} />
              Minhas Atividades
            </button>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              <LogOut size={19} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <PencilLine size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Criar atividade pedagógica
              </h2>

              <p className="text-sm text-slate-600">
                Informe o conteúdo. O PlanejAI adapta a atividade à série.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-slate-950">
              Como você deseja criar?
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => escolherModo("automatica")}
                className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
                  modoCriacao === "automatica"
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <WandSparkles size={25} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-950">
                        Atividade completa
                      </p>

                      <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                        Mais rápido
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-5 text-slate-600">
                      A IA escolhe automaticamente os exercícios mais
                      adequados para a série, disciplina e conteúdo.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => escolherModo("personalizada")}
                className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
                  modoCriacao === "personalizada"
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <FileText size={25} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-950">
                      Atividade personalizada
                    </p>

                    <p className="mt-2 text-sm leading-5 text-slate-600">
                      Descreva o que deseja, como uma cruzadinha, um
                      caça-palavras ou uma atividade de alfabetização.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Etapa de ensino <span className="text-red-500">*</span>
              </label>

              <select
                value={etapaEnsino}
                onChange={(event) => {
                  setEtapaEnsino(event.target.value);
                  setSerie("");
                  setDisciplina("");
                  setErro("");
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="">Selecione</option>

                {Object.keys(seriesPorEtapa).map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Série ou turma <span className="text-red-500">*</span>
              </label>

              <select
                value={serie}
                disabled={!etapaEnsino}
                onChange={(event) => {
                  setSerie(event.target.value);
                  setErro("");
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-emerald-500"
              >
                <option value="">Selecione</option>

                {seriesDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Disciplina <span className="text-red-500">*</span>
              </label>

              <select
                value={disciplina}
                disabled={!etapaEnsino}
                onChange={(event) => {
                  setDisciplina(event.target.value);
                  setErro("");
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-emerald-500"
              >
                <option value="">Selecione</option>

                {disciplinasDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Conteúdo ou tema <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={conteudo}
                onChange={(event) => {
                  setConteudo(event.target.value);
                  setErro("");
                }}
                placeholder="Ex.: Letra B, frações ou sistema solar"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                O que foi trabalhado em sala?{" "}
                <span className="font-normal text-emerald-600">
                  (opcional)
                </span>
              </label>

              <textarea
                value={trabalhadoSala}
                onChange={(event) =>
                  setTrabalhadoSala(event.target.value)
                }
                maxLength={500}
                placeholder="Ex.: Os alunos reconheceram a letra B e formaram palavras simples."
                className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <p className="mt-1 text-right text-sm text-slate-500">
                {trabalhadoSala.length}/500
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Observações para a IA{" "}
                <span className="font-normal text-emerald-600">
                  (opcional)
                </span>
              </label>

              <textarea
                value={observacoes}
                onChange={(event) =>
                  setObservacoes(event.target.value)
                }
                maxLength={500}
                placeholder="Ex.: Use imagens simples, pouco texto e espaço para escrever."
                className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <p className="mt-1 text-right text-sm text-slate-500">
                {observacoes.length}/500
              </p>
            </div>
          </div>

          {modoCriacao === "personalizada" && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <label className="mb-2 block font-bold text-slate-950">
                Descreva a atividade que deseja{" "}
                <span className="text-red-500">*</span>
              </label>

              <textarea
                value={pedidoPersonalizado}
                onChange={(event) => {
                  setPedidoPersonalizado(event.target.value);
                  setErro("");
                }}
                maxLength={700}
                placeholder="Ex.: Crie uma cruzadinha com os nomes dos planetas ou uma atividade de alfabetização com a letra B e seis questões."
                className="min-h-32 w-full resize-none rounded-xl border border-blue-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-right text-sm text-slate-500">
                {pedidoPersonalizado.length}/700
              </p>
            </div>
          )}

          <div className="mt-5">
            <label className="mb-3 block font-semibold text-slate-900">
              Tamanho da atividade
            </label>

            <div className="flex flex-wrap gap-3">
              {["1", "2", "3"].map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setQuantidadePaginas(opcao)}
                  className={`cursor-pointer rounded-xl border px-5 py-3 font-bold transition ${
                    quantidadePaginas === opcao
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  {opcao} {opcao === "1" ? "página" : "páginas"}
                </button>
              ))}
            </div>

            <p className="mt-2 text-sm text-slate-500">
              O PlanejAI define automaticamente a quantidade e o tipo de
              exercícios que cabem em cada página.
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-slate-700">
            <strong>Formatação automática:</strong> Educação Infantil,
            1º e 2º ano serão gerados em Times New Roman e letra
            maiúscula. Do 3º ano em diante, o texto seguirá a escrita
            normal.
          </div>

          {erro && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center font-medium text-red-700">
              {erro}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-dashed border-emerald-500 bg-emerald-50 p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="text-emerald-700" size={24} />

              <p className="text-lg font-bold text-slate-950">
                O PlanejAI adapta a atividade à turma selecionada.
              </p>
            </div>

            <p className="mt-2 text-slate-600">
              Depois você poderá revisar, editar, refazer ou excluir os
              exercícios.
            </p>

            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={gerarAtividade}
                disabled={gerando}
                className="flex min-w-72 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {gerando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Criando atividade...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Criar atividade
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={limparCampos}
                disabled={gerando}
                className="cursor-pointer rounded-xl border border-emerald-600 bg-white px-7 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Limpar campos
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}