"use client";

import {
  ArrowLeft,
  ClipboardList,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AtividadesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-500 bg-white font-bold text-slate-900 shadow-sm">
              P
            </div>

            <div>
              <h1 className="text-xl font-bold text-emerald-900">
                Nome do Professor
              </h1>

              <p className="text-sm text-slate-700">
                Bem-vindo às atividades pedagógicas 💚
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              <ArrowLeft size={19} />
              Voltar
            </button>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              <ClipboardList size={19} />
              Minhas Atividades
            </button>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              <LogOut size={19} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ClipboardList size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Configuração da atividade pedagógica
              </h2>

              <p className="text-sm text-slate-600">
                Informe os dados abaixo para gerar uma atividade pronta para
                editar e imprimir.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Etapa de ensino <span className="text-red-500">*</span>
              </label>

              <select className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                <option>Selecione</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Série ou turma <span className="text-red-500">*</span>
              </label>

              <select className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                <option>Selecione</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Disciplina <span className="text-red-500">*</span>
              </label>

              <select className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                <option>Selecione</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Conteúdo <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                placeholder="Ex.: Sistema Solar"
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
                maxLength={500}
                placeholder="Ex.: Os alunos já realizaram leitura de textos curtos e identificação de palavras."
                className="min-h-40 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Observações para a IA{" "}
                <span className="font-normal text-emerald-600">
                  (opcional)
                </span>
              </label>

              <textarea
                maxLength={500}
                placeholder="Ex.: Utilize linguagem simples, frases curtas, imagens e atividades variadas."
                className="min-h-40 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-emerald-500 bg-emerald-50 p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="text-emerald-700" size={24} />

              <p className="text-lg font-bold text-slate-950">
                A IA do PlanejAI vai criar uma atividade completa e
                personalizada!
              </p>
            </div>

            <p className="mt-2 text-slate-600">
              Você poderá editar, refazer exercícios e imprimir.
            </p>

            <button
              type="button"
              className="mx-auto mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              <Sparkles size={20} />
              Gerar atividade pedagógica
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}