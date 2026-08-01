"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ConfiguracaoAtividade = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  tipoSelecionado: string;
  nomeTipoSelecionado: string;
};

type Exercicio = {
  id: number;
  titulo: string;
  conteudo: string;
};

const exerciciosExemplo: Exercicio[] = [
  {
    id: 1,
    titulo: "Forme as sílabas",
    conteudo:
      "Complete a família silábica:\n\nB + A = ______\nB + E = ______\nB + I = ______\nB + O = ______\nB + U = ______",
  },
  {
    id: 2,
    titulo: "Forme as palavras",
    conteudo:
      "Junte as sílabas e escreva as palavras:\n\nBO + LA = __________\nBI + CO = __________\nBE + BÊ = __________\nBA + TA = __________",
  },
  {
    id: 3,
    titulo: "Desembaralhe e forme palavras",
    conteudo:
      "Organize as sílabas e escreva corretamente:\n\nLE + BU = __________\nTA + BO = __________\nCO + BI = __________\nLA + BE = __________",
  },
  {
    id: 4,
    titulo: "Observe e circule",
    conteudo:
      "Circule apenas as figuras cujos nomes começam com a letra B.\n\n[FIGURA DE BOLA]\n[FIGURA DE OVO]\n[FIGURA DE BANANA]\n[FIGURA DE MAÇÃ]\n[FIGURA DE BOLO]",
  },
];

export default function RevisaoAtividadePage() {
  const router = useRouter();

  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividade | null>(null);

  const [exercicios, setExercicios] =
    useState<Exercicio[]>(exerciciosExemplo);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("configuracaoAtividade");

    if (!dadosSalvos) {
      router.push("/atividades");
      return;
    }

    try {
      setConfiguracao(JSON.parse(dadosSalvos));
    } catch {
      router.push("/atividades");
    }
  }, [router]);

  function excluirExercicio(id: number) {
    setExercicios((listaAtual) =>
      listaAtual
        .filter((exercicio) => exercicio.id !== id)
        .map((exercicio, indice) => ({
          ...exercicio,
          id: indice + 1,
        }))
    );
  }

  function editarExercicio(id: number) {
    setExercicios((listaAtual) =>
      listaAtual.map((exercicio) => {
        if (exercicio.id !== id) return exercicio;

        const novoConteudo = window.prompt(
          "Edite o exercício:",
          exercicio.conteudo
        );

        if (novoConteudo === null) return exercicio;

        return {
          ...exercicio,
          conteudo: novoConteudo,
        };
      })
    );
  }

  function refazerExercicio(id: number) {
    setExercicios((listaAtual) =>
      listaAtual.map((exercicio) =>
        exercicio.id === id
          ? {
              ...exercicio,
              conteudo:
                "Novo exercício de exemplo gerado para substituir o anterior.",
            }
          : exercicio
      )
    );
  }

  function adicionarExercicio() {
    setExercicios((listaAtual) => [
      ...listaAtual,
      {
        id: listaAtual.length + 1,
        titulo: "Novo exercício",
        conteudo:
          "Este exercício será gerado pela inteligência artificial posteriormente.",
      },
    ]);
  }

  if (!configuracao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 font-semibold text-emerald-700">
          <Sparkles className="animate-pulse" />
          Carregando atividade...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Revisão da atividade
            </h1>

            <p className="text-sm text-slate-700">
              {configuracao.serie} • {configuracao.disciplina} •{" "}
              {configuracao.conteudo}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/atividades")}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            <ArrowLeft size={19} />
            Voltar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="font-bold text-slate-950">
            Revise os exercícios antes de montar a folha
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Você poderá editar, refazer, excluir ou acrescentar novos
            exercícios.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {exercicios.map((exercicio) => (
            <article
              key={exercicio.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 text-slate-400">
                  <GripVertical size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">
                        EXERCÍCIO {exercicio.id}
                      </p>

                      <h3 className="text-lg font-bold text-slate-950">
                        {exercicio.titulo}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editarExercicio(exercicio.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => refazerExercicio(exercicio.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <RefreshCw size={16} />
                        Refazer
                      </button>

                      <button
                        type="button"
                        onClick={() => excluirExercicio(exercicio.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap pt-4 leading-7 text-slate-800">
                    {exercicio.conteudo}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={adicionarExercicio}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-6 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            <Plus size={20} />
            Adicionar exercício
          </button>

          <button
            type="button"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white transition hover:bg-emerald-700"
          >
            <Sparkles size={20} />
            Montar folha final
          </button>
        </div>
      </section>
    </main>
  );
}