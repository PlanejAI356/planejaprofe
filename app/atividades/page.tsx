"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  LogOut,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

const seriesPorEtapa: Record<string, string[]> = {
  "Educação Infantil": ["Creche", "Pré I", "Pré II"],
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
  EJA: [
    "EJA - Etapa I",
    "EJA - Etapa II",
    "EJA - Etapa III",
    "EJA - Etapa IV",
  ],
};

const disciplinasPorEtapa: Record<string, string[]> = {
  "Educação Infantil": [
    "Linguagem",
    "Matemática",
    "Natureza e sociedade",
    "Arte",
    "Educação Física",
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
    "Computação",
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
    "Educação Física",
    "Inglês",
  ],
  EJA: [
    "Língua Portuguesa",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Inglês",
  ],
};


export default function AtividadesPage() {
  const router = useRouter();

  const [etapaEnsino, setEtapaEnsino] = useState("");
  const [serie, setSerie] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [pedido, setPedido] = useState("");
  const [quantidadeQuestoes, setQuantidadeQuestoes] =
    useState("6");

  const [tipoAtividade, setTipoAtividade] = useState("mista");
  const [nivelCacaPalavras, setNivelCacaPalavras] =
    useState("facil");
  const [palavrasCacaPalavras, setPalavrasCacaPalavras] =
    useState("");
  const [quantidadeAutoditado, setQuantidadeAutoditado] =
    useState("6");
  const [palavrasAutoditado, setPalavrasAutoditado] =
    useState("");

  const [erro, setErro] = useState("");
  const [gerando, setGerando] = useState(false);

  const seriesDisponiveis = etapaEnsino
    ? seriesPorEtapa[etapaEnsino] || []
    : [];

  const disciplinasDisponiveis = etapaEnsino
    ? disciplinasPorEtapa[etapaEnsino] || []
    : [];

  function limparCampos() {
    setEtapaEnsino("");
    setSerie("");
    setDisciplina("");
    setPedido("");
    setQuantidadeQuestoes("6");
    setTipoAtividade("mista");
    setNivelCacaPalavras("facil");
    setPalavrasCacaPalavras("");
    setQuantidadeAutoditado("6");
    setPalavrasAutoditado("");
    setErro("");
  }

  async function gerarAtividade() {
    setErro("");

    if (!etapaEnsino || !serie || !disciplina) {
      setErro(
        "Selecione a etapa de ensino, a série ou turma e a disciplina."
      );
      return;
    }

    if (!pedido.trim()) {
      setErro("Escreva o que você deseja criar.");
      return;
    }

    const totalQuestoes = Number(quantidadeQuestoes);

    const configuracao = {
      etapaEnsino,
      serie,
      disciplina,
      pedido: pedido.trim(),
      quantidadeQuestoes: totalQuestoes,
      tipoAtividade,
      nivelCacaPalavras:
        tipoAtividade === "caca_palavras"
          ? nivelCacaPalavras
          : null,
      palavrasCacaPalavras:
        tipoAtividade === "caca_palavras"
          ? palavrasCacaPalavras.trim()
          : "",
      quantidadeAutoditado:
        tipoAtividade === "autoditado"
          ? Number(quantidadeAutoditado)
          : null,
      palavrasAutoditado:
        tipoAtividade === "autoditado"
          ? palavrasAutoditado.trim()
          : "",
    };

    try {
      setGerando(true);

      const resposta = await fetch(
        "/api/gerar-atividade-imagem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configuracao),
        }
      );

      const tipoResposta =
        resposta.headers.get("content-type") || "";

      if (!tipoResposta.includes("application/json")) {
        if (resposta.status === 504) {
          throw new Error(
            "A geração demorou mais que o esperado. Tente novamente."
          );
        }

        throw new Error(
          "O servidor não conseguiu concluir a atividade."
        );
      }

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro ||
            "Não foi possível gerar a atividade."
        );
      }

      if (
        typeof resultado.imagem !== "string" ||
        !resultado.imagem.startsWith("data:image/")
      ) {
        throw new Error(
          "A imagem da atividade não foi retornada corretamente."
        );
      }

      localStorage.setItem(
        "atividadeImagem",
        resultado.imagem
      );

      localStorage.setItem(
        "configuracaoAtividadeImagem",
        JSON.stringify(configuracao)
      );

      if (typeof resultado.promptFinal === "string") {
        localStorage.setItem(
          "promptAtividadeImagem",
          resultado.promptFinal
        );
      }

      router.push("/atividades/resultado");
    } catch (error) {
      console.error(
        "Erro ao gerar atividade em imagem:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao gerar a atividade."
      );
    } finally {
      setGerando(false);
    }
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
                Escreva o que precisa e receba a atividade pronta.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                router.back()
              }
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
            >
              <ArrowLeft size={19} />
              Voltar
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/atividades/minhas-atividades"
                )
              }
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
            >
              <ClipboardList
                size={19}
              />
              Minhas atividades
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
            >
              <LogOut size={19} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-start gap-4 border-b border-slate-200 pb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <MessageSquareText
                size={29}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                O que você deseja criar?
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Escreva como falaria com uma assistente. O PlanejAI criará a folha completa e mostrará a atividade pronta na próxima página.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Etapa de ensino
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                value={etapaEnsino}
                onChange={(event) => {
                  setEtapaEnsino(
                    event.target.value
                  );
                  setSerie("");
                  setDisciplina("");
                  setErro("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="">
                  Selecione
                </option>

                {Object.keys(
                  seriesPorEtapa
                ).map((etapa) => (
                  <option
                    key={etapa}
                    value={etapa}
                  >
                    {etapa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Série ou turma
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                value={serie}
                disabled={!etapaEnsino}
                onChange={(event) => {
                  setSerie(
                    event.target.value
                  );
                  setErro("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100 focus:border-emerald-500"
              >
                <option value="">
                  Selecione
                </option>

                {seriesDisponiveis.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Disciplina
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <select
                value={disciplina}
                disabled={!etapaEnsino}
                onChange={(event) => {
                  setDisciplina(
                    event.target.value
                  );
                  setErro("");
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100 focus:border-emerald-500"
              >
                <option value="">
                  Selecione
                </option>

                {disciplinasDisponiveis.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-lg font-bold text-slate-950">
              Tipo de atividade
              <span className="text-red-500"> *</span>
            </label>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                ["mista", "🧩", "Atividade mista"],
                ["caca_palavras", "🔎", "Caça-palavras"],
                ["cruzadinha", "🔲", "Cruzadinha"],
                ["autoditado", "🖼️", "Autoditado"],
                ["complete", "✏️", "Complete"],
                ["ligue", "🔗", "Ligue"],
                ["multipla_escolha", "☑️", "Múltipla escolha"],
                ["verdadeiro_falso", "✅", "Verdadeiro ou falso"],
                ["leitura_escrita", "📖", "Leitura e escrita"],
              ].map(([valor, icone, rotulo]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => {
                    setTipoAtividade(valor);
                    setErro("");
                  }}
                  className={`rounded-2xl border px-3 py-4 text-center transition ${
                    tipoAtividade === valor
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-100"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/60"
                  }`}
                >
                  <div className="mb-2 text-2xl">{icone}</div>
                  <div className="text-sm font-bold">{rotulo}</div>
                </button>
              ))}
            </div>
          </div>

          {tipoAtividade === "caca_palavras" && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
              <h3 className="text-base font-bold text-slate-900">
                Opções do caça-palavras
              </h3>

              <div className="mt-4">
                <label className="mb-2 block font-semibold text-slate-800">
                  Nível de dificuldade
                </label>

                <div className="flex flex-wrap gap-3">
                  {[
                    ["facil", "Fácil"],
                    ["medio", "Médio"],
                    ["dificil", "Difícil"],
                  ].map(([valor, rotulo]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setNivelCacaPalavras(valor)}
                      className={`rounded-xl border px-5 py-2.5 font-bold transition ${
                        nivelCacaPalavras === valor
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400"
                      }`}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block font-semibold text-slate-800">
                  Palavras que deseja incluir
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    (opcional)
                  </span>
                </label>

                <input
                  type="text"
                  value={palavrasCacaPalavras}
                  onChange={(event) =>
                    setPalavrasCacaPalavras(event.target.value)
                  }
                  placeholder="Ex.: Terra, Marte, Júpiter, Saturno, Netuno"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />

                <p className="mt-2 text-sm text-slate-500">
                  Deixe em branco para o PlanejAI escolher palavras relacionadas ao conteúdo.
                </p>
              </div>
            </div>
          )}

          {tipoAtividade === "autoditado" && (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
              <h3 className="text-base font-bold text-slate-900">
                Opções do autoditado
              </h3>

              <div className="mt-4">
                <label className="mb-2 block font-semibold text-slate-800">
                  Quantidade de palavras/imagens
                </label>

                <div className="flex flex-wrap gap-3">
                  {["4", "6", "8", "10"].map((opcao) => (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => setQuantidadeAutoditado(opcao)}
                      className={`rounded-xl border px-5 py-2.5 font-bold transition ${
                        quantidadeAutoditado === opcao
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                      }`}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block font-semibold text-slate-800">
                  Palavras que deseja trabalhar
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    (opcional)
                  </span>
                </label>

                <input
                  type="text"
                  value={palavrasAutoditado}
                  onChange={(event) =>
                    setPalavrasAutoditado(event.target.value)
                  }
                  placeholder="Ex.: bola, banana, bebê, barco"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-sm text-slate-500">
                  Deixe em branco para o PlanejAI escolher palavras adequadas ao conteúdo e à turma.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="mb-2 block text-lg font-bold text-slate-950">
              Descreva a atividade
              <span className="text-red-500"> *</span>
            </label>

            <textarea
              value={pedido}
              onChange={(event) => {
                setPedido(event.target.value);
                setErro("");
              }}
              maxLength={1200}
              placeholder="Ex.: Trabalhar animais vertebrados com o 3º ano, com atividades simples e adequadas à turma."
              className="min-h-32 w-full resize-y rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 px-5 py-4 text-base leading-7 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />

            <p className="mt-1 text-right text-sm text-slate-500">
              {pedido.length}/1200
            </p>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-semibold text-slate-900">
                Quantidade de questões
              </label>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                6 é o recomendado
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {["4", "5", "6", "7", "8", "10"].map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setQuantidadeQuestoes(opcao)}
                  className={`rounded-xl border px-5 py-3 font-bold transition ${
                    quantidadeQuestoes === opcao
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  {opcao}
                </button>
              ))}
            </div>
          </div>

          {erro && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center font-medium text-red-700">
              {erro}
            </div>
          )}

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={gerarAtividade}
              disabled={gerando}
              className="flex min-w-72 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
            >
              {gerando ? (
                <>
                  <Loader2
                    size={21}
                    className="animate-spin"
                  />
                  Gerando folha pronta...
                </>
              ) : (
                <>
                  <Sparkles
                    size={21}
                  />
                  Gerar atividade pronta
                </>
              )}
            </button>

            <button
              type="button"
              onClick={limparCampos}
              disabled={gerando}
              className="rounded-xl border border-emerald-600 bg-white px-7 py-4 font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
            >
              Limpar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}