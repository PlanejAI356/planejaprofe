"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  ImagePlus,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import TopoAvaliacoes from "../componentes/TopoAvaliacoes";

type TipoQuestao =
  | "multipla_escolha"
  | "discursiva"
  | "verdadeiro_falso"
  | "complete"
  | "relacione";

type Questao = {
  id: string;
  numero: number;
  tipo: TipoQuestao;
  enunciado: string;
  alternativas: string[];
  afirmativas: string[];
  bancoPalavras: string[];
  frasesComplete: string[];
  colunaA: string[];
  colunaB: string[];
  linhasResposta: number;
  imagemNecessaria: boolean;
  descricaoImagem: string;
  imagemUrl?: string;
};

type AvaliacaoJson = {
  titulo: string;
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  tipoAvaliacao: string;
  valorTotal: string;
  questoes: Questao[];
};

function nomeTipo(tipo: TipoQuestao) {
  const nomes: Record<TipoQuestao, string> = {
    multipla_escolha: "Múltipla escolha",
    discursiva: "Discursiva",
    verdadeiro_falso: "Verdadeiro ou falso",
    complete: "Complete",
    relacione: "Relacione as colunas",
  };

  return nomes[tipo];
}

function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function montarHtmlQuestao(
  questao: Questao,
  numero: number
) {
  const imagem = questao.imagemUrl
    ? `
      <div style="text-align:center;margin:16px 0;break-inside:avoid;">
        <img
          src="${questao.imagemUrl}"
          alt="${escaparHtml(questao.descricaoImagem || "Imagem da questão")}"
          style="display:block;max-width:100%;width:420px;height:auto;margin:0 auto;border:1px solid #cbd5e1;border-radius:8px;"
        />
      </div>
    `
    : "";

  if (questao.tipo === "multipla_escolha") {
    const letras = ["A", "B", "C", "D"];

    return `
      <div style="break-inside:avoid;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
        ${imagem}
        ${questao.alternativas
          .map(
            (alternativa, indice) =>
              `<p style="margin:2px 0;">${letras[indice] || ""}) ${escaparHtml(alternativa)}</p>`
          )
          .join("")}
      </div>
    `;
  }

  if (questao.tipo === "discursiva") {
    const quantidadeLinhas = Math.max(
      1,
      Math.min(6, Number(questao.linhasResposta || 3))
    );

    const linhas = Array.from(
      { length: quantidadeLinhas },
      () =>
        `<div style="height:28px;border-bottom:1px solid #475569;width:100%;"></div>`
    ).join("");

    return `
      <div style="break-inside:avoid;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
        ${imagem}
        <div style="width:100%;">${linhas}</div>
      </div>
    `;
  }

  if (questao.tipo === "verdadeiro_falso") {
    return `
      <div style="break-inside:avoid;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
        ${imagem}
        ${questao.afirmativas
          .map(
            (afirmativa) =>
              `<p style="margin:5px 0;">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ) ${escaparHtml(afirmativa)}</p>`
          )
          .join("")}
      </div>
    `;
  }

  if (questao.tipo === "complete") {
    const banco = questao.bancoPalavras.length
      ? `
        <div style="margin:8px 0;padding:8px;border:1px solid #cbd5e1;border-radius:6px;">
          <strong>Banco de palavras:</strong>
          ${questao.bancoPalavras.map(escaparHtml).join(" – ")}
        </div>
      `
      : "";

    return `
      <div style="break-inside:avoid;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
        ${imagem}
        ${banco}
        ${questao.frasesComplete
          .map((frase) =>
            `<p style="margin:6px 0;">${escaparHtml(frase).replace(/\{\{LACUNA\}\}/g, "____________________")}</p>`
          )
          .join("")}
      </div>
    `;
  }

  return `
    <div style="break-inside:avoid;margin-bottom:20px;">
      <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
      ${imagem}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:10px;">
        <div>
          <strong>COLUNA A</strong>
          ${questao.colunaA
            .map(
              (item, indice) =>
                `<p style="margin:5px 0;">${indice + 1}. ${escaparHtml(item)}</p>`
            )
            .join("")}
        </div>
        <div>
          <strong>COLUNA B</strong>
          ${questao.colunaB
            .map(
              (item, indice) =>
                `<p style="margin:5px 0;">${String.fromCharCode(65 + indice)}. ${escaparHtml(item)}</p>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

