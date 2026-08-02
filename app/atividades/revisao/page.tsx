"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import VisualizacaoExercicio from "../componentes/VisualizacaoExercicio";

type ModoCriacao = "folha" | "especifica" | "revisao";
type FormaConteudo = "tema" | "palavras";

type ConfiguracaoAtividade = {
  modoCriacao: ModoCriacao;
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  trabalhadoSala: string;
  observacoes: string;
  quantidade: number;
  tipoEspecifico?: string;
  formaConteudo?: FormaConteudo;
  palavras?: string[];
};

type ItemExercicio = {
  id: string;
  texto: string;
  resposta: string;
  imagemNecessaria: boolean;
  imagemDescricao: string;
  imagemUrl?: string;
  colunaA: string;
  colunaB: string;
  alternativas: string[];
  verdadeiro: boolean | null;
};

type Exercicio = {
  id: string;
  numero: number;
  tipo: string;
  titulo: string;
  comando: string;
  conteudoLivre: string;
  itens: ItemExercicio[];
  textoApoio: string;
  palavras: string[];
  pistas: string[];
  grade: string[];
  colunas: string[];
  imagemNecessaria: boolean;
  imagemDescricao: string;
  imagemUrl?: string;
  gabarito: string;
};

type AtividadeGerada = {
  titulo: string;
  subtitulo?: string;
  modoCriacao?: ModoCriacao;
  exercicios: Exercicio[];
};

type EdicaoExercicio = {
  titulo: string;
  tipo: string;
  comando: string;
  conteudoLivre: string;
  textoApoio: string;
  gabarito: string;
  palavrasTexto: string;
  pistasTexto: string;
  gradeTexto: string;
  colunasTexto: string;
  imagemNecessaria: boolean;
  imagemDescricao: string;
};

function nomeModo(modo: ModoCriacao) {
  if (modo === "especifica") return "Atividade específica";
  if (modo === "revisao") return "Folha de revisão";
  return "Folha de atividades";
}

