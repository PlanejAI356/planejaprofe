"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  ClipboardList,
  FileStack,
  Lightbulb,
  Loader2,
  LogOut,
  PencilLine,
  RefreshCw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ModoCriacao = "folha" | "especifica" | "revisao";
type FormaConteudo = "tema" | "palavras";

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

const tiposAtividadeEspecifica = [
  "Ditado ilustrado",
  "Caça-palavras",
  "Cruzadinha",
  "Escreva o nome das figuras",
  "Ligue as colunas",
  "Complete as palavras",
  "Interpretação de texto",
  "Produção de texto",
  "Problemas matemáticos",
  "Sequência numérica",
  "Verdadeiro ou falso",
  "Múltipla escolha",
];

const sugestoesPorTema: Record<string, string[]> = {
  frutas: [
    "maçã",
    "banana",
    "uva",
    "laranja",
    "melancia",
    "morango",
    "pera",
    "mamão",
  ],
  "animais domésticos": [
    "cachorro",
    "gato",
    "coelho",
    "peixe",
    "tartaruga",
    "papagaio",
    "hamster",
    "canário",
  ],
  brinquedos: [
    "bola",
    "boneca",
    "carrinho",
    "pipa",
    "pião",
    "bicicleta",
    "patinete",
    "quebra-cabeça",
  ],
  "material escolar": [
    "lápis",
    "borracha",
    "caderno",
    "mochila",
    "tesoura",
    "régua",
    "apontador",
    "cola",
  ],
  "sistema solar": [
    "Sol",
    "Mercúrio",
    "Vênus",
    "Terra",
    "Marte",
    "Júpiter",
    "Saturno",
    "Urano",
    "Netuno",
  ],
};

