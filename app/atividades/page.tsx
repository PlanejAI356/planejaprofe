"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  Grid3X3,
  Hash,
  Image,
  Link2,
  ListChecks,
  ListOrdered,
  LogOut,
  PencilLine,
  Search,
  Sparkles,
  Table2,
  Trophy,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type TipoAtividade = {
  id: string;
  nome: string;
  descricao: string;
  icone: LucideIcon;
};

const seriesPorEtapa: Record<string, string[]> = {
  "Educação Infantil": ["Pré I", "Pré II"],
  "Ensino Fundamental - Anos Iniciais": [
    "1º ano",
    "2º ano",
    "3º ano",
    "4º ano",
    "5º ano",
  ],
  "Ensino Fundamental - Anos Finais": [
    "6º ano",
    "7º ano",
    "8º ano",
    "9º ano",
  ],
  "Ensino Médio": [
    "1º ano do Ensino Médio",
    "2º ano do Ensino Médio",
    "3º ano do Ensino Médio",
  ],
  EJA: ["EJA - Etapa I", "EJA - Etapa II", "EJA - Etapa III", "EJA - Etapa IV"],
};

const disciplinasPorEtapa: Record<string, string[]> = {
  "Educação Infantil": [
    "Linguagem",
    "Matemática",
    "Natureza e sociedade",
    "Arte",
  ],
  "Ensino Fundamental - Anos Iniciais": [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Ensino Religioso",
    "Inglês",
  ],
  "Ensino Fundamental - Anos Finais": [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Ensino Religioso",
    "Inglês",
    "Computação",
  ],
  "Ensino Médio": [
    "Língua Portuguesa",
    "Matemática",
    "Biologia",
    "Física",
    "Química",
    "História",
    "Geografia",
    "Filosofia",
    "Sociologia",
    "Arte",
    "Inglês",
  ],
  EJA: [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Inglês",
  ],
};

const todosOsTipos: TipoAtividade[] = [
  {
    id: "ditado-ilustrado",
    nome: "Ditado ilustrado",
    descricao: "Observe as figuras e escreva seus nomes.",
    icone: Image,
  },
  {
    id: "escreva-nome",
    nome: "Escreva o nome",
    descricao: "Escreva corretamente o nome das figuras.",
    icone: PencilLine,
  },
  {
    id: "letra-inicial",
    nome: "Letra inicial",
    descricao: "Identifique e escreva a letra inicial.",
    icone: Type,
  },
  {
    id: "silaba-inicial",
    nome: "Sílaba inicial",
    descricao: "Identifique a sílaba inicial das palavras.",
    icone: BookOpen,
  },
  {
    id: "complete",
    nome: "Complete",
    descricao: "Complete palavras, frases ou conceitos.",
    icone: PencilLine,
  },
  {
    id: "ligue-colunas",
    nome: "Ligue as colunas",
    descricao: "Relacione corretamente os itens.",
    icone: Link2,
  },
  {
    id: "ordem-alfabetica",
    nome: "Ordem alfabética",
    descricao: "Organize as palavras em ordem alfabética.",
    icone: ListOrdered,
  },
  {
    id: "caca-palavras",
    nome: "Caça-palavras",
    descricao: "Encontre palavras escondidas no diagrama.",
    icone: Search,
  },
  {
    id: "cruzadinha",
    nome: "Cruzadinha",
    descricao: "Preencha a cruzadinha utilizando as dicas.",
    icone: Grid3X3,
  },
  {
    id: "interpretacao",
    nome: "Interpretação de texto",
    descricao: "Leia o texto e responda às questões.",
    icone: FileText,
  },
  {
    id: "problemas-ilustrados",
    nome: "Problemas ilustrados",
    descricao: "Resolva situações-problema com imagens.",
    icone: Calculator,
  },
  {
    id: "arme-efetue",
    nome: "Arme e efetue",
    descricao: "Organize e resolva as operações.",
    icone: Hash,
  },
  {
    id: "sequencia-numerica",
    nome: "Sequência numérica",
    descricao: "Complete sequências numéricas e lógicas.",
    icone: ListOrdered,
  },
  {
    id: "antecessor-sucessor",
    nome: "Antecessor e sucessor",
    descricao: "Identifique o número anterior e o posterior.",
    icone: Hash,
  },
  {
    id: "compare-quantidades",
    nome: "Compare quantidades",
    descricao: "Compare números utilizando sinais matemáticos.",
    icone: Calculator,
  },
  {
    id: "tabela-grafico",
    nome: "Tabela ou gráfico",
    descricao: "Leia ou complete tabelas e gráficos.",
    icone: Table2,
  },
  {
    id: "verdadeiro-falso",
    nome: "Verdadeiro ou falso",
    descricao: "Analise as afirmativas e marque V ou F.",
    icone: CheckCircle2,
  },
  {
    id: "multipla-escolha",
    nome: "Múltipla escolha",
    descricao: "Escolha a alternativa correta.",
    icone: ListChecks,
  },
  {
    id: "observe-responda",
    nome: "Observe e responda",
    descricao: "Analise a imagem e responda às perguntas.",
    icone: Image,
  },
  {
    id: "relacione",
    nome: "Relacione",
    descricao: "Associe conceitos, imagens ou informações.",
    icone: Link2,
  },
];

