"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  FileImage,
  Loader2,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type AtividadeSalva = {
  id: string;
  titulo: string | null;
  etapa_ensino: string | null;
  serie: string | null;
  disciplina: string | null;
  pedido: string | null;
  tipo_atividade: string | null;
  quantidade_questoes: number | null;
  imagem: string | null;
  created_at: string;
};

export default function MinhasAtividadesPage() {
  const router = useRouter();

  const [atividades, setAtividades] =
    useState<AtividadeSalva[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [excluindoId, setExcluindoId] =
    useState<string | null>(null);

  useEffect(() => {
    carregarAtividades();
  }, []);

  async function carregarAtividades() {
    try {
      setCarregando(true);

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario) {
        console.error(
          "Erro ao identificar usuário:",
          erroUsuario
        );
        return;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("atividades")
        .select(
          `
          id,
          titulo,
          etapa_ensino,
          serie,
          disciplina,
          pedido,
          tipo_atividade,
          quantidade_questoes,
          imagem,
          created_at
          `
        )
        .eq("usuario_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Erro ao carregar atividades:",
          error
        );
        return;
      }

      setAtividades(data ?? []);
    } catch (error) {
      console.error(
        "Erro inesperado ao carregar atividades:",
        error
      );
    } finally {
      setCarregando(false);
    }
  }

  async function excluirAtividade(id: string) {
    const confirmar = window.confirm(
      "Tem certeza de que deseja excluir esta atividade?"
    );

    if (!confirmar) return;

    try {
      setExcluindoId(id);

      const { error } = await supabase
        .from("atividades")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(
          "Erro ao excluir atividade:",
          error
        );

        alert(
          "Não foi possível excluir a atividade."
        );

        return;
      }

      setAtividades((atuais) =>
        atuais.filter(
          (atividade) =>
            atividade.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Erro inesperado ao excluir atividade:",
        error
      );

      alert(
        "Não foi possível excluir a atividade."
      );
    } finally {
      setExcluindoId(null);
    }
  }

  function abrirAtividade(
    atividade: AtividadeSalva
  ) {
    if (!atividade.imagem) {
      alert(
        "A imagem desta atividade não foi encontrada."
      );
      return;
    }

    localStorage.setItem(
      "atividadeImagem",
      atividade.imagem
    );

    localStorage.setItem(
      "atividadeSalvaId",
      atividade.id
    );

    localStorage.setItem(
      "configuracaoAtividadeImagem",
      JSON.stringify({
        etapaEnsino:
          atividade.etapa_ensino,
        serie: atividade.serie,
        disciplina:
          atividade.disciplina,
        pedido: atividade.pedido,
        tipoAtividade:
          atividade.tipo_atividade,
        quantidadeQuestoes:
          atividade.quantidade_questoes,
      })
    );

    router.push(
      "/atividades/resultado"
    );
  }

  function formatarData(data: string) {
    return new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    ).format(new Date(data));
  }

  function formatarTipo(
    tipo: string | null
  ) {
    if (!tipo) {
      return "Atividade personalizada";
    }

    const nomes: Record<string, string> = {
      mista: "Atividade mista",
      caca_palavras: "Caça-palavras",
      cruzadinha: "Cruzadinha",
      autoditado: "Autoditado",
      complete: "Complete",
      ligue: "Ligue",
      multipla_escolha:
        "Múltipla escolha",
      verdadeiro_falso:
        "Verdadeiro ou falso",
      leitura_escrita:
        "Leitura e escrita",
      ordene: "Ordene",
    };

    return nomes[tipo] || tipo;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ClipboardList size={24} />
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  Minhas atividades
                </h1>

                <p className="text-sm text-slate-500">
                  Veja e organize as atividades que você criou.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/atividades")
              }
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800"
            >
              <Plus size={18} />
              Nova atividade
            </button>
          </div>

          {carregando ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center">
              <Loader2
                size={38}
                className="animate-spin text-emerald-700"
              />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Carregando atividades...
              </p>
            </div>
          ) : atividades.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <FileImage
                size={48}
                className="mb-3 text-slate-300"
              />

              <h2 className="text-lg font-extrabold text-slate-700">
                Nenhuma atividade salva
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Quando uma atividade for criada, ela aparecerá aqui para você abrir ou excluir.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 pt-5 md:grid-cols-2 xl:grid-cols-3">
              {atividades.map(
                (atividade) => (
                  <article
                    key={atividade.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <FileImage
                          size={22}
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-extrabold text-slate-900">
                          {atividade.titulo ||
                            "Atividade sem título"}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                          {atividade.disciplina ||
                            "Disciplina não informada"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-bold text-slate-700">
                          Tipo:
                        </span>{" "}
                        {formatarTipo(
                          atividade.tipo_atividade
                        )}
                      </p>

                      <p>
                        <span className="font-bold text-slate-700">
                          Etapa:
                        </span>{" "}
                        {atividade.etapa_ensino ||
                          "Não informada"}
                      </p>

                      <p>
                        <span className="font-bold text-slate-700">
                          Série/Turma:
                        </span>{" "}
                        {atividade.serie ||
                          "Não informada"}
                      </p>

                      <p>
                        <span className="font-bold text-slate-700">
                          Criada em:
                        </span>{" "}
                        {formatarData(
                          atividade.created_at
                        )}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          abrirAtividade(
                            atividade
                          )
                        }
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
                      >
                        <Eye size={16} />
                        Abrir
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          excluirAtividade(
                            atividade.id
                          )
                        }
                        disabled={
                          excluindoId ===
                          atividade.id
                        }
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {excluindoId ===
                        atividade.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2
                            size={16}
                          />
                        )}

                        Excluir
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}