function textoTipo(tipo: string) {
  return tipo
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function normalizarItem(
  item: Partial<ItemExercicio>,
  indice: number
): ItemExercicio {
  return {
    id:
      typeof item.id === "string" && item.id
        ? item.id
        : `item-${indice + 1}`,
    texto: typeof item.texto === "string" ? item.texto : "",
    resposta: typeof item.resposta === "string" ? item.resposta : "",
    imagemNecessaria: Boolean(item.imagemNecessaria),
    imagemDescricao:
      typeof item.imagemDescricao === "string"
        ? item.imagemDescricao
        : "",
    imagemUrl:
      typeof item.imagemUrl === "string" ? item.imagemUrl : undefined,
    colunaA: typeof item.colunaA === "string" ? item.colunaA : "",
    colunaB: typeof item.colunaB === "string" ? item.colunaB : "",
    alternativas: Array.isArray(item.alternativas)
      ? item.alternativas.map((alternativa) => String(alternativa))
      : [],
    verdadeiro:
      typeof item.verdadeiro === "boolean" ? item.verdadeiro : null,
  };
}

function normalizarExercicio(
  exercicio: Partial<Exercicio>,
  indice: number
): Exercicio {
  return {
    id:
      typeof exercicio.id === "string" && exercicio.id
        ? exercicio.id
        : `exercicio-${Date.now()}-${indice + 1}`,
    numero: indice + 1,
    tipo:
      typeof exercicio.tipo === "string" && exercicio.tipo.trim()
        ? exercicio.tipo
        : "outro",
    titulo:
      typeof exercicio.titulo === "string" && exercicio.titulo.trim()
        ? exercicio.titulo
        : `Exercício ${indice + 1}`,
    comando:
      typeof exercicio.comando === "string" ? exercicio.comando : "",
    conteudoLivre:
      typeof exercicio.conteudoLivre === "string"
        ? exercicio.conteudoLivre
        : "",
    itens: Array.isArray(exercicio.itens)
      ? exercicio.itens.map((item, itemIndice) =>
          normalizarItem(item, itemIndice)
        )
      : [],
    textoApoio:
      typeof exercicio.textoApoio === "string"
        ? exercicio.textoApoio
        : "",
    palavras: Array.isArray(exercicio.palavras)
      ? exercicio.palavras.map((palavra) => String(palavra))
      : [],
    pistas: Array.isArray(exercicio.pistas)
      ? exercicio.pistas.map((pista) => String(pista))
      : [],
    grade: Array.isArray(exercicio.grade)
      ? exercicio.grade.map((linha) => String(linha))
      : [],
    colunas: Array.isArray(exercicio.colunas)
      ? exercicio.colunas.map((coluna) => String(coluna))
      : [],
    imagemNecessaria: Boolean(exercicio.imagemNecessaria),
    imagemDescricao:
      typeof exercicio.imagemDescricao === "string"
        ? exercicio.imagemDescricao
        : "",
    imagemUrl:
      typeof exercicio.imagemUrl === "string"
        ? exercicio.imagemUrl
        : undefined,
    gabarito:
      typeof exercicio.gabarito === "string" ? exercicio.gabarito : "",
  };
}

export default function RevisaoAtividadePage() {
  const router = useRouter();

  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividade | null>(null);

  const [atividade, setAtividade] =
    useState<AtividadeGerada | null>(null);

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [idEmEdicao, setIdEmEdicao] = useState<string | null>(null);
  const [edicao, setEdicao] = useState<EdicaoExercicio | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const configuracaoSalva = localStorage.getItem(
      "configuracaoAtividade"
    );

    const atividadeSalva = localStorage.getItem("atividadeJson");

    if (!configuracaoSalva || !atividadeSalva) {
      setErro(
        "Não encontrei a atividade gerada. Volte e gere a atividade novamente."
      );
      return;
    }

    try {
      const configuracaoRecebida = JSON.parse(
        configuracaoSalva
      ) as ConfiguracaoAtividade;

      const atividadeRecebida = JSON.parse(
        atividadeSalva
      ) as AtividadeGerada;

      if (
        !atividadeRecebida ||
        !Array.isArray(atividadeRecebida.exercicios) ||
        atividadeRecebida.exercicios.length === 0
      ) {
        throw new Error("Lista de exercícios inválida.");
      }

      const exerciciosNormalizados =
        atividadeRecebida.exercicios.map(
          (exercicio, indice) =>
            normalizarExercicio(exercicio, indice)
        );

      setConfiguracao(configuracaoRecebida);
      setAtividade({
        ...atividadeRecebida,
        titulo:
          atividadeRecebida.titulo || "Atividade pedagógica",
        exercicios: exerciciosNormalizados,
      });
      setExercicios(exerciciosNormalizados);
    } catch (error) {
      console.error("Erro ao carregar atividade:", error);

      setErro(
        "A atividade foi encontrada, mas os dados ficaram inválidos. Volte e gere novamente."
      );
    }
  }, []);

  const resumoPalavras = useMemo(() => {
    if (!configuracao?.palavras?.length) return "";
    return configuracao.palavras.join(", ");
  }, [configuracao]);

  function persistir(lista: Exercicio[]) {
    if (!atividade) return;

    const atividadeAtualizada = {
      ...atividade,
      exercicios: lista,
    };

    setAtividade(atividadeAtualizada);

    localStorage.setItem(
      "atividadeJson",
      JSON.stringify(atividadeAtualizada)
    );
  }

  function excluirExercicio(id: string) {
    const novaLista = exercicios
      .filter((exercicio) => exercicio.id !== id)
      .map((exercicio, indice) => ({
        ...exercicio,
        numero: indice + 1,
      }));

    setExercicios(novaLista);
    persistir(novaLista);

    if (idEmEdicao === id) {
      setIdEmEdicao(null);
      setEdicao(null);
    }
  }

  function iniciarEdicao(exercicio: Exercicio) {
    setIdEmEdicao(exercicio.id);

    setEdicao({
      titulo: exercicio.titulo,
      tipo: exercicio.tipo,
      comando: exercicio.comando,
      conteudoLivre: exercicio.conteudoLivre,
      textoApoio: exercicio.textoApoio,
      gabarito: exercicio.gabarito,
      palavrasTexto: exercicio.palavras.join("\n"),
      pistasTexto: exercicio.pistas.join("\n"),
      gradeTexto: exercicio.grade.join("\n"),
      colunasTexto: exercicio.colunas.join("\n"),
      imagemNecessaria: exercicio.imagemNecessaria,
      imagemDescricao: exercicio.imagemDescricao,
    });
  }

  function cancelarEdicao() {
    setIdEmEdicao(null);
    setEdicao(null);
  }

  function salvarEdicao(id: string) {
    if (!edicao) return;

    const novaLista = exercicios.map((exercicio) => {
      if (exercicio.id !== id) return exercicio;

      return {
        ...exercicio,
        titulo: edicao.titulo.trim() || exercicio.titulo,
        tipo: edicao.tipo.trim() || exercicio.tipo,
        comando: edicao.comando.trim(),
        conteudoLivre: edicao.conteudoLivre.trim(),
        textoApoio: edicao.textoApoio.trim(),
        gabarito: edicao.gabarito.trim(),
        palavras: edicao.palavrasTexto
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        pistas: edicao.pistasTexto
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        grade: edicao.gradeTexto
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        colunas: edicao.colunasTexto
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        imagemNecessaria: edicao.imagemNecessaria,
        imagemDescricao: edicao.imagemDescricao.trim(),
      };
    });

    setExercicios(novaLista);
    persistir(novaLista);
    cancelarEdicao();
  }

  function adicionarExercicio() {
    const novoExercicio: Exercicio = {
      id: `exercicio-${Date.now()}`,
      numero: exercicios.length + 1,
      tipo: "outro",
      titulo: "Novo exercício",
      comando: "",
      conteudoLivre: "",
      itens: [],
      textoApoio: "",
      palavras: [],
      pistas: [],
      grade: [],
      colunas: [],
      imagemNecessaria: false,
      imagemDescricao: "",
      gabarito: "",
    };

    const novaLista = [...exercicios, novoExercicio];

    setExercicios(novaLista);
    persistir(novaLista);
    iniciarEdicao(novoExercicio);
  }

  function solicitarRefazer() {
    setErro(
      "O botão Refazer será conectado à IA no próximo passo."
    );
  }

  function montarFolhaFinal() {
    if (!atividade) return;

    persistir(exercicios);
    router.push("/atividades/resultado");
  }



  if (erro && (!configuracao || !atividade)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-red-700">{erro}</p>

          <button
            type="button"
            onClick={() => router.push("/atividades")}
            className="mt-5 cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white"
          >
            Voltar para atividades
          </button>
        </div>
      </main>
    );
  }

  if (!configuracao || !atividade) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 font-semibold text-emerald-700">
          <Sparkles className="animate-pulse" />
          Carregando atividade...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Revisão da atividade
            </h1>

            <p className="text-sm text-slate-700">
              {configuracao.serie} • {configuracao.disciplina} •{" "}
              {configuracao.conteudo}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/atividades")}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm"
          >
            <ArrowLeft size={19} />
            Voltar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                {nomeModo(configuracao.modoCriacao)}
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {atividade.titulo}
              </h2>

              {atividade.subtitulo && (
                <p className="mt-1 text-sm text-slate-600">
                  {atividade.subtitulo}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm">
              <strong>Exercícios:</strong> {exercicios.length}
            </div>
          </div>

          {resumoPalavras && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm">
              <strong>Palavras escolhidas:</strong> {resumoPalavras}
            </div>
          )}
        </div>

        {erro && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {erro}
          </div>
        )}

        <div className="mt-5 space-y-4">
          {exercicios.map((exercicio) => {
            const estaEditando = idEmEdicao === exercicio.id;

            return (
              <article
                key={exercicio.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <GripVertical className="mt-1 text-slate-400" size={22} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">
                          {configuracao.modoCriacao === "especifica"
                            ? "ATIVIDADE"
                            : `EXERCÍCIO ${exercicio.numero}`}
                        </p>

                        <h3 className="text-lg font-bold text-slate-950">
                          {exercicio.titulo}
                        </h3>

                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {textoTipo(exercicio.tipo)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {estaEditando ? (
                          <>
                            <button
                              type="button"
                              onClick={() => salvarEdicao(exercicio.id)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                            >
                              <Save size={16} />
                              Salvar
                            </button>

                            <button
                              type="button"
                              onClick={cancelarEdicao}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                            >
                              <X size={16} />
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => iniciarEdicao(exercicio)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                            >
                              <Pencil size={16} />
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={solicitarRefazer}
                              className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                            >
                              <RefreshCw size={16} />
                              Refazer
                            </button>

                            <button
                              type="button"
                              onClick={() => excluirExercicio(exercicio.id)}
                              className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                            >
                              <Trash2 size={16} />
                              Excluir
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {estaEditando && edicao ? (
                      <div className="space-y-4 pt-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <input
                            value={edicao.titulo}
                            onChange={(event) =>
                              setEdicao({ ...edicao, titulo: event.target.value })
                            }
                            placeholder="Título"
                            className="rounded-xl border border-slate-300 px-4 py-3"
                          />

                          <input
                            value={edicao.tipo}
                            onChange={(event) =>
                              setEdicao({ ...edicao, tipo: event.target.value })
                            }
                            placeholder="Tipo"
                            className="rounded-xl border border-slate-300 px-4 py-3"
                          />
                        </div>

                        <textarea
                          value={edicao.comando}
                          onChange={(event) =>
                            setEdicao({ ...edicao, comando: event.target.value })
                          }
                          placeholder="Comando"
                          className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                        />

                        <textarea
                          value={edicao.textoApoio}
                          onChange={(event) =>
                            setEdicao({
                              ...edicao,
                              textoApoio: event.target.value,
                            })
                          }
                          placeholder="Texto de apoio"
                          className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
                        />

                        <textarea
                          value={edicao.conteudoLivre}
                          onChange={(event) =>
                            setEdicao({
                              ...edicao,
                              conteudoLivre: event.target.value,
                            })
                          }
                          placeholder="Conteúdo livre"
                          className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                          <textarea
                            value={edicao.palavrasTexto}
                            onChange={(event) =>
                              setEdicao({
                                ...edicao,
                                palavrasTexto: event.target.value,
                              })
                            }
                            placeholder="Palavras — uma por linha"
                            className="min-h-32 rounded-xl border border-slate-300 px-4 py-3"
                          />

                          <textarea
                            value={edicao.pistasTexto}
                            onChange={(event) =>
                              setEdicao({
                                ...edicao,
                                pistasTexto: event.target.value,
                              })
                            }
                            placeholder="Pistas — uma por linha"
                            className="min-h-32 rounded-xl border border-slate-300 px-4 py-3"
                          />
                        </div>

                        <textarea
                          value={edicao.gradeTexto}
                          onChange={(event) =>
                            setEdicao({
                              ...edicao,
                              gradeTexto: event.target.value,
                            })
                          }
                          placeholder="Grade — uma linha por linha"
                          className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono"
                        />

                        <textarea
                          value={edicao.gabarito}
                          onChange={(event) =>
                            setEdicao({ ...edicao, gabarito: event.target.value })
                          }
                          placeholder="Gabarito"
                          className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3"
                        />
                      </div>
                    ) : (
                      <VisualizacaoExercicio exercicio={exercicio} />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={adicionarExercicio}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-6 py-3 font-bold text-emerald-700"
          >
            <Plus size={20} />
            Adicionar exercício
          </button>

          <button
            type="button"
            onClick={montarFolhaFinal}
            disabled={exercicios.length === 0}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white disabled:bg-emerald-300"
          >
            <Sparkles size={20} />
            Montar folha final
          </button>
        </div>
      </section>
    </main>
  );
}