export default function AtividadesPage() {
  const router = useRouter();

  const [modoCriacao, setModoCriacao] =
    useState<ModoCriacao>("folha");

  const [etapaEnsino, setEtapaEnsino] = useState("");
  const [serie, setSerie] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [trabalhadoSala, setTrabalhadoSala] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [quantidade, setQuantidade] = useState("6");

  const [tipoEspecifico, setTipoEspecifico] = useState("");
  const [formaConteudo, setFormaConteudo] =
    useState<FormaConteudo>("tema");
  const [palavrasProprias, setPalavrasProprias] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [palavrasSelecionadas, setPalavrasSelecionadas] = useState<string[]>([]);

  const [erro, setErro] = useState("");
  const [gerando, setGerando] = useState(false);

  const seriesDisponiveis = etapaEnsino
    ? seriesPorEtapa[etapaEnsino] || []
    : [];

  const disciplinasDisponiveis = etapaEnsino
    ? disciplinasPorEtapa[etapaEnsino] || []
    : [];

  const opcoesQuantidade =
    modoCriacao === "especifica"
      ? ["6", "8", "10", "12"]
      : ["4", "6", "8", "10"];

  const rotuloQuantidade =
    modoCriacao === "especifica"
      ? "Quantidade de itens"
      : "Quantidade de atividades";

  function escolherModo(novoModo: ModoCriacao) {
    setModoCriacao(novoModo);
    setQuantidade(novoModo === "especifica" ? "8" : "6");
    setTipoEspecifico("");
    setFormaConteudo("tema");
    setPalavrasProprias("");
    setSugestoes([]);
    setPalavrasSelecionadas([]);
    setErro("");
  }

  function gerarSugestoes() {
    const temaNormalizado = conteudo.trim().toLowerCase();

    if (!temaNormalizado) {
      setErro("Digite um tema antes de pedir sugestões.");
      return;
    }

    const listaEncontrada =
      sugestoesPorTema[temaNormalizado] ||
      [
        `${conteudo.trim()} 1`,
        `${conteudo.trim()} 2`,
        `${conteudo.trim()} 3`,
        `${conteudo.trim()} 4`,
        `${conteudo.trim()} 5`,
        `${conteudo.trim()} 6`,
        `${conteudo.trim()} 7`,
        `${conteudo.trim()} 8`,
      ];

    setSugestoes(listaEncontrada);
    setPalavrasSelecionadas(listaEncontrada);
    setErro("");
  }

  function alternarPalavra(palavra: string) {
    setPalavrasSelecionadas((listaAtual) =>
      listaAtual.includes(palavra)
        ? listaAtual.filter((item) => item !== palavra)
        : [...listaAtual, palavra]
    );
  }

  function limparCampos() {
    setEtapaEnsino("");
    setSerie("");
    setDisciplina("");
    setConteudo("");
    setTrabalhadoSala("");
    setObservacoes("");
    setQuantidade(modoCriacao === "especifica" ? "8" : "6");
    setTipoEspecifico("");
    setFormaConteudo("tema");
    setPalavrasProprias("");
    setSugestoes([]);
    setPalavrasSelecionadas([]);
    setErro("");
  }

  async function gerarAtividade() {
    setErro("");

    if (!etapaEnsino || !serie || !disciplina || !conteudo.trim()) {
      setErro(
        "Preencha a etapa de ensino, a série ou turma, a disciplina e o conteúdo."
      );
      return;
    }

    if (modoCriacao === "especifica" && !tipoEspecifico) {
      setErro("Escolha o tipo da atividade específica.");
      return;
    }

    if (
      modoCriacao === "especifica" &&
      formaConteudo === "palavras" &&
      !palavrasProprias.trim()
    ) {
      setErro("Digite as palavras que deseja utilizar na atividade.");
      return;
    }

    const palavrasDigitadas = palavrasProprias
      .split(/\n|,/)
      .map((palavra) => palavra.trim())
      .filter(Boolean);

    const configuracao = {
      modoCriacao,
      etapaEnsino,
      serie,
      disciplina,
      conteudo: conteudo.trim(),
      trabalhadoSala: trabalhadoSala.trim(),
      observacoes: observacoes.trim(),
      quantidade: Number(quantidade),
      tipoEspecifico,
      formaConteudo,
      palavras:
        modoCriacao === "especifica"
          ? formaConteudo === "palavras"
            ? palavrasDigitadas
            : palavrasSelecionadas
          : [],
    };

    try {
      setGerando(true);

      const resposta = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "atividade_pedagogica",
          ...configuracao,
        }),
      });

      const tipoResposta =
        resposta.headers.get("content-type") || "";

      if (!tipoResposta.includes("application/json")) {
        if (resposta.status === 504) {
          throw new Error(
            "A geração demorou mais que o esperado. Tente novamente."
          );
        }

        throw new Error(
          "O servidor não conseguiu concluir a geração da atividade."
        );
      }

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível gerar a atividade."
        );
      }

      const textoRecebido =
        typeof resultado.texto === "string"
          ? resultado.texto
          : "";

      const textoLimpo = textoRecebido
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      if (!textoLimpo) {
        throw new Error(
          "A inteligência artificial retornou uma atividade vazia."
        );
      }

      let atividadeGerada: {
        titulo?: string;
        subtitulo?: string;
        modoCriacao?: string;
        exercicios?: Array<Record<string, unknown>>;
      };

      try {
        atividadeGerada = JSON.parse(textoLimpo);
      } catch {
        throw new Error(
          "A atividade foi gerada, mas o formato ficou inválido. Tente gerar novamente."
        );
      }

      if (
        !atividadeGerada ||
        !Array.isArray(atividadeGerada.exercicios) ||
        atividadeGerada.exercicios.length === 0
      ) {
        throw new Error(
          "A inteligência artificial não retornou os exercícios da atividade."
        );
      }

      const exerciciosComId = atividadeGerada.exercicios.map(
        (exercicio, indice) => ({
          ...exercicio,
          id: `exercicio-${Date.now()}-${indice + 1}`,
          numero: indice + 1,
        })
      );

      localStorage.setItem(
        "atividadeJson",
        JSON.stringify({
          ...atividadeGerada,
          exercicios: exerciciosComId,
        })
      );

      localStorage.setItem(
        "configuracaoAtividade",
        JSON.stringify(configuracao)
      );

      router.push("/atividades/revisao");
    } catch (error) {
      console.error("Erro ao gerar atividade:", error);

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
              onClick={() => router.push("/atividades/minhas-atividades")}
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
                Criar atividade pedagógica
              </h2>

              <p className="text-sm text-slate-600">
                Escolha o tipo de material e informe os dados da turma.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-slate-950">
              O que você deseja criar?
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Escolha uma opção para configurar a atividade.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => escolherModo("folha")}
                className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
                  modoCriacao === "folha"
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-slate-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <FileStack size={25} />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-950">
                        Folha de atividades
                      </p>

                      <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                        Recomendado
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-5 text-slate-600">
                      O PlanejAI cria uma sequência variada e equilibrada.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => escolherModo("especifica")}
                className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
                  modoCriacao === "especifica"
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Target size={25} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-950">
                      Atividade específica
                    </p>

                    <p className="mt-2 text-sm leading-5 text-slate-600">
                      Escolha um formato, como ditado ilustrado, caça-palavras
                      ou cruzadinha.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => escolherModo("revisao")}
                className={`cursor-pointer rounded-2xl border p-5 text-left transition ${
                  modoCriacao === "revisao"
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                    : "border-slate-200 bg-white hover:border-amber-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <BookOpenCheck size={25} />
                  </div>

                  <div>
                    <p className="font-bold text-slate-950">
                      Folha de revisão
                    </p>

                    <p className="mt-2 text-sm leading-5 text-slate-600">
                      Crie uma revisão misturando exercícios sobre os conteúdos
                      trabalhados.
                    </p>
                  </div>
                </div>
              </button>
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
                  setErro("");
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
                  setErro("");
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
                  setErro("");
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
                {modoCriacao === "revisao"
                  ? "Conteúdos da revisão"
                  : "Conteúdo ou tema"}{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={conteudo}
                onChange={(event) => {
                  setConteudo(event.target.value);
                  setSugestoes([]);
                  setPalavrasSelecionadas([]);
                  setErro("");
                }}
                placeholder={
                  modoCriacao === "revisao"
                    ? "Ex.: Adição, subtração e problemas"
                    : "Ex.: Animais domésticos"
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {modoCriacao === "especifica" && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-bold text-slate-950">
                Configuração da atividade específica
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold text-slate-900">
                    Qual atividade deseja criar?{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={tipoEspecifico}
                    onChange={(event) => {
                      setTipoEspecifico(event.target.value);
                      setErro("");
                    }}
                    className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione</option>

                    {tiposAtividadeEspecifica.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-slate-900">
                    Como deseja montar?
                  </label>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormaConteudo("tema");
                        setErro("");
                      }}
                      className={`cursor-pointer rounded-xl border px-4 py-3 font-semibold transition ${
                        formaConteudo === "tema"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      Usar um tema
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormaConteudo("palavras");
                        setErro("");
                      }}
                      className={`cursor-pointer rounded-xl border px-4 py-3 font-semibold transition ${
                        formaConteudo === "palavras"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      Minhas palavras
                    </button>
                  </div>
                </div>
              </div>

              {formaConteudo === "tema" && (
                <div className="mt-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">
                        Use o campo “Conteúdo ou tema” acima. Depois peça
                        sugestões para escolher as palavras da atividade.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={gerarSugestoes}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
                    >
                      <Lightbulb size={19} />
                      Sugerir palavras
                    </button>
                  </div>

                  {sugestoes.length > 0 && (
                    <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-bold text-slate-950">
                            Sugestões para “{conteudo.trim()}”
                          </p>

                          <p className="text-sm text-slate-600">
                            Marque ou desmarque as palavras que deseja usar.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={gerarSugestoes}
                          className="flex cursor-pointer items-center gap-2 text-sm font-bold text-blue-700"
                        >
                          <RefreshCw size={16} />
                          Gerar outras sugestões
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {sugestoes.map((palavra) => {
                          const selecionada =
                            palavrasSelecionadas.includes(palavra);

                          return (
                            <button
                              key={palavra}
                              type="button"
                              onClick={() => alternarPalavra(palavra)}
                              className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                selecionada
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-300 bg-white text-slate-700"
                              }`}
                            >
                              {palavra}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formaConteudo === "palavras" && (
                <div className="mt-4">
                  <label className="mb-2 block font-semibold text-slate-900">
                    Digite suas palavras
                  </label>

                  <textarea
                    value={palavrasProprias}
                    onChange={(event) => {
                      setPalavrasProprias(event.target.value);
                      setErro("");
                    }}
                    placeholder={
                      "Digite uma palavra por linha ou separe por vírgulas.\n\nEx.: Ana\nJoão\nMaria\nPedro"
                    }
                    className="min-h-36 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <p className="mt-2 text-sm text-slate-600">
                    Você pode criar, por exemplo, um caça-palavras com os nomes
                    dos alunos da turma.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                O que foi trabalhado em sala?{" "}
                <span className="font-normal text-emerald-600">
                  (opcional)
                </span>
              </label>

              <textarea
                value={trabalhadoSala}
                onChange={(event) => setTrabalhadoSala(event.target.value)}
                maxLength={500}
                placeholder="Ex.: Os alunos já reconheceram o conteúdo e realizaram exemplos simples."
                className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <p className="mt-1 text-right text-sm text-slate-500">
                {trabalhadoSala.length}/500
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-slate-900">
                Observações para a IA{" "}
                <span className="font-normal text-emerald-600">
                  (opcional)
                </span>
              </label>

              <textarea
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
                maxLength={500}
                placeholder="Ex.: Use imagens fáceis de reconhecer, linguagem simples e letra de forma."
                className="min-h-28 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />

              <p className="mt-1 text-right text-sm text-slate-500">
                {observacoes.length}/500
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-3 block font-semibold text-slate-900">
              {rotuloQuantidade}
            </label>

            <div className="flex flex-wrap gap-3">
              {opcoesQuantidade.map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setQuantidade(opcao)}
                  className={`min-w-20 cursor-pointer rounded-xl border px-5 py-3 font-bold transition ${
                    quantidade === opcao
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

          <div className="mt-6 rounded-2xl border border-dashed border-emerald-500 bg-emerald-50 p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="text-emerald-700" size={24} />

              <p className="text-lg font-bold text-slate-950">
                O PlanejAI criará o material de acordo com suas escolhas.
              </p>
            </div>

            <p className="mt-2 text-slate-600">
              Depois você poderá editar, refazer, excluir ou adicionar
              exercícios.
            </p>

            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={gerarAtividade}
                disabled={gerando}
                className="flex min-w-72 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
              >
                {gerando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Gerando atividade...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Gerar atividade
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={limparCampos}
                disabled={gerando}
                className="cursor-pointer rounded-xl border border-emerald-600 bg-white px-7 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Limpar campos
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}