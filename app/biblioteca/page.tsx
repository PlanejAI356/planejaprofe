"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type Material = {
  id: number;
  tipo: "Planejamento" | "Atividade" | "Avaliação";
  titulo: string;
  etapa: string;
  serie: string;
  disciplina: string;
  emoji: string;
};

const materiais: Material[] = [
  {
    id: 1,
    tipo: "Atividade",
    titulo: "Caça-palavras: Reino Animal",
    etapa: "Ensino Fundamental - Anos Finais",
    serie: "6º ano",
    disciplina: "Ciências",
    emoji: "🐆",
  },
  {
    id: 2,
    tipo: "Avaliação",
    titulo: "Avaliação de Matemática",
    etapa: "Ensino Fundamental - Anos Finais",
    serie: "7º ano",
    disciplina: "Matemática",
    emoji: "📝",
  },
  {
    id: 3,
    tipo: "Planejamento",
    titulo: "Planejamento: Independência do Brasil",
    etapa: "Ensino Fundamental - Anos Iniciais",
    serie: "5º ano",
    disciplina: "História",
    emoji: "📘",
  },
  {
    id: 4,
    tipo: "Atividade",
    titulo: "Ciclo da Água - Complete",
    etapa: "Ensino Fundamental - Anos Iniciais",
    serie: "5º ano",
    disciplina: "Ciências",
    emoji: "💧",
  },
  {
    id: 5,
    tipo: "Avaliação",
    titulo: "Interpretação de Texto",
    etapa: "Ensino Fundamental - Anos Finais",
    serie: "8º ano",
    disciplina: "Língua Portuguesa",
    emoji: "📄",
  },
  {
    id: 6,
    tipo: "Planejamento",
    titulo: "Planejamento mensal de Ciências",
    etapa: "Ensino Fundamental - Anos Finais",
    serie: "9º ano",
    disciplina: "Ciências",
    emoji: "🧪",
  },
  {
    id: 7,
    tipo: "Atividade",
    titulo: "Alfabeto Ilustrado",
    etapa: "Ensino Fundamental - Anos Iniciais",
    serie: "1º ano",
    disciplina: "Língua Portuguesa",
    emoji: "🔤",
  },
  {
    id: 8,
    tipo: "Avaliação",
    titulo: "Avaliação de Ciências",
    etapa: "Ensino Fundamental - Anos Finais",
    serie: "9º ano",
    disciplina: "Ciências",
    emoji: "🔬",
  },
];

const categorias = ["Todos", "Planejamento", "Atividade", "Avaliação"];

const etapas = [
  "Todas",
  "Educação Infantil",
  "Ensino Fundamental - Anos Iniciais",
  "Ensino Fundamental - Anos Finais",
  "Ensino Médio",
  "EJA",
];

const series = [
  "Todos",
  "Creche",
  "Pré I",
  "Pré II",
  "1º ano",
  "2º ano",
  "3º ano",
  "4º ano",
  "5º ano",
  "6º ano",
  "7º ano",
  "8º ano",
  "9º ano",
  "1º ano do Ensino Médio",
  "2º ano do Ensino Médio",
  "3º ano do Ensino Médio",
];

const disciplinas = [
  "Todas",
  "Língua Portuguesa",
  "Matemática",
  "Ciências",
  "Biologia",
  "Física",
  "Química",
  "História",
  "Geografia",
  "Arte",
  "Educação Física",
  "Ensino Religioso",
  "Inglês",
  "Computação",
];