function selecionarTipos(ids: string[]) {
  return ids
    .map((id) => todosOsTipos.find((tipo) => tipo.id === id))
    .filter((tipo): tipo is TipoAtividade => Boolean(tipo));
}

function obterRecomendacoes(
  etapa: string,
  serie: string,
  disciplina: string
): TipoAtividade[] {
  const alfabetizacao =
    etapa === "Educação Infantil" ||
    serie === "1º ano" ||
    serie === "2º ano" ||
    serie === "3º ano";

  if (disciplina === "Linguagem" || disciplina === "Língua Portuguesa") {
    if (alfabetizacao) {
      return selecionarTipos([
        "ditado-ilustrado",
        "escreva-nome",
        "letra-inicial",
        "silaba-inicial",
        "complete",
        "ligue-colunas",
        "ordem-alfabetica",
        "caca-palavras",
        "cruzadinha",
        "interpretacao",
      ]);
    }

    return selecionarTipos([
      "interpretacao",
      "complete",
      "ordem-alfabetica",
      "caca-palavras",
      "cruzadinha",
      "verdadeiro-falso",
      "multipla-escolha",
      "observe-responda",
      "relacione",
      "escreva-nome",
    ]);
  }

  if (disciplina === "Matemática") {
    return selecionarTipos([
      "problemas-ilustrados",
      "arme-efetue",
      "sequencia-numerica",
      "antecessor-sucessor",
      "compare-quantidades",
      "tabela-grafico",
      "complete",
      "ligue-colunas",
      "multipla-escolha",
      "observe-responda",
    ]);
  }

  if (
    disciplina === "Ciências" ||
    disciplina === "Biologia" ||
    disciplina === "Física" ||
    disciplina === "Química" ||
    disciplina === "Natureza e sociedade"
  ) {
    return selecionarTipos([
      "observe-responda",
      "relacione",
      "complete",
      "verdadeiro-falso",
      "multipla-escolha",
      "caca-palavras",
      "cruzadinha",
      "tabela-grafico",
      "interpretacao",
      "escreva-nome",
    ]);
  }

  if (
    disciplina === "História" ||
    disciplina === "Geografia" ||
    disciplina === "Filosofia" ||
    disciplina === "Sociologia" ||
    disciplina === "Ensino Religioso"
  ) {
    return selecionarTipos([
      "interpretacao",
      "observe-responda",
      "relacione",
      "complete",
      "verdadeiro-falso",
      "multipla-escolha",
      "caca-palavras",
      "cruzadinha",
      "ordem-alfabetica",
      "tabela-grafico",
    ]);
  }

  return selecionarTipos([
    "observe-responda",
    "relacione",
    "complete",
    "caca-palavras",
    "cruzadinha",
    "verdadeiro-falso",
    "multipla-escolha",
    "interpretacao",
    "escreva-nome",
    "ligue-colunas",
  ]);
}

