"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import TopoAvaliacoes from "../componentes/TopoAvaliacoes";

export default function ResultadoAvaliacaoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50">
      <TopoAvaliacoes
  destinoVoltar="/avaliacoes"
  textoVoltar="Voltar às avaliações"
/>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-3 lg:border-r lg:border-green-200 lg:pr-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                <GraduationCap size={23} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Etapa de ensino
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  Ensino Fundamental – Anos Finais
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:border-r lg:border-green-200 lg:pr-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                <Users size={22} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Série ou turma
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  7º ano
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:border-r lg:border-green-200 lg:pr-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                <BookOpen size={22} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Disciplina
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  Ciências
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:border-r lg:border-green-200 lg:pr-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                <ClipboardList size={22} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Tipo de avaliação
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  Avaliação bimestral
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
                <FileText size={22} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total de questões
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  10 questões
                </p>
              </div>
            </div>
          </div>
        </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-center gap-2 bg-green-700 px-5 py-4 text-white">
              <GraduationCap size={22} />

              <h2 className="text-lg font-extrabold">
                Versão do professor
              </h2>
            </div>

            <div className="p-5">
              <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
                Esta versão contém gabarito, respostas e explicações.
              </div>

              <div className="min-h-[430px] rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  O conteúdo da versão do professor aparecerá aqui.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-green-700 px-5 py-3 text-sm font-extrabold text-green-800 transition hover:bg-green-50"
                >
                  Visualizar
                </button>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    Baixar Word
                  </button>

                  <button
                    type="button"
                    className="rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-green-800"
                  >
                    Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-center gap-2 border-b border-slate-200 bg-white px-5 py-4 text-slate-900">
              <Users size={22} className="text-green-700" />

              <h2 className="text-lg font-extrabold">
                Versão do aluno
              </h2>
            </div>

            <div className="p-5">
              <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
                Esta versão não contém respostas.
              </div>

              <div className="min-h-[430px] rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  O conteúdo da versão do aluno aparecerá aqui.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-green-700 px-5 py-3 text-sm font-extrabold text-green-800 transition hover:bg-green-50"
                >
                  Visualizar
                </button>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    Baixar Word
                  </button>

                  <button
                    type="button"
                    className="rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-green-800"
                  >
                    Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}