export default function RevisaoAvaliacaoPage() {
  const router = useRouter();

  const [avaliacao, setAvaliacao] =
    useState<AvaliacaoJson | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [questaoEditando, setQuestaoEditando] =
    useState<string | null>(null);

  const [questaoRefazendo, setQuestaoRefazendo] =
    useState<string | null>(null);

  const [imagemGerando, setImagemGerando] =
    useState<string | null>(null);

  const [erro, setErro] = useState("");

  useEffect(() => {
    const avaliacaoSalva =
      localStorage.getItem("avaliacaoJson");

    if (avaliacaoSalva) {
      try {
        const dados = JSON.parse(
          avaliacaoSalva
        ) as AvaliacaoJson;

        dados.questoes = dados.questoes.map(
          (questao, indice) => ({
            ...questao,
            id:
              questao.id ||
              `questao-${Date.now()}-${indice}`,
            numero: indice + 1,
            alternativas:
              questao.alternativas || [],
            afirmativas:
              questao.afirmativas || [],
            bancoPalavras:
              questao.bancoPalavras || [],
            frasesComplete:
              questao.frasesComplete || [],
            colunaA: questao.colunaA || [],
            colunaB: questao.colunaB || [],
          })
        );

        setAvaliacao(dados);
      } catch {
        setErro(
          "Não foi possível abrir as questões geradas."
        );
      }
    }

    setCarregando(false);
  }, []);

  function salvarAvaliacao(
    novaAvaliacao: AvaliacaoJson
  ) {
    const questoesNumeradas =
      novaAvaliacao.questoes.map(
        (questao, indice) => ({
          ...questao,
          numero: indice + 1,
        })
      );

    const avaliacaoAtualizada = {
      ...novaAvaliacao,
      questoes: questoesNumeradas,
    };

    setAvaliacao(avaliacaoAtualizada);

    try {
      localStorage.setItem(
        "avaliacaoJson",
        JSON.stringify(avaliacaoAtualizada)
      );
    } catch {
      setErro(
        "As alterações foram feitas, mas o navegador não conseguiu salvá-las."
      );
    }
  }

  function atualizarQuestao(
    id: string,
    alteracoes: Partial<Questao>
  ) {
    if (!avaliacao) return;

    salvarAvaliacao({
      ...avaliacao,
      questoes: avaliacao.questoes.map(
        (questao) =>
          questao.id === id
            ? { ...questao, ...alteracoes }
            : questao
      ),
    });
  }

  function atualizarItemArray(
    id: string,
    campo:
      | "alternativas"
      | "afirmativas"
      | "bancoPalavras"
      | "frasesComplete"
      | "colunaA"
      | "colunaB",
    indice: number,
    valor: string
  ) {
    const questao = avaliacao?.questoes.find(
      (item) => item.id === id
    );

    if (!questao) return;

    const novoArray = [...questao[campo]];
    novoArray[indice] = valor;

    atualizarQuestao(id, {
      [campo]: novoArray,
    });
  }

  function excluirQuestao(id: string) {
    if (!avaliacao) return;

    salvarAvaliacao({
      ...avaliacao,
      questoes: avaliacao.questoes.filter(
        (questao) => questao.id !== id
      ),
    });
  }

  function moverQuestao(
    indice: number,
    direcao: -1 | 1
  ) {
    if (!avaliacao) return;

    const novoIndice = indice + direcao;

    if (
      novoIndice < 0 ||
      novoIndice >= avaliacao.questoes.length
    ) {
      return;
    }

    const questoes = [...avaliacao.questoes];

    [questoes[indice], questoes[novoIndice]] = [
      questoes[novoIndice],
      questoes[indice],
    ];

    salvarAvaliacao({
      ...avaliacao,
      questoes,
    });
  }

  async function refazerQuestao(
    questao: Questao
  ) {
    if (!avaliacao) return;

    setErro("");
    setQuestaoRefazendo(questao.id);

    const configuracaoSalva =
      localStorage.getItem(
        "configuracaoAvaliacao"
      );

    const configuracao = configuracaoSalva
      ? JSON.parse(configuracaoSalva)
      : {};

    const quantidades = {
      quantidadeMultiplaEscolha:
        questao.tipo === "multipla_escolha"
          ? 1
          : 0,
      quantidadeDiscursivas:
        questao.tipo === "discursiva" ? 1 : 0,
      quantidadeVerdadeiroFalso:
        questao.tipo === "verdadeiro_falso"
          ? 1
          : 0,
      quantidadeComplete:
        questao.tipo === "complete" ? 1 : 0,
      quantidadeRelacione:
        questao.tipo === "relacione" ? 1 : 0,
    };

    try {
      const resposta = await fetch(
        "/api/gerar-plano",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tipo: "prova_json",
            ...configuracao,
            ...quantidades,
            totalQuestoes: 1,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível refazer a questão."
        );
      }

      const novaQuestao =
        dados.avaliacao?.questoes?.[0];

      if (!novaQuestao) {
        throw new Error(
          "A nova questão não foi retornada."
        );
      }

      atualizarQuestao(questao.id, {
        ...novaQuestao,
        id: questao.id,
        numero: questao.numero,
        imagemUrl: undefined,
      });

      setQuestaoEditando(null);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível refazer a questão."
      );
    } finally {
      setQuestaoRefazendo(null);
    }
  }

  async function gerarImagemQuestao(
    questao: Questao
  ) {
    if (!questao.descricaoImagem.trim()) {
      setErro(
        "Esta questão não possui uma descrição de imagem."
      );
      return;
    }

    setErro("");
    setImagemGerando(questao.id);

    try {
      const resposta = await fetch(
        "/api/gerar-imagem-avaliacao",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            descricao:
              questao.descricaoImagem,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível gerar a imagem."
        );
      }

      atualizarQuestao(questao.id, {
        imagemUrl: dados.imagem,
        imagemNecessaria: true,
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a imagem."
      );
    } finally {
      setImagemGerando(null);
    }
  }

  function montarAvaliacao() {
    if (!avaliacao) return;

    if (avaliacao.questoes.length === 0) {
      setErro(
        "A avaliação precisa ter pelo menos uma questão."
      );
      return;
    }

    const html = `
      <div style="text-align:center;font-size:18px;font-weight:700;margin-bottom:24px;">
        ${escaparHtml(avaliacao.titulo)}
      </div>
      ${avaliacao.questoes
        .map((questao, indice) =>
          montarHtmlQuestao(
            questao,
            indice + 1
          )
        )
        .join("")}
    `;

    localStorage.setItem(
      "provaGeradaEditada",
      html
    );

    localStorage.setItem(
      "provaGerada",
      avaliacao.titulo
    );

    router.push("/avaliacoes/resultado");
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopoAvaliacoes
          destinoVoltar="/avaliacoes"
          textoVoltar="Voltar às avaliações"
        />

        <div className="flex min-h-[500px] items-center justify-center gap-2 text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Carregando questões...
        </div>
      </main>
    );
  }

  if (!avaliacao) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopoAvaliacoes
          destinoVoltar="/avaliacoes"
          textoVoltar="Voltar às avaliações"
        />

        <div className="mx-auto flex min-h-[500px] max-w-4xl flex-col items-center justify-center px-4 text-center">
          <FileText
            size={42}
            className="mb-3 text-slate-300"
          />

          <p className="font-bold text-slate-700">
            Nenhuma avaliação foi encontrada.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/avaliacoes")
            }
            className="mt-4 rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white"
          >
            Gerar avaliação
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopoAvaliacoes
        destinoVoltar="/avaliacoes"
        textoVoltar="Voltar às avaliações"
      />

      <section className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-green-700">
                Revisão das questões
              </p>

              <h1 className="mt-1 text-xl font-extrabold text-slate-900">
                {avaliacao.titulo}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {avaliacao.serie} •{" "}
                {avaliacao.disciplina} •{" "}
                {avaliacao.questoes.length} questões
              </p>
            </div>

            <button
              type="button"
              onClick={montarAvaliacao}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-800"
            >
              <Sparkles size={18} />
              Montar avaliação
            </button>
          </div>
        </div>

        {erro && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          {avaliacao.questoes.map(
            (questao, indice) => {
              const editando =
                questaoEditando === questao.id;

              return (
                <article
                  key={questao.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="mr-auto">
                      <p className="font-extrabold text-slate-900">
                        Questão {indice + 1}
                      </p>

                      <p className="text-xs font-semibold text-green-700">
                        {nomeTipo(questao.tipo)}
                      </p>
                    </div>

                    <button
                      type="button"
                      title="Mover para cima"
                      disabled={indice === 0}
                      onClick={() =>
                        moverQuestao(indice, -1)
                      }
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white disabled:opacity-30"
                    >
                      <ArrowUp size={17} />
                    </button>

                    <button
                      type="button"
                      title="Mover para baixo"
                      disabled={
                        indice ===
                        avaliacao.questoes.length - 1
                      }
                      onClick={() =>
                        moverQuestao(indice, 1)
                      }
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white disabled:opacity-30"
                    >
                      <ArrowDown size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setQuestaoEditando(
                          editando
                            ? null
                            : questao.id
                        )
                      }
                      className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-white"
                    >
                      {editando ? (
                        <Save size={16} />
                      ) : (
                        <Pencil size={16} />
                      )}
                      {editando
                        ? "Concluir"
                        : "Editar"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        refazerQuestao(questao)
                      }
                      disabled={
                        questaoRefazendo ===
                        questao.id
                      }
                      className="flex items-center gap-2 rounded-lg border border-blue-300 px-3 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                    >
                      {questaoRefazendo ===
                      questao.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCw size={16} />
                      )}
                      Refazer
                    </button>

                    {(questao.imagemNecessaria ||
                      questao.descricaoImagem) && (
                      <button
                        type="button"
                        onClick={() =>
                          gerarImagemQuestao(
                            questao
                          )
                        }
                        disabled={
                          imagemGerando ===
                          questao.id
                        }
                        className="flex items-center gap-2 rounded-lg border border-green-300 px-3 py-2 text-xs font-extrabold text-green-700 hover:bg-green-50 disabled:opacity-60"
                      >
                        {imagemGerando ===
                        questao.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <ImagePlus size={16} />
                        )}
                        {questao.imagemUrl
                          ? "Refazer imagem"
                          : "Gerar imagem"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        excluirQuestao(questao.id)
                      }
                      className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-extrabold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>

                  <div className="p-5">
                    {editando ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Enunciado
                          </label>

                          <textarea
                            value={questao.enunciado}
                            onChange={(event) =>
                              atualizarQuestao(
                                questao.id,
                                {
                                  enunciado:
                                    event.target
                                      .value,
                                }
                              )
                            }
                            rows={3}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                          />
                        </div>

                        {questao.tipo ===
                          "multipla_escolha" &&
                          questao.alternativas.map(
                            (
                              alternativa,
                              itemIndice
                            ) => (
                              <input
                                key={itemIndice}
                                value={alternativa}
                                onChange={(event) =>
                                  atualizarItemArray(
                                    questao.id,
                                    "alternativas",
                                    itemIndice,
                                    event.target
                                      .value
                                  )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-green-500"
                              />
                            )
                          )}

                        {questao.tipo ===
                          "verdadeiro_falso" &&
                          questao.afirmativas.map(
                            (
                              afirmativa,
                              itemIndice
                            ) => (
                              <input
                                key={itemIndice}
                                value={afirmativa}
                                onChange={(event) =>
                                  atualizarItemArray(
                                    questao.id,
                                    "afirmativas",
                                    itemIndice,
                                    event.target
                                      .value
                                  )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-green-500"
                              />
                            )
                          )}

                        {questao.tipo ===
                          "complete" &&
                          questao.frasesComplete.map(
                            (
                              frase,
                              itemIndice
                            ) => (
                              <input
                                key={itemIndice}
                                value={frase}
                                onChange={(event) =>
                                  atualizarItemArray(
                                    questao.id,
                                    "frasesComplete",
                                    itemIndice,
                                    event.target
                                      .value
                                  )
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-green-500"
                              />
                            )
                          )}

                        {questao.tipo ===
                          "discursiva" && (
                          <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                              Linhas para resposta
                            </label>

                            <input
                              type="number"
                              min="1"
                              max="6"
                              value={
                                questao.linhasResposta
                              }
                              onChange={(event) =>
                                atualizarQuestao(
                                  questao.id,
                                  {
                                    linhasResposta:
                                      Number(
                                        event.target
                                          .value
                                      ),
                                  }
                                )
                              }
                              className="w-28 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-green-500"
                            />
                          </div>
                        )}

                        {(questao.imagemNecessaria ||
                          questao
                            .descricaoImagem) && (
                          <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                              Descrição da imagem
                            </label>

                            <textarea
                              value={
                                questao.descricaoImagem
                              }
                              onChange={(event) =>
                                atualizarQuestao(
                                  questao.id,
                                  {
                                    descricaoImagem:
                                      event.target
                                        .value,
                                  }
                                )
                              }
                              rows={2}
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm leading-7 text-slate-800">
                        <p className="font-semibold">
                          {questao.enunciado}
                        </p>

                        {questao.imagemUrl && (
                          <img
                            src={questao.imagemUrl}
                            alt={
                              questao.descricaoImagem
                            }
                            className="mx-auto my-4 max-h-[360px] max-w-full rounded-xl border border-slate-200 object-contain"
                          />
                        )}

                        {questao.tipo ===
                          "multipla_escolha" &&
                          questao.alternativas.map(
                            (
                              alternativa,
                              itemIndice
                            ) => (
                              <p key={itemIndice}>
                                {String.fromCharCode(
                                  65 + itemIndice
                                )}
                                ) {alternativa}
                              </p>
                            )
                          )}

                        {questao.tipo ===
                          "verdadeiro_falso" &&
                          questao.afirmativas.map(
                            (
                              afirmativa,
                              itemIndice
                            ) => (
                              <p key={itemIndice}>
                                ( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ){" "}
                                {afirmativa}
                              </p>
                            )
                          )}

                        {questao.tipo ===
                          "discursiva" && (
                          <div className="mt-3">
                            {Array.from({
                              length: Math.max(
                                1,
                                questao.linhasResposta ||
                                  3
                              ),
                            }).map(
                              (_, linhaIndice) => (
                                <div
                                  key={linhaIndice}
                                  className="h-7 w-full border-b border-slate-500"
                                />
                              )
                            )}
                          </div>
                        )}

                        {questao.tipo ===
                          "complete" && (
                          <div className="mt-3">
                            {questao.bancoPalavras
                              .length > 0 && (
                              <p className="mb-2 rounded-lg border border-slate-300 p-2">
                                <strong>
                                  Banco de palavras:
                                </strong>{" "}
                                {questao.bancoPalavras.join(
                                  " – "
                                )}
                              </p>
                            )}

                            {questao.frasesComplete.map(
                              (
                                frase,
                                itemIndice
                              ) => (
                                <p key={itemIndice}>
                                  {frase.replace(
                                    /\{\{LACUNA\}\}/g,
                                    "____________________"
                                  )}
                                </p>
                              )
                            )}
                          </div>
                        )}

                        {questao.tipo ===
                          "relacione" && (
                          <div className="mt-3 grid gap-6 sm:grid-cols-2">
                            <div>
                              <p className="font-extrabold">
                                COLUNA A
                              </p>
                              {questao.colunaA.map(
                                (
                                  item,
                                  itemIndice
                                ) => (
                                  <p
                                    key={itemIndice}
                                  >
                                    {itemIndice + 1}.{" "}
                                    {item}
                                  </p>
                                )
                              )}
                            </div>

                            <div>
                              <p className="font-extrabold">
                                COLUNA B
                              </p>
                              {questao.colunaB.map(
                                (
                                  item,
                                  itemIndice
                                ) => (
                                  <p
                                    key={itemIndice}
                                  >
                                    {String.fromCharCode(
                                      65 +
                                        itemIndice
                                    )}
                                    . {item}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            }
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={montarAvaliacao}
            className="flex items-center gap-2 rounded-xl bg-green-700 px-7 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-green-800"
          >
            <Sparkles size={18} />
            Montar avaliação
          </button>
        </div>
      </section>
    </main>
  );
}