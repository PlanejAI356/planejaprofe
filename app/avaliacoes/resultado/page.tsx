"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  GraduationCap,
  Loader2,
} from "lucide-react";
import TopoAvaliacoes from "../componentes/TopoAvaliacoes";

export default function ResultadoAvaliacaoPage() {
  const [conteudoAluno, setConteudoAluno] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const provaSalva =
      localStorage.getItem("provaGerada");

    if (provaSalva) {
      setConteudoAluno(provaSalva);
    }

    setCarregando(false);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <TopoAvaliacoes
        destinoVoltar="/avaliacoes"
        textoVoltar="Voltar às avaliações"
      />

      <section className="mx-auto max-w-5xl px-4 py-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-center gap-2 bg-green-700 px-5 py-4 text-white">
            <GraduationCap size={23} />

            <h1 className="text-xl font-extrabold">
              Avaliação do aluno
            </h1>
          </div>

          <div className="p-5">
            <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
              Esta é a versão da avaliação que será entregue ao aluno.
            </div>

            <div className="max-h-[700px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
              {carregando ? (
                <div className="flex min-h-[560px] items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Carregando avaliação...
                </div>
              ) : conteudoAluno ? (
                <div className="mx-auto min-h-[900px] max-w-[794px] bg-white px-8 py-10 shadow-sm sm:px-12">
                  {/* Espaço reservado para o cabeçalho da escola */}
                  <div className="mb-8 h-[150px] border border-dashed border-slate-300 bg-white" />

                  {/* Conteúdo da avaliação */}
                  <div className="whitespace-pre-wrap text-sm leading-7 text-slate-900">
                    {conteudoAluno}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                  <FileText
                    size={40}
                    className="mb-3 text-slate-300"
                  />

                  <p className="text-sm font-semibold text-slate-600">
                    Nenhuma avaliação foi encontrada.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Volte à configuração e gere uma nova avaliação.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
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

                <button
                  type="button"
                  className="rounded-xl border border-green-700 px-5 py-3 text-sm font-extrabold text-green-800 transition hover:bg-green-50"
                >
                  Gerar versão do professor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}