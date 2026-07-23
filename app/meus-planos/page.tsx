"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
} from "lucide-react";
import { supabase } from "../lib/supabase";

type PlanoSalvo = {
  id: string;
  etapa_ensino: string | null;
  serie: string | null;
  disciplina: string | null;
  tipo_planejamento: string | null;
  periodo: string | null;
  plano_completo: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function MeusPlanosPage() {
  const [planos, setPlanos] = useState<PlanoSalvo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarPlanos();
  }, []);

  async function carregarPlanos() {
    try {
      setCarregando(true);
      setErro("");

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario) {
        throw new Error("Não foi possível identificar o usuário.");
      }

      if (!user) {
        setPlanos([]);
        setErro("Você precisa estar conectada para visualizar seus planos.");
        return;
      }

      const { data, error } = await supabase
        .from("planos")
        .select(
          `
          id,
          etapa_ensino,
          serie,
          disciplina,
          tipo_planejamento,
          periodo,
          plano_completo,
          created_at,
          updated_at
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setPlanos(data || []);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os planejamentos."
      );
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(data: string | null) {
    if (!data) return "Data não informada";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(data));
  }

  function obterTitulo(plano: PlanoSalvo) {
    if (!plano.plano_completo) {
      return plano.disciplina || "Planejamento";
    }

    try {
      const conteudo = JSON.parse(plano.plano_completo);
      const temas = String(conteudo?.temas || "").trim();

      if (temas) {
        const primeiraLinha = temas
          .split("\n")
          .find((linha: string) => linha.trim());

        if (primeiraLinha) {
          return primeiraLinha
            .replace(/^AULA\s*\d+\s*[-–—:]?\s*/i, "")
            .trim();
        }
      }
    } catch (error) {
      console.error("Erro ao ler o conteúdo do plano:", error);
    }

    return plano.disciplina || "Planejamento";
  }

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
                Seus planejamentos salvos ficam organizados aqui.
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

        <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-lg md:p-6">
          {carregando && (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <Loader2
                size={42}
                className="animate-spin text-emerald-600"
              />

              <p className="mt-4 font-semibold text-slate-600">
                Carregando seus planos...
              </p>
            </div>
          )}

          {!carregando && erro && (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
                <FileText size={38} />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900">
                Não foi possível carregar
              </h2>

              <p className="mt-3 max-w-lg text-slate-600">{erro}</p>

              <button
                type="button"
                onClick={carregarPlanos}
                className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregando && !erro && planos.length === 0 && (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <BookOpen size={38} />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900">
                Nenhum plano salvo ainda
              </h2>

              <p className="mt-3 max-w-lg text-slate-600">
                Depois que você gerar a Atividade para Casa, o planejamento
                completo aparecerá aqui.
              </p>

              <Link
                href="/"
                className="mt-7 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                <Plus size={18} />
                Criar planejamento
              </Link>
            </div>
          )}

          {!carregando && !erro && planos.length > 0 && (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Planejamentos salvos
                  </h2>

                  <p className="text-sm text-slate-600">
                    {planos.length}{" "}
                    {planos.length === 1
                      ? "planejamento encontrado"
                      : "planejamentos encontrados"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={carregarPlanos}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Atualizar
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {planos.map((plano) => (
                  <article
                    key={plano.id}
                    className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <FileText size={23} />
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                        {plano.tipo_planejamento || "Planejamento"}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-extrabold text-slate-900">
                      {obterTitulo(plano)}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p>
                        <strong className="text-slate-800">Etapa:</strong>{" "}
                        {plano.etapa_ensino || "Não informada"}
                      </p>

                      <p>
                        <strong className="text-slate-800">Série:</strong>{" "}
                        {plano.serie || "Não informada"}
                      </p>

                      <p>
                        <strong className="text-slate-800">
                          Disciplina:
                        </strong>{" "}
                        {plano.disciplina || "Não informada"}
                      </p>

                      {plano.periodo && (
                        <p>
                          <strong className="text-slate-800">Período:</strong>{" "}
                          {plano.periodo}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t border-emerald-100 pt-4 text-xs font-medium text-slate-500">
                      <CalendarDays size={15} />
                      Salvo em {formatarData(plano.created_at)}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}