export default function AtividadesPage() {
  const router = useRouter();

  const [etapaEnsino, setEtapaEnsino] = useState("");
  const [serie, setSerie] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const seriesDisponiveis = etapaEnsino
    ? seriesPorEtapa[etapaEnsino] || []
    : [];

  const disciplinasDisponiveis = etapaEnsino
    ? disciplinasPorEtapa[etapaEnsino] || []
    : [];

  const dadosPreenchidos =
    etapaEnsino !== "" &&
    serie !== "" &&
    disciplina !== "" &&
    conteudo.trim() !== "";

  const recomendacoes = useMemo(() => {
    if (!etapaEnsino || !serie || !disciplina) {
      return [];
    }

    return obterRecomendacoes(etapaEnsino, serie, disciplina);
  }, [etapaEnsino, serie, disciplina]);

  const atividadesExibidas = mostrarTodos ? todosOsTipos : recomendacoes;

  function limparCampos() {
    setEtapaEnsino("");
    setSerie("");
    setDisciplina("");
    setConteudo("");
    setTipoSelecionado("");
    setMostrarTodos(false);
  }

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
              <PencilLine size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Gerar atividade pedagógica
              </h2>

              <p className="text-sm text-slate-600">
                Informe os dados da turma para receber sugestões de atividades.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Etapa de ensino <span className="text-red-500">*</span>
              </label>

              <select
                value={etapaEnsino}
                onChange={(event) => {
                  setEtapaEnsino(event.target.value);
                  setSerie("");
                  setDisciplina("");
                  setTipoSelecionado("");
                  setMostrarTodos(false);
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="">Selecione</option>

                {Object.keys(seriesPorEtapa).map((etapa) => (
                  <option key={etapa} value={etapa}>
                    {etapa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Série ou turma <span className="text-red-500">*</span>
              </label>

              <select
                value={serie}
                disabled={!etapaEnsino}
                onChange={(event) => {
                  setSerie(event.target.value);
                  setTipoSelecionado("");
                  setMostrarTodos(false);
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-emerald-500"
              >
                <option value="">Selecione</option>

                {seriesDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Disciplina <span className="text-red-500">*</span>
              </label>

              <select
                value={disciplina}
                disabled={!etapaEnsino}
                onChange={(event) => {
                  setDisciplina(event.target.value);
                  setTipoSelecionado("");
                  setMostrarTodos(false);
                }}
                className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-emerald-500"
              >
                <option value="">Selecione</option>

                {disciplinasDisponiveis.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Conteúdo ou tema <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={conteudo}
                onChange={(event) => setConteudo(event.target.value)}
                placeholder="Ex.: Adição e subtração até 100"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {dadosPreenchidos && (
            <>
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <div className="flex items-center justify-center gap-3 text-center">
                  <CheckCircle2
                    size={26}
                    className="shrink-0 text-emerald-600"
                  />

                  <p className="text-slate-700">
                    Selecionamos os tipos de atividades mais adequados para o{" "}
                    <strong className="text-emerald-700">{serie}</strong> de{" "}
                    <strong className="text-emerald-700">{disciplina}</strong>{" "}
                    com o tema{" "}
                    <strong className="text-emerald-700">
                      “{conteudo.trim()}”
                    </strong>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">
                      {mostrarTodos
                        ? "Todos os tipos de atividade"
                        : `Atividades recomendadas para ${serie} de ${disciplina}`}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Escolha um tipo de atividade para continuar.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                    {atividadesExibidas.length} tipos disponíveis
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {atividadesExibidas.map((atividade) => {
                    const Icone = atividade.icone;
                    const selecionada = tipoSelecionado === atividade.id;

                    return (
                      <button
                        key={atividade.id}
                        type="button"
                        onClick={() => setTipoSelecionado(atividade.id)}
                        className={`relative min-h-44 cursor-pointer rounded-2xl border p-4 text-center transition ${
                          selecionada
                            ? "border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-200"
                            : "border-slate-200 bg-white hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
                        }`}
                      >
                        {selecionada && (
                          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Check size={17} />
                          </span>
                        )}

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <Icone size={28} />
                        </div>

                        <h4 className="mt-3 font-bold text-slate-950">
                          {atividade.nome}
                        </h4>

                        <p className="mt-2 text-sm leading-5 text-slate-600">
                          {atividade.descricao}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMostrarTodos(!mostrarTodos);
                    setTipoSelecionado("");
                  }}
                  className="mt-5 w-full cursor-pointer rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  {mostrarTodos
                    ? "Voltar às atividades recomendadas"
                    : "Ver todos os 20 tipos de atividade"}
                </button>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={!tipoSelecionado}
                    onClick={() => {
                      const tipo = todosOsTipos.find(
                        (atividade) => atividade.id === tipoSelecionado
                      );

                      localStorage.setItem(
                        "configuracaoAtividade",
                        JSON.stringify({
                          etapaEnsino,
                          serie,
                          disciplina,
                          conteudo: conteudo.trim(),
                          tipoSelecionado,
                          nomeTipoSelecionado: tipo?.nome || "",
                        })
                      );

                      router.push("/atividades/revisao");
                    }}
                    className="flex min-w-72 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Sparkles size={20} />
                    Gerar atividade
                  </button>

                  <button
                    type="button"
                    onClick={limparCampos}
                    className="cursor-pointer rounded-xl border border-emerald-600 bg-white px-7 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Limpar campos
                  </button>
                </div>
              </div>
            </>
          )}

                    {!dadosPreenchidos && (
            <div className="mt-6 rounded-2xl border border-dashed border-emerald-400 bg-emerald-50 p-6 text-center">
              <Sparkles
                size={28}
                className="mx-auto text-emerald-700"
              />

              <p className="mt-2 font-bold text-slate-950">
                Preencha os campos acima para visualizar as atividades
                recomendadas.
              </p>

              <p className="mt-1 text-sm text-slate-600">
                As opções mudarão de acordo com a série e a disciplina.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}