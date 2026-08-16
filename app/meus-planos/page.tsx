"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
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

type ConteudoPlano = {
  temas: string;
  objetivos: string;
  recursos: string;
  metodologia: string;
  avaliacao: string;
  referencias: string;
  atividade: string;
};

const conteudoVazio: ConteudoPlano = {
  temas: "",
  objetivos: "",
  recursos: "",
  metodologia: "",
  avaliacao: "",
  referencias: "",
  atividade: "",
};

export default function MeusPlanosPage() {
  const [planos, setPlanos] = useState<PlanoSalvo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [planoAberto, setPlanoAberto] =
    useState<PlanoSalvo | null>(null);

  const [conteudoAberto, setConteudoAberto] =
    useState<ConteudoPlano>(conteudoVazio);

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] =
    useState<string | null>(null);

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
        throw new Error(
          "Não foi possível identificar o usuário."
        );
      }

      if (!user) {
        setPlanos([]);
        setErro(
          "Você precisa estar conectada para visualizar seus planos."
        );
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

  function lerConteudoPlano(
    planoCompleto: string | null
  ): ConteudoPlano {
    if (!planoCompleto) {
      return { ...conteudoVazio };
    }

    try {
      const conteudo = JSON.parse(planoCompleto);

      return {
        temas: String(conteudo?.temas || ""),
        objetivos: String(conteudo?.objetivos || ""),
        recursos: String(conteudo?.recursos || ""),
        metodologia: String(conteudo?.metodologia || ""),
        avaliacao: String(conteudo?.avaliacao || ""),
        referencias: String(conteudo?.referencias || ""),
        atividade: String(conteudo?.atividade || ""),
      };
    } catch (error) {
      console.error(
        "Erro ao interpretar o plano:",
        error
      );

      return {
        ...conteudoVazio,
        temas: planoCompleto,
      };
    }
  }

  function obterTitulo(plano: PlanoSalvo) {
    const conteudo = lerConteudoPlano(
      plano.plano_completo
    );

    const primeiraLinha = conteudo.temas
      .split("\n")
      .find((linha) => linha.trim());

    if (primeiraLinha) {
      return primeiraLinha
        .replace(
          /^AULA\s*\d+\s*[-–—:]?\s*/i,
          ""
        )
        .trim();
    }

    return plano.disciplina || "Planejamento";
  }

  function abrirPlano(plano: PlanoSalvo) {
    setPlanoAberto(plano);
    setConteudoAberto(
      lerConteudoPlano(plano.plano_completo)
    );
    setEditando(false);
  }

  function fecharPlano() {
    setPlanoAberto(null);
    setConteudoAberto({ ...conteudoVazio });
    setEditando(false);
  }

  function alterarConteudo(
    campo: keyof ConteudoPlano,
    valor: string
  ) {
    setConteudoAberto((conteudoAtual) => ({
      ...conteudoAtual,
      [campo]: valor,
    }));
  }

  async function salvarAlteracoes() {
    if (!planoAberto) return;

    try {
      setSalvando(true);

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        throw new Error(
          "Não foi possível identificar o usuário."
        );
      }

      const dataAtualizacao =
        new Date().toISOString();

      const { error } = await supabase
        .from("planos")
        .update({
          plano_completo:
            JSON.stringify(conteudoAberto),
          updated_at: dataAtualizacao,
        })
        .eq("id", planoAberto.id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      setPlanos((planosAtuais) =>
        planosAtuais.map((plano) =>
          plano.id === planoAberto.id
            ? {
                ...plano,
                plano_completo:
                  JSON.stringify(conteudoAberto),
                updated_at: dataAtualizacao,
              }
            : plano
        )
      );

      setPlanoAberto((planoAtual) =>
        planoAtual
          ? {
              ...planoAtual,
              plano_completo:
                JSON.stringify(conteudoAberto),
              updated_at: dataAtualizacao,
            }
          : null
      );

      setEditando(false);
    } catch (error) {
      console.error(
        "Erro ao salvar alterações:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSalvando(false);
    }
  }

  function exportarPlano(plano: PlanoSalvo) {
    const conteudo = lerConteudoPlano(plano.plano_completo);

    localStorage.setItem("temasPlano", conteudo.temas);
    localStorage.setItem("objetivosPlano", conteudo.objetivos);
    localStorage.setItem("recursosPlano", conteudo.recursos);
    localStorage.setItem("metodologiaPlano", conteudo.metodologia);
    localStorage.setItem("avaliacaoPlano", conteudo.avaliacao);
    localStorage.setItem("referenciasPlano", conteudo.referencias);
    localStorage.setItem("atividadePlano", conteudo.atividade);

    localStorage.setItem("serieSelecionada", plano.serie || "");
    localStorage.setItem(
      "disciplinaSelecionada",
      plano.disciplina || ""
    );
    localStorage.setItem("etapaEnsino", plano.etapa_ensino || "");
    localStorage.setItem(
      "tipoPlanejamento",
      plano.tipo_planejamento || ""
    );
    localStorage.setItem(
      "periodoPlanejamento",
      plano.periodo || ""
    );
    localStorage.setItem("planoSalvoId", plano.id);

    window.location.href = "/exportacao-plano";
  }

  async function excluirPlano(plano: PlanoSalvo) {
    const confirmou = window.confirm(
      `Deseja realmente excluir o plano "${obterTitulo(
        plano
      )}"?`
    );

    if (!confirmou) return;

    try {
      setExcluindoId(plano.id);

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        throw new Error(
          "Não foi possível identificar o usuário."
        );
      }

      const { error } = await supabase
        .from("planos")
        .delete()
        .eq("id", plano.id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      setPlanos((planosAtuais) =>
        planosAtuais.filter(
          (item) => item.id !== plano.id
        )
      );

      if (planoAberto?.id === plano.id) {
        fecharPlano();
      }
    } catch (error) {
      console.error(
        "Erro ao excluir plano:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o plano."
      );
    } finally {
      setExcluindoId(null);
    }
  }

  const secoes: {
    campo: keyof ConteudoPlano;
    titulo: string;
  }[] = [
    { campo: "temas", titulo: "Temas" },
    {
      campo: "objetivos",
      titulo: "Objetivos e Habilidades",
    },
    {
      campo: "recursos",
      titulo: "Recursos e Materiais",
    },
    {
      campo: "metodologia",
      titulo: "Metodologia",
    },
    {
      campo: "avaliacao",
      titulo: "Avaliação",
    },
    {
      campo: "referencias",
      titulo: "Referências",
    },
    {
      campo: "atividade",
      titulo: "Atividade para Casa",
    },
  ];

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
                Seus planejamentos salvos ficam
                organizados aqui.
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

              <p className="mt-3 max-w-lg text-slate-600">
                {erro}
              </p>

              <button
                type="button"
                onClick={carregarPlanos}
                className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md hover:bg-emerald-700"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregando &&
            !erro &&
            planos.length === 0 && (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <BookOpen size={38} />
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  Nenhum plano salvo ainda
                </h2>

                <p className="mt-3 max-w-lg text-slate-600">
                  Depois que você gerar a Atividade
                  para Casa, o planejamento completo
                  aparecerá aqui.
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

          {!carregando &&
            !erro &&
            planos.length > 0 && (
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
                          {plano.tipo_planejamento ||
                            "Planejamento"}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-lg font-extrabold text-slate-900">
                        {obterTitulo(plano)}
                      </h3>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <p>
                          <strong className="text-slate-800">
                            Etapa:
                          </strong>{" "}
                          {plano.etapa_ensino ||
                            "Não informada"}
                        </p>

                        <p>
                          <strong className="text-slate-800">
                            Série:
                          </strong>{" "}
                          {plano.serie ||
                            "Não informada"}
                        </p>

                        <p>
                          <strong className="text-slate-800">
                            Disciplina:
                          </strong>{" "}
                          {plano.disciplina ||
                            "Não informada"}
                        </p>

                        {plano.periodo && (
                          <p>
                            <strong className="text-slate-800">
                              Período:
                            </strong>{" "}
                            {plano.periodo}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 flex items-center gap-2 border-t border-emerald-100 pt-4 text-xs font-medium text-slate-500">
                        <CalendarDays size={15} />
                        Salvo em{" "}
                        {formatarData(
                          plano.created_at
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => abrirPlano(plano)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 font-bold text-white transition hover:bg-emerald-700"
                        >
                          <Eye size={17} />
                          Abrir
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            abrirPlano(plano);
                            setEditando(true);
                          }}
                          className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          <Pencil size={17} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => exportarPlano(plano)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 font-bold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Download size={17} />
                          Exportar
                        </button>

                        <button
                          type="button"
                          onClick={() => excluirPlano(plano)}
                          disabled={excluindoId === plano.id}
                          className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {excluindoId === plano.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}

                          {excluindoId === plano.id
                            ? "Excluindo..."
                            : "Excluir"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
        </section>
      </div>

      {planoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 md:p-6">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 md:text-2xl">
                  {obterTitulo(planoAberto)}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {planoAberto.serie ||
                    "Série não informada"}{" "}
                  •{" "}
                  {planoAberto.disciplina ||
                    "Disciplina não informada"}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharPlano}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100"
                aria-label="Fechar"
              >
                <X size={22} />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="space-y-5">
                {secoes.map(({ campo, titulo }) => {
                  const texto =
                    conteudoAberto[campo];

                  if (!editando && !texto.trim()) {
                    return null;
                  }

                  return (
                    <section
                      key={campo}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <h3 className="mb-3 text-lg font-extrabold text-emerald-700">
                        {titulo}
                      </h3>

                      {editando ? (
                        <textarea
                          value={texto}
                          onChange={(event) =>
                            alterarConteudo(
                              campo,
                              event.target.value
                            )
                          }
                          className="min-h-[180px] w-full resize-y rounded-xl border border-slate-300 bg-white p-4 leading-7 text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap leading-7 text-slate-700">
                          {texto}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end">
              {editando ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setConteudoAberto(
                        lerConteudoPlano(
                          planoAberto.plano_completo
                        )
                      );
                      setEditando(false);
                    }}
                    disabled={salvando}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar edição
                  </button>

                  <button
                    type="button"
                    onClick={salvarAlteracoes}
                    disabled={salvando}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {salvando ? (
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={19} />
                    )}

                    {salvando
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      excluirPlano(planoAberto)
                    }
                    disabled={
                      excluindoId === planoAberto.id
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 size={19} />
                    Excluir
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditando(true)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Pencil size={19} />
                    Editar plano
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}