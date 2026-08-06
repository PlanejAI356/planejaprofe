"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ImageIcon,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ModoCriacao = "automatica" | "personalizada";

type ConfiguracaoAtividade = {
  modoCriacao: ModoCriacao;
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  trabalhadoSala: string;
  pedidoPersonalizado?: string;
  observacoes: string;
  quantidadePaginas: number;
  fonteAtividade: string;
  usarMaiusculas: boolean;
};

type ItemExercicio = {
  id: string;
  texto: string;
  resposta: string;
  imagemNecessaria: boolean;
  imagemDescricao: string;
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
  fonteAtividade?: string;
  usarMaiusculas?: boolean;
  quantidadePaginas?: number;
  exercicios: Exercicio[];
};

type EdicaoExercicio = {
  titulo: string;
  tipo: string;
  comando: string;
  conteudoLivre: string;
  textoApoio: string;
  itensJson: string;
  palavrasTexto: string;
  pistasTexto: string;
  gradeTexto: string;
  colunasTexto: string;
  gabarito: string;
  imagemNecessaria: boolean;
  imagemDescricao: string;
};

function nomeModo(modo: ModoCriacao) {
  return modo === "personalizada"
    ? "Atividade personalizada"
    : "Atividade completa";
}

function textoSeguro(valor: unknown) {
  return typeof valor === "string" ? valor : "";
}

function listaTexto(valor: unknown): string[] {
  return Array.isArray(valor)
    ? valor.map((item) => String(item)).filter(Boolean)
    : [];
}

function normalizarItem(
  item: Partial<ItemExercicio>,
  indice: number
): ItemExercicio {
  return {
    id:
      typeof item.id === "string" && item.id.trim()
        ? item.id
        : `item-${indice + 1}`,
    texto: textoSeguro(item.texto),
    resposta: textoSeguro(item.resposta),
    imagemNecessaria: Boolean(item.imagemNecessaria),
    imagemDescricao: textoSeguro(item.imagemDescricao),
    colunaA: textoSeguro(item.colunaA),
    colunaB: textoSeguro(item.colunaB),
    alternativas: listaTexto(item.alternativas),
    verdadeiro:
      typeof item.verdadeiro === "boolean"
        ? item.verdadeiro
        : null,
  };
}

function normalizarExercicio(
  exercicio: Partial<Exercicio>,
  indice: number
): Exercicio {
  return {
    id:
      typeof exercicio.id === "string" && exercicio.id.trim()
        ? exercicio.id
        : `exercicio-${Date.now()}-${indice + 1}`,
    numero: indice + 1,
    tipo:
      typeof exercicio.tipo === "string" && exercicio.tipo.trim()
        ? exercicio.tipo
        : "outro",
    titulo:
      typeof exercicio.titulo === "string" &&
      exercicio.titulo.trim()
        ? exercicio.titulo
        : `Exercício ${indice + 1}`,
    comando: textoSeguro(exercicio.comando),
    conteudoLivre: textoSeguro(exercicio.conteudoLivre),
    itens: Array.isArray(exercicio.itens)
      ? exercicio.itens.map((item, itemIndice) =>
          normalizarItem(
            typeof item === "object" && item !== null
              ? (item as Partial<ItemExercicio>)
              : { texto: String(item) },
            itemIndice
          )
        )
      : [],
    textoApoio: textoSeguro(exercicio.textoApoio),
    palavras: listaTexto(exercicio.palavras),
    pistas: listaTexto(exercicio.pistas),
    grade: listaTexto(exercicio.grade),
    colunas: listaTexto(exercicio.colunas),
    imagemNecessaria: Boolean(exercicio.imagemNecessaria),
    imagemDescricao: textoSeguro(exercicio.imagemDescricao),
    imagemUrl:
      typeof exercicio.imagemUrl === "string"
        ? exercicio.imagemUrl
        : undefined,
    gabarito: textoSeguro(exercicio.gabarito),
  };
}

