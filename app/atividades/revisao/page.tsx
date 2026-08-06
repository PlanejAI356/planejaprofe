"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import LetraTracejada from "../visualizacao/LetraTracejada";

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
  fonteAtividade?: string;
  usarMaiusculas?: boolean;
  quantidadePaginas?: number;
  exercicios: Exercicio[];
};

function normalizarLista(valor: unknown): string[] {
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
    texto: typeof item.texto === "string" ? item.texto : "",
    resposta:
      typeof item.resposta === "string" ? item.resposta : "",
    imagemNecessaria: Boolean(item.imagemNecessaria),
    imagemDescricao:
      typeof item.imagemDescricao === "string"
        ? item.imagemDescricao
        : "",
    imagemUrl:
      typeof item.imagemUrl === "string"
        ? item.imagemUrl
        : undefined,
    colunaA:
      typeof item.colunaA === "string" ? item.colunaA : "",
    colunaB:
      typeof item.colunaB === "string" ? item.colunaB : "",
    alternativas: normalizarLista(item.alternativas),
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
    comando:
      typeof exercicio.comando === "string"
        ? exercicio.comando
        : "",
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
    palavras: normalizarLista(exercicio.palavras),
    pistas: normalizarLista(exercicio.pistas),
    grade: normalizarLista(exercicio.grade),
    colunas: normalizarLista(exercicio.colunas),
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
      typeof exercicio.gabarito === "string"
        ? exercicio.gabarito
        : "",
  };
}

function EspacoImagem({
  descricao,
  url,
}: {
  descricao: string;
  url?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={descricao}
        className="mx-auto h-28 w-28 object-contain"
      />
    );
  }

  return (
    <div className="flex h-28 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-center">
      <div>
        <ImageIcon
          size={24}
          className="mx-auto mb-2 text-slate-400"
        />
        <p className="text-xs leading-4 text-slate-500">
          {descricao || "Imagem será inserida aqui"}
        </p>
      </div>
    </div>
  );
}

function LinhasResposta({
  quantidade = 2,
}: {
  quantidade?: number;
}) {
  return (
    <div className="mt-3 space-y-4">
      {Array.from({ length: quantidade }).map((_, indice) => (
        <div
          key={indice}
          className="h-4 border-b border-slate-700"
        />
      ))}
    </div>
  );
}