export default function BibliotecaPage() {
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [etapa, setEtapa] = useState("Todas");
  const [serie, setSerie] = useState("Todos");
  const [disciplina, setDisciplina] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState("recentes");

  const materiaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const lista = materiais.filter((material) => {
      const passaCategoria =
        categoria === "Todos" || material.tipo === categoria;

      const passaEtapa =
        etapa === "Todas" || material.etapa === etapa;

      const passaSerie =
        serie === "Todos" || material.serie === serie;

      const passaDisciplina =
        disciplina === "Todas" ||
        material.disciplina === disciplina;

      const passaBusca =
        termo === "" ||
        material.titulo.toLowerCase().includes(termo) ||
        material.tipo.toLowerCase().includes(termo) ||
        material.etapa.toLowerCase().includes(termo) ||
        material.serie.toLowerCase().includes(termo) ||
        material.disciplina.toLowerCase().includes(termo);

      return (
        passaCategoria &&
        passaEtapa &&
        passaSerie &&
        passaDisciplina &&
        passaBusca
      );
    });

    return [...lista].sort((a, b) => {
      if (ordenacao === "antigos") {
        return a.id - b.id;
      }

      if (ordenacao === "az") {
        return a.titulo.localeCompare(b.titulo, "pt-BR");
      }

      return b.id - a.id;
    });
  }, [
    busca,
    categoria,
    etapa,
    serie,
    disciplina,
    ordenacao,
  ]);

  function limparFiltros() {
    setBusca("");
    setCategoria("Todos");
    setEtapa("Todas");
    setSerie("Todos");
    setDisciplina("Todas");
    setOrdenacao("recentes");
  }

  function estiloTipo(tipo: Material["tipo"]) {
    if (tipo === "Planejamento") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (tipo === "Avaliação") {
      return "border-sky-200 bg-sky-50 text-sky-700";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-500 bg-white font-bold text-slate-900 shadow-sm">
              P
            </div>

            <div>
              <h1 className="text-xl font-bold text-emerald-900">
                PlanejAI
              </h1>

              <p className="text-sm text-slate-700">
                Materiais prontos para facilitar sua rotina.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            <ArrowLeft size={19} />
            Voltar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4 border-b border-slate-200 pb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <BookOpen size={29} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Biblioteca de Materiais
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Encontre planejamentos, atividades e avaliações
                prontas para usar em sala de aula.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                type="text"
                placeholder="Buscar por tema, conteúdo, série ou disciplina..."
                className="w-full rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 py-4 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categorias.map((item) => {
                const ativo = categoria === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategoria(item)}
                    className={`cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                      ativo
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <select
                value={etapa}
                onChange={(event) => {
                  setEtapa(event.target.value);
                  setSerie("Todos");
                }}
                className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                {etapas.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todas" ? "Etapa: Todas" : item}
                  </option>
                ))}
              </select>

              <select
                value={serie}
                onChange={(event) => setSerie(event.target.value)}
                className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                {series.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todos"
                      ? "Ano / Série: Todos"
                      : item}
                  </option>
                ))}
              </select>

              <select
                value={disciplina}
                onChange={(event) =>
                  setDisciplina(event.target.value)
                }
                className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                {disciplinas.map((item) => (
                  <option key={item} value={item}>
                    {item === "Todas"
                      ? "Disciplina: Todas"
                      : item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={limparFiltros}
                className="cursor-pointer text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          <section className="mt-7">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Materiais disponíveis
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {materiaisFiltrados.length}{" "}
                  {materiaisFiltrados.length === 1
                    ? "material encontrado"
                    : "materiais encontrados"}
                </p>
              </div>

              <select
                value={ordenacao}
                onChange={(event) =>
                  setOrdenacao(event.target.value)
                }
                className="w-fit cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-500"
              >
                <option value="recentes">Mais recentes</option>
                <option value="antigos">Mais antigos</option>
                <option value="az">A-Z</option>
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {materiaisFiltrados.map((material) => (
                <article
                  key={material.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-50">
                    <span className="text-7xl drop-shadow-sm">
                      {material.emoji}
                    </span>

                    <span
                      className={`absolute left-4 top-4 rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wide ${estiloTipo(
                        material.tipo
                      )}`}
                    >
                      {material.tipo}
                    </span>
                  </div>

                  <div className="p-4">
                    <h4 className="min-h-[48px] text-base font-bold text-slate-900">
                      {material.titulo}
                    </h4>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{material.serie}</span>
                      <span>•</span>
                      <span>{material.disciplina}</span>
                    </div>

                    <button
                      type="button"
                      className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Ver material
                      <span>→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {materiaisFiltrados.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                <p className="text-lg font-semibold text-slate-700">
                  Nenhum material encontrado
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Tente outra busca ou limpe os filtros.
                </p>

                <button
                  type="button"
                  onClick={limparFiltros}
                  className="mt-4 cursor-pointer rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </section>

          <section className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                  <Sparkles size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Não encontrou o que precisa?
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Use o PlanejAI para criar um material
                    personalizado para a sua turma.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/atividades")}
                className="cursor-pointer rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Criar material →
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
