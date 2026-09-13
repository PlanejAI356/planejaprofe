"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type TipoMaterial = "Planejamento" | "Avaliação" | "Atividade";

type Material = {
  id: string | number;
  tipo: TipoMaterial;
  titulo: string;
  etapa: string;
  serie: string;
  disciplina: string;
  subtitulo?: string | null;
  imagem?: string | null;
  criadoEm?: string | null;
};

type DetalheMaterial = {
  id: string | number;
  titulo?: string | null;
  etapa_ensino?: string | null;
  serie?: string | null;
  disciplina?: string | null;
  tipo_atividade?: string | null;
  tipo_planejamento?: string | null;
  imagem?: string | null;
  conteudos?: string | null;
  avaliacao_completa?: string | null;
  conteudo?: {
    temas?: string;
    objetivos?: string;
    recursos?: string;
    metodologia?: string;
    avaliacao?: string;
    referencias?: string;
    atividade?: string;
  };
};

const categorias = [
  "Todos",
  "Planejamento",
  "Avaliação",
  "Atividade",
] as const;

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

function slugArquivo(texto: string) {
  return (
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "material-planejai"
  );
}

function classeTipo(tipo: TipoMaterial) {
  if (tipo === "Planejamento") {
    return {
      selo: "border-blue-200 bg-blue-50 text-blue-700",
      fundo: "from-blue-50 via-white to-sky-50",
      icone: "bg-blue-100 text-blue-700",
      botao: "bg-blue-600 hover:bg-blue-700",
    };
  }

  if (tipo === "Avaliação") {
    return {
      selo: "border-violet-200 bg-violet-50 text-violet-700",
      fundo: "from-violet-50 via-white to-purple-50",
      icone: "bg-violet-100 text-violet-700",
      botao: "bg-violet-600 hover:bg-violet-700",
    };
  }

  return {
    selo: "border-orange-200 bg-orange-50 text-orange-700",
    fundo: "from-orange-50 via-white to-amber-50",
    icone: "bg-orange-100 text-orange-700",
    botao: "bg-emerald-600 hover:bg-emerald-700",
  };
}

function IconeTipo({
  tipo,
  size = 24,
}: {
  tipo: TipoMaterial;
  size?: number;
}) {
  if (tipo === "Planejamento") {
    return <CalendarDays size={size} />;
  }

  if (tipo === "Avaliação") {
    return <CheckSquare size={size} />;
  }

  return <ClipboardList size={size} />;
}

