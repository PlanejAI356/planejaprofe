"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  FolderOpen,
  Plus,
} from "lucide-react";

export default function MeusPlanosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-emerald-100 bg-white p-5 shadow-lg md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <FolderOpen size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
                Meus Planos
              </h1>

              <p className="mt-1 text-sm text-slate-600 md:text-base">
                Aqui ficarão salvos todos os seus planejamentos.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Voltar
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-bold text-white shadow-md transition hover:scale-[1.01]"
            >
              <Plus size={18} />
              Novo Planejamento
            </Link>
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <BookOpen size={38} />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900">
              Nenhum plano salvo ainda
            </h2>

            <p className="mt-3 max-w-lg text-slate-600">
              Quando o salvamento dos planejamentos estiver conectado, seus
              planos aparecerão aqui organizados por etapa, série, disciplina
              e data.
            </p>

            <div className="mt-7 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-left">
                <FileText className="mb-3 text-emerald-600" size={25} />

                <h3 className="font-extrabold text-slate-900">
                  Histórico organizado
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Visualize seus planejamentos anteriores sem precisar criar
                  tudo novamente.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-left">
                <FolderOpen className="mb-3 text-emerald-600" size={25} />

                <h3 className="font-extrabold text-slate-900">
                  Seus planos em um só lugar
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Depois será possível visualizar, editar, duplicar, exportar
                  e excluir cada planejamento.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="mt-7 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Criar meu primeiro plano
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}