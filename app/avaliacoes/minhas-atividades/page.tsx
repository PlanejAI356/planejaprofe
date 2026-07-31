"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import TopoAvaliacoes from "../componentes/TopoAvaliacoes";
import { supabase } from "../../lib/supabase";

type AvaliacaoSalva = {
  id: string;
  titulo: string;
  etapa_ensino: string | null;
  serie: string | null;
  disciplina: string | null;
  conteudos: string | null;
  avaliacao_completa: string | null;
  status: string | null;
  created_at: string;
};

export default function MinhasAvaliacoesPage() {
  const router = useRouter();

  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoSalva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  async function carregarAvaliacoes() {
    try {
      setCarregando(true);

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario) {
        console.error("Erro ao identificar usuário:", erroUsuario);
        return;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("avaliacoes")
        .select(
          `
          id,
          titulo,
          etapa_ensino,
          serie,
          disciplina,
          conteudos,
          avaliacao_completa,
          status,
          created_at
          `
        )
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar avaliações:", error);
        return;
      }

      setAvaliacoes(data ?? []);
    } catch (error) {
      console.error("Erro inesperado ao carregar avaliações:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function excluirAvaliacao(id: string) {
    const confirmar = window.confirm(
      "Tem certeza de que deseja excluir esta avaliação?"
    );

    if (!confirmar) return;

    try {
      setExcluindoId(id);

      const { error } = await supabase
        .from("avaliacoes")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir avaliação:", error);
        alert("Não foi possível excluir a avaliação.");
        return;
      }

      setAvaliacoes((avaliacoesAtuais) =>
        avaliacoesAtuais.filter((avaliacao) => avaliacao.id !== id)
      );
    } catch (error) {
      console.error("Erro inesperado ao excluir avaliação:", error);
      alert("Não foi possível excluir a avaliação.");
    } finally {
      setExcluindoId(null);
    }
  }

  function abrirAvaliacao(avaliacao: AvaliacaoSalva) {
    localStorage.setItem(
      "provaGerada",
      JSON.stringify({
        id: avaliacao.id,
        titulo: avaliacao.titulo,
        etapaEnsino: avaliacao.etapa_ensino,
        serie: avaliacao.serie,
        disciplina: avaliacao.disciplina,
        conteudos: avaliacao.conteudos,
        avaliacaoCompleta: avaliacao.avaliacao_completa,
      })
    );

    router.push(`/avaliacoes/resultado?id=${avaliacao.id}`);
  }

  function formatarData(data: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(data));
  }

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
              onClick={() => router.push("/avaliacoes")}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-green-800"
            >
              <Plus size={18} />
              Nova avaliação
            </button>
          </div>

          {carregando ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center">
              <Loader2
                size={38}
                className="animate-spin text-green-700"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Carregando avaliações...
              </p>
            </div>
          ) : avaliacoes.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <FileText
                size={46}
                className="mb-3 text-slate-300"
              />

              <h2 className="text-lg font-extrabold text-slate-700">
                Nenhuma avaliação salva
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Quando uma avaliação for salva, ela aparecerá aqui para você
                abrir, editar ou excluir.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 pt-5 md:grid-cols-2 xl:grid-cols-3">
              {avaliacoes.map((avaliacao) => (
                <article
                  key={avaliacao.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <FileText size={22} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-base font-extrabold text-slate-900">
                        {avaliacao.titulo || "Avaliação sem título"}
                      </h2>

                      <p className="mt-1 text-sm font-semibold text-green-700">
                        {avaliacao.disciplina || "Disciplina não informada"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-slate-600">
                    <p>
                      <span className="font-bold text-slate-700">Etapa:</span>{" "}
                      {avaliacao.etapa_ensino || "Não informada"}
                    </p>

                    <p>
                      <span className="font-bold text-slate-700">
                        Série/Turma:
                      </span>{" "}
                      {avaliacao.serie || "Não informada"}
                    </p>

                    <p>
                      <span className="font-bold text-slate-700">Criada em:</span>{" "}
                      {formatarData(avaliacao.created_at)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => abrirAvaliacao(avaliacao)}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
                    >
                      <Pencil size={16} />
                      Abrir
                    </button>

                    <button
                      type="button"
                      onClick={() => excluirAvaliacao(avaliacao.id)}
                      disabled={excluindoId === avaliacao.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {excluindoId === avaliacao.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}

                      Excluir
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}