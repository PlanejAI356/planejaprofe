"use client";

import {
  ClipboardList,
  FileText,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TopoAvaliacoes from "../componentes/TopoAvaliacoes";

export default function MinhasAtividadesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50">
      <TopoAvaliacoes
        destinoVoltar="/avaliacoes"
        textoVoltar="Configurar avaliação"
      />

      <section className="mx-auto max-w-7xl px-4 py-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <ClipboardList size={24} />
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  Minhas avaliações
                </h1>

                <p className="text-sm text-slate-500">
                  Veja e organize as avaliações que você criou.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/avaliacoes")
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-green-800"
            >
              <Plus size={18} />
              Nova avaliação
            </button>
          </div>

          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <FileText
              size={46}
              className="mb-3 text-slate-300"
            />

            <h2 className="text-lg font-extrabold text-slate-700">
              Nenhuma avaliação salva
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Quando uma avaliação for salva, ela aparecerá aqui para você abrir, editar ou excluir.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}