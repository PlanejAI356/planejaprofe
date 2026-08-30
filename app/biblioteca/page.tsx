"use client";

import { useMemo, useState } from "react";

const materiais = [
  {
    id: 1,
    tipo: "Atividade",
    titulo: "Caça-palavras: Reino Animal",
    etapa: "Ensino Fundamental II",
    serie: "6º ano",
    disciplina: "Ciências",
    cor: "bg-green-500",
    fundo: "from-green-50 to-emerald-100",
    emoji: "🐆",
  },
  {
    id: 2,
    tipo: "Avaliação",
    titulo: "Avaliação de Matemática",
    etapa: "Ensino Fundamental II",
    serie: "7º ano",
    disciplina: "Matemática",
    cor: "bg-blue-500",
    fundo: "from-blue-50 to-sky-100",
    emoji: "📝",
  },
  {
    id: 3,
    tipo: "Temático",
    titulo: "Atividades - 7 de Setembro",
    etapa: "Ensino Fundamental",
    serie: "Diversos",
    disciplina: "História",
    cor: "bg-violet-500",
    fundo: "from-yellow-50 to-green-100",
    emoji: "🇧🇷",
  },
  {
    id: 4,
    tipo: "Atividade",
    titulo: "Ciclo da Água - Complete",
    etapa: "Ensino Fundamental I",
    serie: "5º ano",
    disciplina: "Ciências",
    cor: "bg-green-500",
    fundo: "from-cyan-50 to-blue-100",
    emoji: "💧",
  },
  {
    id: 5,
    tipo: "Avaliação",
    titulo: "Interpretação de Texto",
    etapa: "Ensino Fundamental II",
    serie: "8º ano",
    disciplina: "Língua Portuguesa",
    cor: "bg-blue-500",
    fundo: "from-slate-50 to-blue-100",
    emoji: "📄",
  },
  {
    id: 6,
    tipo: "Temático",
    titulo: "Atividades - Dia das Crianças",
    etapa: "Ensino Fundamental",
    serie: "Diversos",
    disciplina: "Diversas",
    cor: "bg-violet-500",
    fundo: "from-pink-50 to-yellow-100",
    emoji: "🎈",
  },
  {
    id: 7,
    tipo: "Atividade",
    titulo: "Alfabeto Ilustrado",
    etapa: "Ensino Fundamental I",
    serie: "1º ano",
    disciplina: "Alfabetização",
    cor: "bg-green-500",
    fundo: "from-emerald-50 to-lime-100",
    emoji: "🔤",
  },
  {
    id: 8,
    tipo: "Avaliação",
    titulo: "Avaliação de Ciências",
    etapa: "Ensino Fundamental II",
    serie: "9º ano",
    disciplina: "Ciências",
    cor: "bg-blue-500",
    fundo: "from-sky-50 to-indigo-100",
    emoji: "🔬",
  },
];

const categorias = ["Todos", "Atividade", "Avaliação", "Temático"];

export default function BibliotecaPage() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const materiaisFiltrados = useMemo(() => {
    return materiais.filter((material) => {
      const passaCategoria =
        categoria === "Todos" || material.tipo === categoria;

      const termo = busca.toLowerCase();

      const passaBusca =
        material.titulo.toLowerCase().includes(termo) ||
        material.disciplina.toLowerCase().includes(termo) ||
        material.serie.toLowerCase().includes(termo);

      return passaCategoria && passaBusca;
    });
  }, [busca, categoria]);

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[26px] border border-green-100 bg-gradient-to-r from-emerald-50 via-white to-blue-50 px-6 py-7 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm ring-1 ring-green-100">
                📚
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold uppercase tracking-[0.18em] text-green-600">
                  PlanejAI
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Biblioteca de Materiais
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                  Materiais prontos para facilitar sua rotina em sala de aula.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
              <p className="font-semibold text-green-700">
                Encontre materiais prontos
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Explore atividades e avaliações ou inspire-se para criar as suas.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
              🔎
            </span>

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              type="text"
              placeholder="Buscar por tema, conteúdo ou material..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-green-400 focus:ring-4 focus:ring-green-100"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {categorias.map((item) => {
              const ativo = categoria === item;

              return (
                <button
                  key={item}
                  onClick={() => setCategoria(item)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    ativo
                      ? "bg-green-500 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:text-green-700"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-green-400">
              <option>Etapa: Todas</option>
              <option>Educação Infantil</option>
              <option>Ensino Fundamental I</option>
              <option>Ensino Fundamental II</option>
              <option>Ensino Médio</option>
              <option>EJA</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-green-400">
              <option>Ano / Série: Todos</option>
              <option>1º ano</option>
              <option>2º ano</option>
              <option>3º ano</option>
              <option>4º ano</option>
              <option>5º ano</option>
              <option>6º ano</option>
              <option>7º ano</option>
              <option>8º ano</option>
              <option>9º ano</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-green-400">
              <option>Disciplina: Todas</option>
              <option>Ciências</option>
              <option>Matemática</option>
              <option>Língua Portuguesa</option>
              <option>História</option>
              <option>Geografia</option>
            </select>

            <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-green-400">
              <option>Tipo de material: Todos</option>
              <option>Atividade</option>
              <option>Avaliação</option>
              <option>Temático</option>
            </select>
          </div>

          <div className="mt-3 flex justify-end">
            <button className="text-sm font-medium text-green-600 hover:text-green-700">
              Limpar filtros
            </button>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Materiais disponíveis
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-green-500" />
            </div>

            <select className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none">
              <option>Mais recentes</option>
              <option>Mais antigos</option>
              <option>A-Z</option>
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {materiaisFiltrados.map((material) => (
              <article
                key={material.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${material.fundo}`}
                >
                  <span className="text-7xl drop-shadow-sm">
                    {material.emoji}
                  </span>

                  <span
                    className={`absolute left-4 top-4 rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ${material.cor}`}
                  >
                    {material.tipo}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="min-h-[48px] text-base font-bold text-slate-900">
                    {material.titulo}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{material.serie}</span>
                    <span>•</span>
                    <span>{material.disciplina}</span>
                  </div>

                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100">
                    Ver material
                    <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {materiaisFiltrados.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">
                Nenhum material encontrado
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Tente buscar outro tema ou selecionar outra categoria.
              </p>
            </div>
          )}
        </section>

        <section className="mt-7 rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-blue-50 px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                💡
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Não encontrou o que precisa?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Use o PlanejAI para criar atividades e avaliações
                  personalizadas do jeito que você quiser.
                </p>
              </div>
            </div>

            <button className="rounded-xl border border-green-300 bg-white px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50">
              Criar material →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}