function separarLinhas(texto: string) {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

function mostrarItem(item: ItemExercicio) {
  if (item.colunaA || item.colunaB) {
    return `${item.colunaA} — ${item.colunaB}`;
  }

  if (item.alternativas.length > 0) {
    return `${item.texto}\n${item.alternativas
      .map((alternativa, indice) => `${String.fromCharCode(65 + indice)}) ${alternativa}`)
      .join("\n")}`;
  }

  if (typeof item.verdadeiro === "boolean") {
    return `( ) ${item.texto}`;
  }

  return item.texto || item.resposta || "Item sem texto";
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

      const atividadeNormalizada: AtividadeGerada = {
        ...atividadeRecebida,
        titulo:
          atividadeRecebida.titulo || "Atividade pedagógica",
        fonteAtividade:
          atividadeRecebida.fonteAtividade ||
          configuracaoRecebida.fonteAtividade ||
          "Times New Roman",
        usarMaiusculas:
          atividadeRecebida.usarMaiusculas ??
          configuracaoRecebida.usarMaiusculas ??
          false,
        quantidadePaginas:
          atividadeRecebida.quantidadePaginas ||
          configuracaoRecebida.quantidadePaginas ||
          1,
        exercicios: exerciciosNormalizados,
      };

      setConfiguracao(configuracaoRecebida);
      setAtividade(atividadeNormalizada);
      setExercicios(exerciciosNormalizados);

      localStorage.setItem(
        "atividadeJson",
        JSON.stringify(atividadeNormalizada)
      );
    } catch (error) {
      console.error("Erro ao carregar atividade:", error);

      setErro(
        "A atividade foi encontrada, mas os dados ficaram inválidos. Volte e gere novamente."
      );
    }
  }, []);

  function persistir(lista: Exercicio[]) {
    if (!atividade) return;

    const listaNumerada = lista.map((exercicio, indice) => ({
      ...exercicio,
      numero: indice + 1,
    }));

    const atividadeAtualizada = {
      ...atividade,
      exercicios: listaNumerada,
    };

    setAtividade(atividadeAtualizada);
    setExercicios(listaNumerada);

    localStorage.setItem(
      "atividadeJson",
      JSON.stringify(atividadeAtualizada)
    );
  }

  function excluirExercicio(id: string) {
    persistir(
      exercicios.filter((exercicio) => exercicio.id !== id)
    );

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
      itensJson: JSON.stringify(exercicio.itens, null, 2),
      palavrasTexto: exercicio.palavras.join("\n"),
      pistasTexto: exercicio.pistas.join("\n"),
      gradeTexto: exercicio.grade.join("\n"),
      colunasTexto: exercicio.colunas.join("\n"),
      gabarito: exercicio.gabarito,
      imagemNecessaria: exercicio.imagemNecessaria,
      imagemDescricao: exercicio.imagemDescricao,
    });

    setErro("");
  }

  function cancelarEdicao() {
    setIdEmEdicao(null);
    setEdicao(null);
    setErro("");
  }

  function salvarEdicao(id: string) {
    if (!edicao) return;

    let itensEditados: ItemExercicio[] = [];

    try {
      const itensRecebidos = JSON.parse(edicao.itensJson);

      if (!Array.isArray(itensRecebidos)) {
        throw new Error("Os itens precisam formar uma lista.");
      }

      itensEditados = itensRecebidos.map((item, indice) =>
        normalizarItem(item, indice)
      );
    } catch {
      setErro(
        "Os itens desse exercício estão com formato inválido. Corrija o campo de itens antes de salvar."
      );
      return;
    }

    const novaLista = exercicios.map((exercicio) => {
      if (exercicio.id !== id) return exercicio;

      return {
        ...exercicio,
        titulo: edicao.titulo.trim() || exercicio.titulo,
        tipo: edicao.tipo.trim() || exercicio.tipo,
        comando: edicao.comando.trim(),
        conteudoLivre: edicao.conteudoLivre.trim(),
        textoApoio: edicao.textoApoio.trim(),
        itens: itensEditados,
        palavras: separarLinhas(edicao.palavrasTexto),
        pistas: separarLinhas(edicao.pistasTexto),
        grade: separarLinhas(edicao.gradeTexto),
        colunas: separarLinhas(edicao.colunasTexto),
        gabarito: edicao.gabarito.trim(),
        imagemNecessaria: edicao.imagemNecessaria,
        imagemDescricao: edicao.imagemDescricao.trim(),
      };
    });

    persistir(novaLista);
    cancelarEdicao();
  }

  function adicionarExercicio() {
    const novoExercicio: Exercicio = {
      id: `exercicio-${Date.now()}`,
      numero: exercicios.length + 1,
      titulo: "Novo exercício",
      tipo: "outro",
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

    persistir(novaLista);
    iniciarEdicao(novoExercicio);
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
            className="mt-5 cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
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
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            <ArrowLeft size={19} />
            Voltar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

              <p className="mt-2 text-sm text-slate-600">
                Revise, edite ou exclua os exercícios antes de montar
                a folha final.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700">
              <p>
                <strong>Exercícios:</strong> {exercicios.length}
              </p>
              <p className="mt-1">
                <strong>Páginas:</strong>{" "}
                {configuracao.quantidadePaginas}
              </p>
              <p className="mt-1">
                <strong>Fonte:</strong>{" "}
                {configuracao.fonteAtividade}
              </p>
              <p className="mt-1">
                <strong>Escrita:</strong>{" "}
                {configuracao.usarMaiusculas
                  ? "LETRAS MAIÚSCULAS"
                  : "Normal"}
              </p>
            </div>
          </div>

          {configuracao.modoCriacao === "personalizada" &&
            configuracao.pedidoPersonalizado && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-white px-4 py-3">
                <p className="text-sm font-bold text-slate-950">
                  Pedido personalizado
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                  {configuracao.pedidoPersonalizado}
                </p>
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
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      EXERCÍCIO {exercicio.numero}
                    </p>

                    <h3 className="text-lg font-bold text-slate-950">
                      {exercicio.titulo}
                    </h3>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {exercicio.tipo.replaceAll("_", " ")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {estaEditando ? (
                      <>
                        <button
                          type="button"
                          onClick={() => salvarEdicao(exercicio.id)}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                        >
                          <Save size={16} />
                          Salvar
                        </button>

                        <button
                          type="button"
                          onClick={cancelarEdicao}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
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
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          <Pencil size={16} />
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirExercicio(exercicio.id)
                          }
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
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
                          setEdicao({
                            ...edicao,
                            titulo: event.target.value,
                          })
                        }
                        placeholder="Título"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />

                      <input
                        value={edicao.tipo}
                        onChange={(event) =>
                          setEdicao({
                            ...edicao,
                            tipo: event.target.value,
                          })
                        }
                        placeholder="Tipo"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <textarea
                      value={edicao.comando}
                      onChange={(event) =>
                        setEdicao({
                          ...edicao,
                          comando: event.target.value,
                        })
                      }
                      placeholder="Comando"
                      className="min-h-24 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
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
                      className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
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
                      className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                    />

                    <div>
                      <label className="mb-2 block font-semibold text-slate-900">
                        Itens estruturados
                      </label>
                      <textarea
                        value={edicao.itensJson}
                        onChange={(event) =>
                          setEdicao({
                            ...edicao,
                            itensJson: event.target.value,
                          })
                        }
                        className="min-h-64 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

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
                        className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
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
                        className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />

                      <textarea
                        value={edicao.gradeTexto}
                        onChange={(event) =>
                          setEdicao({
                            ...edicao,
                            gradeTexto: event.target.value,
                          })
                        }
                        placeholder="Grade — uma linha por linha"
                        className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />

                      <textarea
                        value={edicao.colunasTexto}
                        onChange={(event) =>
                          setEdicao({
                            ...edicao,
                            colunasTexto: event.target.value,
                          })
                        }
                        placeholder="Colunas — uma por linha"
                        className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <textarea
                      value={edicao.gabarito}
                      onChange={(event) =>
                        setEdicao({
                          ...edicao,
                          gabarito: event.target.value,
                        })
                      }
                      placeholder="Gabarito"
                      className="min-h-24 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                    />

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <label className="flex cursor-pointer items-center gap-3 font-semibold text-slate-800">
                        <input
                          type="checkbox"
                          checked={edicao.imagemNecessaria}
                          onChange={(event) =>
                            setEdicao({
                              ...edicao,
                              imagemNecessaria:
                                event.target.checked,
                            })
                          }
                          className="h-5 w-5 cursor-pointer accent-emerald-600"
                        />
                        Este exercício precisa de imagem geral
                      </label>

                      {edicao.imagemNecessaria && (
                        <textarea
                          value={edicao.imagemDescricao}
                          onChange={(event) =>
                            setEdicao({
                              ...edicao,
                              imagemDescricao:
                                event.target.value,
                            })
                          }
                          placeholder="Descrição da imagem"
                          className="mt-3 min-h-24 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4">
                    {exercicio.textoApoio && (
                      <div className="mb-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 leading-7 text-slate-800">
                        {exercicio.textoApoio}
                      </div>
                    )}

                    {exercicio.comando && (
                      <p className="font-semibold leading-7 text-slate-900">
                        {exercicio.comando}
                      </p>
                    )}

                    {exercicio.conteudoLivre && (
                      <div className="mt-3 whitespace-pre-wrap leading-7 text-slate-800">
                        {exercicio.conteudoLivre}
                      </div>
                    )}

                    {exercicio.itens.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {exercicio.itens.map((item, indice) => (
                          <div
                            key={item.id || `${exercicio.id}-${indice}`}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
                          >
                            <div className="whitespace-pre-wrap">
                              {mostrarItem(item)}
                            </div>

                            {item.imagemNecessaria && (
                              <div className="mt-3 flex items-start gap-3 rounded-lg border border-dashed border-blue-300 bg-blue-50 p-3">
                                <ImageIcon
                                  size={22}
                                  className="shrink-0 text-blue-600"
                                />
                                <p className="text-sm text-slate-600">
                                  {item.imagemDescricao ||
                                    "Imagem necessária para este item."}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {exercicio.palavras.length > 0 && (
                      <div className="mt-4">
                        <strong>Palavras:</strong>{" "}
                        {exercicio.palavras.join(", ")}
                      </div>
                    )}

                    {exercicio.pistas.length > 0 && (
                      <div className="mt-4">
                        <strong>Pistas:</strong>
                        <ol className="mt-2 list-decimal space-y-1 pl-6">
                          {exercicio.pistas.map((pista, indice) => (
                            <li key={`${exercicio.id}-pista-${indice}`}>
                              {pista}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {exercicio.grade.length > 0 && (
                      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono leading-7">
                        {exercicio.grade.map((linha, indice) => (
                          <div
                            key={`${exercicio.id}-grade-${indice}`}
                            className="whitespace-pre"
                          >
                            {linha}
                          </div>
                        ))}
                      </div>
                    )}

                    {exercicio.imagemNecessaria && (
                      <div className="mt-4 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <ImageIcon
                            size={25}
                            className="shrink-0 text-blue-600"
                          />
                          <div>
                            <p className="font-bold text-slate-900">
                              Imagem geral necessária
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {exercicio.imagemDescricao ||
                                "A descrição ainda não foi informada."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {exercicio.gabarito && (
                      <details className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <summary className="cursor-pointer font-bold text-emerald-800">
                          Ver gabarito
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {exercicio.gabarito}
                        </p>
                      </details>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={adicionarExercicio}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-6 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            <Plus size={20} />
            Adicionar exercício
          </button>

          <button
            type="button"
            onClick={montarFolhaFinal}
            disabled={exercicios.length === 0}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            <Sparkles size={20} />
            Montar folha final
          </button>
        </div>
      </section>
    </main>
  );
}