export default function BibliotecaPage() {
  const router = useRouter();

  const [materiais, setMateriais] = useState<Material[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] =
    useState<(typeof categorias)[number]>("Todos");
  const [etapa, setEtapa] = useState("Todas");
  const [serie, setSerie] = useState("Todos");
  const [disciplina, setDisciplina] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState("recentes");

  const [materialAberto, setMaterialAberto] =
    useState<Material | null>(null);
  const [detalheAberto, setDetalheAberto] =
    useState<DetalheMaterial | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] =
    useState(false);

  useEffect(() => {
    async function carregarMateriais() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch("/api/biblioteca", {
          method: "GET",
          cache: "no-store",
        });

        const resultado = await resposta.json().catch(() => null);

        if (!resposta.ok) {
          throw new Error(
            resultado?.erro ||
              "Não foi possível carregar a Biblioteca."
          );
        }

        setMateriais(resultado?.materiais || []);
      } catch (error) {
        console.error("Erro ao carregar Biblioteca:", error);
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a Biblioteca."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarMateriais();
  }, []);

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

      const textoBusca = [
        material.titulo,
        material.subtitulo,
        material.tipo,
        material.etapa,
        material.serie,
        material.disciplina,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const passaBusca =
        termo === "" || textoBusca.includes(termo);

      return (
        passaCategoria &&
        passaEtapa &&
        passaSerie &&
        passaDisciplina &&
        passaBusca
      );
    });

    return [...lista].sort((a, b) => {
      if (ordenacao === "az") {
        return a.titulo.localeCompare(b.titulo, "pt-BR");
      }

      const dataA = a.criadoEm
        ? new Date(a.criadoEm).getTime()
        : 0;
      const dataB = b.criadoEm
        ? new Date(b.criadoEm).getTime()
        : 0;

      if (ordenacao === "antigos") {
        return dataA - dataB;
      }

      return dataB - dataA;
    });
  }, [
    materiais,
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

  async function visualizarMaterial(material: Material) {
    setMaterialAberto(material);
    setDetalheAberto(null);
    setCarregandoDetalhe(true);

    try {
      const tipoApi =
        material.tipo === "Planejamento"
          ? "plano"
          : material.tipo === "Avaliação"
            ? "avaliacao"
            : "atividade";

      const resposta = await fetch(
        `/api/biblioteca?tipo=${tipoApi}&id=${encodeURIComponent(
          String(material.id)
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const resultado = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro || "Não foi possível abrir o material."
        );
      }

      setDetalheAberto(resultado?.material || null);
    } catch (error) {
      console.error("Erro ao abrir material:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o material."
      );
      setMaterialAberto(null);
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  async function baixarAtividade(material: Material) {
    if (!material.imagem) {
      await visualizarMaterial(material);
      return;
    }

    try {
      const resposta = await fetch(material.imagem);

      if (!resposta.ok) {
        throw new Error("Não foi possível baixar a atividade.");
      }

      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const extensao =
        blob.type === "image/jpeg" ? "jpg" : "png";

      link.href = url;
      link.download = `${slugArquivo(material.titulo)}.${extensao}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar atividade:", error);
      alert("Não foi possível baixar a atividade.");
    }
  }

  function baixarComoHtml(material: Material) {
    if (!detalheAberto) {
      visualizarMaterial(material);
      return;
    }

    let corpo = "";

    if (material.tipo === "Avaliação") {
      corpo =
        detalheAberto.avaliacao_completa ||
        "<p>Conteúdo não disponível.</p>";
    } else if (material.tipo === "Planejamento") {
      const secoes = [
        ["Temas", detalheAberto.conteudo?.temas],
        ["Objetivos e Habilidades", detalheAberto.conteudo?.objetivos],
        ["Recursos e Materiais", detalheAberto.conteudo?.recursos],
        ["Metodologia", detalheAberto.conteudo?.metodologia],
        ["Avaliação", detalheAberto.conteudo?.avaliacao],
        ["Referências", detalheAberto.conteudo?.referencias],
        ["Atividade para Casa", detalheAberto.conteudo?.atividade],
      ]
        .filter(([, conteudo]) => String(conteudo || "").trim())
        .map(
          ([titulo, conteudo]) => `
            <section style="margin:0 0 18px">
              <h2 style="font-size:18px;margin:0 0 8px">${titulo}</h2>
              <div style="white-space:pre-wrap;line-height:1.6">${String(
                conteudo || ""
              )}</div>
            </section>
          `
        )
        .join("");

      corpo = secoes;
    }

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${material.titulo}</title>
<style>
body{font-family:Arial,sans-serif;max-width:900px;margin:36px auto;padding:0 24px;color:#0f172a}
h1{font-size:28px;margin-bottom:8px}
.meta{color:#64748b;margin-bottom:28px}
table{max-width:100%;border-collapse:collapse}
img{max-width:100%;height:auto}
</style>
</head>
<body>
<h1>${material.titulo}</h1>
<div class="meta">${material.serie} • ${material.disciplina}</div>
${corpo}
</body>
</html>`;

    const blob = new Blob([html], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${slugArquivo(material.titulo)}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function baixarMaterial(material: Material) {
    if (material.tipo === "Atividade") {
      await baixarAtividade(material);
      return;
    }

    if (
      !materialAberto ||
      String(materialAberto.id) !== String(material.id) ||
      !detalheAberto
    ) {
      await visualizarMaterial(material);
      return;
    }

    baixarComoHtml(material);
  }

  function fecharModal() {
    setMaterialAberto(null);
    setDetalheAberto(null);
    setCarregandoDetalhe(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 px-3 py-5 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
        >
          <ArrowLeft size={17} />
          Voltar
        </button>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-white via-emerald-50/60 to-sky-50/60 px-5 py-7 sm:px-8 lg:px-10">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />
            <div className="absolute right-44 top-4 h-32 w-32 rounded-full bg-sky-100/60 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                  <BookOpen size={31} />
                </div>

                <div>
                  <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-600">
                    PlanejAI
                  </p>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                    Biblioteca de Materiais
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    Encontre planejamentos, avaliações e atividades
                    prontos para adaptar e usar em sala de aula.
                  </p>
                </div>
              </div>

              <div className="hidden max-w-md items-center gap-3 rounded-2xl border border-emerald-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur lg:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Sparkles size={20} />
                </div>
                <p className="text-sm font-semibold leading-5 text-slate-600">
                  Materiais selecionados para facilitar a rotina de quem
                  ensina.
                </p>
              </div>
            </div>

            <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar por tema, conteúdo, série ou disciplina..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <button
                type="button"
                className="h-14 cursor-pointer rounded-2xl bg-emerald-600 px-7 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Buscar
              </button>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 lg:px-10">
            <div className="flex flex-wrap gap-2">
              {categorias.map((item) => {
                const ativo = categoria === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategoria(item)}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-extrabold transition ${
                      ativo
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                        : item === "Planejamento"
                          ? "border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-200"
                          : item === "Avaliação"
                            ? "border-violet-100 bg-violet-50 text-violet-700 hover:border-violet-200"
                            : item === "Atividade"
                              ? "border-orange-100 bg-orange-50 text-orange-700 hover:border-orange-200"
                              : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"
                    }`}
                  >
                    {item === "Todos" ? (
                      <BookOpen size={17} />
                    ) : (
                      <IconeTipo tipo={item} size={17} />
                    )}
                    {item === "Planejamento"
                      ? "Planejamentos"
                      : item === "Avaliação"
                        ? "Avaliações"
                        : item === "Atividade"
                          ? "Atividades"
                          : "Todos"}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  value={etapa}
                  onChange={(event) => setEtapa(event.target.value)}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-400"
                >
                  {etapas.map((item) => (
                    <option key={item} value={item}>
                      Etapa: {item}
                    </option>
                  ))}
                </select>

                <select
                  value={serie}
                  onChange={(event) => setSerie(event.target.value)}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-400"
                >
                  {series.map((item) => (
                    <option key={item} value={item}>
                      Ano / Série: {item}
                    </option>
                  ))}
                </select>

                <select
                  value={disciplina}
                  onChange={(event) =>
                    setDisciplina(event.target.value)
                  }
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-400"
                >
                  {disciplinas.map((item) => (
                    <option key={item} value={item}>
                      Disciplina: {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="cursor-pointer text-sm font-extrabold text-emerald-700 hover:text-emerald-800"
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Materiais disponíveis
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Escolha um material para visualizar antes de usar.
                </p>
              </div>

              <select
                value={ordenacao}
                onChange={(event) =>
                  setOrdenacao(event.target.value)
                }
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-emerald-400"
              >
                <option value="recentes">Mais recentes</option>
                <option value="antigos">Mais antigos</option>
                <option value="az">A–Z</option>
              </select>
            </div>

            {carregando && (
              <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-5 py-8">
                <Loader2
                  size={24}
                  className="animate-spin text-emerald-600"
                />
                <span className="text-sm font-bold text-slate-600">
                  Preparando a Biblioteca...
                </span>
              </div>
            )}

            {!carregando && erro && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
                <p className="font-bold text-red-700">{erro}</p>
              </div>
            )}

            {!carregando &&
              !erro &&
              materiaisFiltrados.length > 0 && (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {materiaisFiltrados.map((material) => {
                    const estilo = classeTipo(material.tipo);

                    return (
                      <article
                        key={`${material.tipo}-${material.id}`}
                        className="group flex min-h-[410px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div
                          className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${estilo.fundo}`}
                        >
                          {material.imagem ? (
                            <img
                              src={material.imagem}
                              alt={material.titulo}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div
                              className={`flex h-20 w-20 items-center justify-center rounded-3xl ${estilo.icone}`}
                            >
                              <IconeTipo
                                tipo={material.tipo}
                                size={38}
                              />
                            </div>
                          )}

                          <span
                            className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-extrabold ${estilo.selo}`}
                          >
                            <IconeTipo
                              tipo={material.tipo}
                              size={13}
                            />
                            {material.tipo}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <h3 className="line-clamp-2 text-[17px] font-black leading-6 text-slate-950">
                            {material.titulo}
                          </h3>

                          <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-500">
                            {material.subtitulo ||
                              "Material pedagógico pronto para usar."}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                              <GraduationCap size={14} />
                              {material.serie}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                              <BookOpen size={14} />
                              {material.disciplina}
                            </span>
                          </div>

                          <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                            <button
                              type="button"
                              onClick={() =>
                                visualizarMaterial(material)
                              }
                              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-extrabold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <FileText size={16} />
                              Visualizar
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                baixarMaterial(material)
                              }
                              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold text-white transition ${estilo.botao}`}
                            >
                              <Download size={16} />
                              Baixar
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

            {!carregando &&
              !erro &&
              materiaisFiltrados.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
                  <BookOpen
                    size={42}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-4 text-lg font-black text-slate-700">
                    Nenhum material encontrado
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Tente ajustar os filtros ou fazer outra busca.
                  </p>
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="mt-5 cursor-pointer rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-700"
                  >
                    Limpar filtros
                  </button>
                </div>
              )}

            <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950">
                      Não encontrou o que precisa?
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Crie um material personalizado no PlanejAI e
                      adapte à realidade da sua turma.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700"
                >
                  Criar material →
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>

      {materialAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={fecharModal}
        >
          <div
            className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-extrabold ${
                    classeTipo(materialAberto.tipo).selo
                  }`}
                >
                  <IconeTipo
                    tipo={materialAberto.tipo}
                    size={13}
                  />
                  {materialAberto.tipo}
                </span>

                <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  {materialAberto.titulo}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {materialAberto.serie} •{" "}
                  {materialAberto.disciplina}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <div className="max-h-[calc(94vh-170px)] overflow-y-auto bg-slate-50 p-4 sm:p-6">
              {carregandoDetalhe && (
                <div className="flex min-h-[300px] items-center justify-center gap-3">
                  <Loader2
                    size={26}
                    className="animate-spin text-emerald-600"
                  />
                  <span className="font-bold text-slate-600">
                    Abrindo material...
                  </span>
                </div>
              )}

              {!carregandoDetalhe &&
                detalheAberto &&
                materialAberto.tipo === "Atividade" && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    {detalheAberto.imagem ? (
                      <img
                        src={detalheAberto.imagem}
                        alt={materialAberto.titulo}
                        className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
                      />
                    ) : (
                      <div className="py-20 text-center text-slate-500">
                        Imagem não disponível.
                      </div>
                    )}
                  </div>
                )}

              {!carregandoDetalhe &&
                detalheAberto &&
                materialAberto.tipo === "Avaliação" && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    {detalheAberto.avaliacao_completa ? (
                      <iframe
                        title={`Prévia - ${materialAberto.titulo}`}
                        sandbox=""
                        srcDoc={`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: "Times New Roman", serif;
    margin: 24px;
    color: #111827;
    background: white;
  }
  img { max-width: 100%; height: auto; }
  table { max-width: 100%; border-collapse: collapse; }
</style>
</head>
<body>${detalheAberto.avaliacao_completa}</body>
</html>`}
                        className="min-h-[760px] w-full rounded-xl bg-white"
                      />
                    ) : (
                      <div className="py-20 text-center text-slate-500">
                        Avaliação não disponível.
                      </div>
                    )}
                  </div>
                )}

              {!carregandoDetalhe &&
                detalheAberto &&
                materialAberto.tipo === "Planejamento" && (
                  <div className="mx-auto max-w-4xl space-y-4">
                    {[
                      ["Temas", detalheAberto.conteudo?.temas],
                      [
                        "Objetivos e Habilidades",
                        detalheAberto.conteudo?.objetivos,
                      ],
                      [
                        "Recursos e Materiais",
                        detalheAberto.conteudo?.recursos,
                      ],
                      [
                        "Metodologia",
                        detalheAberto.conteudo?.metodologia,
                      ],
                      ["Avaliação", detalheAberto.conteudo?.avaliacao],
                      [
                        "Referências",
                        detalheAberto.conteudo?.referencias,
                      ],
                      [
                        "Atividade para Casa",
                        detalheAberto.conteudo?.atividade,
                      ],
                    ]
                      .filter(([, conteudo]) =>
                        String(conteudo || "").trim()
                      )
                      .map(([titulo, conteudo]) => (
                        <section
                          key={String(titulo)}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <h3 className="mb-3 text-lg font-black text-blue-700">
                            {titulo}
                          </h3>
                          <div className="whitespace-pre-wrap leading-7 text-slate-700">
                            {conteudo}
                          </div>
                        </section>
                      ))}
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={fecharModal}
                className="cursor-pointer rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => baixarMaterial(materialAberto)}
                disabled={carregandoDetalhe || !detalheAberto}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={17} />
                Baixar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