function ExercicioVisual({
  exercicio,
}: {
  exercicio: Exercicio;
}) {
  const ehVisual =
    exercicio.tipo === "ditado_ilustrado" ||
    exercicio.tipo === "escreva_nome_figuras" ||
    exercicio.tipo === "circule_figuras" ||
    exercicio.tipo === "pinte";

  const ehDiscursivo =
    exercicio.tipo === "discursiva" ||
    exercicio.tipo === "interpretacao_texto" ||
    exercicio.tipo === "problema_matematico";

  return (
    <section className="quebra-evitar mb-7">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
          {exercicio.numero}
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-950">
            {exercicio.titulo}
          </h2>

          {exercicio.comando && (
            <p className="mt-1 leading-6 text-slate-900">
              {exercicio.comando}
            </p>
          )}
        </div>
      </div>

      {exercicio.textoApoio && (
        <div className="mb-4 rounded-xl border border-slate-300 bg-slate-50 p-4 text-justify leading-6">
          {exercicio.textoApoio}
        </div>
      )}

      {exercicio.conteudoLivre &&
        exercicio.tipo !== "letra_tracejada" &&
        exercicio.tipo !== "tracejado" && (
          <div className="mb-4 whitespace-pre-wrap leading-7">
            {exercicio.conteudoLivre}
          </div>
        )}

      {(exercicio.tipo === "letra_tracejada" ||
        exercicio.tipo === "tracejado") && (
        <div className="mb-5">
          <LetraTracejada
            exercicio={{
              conteudoLivre:
                exercicio.conteudoLivre ||
                exercicio.titulo ||
                "A",
              titulo: "",
              comando: "",
            }}
          />
        </div>
      )}

      {exercicio.imagemNecessaria && (
        <div className="mb-4 max-w-52">
          <EspacoImagem
            descricao={exercicio.imagemDescricao}
            url={exercicio.imagemUrl}
          />
        </div>
      )}

      {exercicio.itens.length > 0 && (
        <div
          className={
            ehVisual
              ? "grid grid-cols-2 gap-4 sm:grid-cols-3"
              : "space-y-3"
          }
        >
          {exercicio.itens.map((item, indice) => {
            if (item.colunaA || item.colunaB) {
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[28px_1fr_1fr] gap-3 border-b border-slate-300 py-2"
                >
                  <span>{indice + 1}.</span>
                  <span>{item.colunaA}</span>
                  <span>{item.colunaB}</span>
                </div>
              );
            }

            if (item.alternativas.length > 0) {
              return (
                <div key={item.id} className="quebra-evitar">
                  <p className="font-medium">
                    {indice + 1}. {item.texto}
                  </p>

                  <div className="mt-2 space-y-1 pl-5">
                    {item.alternativas.map(
                      (alternativa, alternativaIndice) => (
                        <p key={alternativaIndice}>
                          ( ){" "}
                          {String.fromCharCode(
                            65 + alternativaIndice
                          )}
                          ) {alternativa}
                        </p>
                      )
                    )}
                  </div>
                </div>
              );
            }

            if (typeof item.verdadeiro === "boolean") {
              return (
                <p key={item.id}>
                  ( ) {item.texto}
                </p>
              );
            }

            if (
              item.imagemNecessaria ||
              ehVisual
            ) {
              return (
                <div
                  key={item.id}
                  className="quebra-evitar rounded-xl border border-slate-300 p-3"
                >
                  <EspacoImagem
                    descricao={item.imagemDescricao}
                    url={item.imagemUrl}
                  />

                  {(exercicio.tipo ===
                    "ditado_ilustrado" ||
                    exercicio.tipo ===
                      "escreva_nome_figuras") && (
                    <div className="mt-4 h-6 border-b border-slate-700" />
                  )}
                </div>
              );
            }

            return (
              <div key={item.id} className="quebra-evitar">
                <p>
                  {indice + 1}.{" "}
                  {item.texto || item.resposta}
                </p>

                {ehDiscursivo && (
                  <LinhasResposta quantidade={2} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {exercicio.palavras.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-3 text-center">
          {exercicio.palavras.join(" • ")}
        </div>
      )}

      {exercicio.pistas.length > 0 && (
        <ol className="mt-4 list-decimal space-y-1 pl-6">
          {exercicio.pistas.map((pista, indice) => (
            <li key={indice}>{pista}</li>
          ))}
        </ol>
      )}

      {exercicio.grade.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-300 bg-white p-4 text-center font-mono leading-8 tracking-widest">
          {exercicio.grade.map((linha, indice) => (
            <div key={indice} className="whitespace-pre">
              {linha}
            </div>
          ))}
        </div>
      )}

      {exercicio.tipo === "producao_texto" && (
        <LinhasResposta quantidade={7} />
      )}
    </section>
  );
}


type AlvoImagem =
  | {
      tipo: "exercicio";
      exercicioId: string;
      descricao: string;
    }
  | {
      tipo: "item";
      exercicioId: string;
      itemId: string;
      descricao: string;
    };

function descricaoLimpa(valor: string) {
  return valor
    .replace(/^uma figura de\s+/i, "")
    .replace(/^imagem de\s+/i, "")
    .replace(/,\s*pequen[ao].*$/i, "")
    .trim();
}

function encontrarImagensPendentes(
  lista: Exercicio[]
): AlvoImagem[] {
  const pendentes: AlvoImagem[] = [];

  for (const exercicio of lista) {
    if (
      exercicio.imagemNecessaria &&
      exercicio.imagemDescricao.trim() &&
      !exercicio.imagemUrl
    ) {
      pendentes.push({
        tipo: "exercicio",
        exercicioId: exercicio.id,
        descricao: descricaoLimpa(
          exercicio.imagemDescricao
        ),
      });
    }

    for (const item of exercicio.itens) {
      if (
        item.imagemNecessaria &&
        item.imagemDescricao.trim() &&
        !item.imagemUrl
      ) {
        pendentes.push({
          tipo: "item",
          exercicioId: exercicio.id,
          itemId: item.id,
          descricao: descricaoLimpa(
            item.imagemDescricao
          ),
        });
      }
    }
  }

  return pendentes;
}

export default function RevisaoAtividadePage() {
  const router = useRouter();

  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividade | null>(null);

  const [atividade, setAtividade] =
    useState<AtividadeGerada | null>(null);

  const [exercicios, setExercicios] =
    useState<Exercicio[]>([]);

  const [erro, setErro] = useState("");
  const [gerandoImagens, setGerandoImagens] =
    useState(false);
  const [progressoImagens, setProgressoImagens] =
    useState("");
  const [mensagemImagens, setMensagemImagens] =
    useState("");
  const [geracaoAutomaticaIniciada, setGeracaoAutomaticaIniciada] =
    useState(false);

  useEffect(() => {
    try {
      const configuracaoSalva = localStorage.getItem(
        "configuracaoAtividade"
      );

      const atividadeSalva =
        localStorage.getItem("atividadeJson");

      if (!configuracaoSalva || !atividadeSalva) {
        setErro(
          "Não encontrei a atividade gerada. Volte e crie uma nova atividade."
        );
        return;
      }

      const configuracaoRecebida = JSON.parse(
        configuracaoSalva
      ) as ConfiguracaoAtividade;

      const atividadeRecebida = JSON.parse(
        atividadeSalva
      ) as AtividadeGerada;

      if (
        !atividadeRecebida ||
        !Array.isArray(
          atividadeRecebida.exercicios
        ) ||
        atividadeRecebida.exercicios.length === 0
      ) {
        throw new Error(
          "A atividade não possui exercícios."
        );
      }

      const exerciciosNormalizados =
        atividadeRecebida.exercicios.map(
          (exercicio, indice) =>
            normalizarExercicio(
              exercicio,
              indice
            )
        );

      const atividadeNormalizada = {
        ...atividadeRecebida,
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
      console.error(
        "Erro ao carregar atividade:",
        error
      );

      setErro(
        "Os dados da atividade ficaram inválidos. Volte e gere novamente."
      );
    }
  }, []);

  function persistir(
    novaLista: Exercicio[]
  ) {
    if (!atividade) return;

    const listaNumerada = novaLista.map(
      (exercicio, indice) => ({
        ...exercicio,
        numero: indice + 1,
      })
    );

    const atividadeAtualizada = {
      ...atividade,
      exercicios: listaNumerada,
    };

    setExercicios(listaNumerada);
    setAtividade(atividadeAtualizada);

    localStorage.setItem(
      "atividadeJson",
      JSON.stringify(atividadeAtualizada)
    );
  }


  function salvarListaComImagens(
    lista: Exercicio[]
  ) {
    const listaNumerada = lista.map(
      (exercicio, indice) => ({
        ...exercicio,
        numero: indice + 1,
      })
    );

    setExercicios(listaNumerada);

    setAtividade((atividadeAtual) => {
      if (!atividadeAtual) return atividadeAtual;

      const novaAtividade = {
        ...atividadeAtual,
        exercicios: listaNumerada,
      };

      try {
        localStorage.setItem(
          "atividadeJson",
          JSON.stringify(novaAtividade)
        );
      } catch (error) {
        console.error(
          "Não foi possível salvar as imagens no navegador:",
          error
        );

        setMensagemImagens(
          "As imagens foram geradas, mas o navegador não conseguiu salvar todas localmente."
        );
      }

      return novaAtividade;
    });
  }

  async function solicitarImagem(
    descricao: string
  ) {
    const resposta = await fetch(
      "/api/gerar-imagem-atividade",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao,
          estilo:
            "ilustração infantil didática, contorno nítido, cores suaves, fundo branco",
        }),
      }
    );

    const tipoResposta =
      resposta.headers.get("content-type") || "";

    if (!tipoResposta.includes("application/json")) {
      throw new Error(
        "O servidor não retornou uma imagem válida."
      );
    }

    const dados = await resposta.json();

    if (!resposta.ok || !dados.imagem) {
      throw new Error(
        dados.erro ||
          "Não foi possível gerar uma das imagens."
      );
    }

    return String(dados.imagem);
  }

  async function gerarImagensPendentes() {
    if (gerandoImagens) return;

    const fila = encontrarImagensPendentes(
      exercicios
    );

    if (fila.length === 0) {
      setMensagemImagens(
        "Todas as imagens desta atividade já estão prontas."
      );
      return;
    }

    setErro("");
    setMensagemImagens("");
    setGerandoImagens(true);

    const cache = new Map<string, string>();
    let listaAtual = exercicios.map(
      (exercicio) => ({
        ...exercicio,
        itens: exercicio.itens.map(
          (item) => ({ ...item })
        ),
      })
    );

    let geradas = 0;
    let falhas = 0;

    for (
      let indice = 0;
      indice < fila.length;
      indice += 1
    ) {
      const alvo = fila[indice];

      setProgressoImagens(
        `Gerando imagem ${indice + 1} de ${fila.length}: ${alvo.descricao}`
      );

      try {
        const chaveCache =
          alvo.descricao.toLocaleLowerCase(
            "pt-BR"
          );

        let imagem = cache.get(chaveCache);

        if (!imagem) {
          imagem = await solicitarImagem(
            alvo.descricao
          );

          cache.set(chaveCache, imagem);
        }

        listaAtual = listaAtual.map(
          (exercicio) => {
            if (
              exercicio.id !==
              alvo.exercicioId
            ) {
              return exercicio;
            }

            if (alvo.tipo === "exercicio") {
              return {
                ...exercicio,
                imagemUrl: imagem,
              };
            }

            return {
              ...exercicio,
              itens: exercicio.itens.map(
                (item) =>
                  item.id === alvo.itemId
                    ? {
                        ...item,
                        imagemUrl: imagem,
                      }
                    : item
              ),
            };
          }
        );

        geradas += 1;
        salvarListaComImagens(listaAtual);
      } catch (error) {
        falhas += 1;

        console.error(
          `Erro ao gerar a imagem "${alvo.descricao}":`,
          error
        );
      }
    }

    setGerandoImagens(false);
    setProgressoImagens("");

    if (falhas === 0) {
      setMensagemImagens(
        `${geradas} ${
          geradas === 1
            ? "imagem foi gerada"
            : "imagens foram geradas"
        } e inserida${
          geradas === 1 ? "" : "s"
        } na atividade.`
      );
    } else {
      setMensagemImagens(
        `${geradas} ${
          geradas === 1
            ? "imagem foi gerada"
            : "imagens foram geradas"
        }. ${falhas} ${
          falhas === 1
            ? "imagem não pôde ser criada"
            : "imagens não puderam ser criadas"
        }. Use o botão para tentar novamente.`
      );
    }
  }

  useEffect(() => {
    if (
      !atividade ||
      exercicios.length === 0 ||
      geracaoAutomaticaIniciada
    ) {
      return;
    }

    const pendentes =
      encontrarImagensPendentes(exercicios);

    setGeracaoAutomaticaIniciada(true);

    if (pendentes.length > 0) {
      void gerarImagensPendentes();
    }
  }, [
    atividade,
    exercicios,
    geracaoAutomaticaIniciada,
  ]);

  function excluirExercicio(id: string) {
    persistir(
      exercicios.filter(
        (exercicio) => exercicio.id !== id
      )
    );
  }

  function adicionarExercicio() {
    const novoExercicio: Exercicio = {
      id: `exercicio-${Date.now()}`,
      numero: exercicios.length + 1,
      tipo: "outro",
      titulo: "NOVO EXERCÍCIO",
      comando:
        "ESCREVA AQUI O COMANDO DA ATIVIDADE.",
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

    persistir([
      ...exercicios,
      novoExercicio,
    ]);
  }

  function montarFolhaFinal() {
    persistir(exercicios);
    router.push("/atividades/resultado");
  }

  if (erro) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <FileText
            className="mx-auto text-red-500"
            size={34}
          />

          <p className="mt-3 font-bold text-red-700">
            {erro}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/atividades")
            }
            className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white"
          >
            Voltar para atividades
          </button>
        </div>
      </main>
    );
  }

  if (!configuracao || !atividade) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex items-center gap-2 font-semibold text-emerald-700">
          <Sparkles className="animate-pulse" />
          Montando a folha visual...
        </div>
      </main>
    );
  }

  const fonte =
    atividade.fonteAtividade ||
    configuracao.fonteAtividade ||
    "Times New Roman";

  const usarMaiusculas =
    atividade.usarMaiusculas ??
    configuracao.usarMaiusculas ??
    false;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Prévia visual da atividade
            </h1>

            <p className="text-sm text-slate-700">
              Veja a folha como o aluno receberá.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/atividades")
            }
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm"
          >
            <ArrowLeft size={19} />
            Voltar
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-slate-950">
            Ajustar atividade
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Os controles ficam fora da folha e não aparecem no material final.
          </p>

          {(gerandoImagens ||
            progressoImagens ||
            mensagemImagens) && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
              {gerandoImagens && (
                <div className="flex items-start gap-2 text-sm font-semibold text-blue-800">
                  <Loader2
                    size={18}
                    className="mt-0.5 shrink-0 animate-spin"
                  />

                  <span>
                    {progressoImagens ||
                      "Preparando imagens..."}
                  </span>
                </div>
              )}

              {!gerandoImagens &&
                mensagemImagens && (
                  <p className="text-sm leading-5 text-blue-800">
                    {mensagemImagens}
                  </p>
                )}

              {!gerandoImagens && (
                <button
                  type="button"
                  onClick={() =>
                    void gerarImagensPendentes()
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-bold text-blue-700"
                >
                  <ImageIcon size={15} />
                  Gerar imagens pendentes
                </button>
              )}
            </div>
          )}

          <div className="mt-5 space-y-3">
            {exercicios.map((exercicio) => (
              <div
                key={exercicio.id}
                className="rounded-xl border border-slate-200 p-3"
              >
                <p className="text-sm font-bold text-slate-900">
                  {exercicio.numero}.{" "}
                  {exercicio.titulo}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "A edição visual será conectada no próximo passo."
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 px-2 py-2 text-xs font-semibold"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      excluirExercicio(
                        exercicio.id
                      )
                    }
                    className="flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-red-700"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={adicionarExercicio}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 px-4 py-3 font-bold text-emerald-700"
          >
            <Plus size={18} />
            Adicionar exercício
          </button>

          <button
            type="button"
            onClick={montarFolhaFinal}
            disabled={gerandoImagens}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {gerandoImagens ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Sparkles size={18} />
            )}
            {gerandoImagens
              ? "Aguarde as imagens"
              : "Montar folha final"}
          </button>
        </aside>

        <div className="overflow-x-auto">
          <div
            className={`mx-auto min-h-[1123px] w-[794px] bg-white px-12 py-10 shadow-xl ${
              usarMaiusculas
                ? "uppercase"
                : ""
            }`}
            style={{
              fontFamily: `"${fonte}", "Times New Roman", serif`,
            }}
          >
            <div className="mb-7 border-b-2 border-slate-900 pb-4 text-sm leading-7">
              <p>
                <strong>ESCOLA:</strong>{" "}
                ________________________________________________
              </p>

              <p>
                <strong>ALUNO(A):</strong>{" "}
                _____________________________________________
              </p>

              <div className="grid grid-cols-2 gap-6">
                <p>
                  <strong>TURMA:</strong>{" "}
                  __________________
                </p>

                <p>
                  <strong>DATA:</strong>{" "}
                  ____/____/______
                </p>
              </div>
            </div>

            <div className="mb-8 text-center">
              <p className="text-sm font-bold text-emerald-700">
                {configuracao.disciplina}
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                {atividade.titulo}
              </h1>

              {atividade.subtitulo && (
                <p className="mt-2 text-sm text-slate-600">
                  {atividade.subtitulo}
                </p>
              )}
            </div>

            {exercicios.map((exercicio) => (
              <ExercicioVisual
                key={exercicio.id}
                exercicio={exercicio}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}