"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  ListChecks,
  Loader2,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import TopoAvaliacoes from "./componentes/TopoAvaliacoes";
import {
  consumirTestePromocional,
  usarPlanejamentoGratis,
} from "@/app/lib/profile";

const etapasEnsino = [
  "Ensino Fundamental - Anos Iniciais",
  "Ensino Fundamental - Anos Finais",
  "Ensino Médio",
  "EJA",
];

const seriesPorEtapa: Record<string, string[]> = {
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
    "1ª série do Ensino Médio",
    "2ª série do Ensino Médio",
    "3ª série do Ensino Médio",
  ],

  EJA: [
    "EJA - Anos Iniciais",
    "EJA - Anos Finais",
    "EJA - Ensino Médio",
  ],
};

const disciplinasPorEtapa: Record<string, string[]> = {
  "Ensino Fundamental - Anos Iniciais": [
    "Português",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Ensino Religioso",
    "Computação",
  ],

  "Ensino Fundamental - Anos Finais": [
    "Português",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Língua Inglesa",
    "Arte",
    "Educação Física",
    "Ensino Religioso",
    "Filosofia",
    "Computação",
  ],

  "Ensino Médio": [
    "Português",
    "Matemática",
    "Biologia",
    "Física",
    "Química",
    "História",
    "Geografia",
    "Filosofia",
    "Sociologia",
    "Língua Inglesa",
    "Arte",
    "Educação Física",
    "Computação",
  ],

  EJA: [
    "Português",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Ensino Religioso",
    "Biologia",
    "Física",
    "Química",
    "Língua Inglesa",
    "Filosofia",
    "Sociologia",
    "Computação",
  ],
};

const tiposAvaliacao = [
  "Avaliação bimestral",
  "Avaliação trimestral",
  "Avaliação diagnóstica",
  "Avaliação de recuperação",
  "Atividade avaliativa",
  "Simulado",
  "Revisão avaliativa",
];

function transformarEmNumero(valor: string) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0) {
    return 0;
  }

  return Math.floor(numero);
}

function dividirQuestoesMistas(quantidade: number) {
  const verdadeiroFalso = Math.ceil(quantidade / 3);
  const complete = Math.ceil(
    (quantidade - verdadeiroFalso) / 2
  );
  const relacione =
    quantidade - verdadeiroFalso - complete;

  return {
    verdadeiroFalso,
    complete,
    relacione,
  };
}

export default function AvaliacoesPage() {
  const router = useRouter();

  const [etapaEnsino, setEtapaEnsino] = useState("");
  const [serie, setSerie] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [tipoAvaliacao, setTipoAvaliacao] = useState("");
  const [conteudos, setConteudos] = useState("");
  const [dificuldade, setDificuldade] = useState("Misto");

  const [
    quantidadeMultiplaEscolha,
    setQuantidadeMultiplaEscolha,
  ] = useState("5");

  const [
    quantidadeDiscursivas,
    setQuantidadeDiscursivas,
  ] = useState("3");

  const [
    quantidadeMistas,
    setQuantidadeMistas,
  ] = useState("2");

  const [incluirBncc, setIncluirBncc] = useState(false);
  const [habilidadeBncc, setHabilidadeBncc] = useState("");

  const [
    incluirTextoApoio,
    setIncluirTextoApoio,
  ] = useState(false);

  const [usoImagens, setUsoImagens] =
    useState<"" | "parcial" | "total">("");

  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  useEffect(() => {
  const configuracaoSalva =
    localStorage.getItem(
      "configuracaoAvaliacao"
    );

  if (!configuracaoSalva) {
    return;
  }

  try {
    const configuracao =
      JSON.parse(configuracaoSalva);

    setEtapaEnsino(
      configuracao.etapaEnsino || ""
    );
    setSerie(configuracao.serie || "");
    setDisciplina(
      configuracao.disciplina || ""
    );
    setTipoAvaliacao(
      configuracao.tipoAvaliacao || ""
    );
    setConteudos(
      configuracao.conteudos || ""
    );
    setDificuldade(
      configuracao.dificuldade || "Misto"
    );

    setQuantidadeMultiplaEscolha(
      configuracao.quantidadeMultiplaEscolha ||
        "5"
    );

    setQuantidadeDiscursivas(
      configuracao.quantidadeDiscursivas ||
        "3"
    );

    setQuantidadeMistas(
      configuracao.quantidadeMistas || "2"
    );

    setIncluirBncc(
      Boolean(configuracao.incluirBncc)
    );

    setHabilidadeBncc(
      configuracao.habilidadeBncc || ""
    );

    setIncluirTextoApoio(
      Boolean(
        configuracao.incluirTextoApoio
      )
    );

    setUsoImagens(
      configuracao.usoImagens === "parcial" ||
      configuracao.usoImagens === "total"
        ? configuracao.usoImagens
        : ""
    );
  } catch (error) {
    console.error(
      "Erro ao carregar configuração:",
      error
    );
  }
}, []);

  const seriesDisponiveis =
    seriesPorEtapa[etapaEnsino] || [];

  const disciplinasDisponiveis =
    etapaEnsino && serie
      ? disciplinasPorEtapa[etapaEnsino] || []
      : [];

  const totalQuestoes = useMemo(() => {
    return (
      transformarEmNumero(
        quantidadeMultiplaEscolha
      ) +
      transformarEmNumero(quantidadeDiscursivas) +
      transformarEmNumero(quantidadeMistas)
    );
  }, [
    quantidadeMultiplaEscolha,
    quantidadeDiscursivas,
    quantidadeMistas,
  ]);

  function alterarEtapa(novaEtapa: string) {
    setEtapaEnsino(novaEtapa);
    setSerie("");
    setDisciplina("");
  }

  function alterarSerie(novaSerie: string) {
    setSerie(novaSerie);
    setDisciplina("");
  }

  async function gerarProva() {
    setErro("");

    const permissao = await usarPlanejamentoGratis();

    if (!permissao.permitido) {
      alert(permissao.mensagem);
      router.push("/assinatura");
      return;
    }

    if (
      !etapaEnsino ||
      !serie ||
      !disciplina ||
      !conteudos.trim()
    ) {
      setErro(
        "Preencha todos os campos obrigatórios."
      );
      return;
    }

    if (totalQuestoes === 0) {
      setErro("Informe pelo menos uma questão.");
      return;
    }

    if (totalQuestoes > 30) {
      setErro(
        "A avaliação pode ter no máximo 30 questões."
      );
      return;
    }

    const quantidadeMistasNumero =
      transformarEmNumero(quantidadeMistas);

    const distribuicaoMista =
      dividirQuestoesMistas(
        quantidadeMistasNumero
      );

    try {
      setGerando(true);

      const resposta = await fetch(
        "/api/gerar-plano",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            tipo: "prova_json",
            etapaEnsino,
            serie,
            disciplina,
            tipoAvaliacao,
            conteudos,
            dificuldade,
            valorAvaliacao: "10",
            incluirBncc,
            habilidadeBncc: incluirBncc
              ? habilidadeBncc.trim()
              : "",
            incluirTextoApoio,
            usoImagens,

            quantidadeMultiplaEscolha:
              transformarEmNumero(
                quantidadeMultiplaEscolha
              ),

            quantidadeDiscursivas:
              transformarEmNumero(
                quantidadeDiscursivas
              ),

            quantidadeVerdadeiroFalso:
              distribuicaoMista.verdadeiroFalso,

            quantidadeComplete:
              distribuicaoMista.complete,

            quantidadeRelacione:
              distribuicaoMista.relacione,

            totalQuestoes,
          }),
        }
      );

      const tipoResposta =
        resposta.headers.get("content-type") || "";

      if (
        !tipoResposta.includes(
          "application/json"
        )
      ) {
        if (resposta.status === 504) {
          throw new Error(
            "A geração demorou mais que o esperado. Tente novamente com menos questões."
          );
        }

        throw new Error(
          "O servidor não conseguiu concluir a geração da avaliação."
        );
      }

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível gerar a avaliação."
        );
      }

      const avaliacao = dados.avaliacao;

if (
  !avaliacao ||
  !Array.isArray(avaliacao.questoes)
) {
  throw new Error(
    "A inteligência artificial não retornou as questões da avaliação."
  );
}

      localStorage.setItem(
  "avaliacaoJson",
  JSON.stringify(avaliacao)
);

      if (permissao.usaTestePromocional) {
        const resultadoTeste =
          await consumirTestePromocional();

        if (!resultadoTeste.consumido) {
          console.warn(
            "A avaliação foi gerada, mas o teste promocional não pôde ser descontado:",
            resultadoTeste.mensagem
          );
        }
      }

      localStorage.setItem(
        "configuracaoAvaliacao",
        JSON.stringify({
          etapaEnsino,
          serie,
          disciplina,
          tipoAvaliacao,
          conteudos,
          dificuldade,
          quantidadeMultiplaEscolha,
          quantidadeDiscursivas,
          quantidadeMistas,
          incluirBncc,
          habilidadeBncc: incluirBncc
            ? habilidadeBncc.trim()
            : "",
          incluirTextoApoio,
          usoImagens,
          totalQuestoes,
        })
      );

      router.push("/avaliacoes/revisao");
    } catch (error) {
      console.error(
        "Erro ao gerar avaliação:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao gerar a avaliação."
      );
    } finally {
      setGerando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopoAvaliacoes
        destinoVoltar="/"
        textoVoltar="Voltar"
      />

      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Configuração da avaliação
              </h1>

              <p className="text-sm text-slate-500">
                Os campos com asterisco são
                obrigatórios.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <GraduationCap
                  size={18}
                  className="text-green-600"
                />

                Etapa de ensino

                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                value={etapaEnsino}
                onChange={(event) =>
                  alterarEtapa(
                    event.target.value
                  )
                }
                className="w-full cursor-pointer rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition hover:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-200"
              >
                <option value="">
                  Selecione a etapa
                </option>

                {etapasEnsino.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Users
                  size={18}
                  className="text-green-600"
                />

                Série ou turma

                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                value={serie}
                onChange={(event) =>
                  alterarSerie(
                    event.target.value
                  )
                }
                disabled={!etapaEnsino}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {etapaEnsino
                    ? "Selecione a série ou turma"
                    : "Selecione primeiro a etapa"}
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
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <BookOpen
                  size={18}
                  className="text-green-600"
                />

                Disciplina

                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                value={disciplina}
                onChange={(event) =>
                  setDisciplina(
                    event.target.value
                  )
                }
                disabled={!serie}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {!etapaEnsino
                    ? "Selecione primeiro a etapa"
                    : !serie
                      ? "Selecione primeiro a série"
                      : "Selecione a disciplina"}
                </option>

                {disciplinasDisponiveis.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item === "Computação"
                        ? "Computação — BNCC da Computação"
                        : item}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <ClipboardList
                  size={18}
                  className="text-green-600"
                />

                Tipo de avaliação
              </label>

              <select
                value={tipoAvaliacao}
                onChange={(event) =>
                  setTipoAvaliacao(
                    event.target.value
                  )
                }
                className="w-full cursor-pointer rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition hover:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-200"
              >
                <option value="">
                  Selecione o tipo
                </option>

                {tiposAvaliacao.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks
                size={22}
                className="text-green-600"
              />

              <h2 className="text-lg font-extrabold text-slate-900">
                Quantidade por tipo de questão
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Total de questões
                </label>

                <div className="rounded-xl border-2 border-green-500 bg-green-100 px-4 py-2.5 text-sm font-extrabold text-green-800">
                  {totalQuestoes}
                </div>
              </div>

              <CampoQuantidade
                titulo="Só múltipla escolha"
                valor={
                  quantidadeMultiplaEscolha
                }
                alterar={
                  setQuantidadeMultiplaEscolha
                }
              />

              <CampoQuantidade
                titulo="Só discursivas"
                valor={quantidadeDiscursivas}
                alterar={
                  setQuantidadeDiscursivas
                }
              />

              <CampoQuantidade
                titulo="Misto"
                valor={quantidadeMistas}
                alterar={setQuantidadeMistas}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 border-t border-slate-200 pt-5 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Settings
                  size={22}
                  className="text-emerald-700"
                />

                <h2 className="text-lg font-extrabold text-slate-900">
                  Opções da avaliação
                </h2>

                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-700">
                  não obrigatório
                </span>
              </div>

              <div className="grid gap-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-emerald-200 bg-white px-4 py-3 transition hover:border-emerald-500 hover:bg-emerald-100">
                  <input
                    type="checkbox"
                    checked={incluirBncc}
                    onChange={(event) =>
                      setIncluirBncc(
                        event.target.checked
                      )
                    }
                    className="h-5 w-5 cursor-pointer accent-emerald-700"
                  />

                  <span className="text-sm font-bold text-slate-800">
                    Incluir habilidade da BNCC
                  </span>
                </label>

                {incluirBncc && (
                  <div className="rounded-xl border-2 border-emerald-200 bg-white px-4 py-3">
                    <label
                      htmlFor="habilidade-bncc"
                      className="mb-2 block text-sm font-bold text-slate-800"
                    >
                      Habilidade da BNCC
                      <span className="ml-2 text-xs font-semibold text-slate-500">
                        opcional
                      </span>
                    </label>

                    <input
                      id="habilidade-bncc"
                      type="text"
                      value={habilidadeBncc}
                      onChange={(event) =>
                        setHabilidadeBncc(event.target.value)
                      }
                      placeholder="Ex.: EF08CI01 ou EF08CI01, EF08CI02"
                      className="w-full rounded-xl border-2 border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                    />

                    <p className="mt-2 text-xs font-semibold leading-5 text-emerald-800">
                      Digite uma ou mais habilidades específicas. Se deixar em branco,
                      o PlanejAI escolherá a habilidade mais adequada.
                    </p>
                  </div>
                )}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-emerald-200 bg-white px-4 py-3 transition hover:border-emerald-500 hover:bg-emerald-100">
                  <input
                    type="checkbox"
                    checked={
                      incluirTextoApoio
                    }
                    onChange={(event) =>
                      setIncluirTextoApoio(
                        event.target.checked
                      )
                    }
                    className="h-5 w-5 cursor-pointer accent-emerald-700"
                  />

                  <span className="text-sm font-bold text-slate-800">
                    Incluir texto de apoio
                  </span>
                </label>

                <div className="rounded-xl border-2 border-emerald-200 bg-white px-4 py-3">
                  <label
                    htmlFor="uso-imagens"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Uso de imagens nas questões
                    <span className="ml-2 text-xs font-semibold text-slate-500">
                      opcional
                    </span>
                  </label>

                  <select
                    id="uso-imagens"
                    value={usoImagens}
                    onChange={(event) =>
                      setUsoImagens(
                        event.target.value as
                          | ""
                          | "parcial"
                          | "total"
                      )
                    }
                    className="w-full cursor-pointer rounded-xl border-2 border-emerald-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="">
                      Deixar a IA decidir
                    </option>
                    <option value="parcial">
                      Imagens em algumas questões
                    </option>
                    <option value="total">
                      Imagens em todas as questões
                    </option>
                  </select>

                  <p className="mt-2 text-xs font-semibold leading-5 text-emerald-800">
                    Se não escolher uma opção, o PlanejAI decide quando a imagem ajuda. Um pedido escrito pelo professor continua tendo prioridade.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-extrabold text-slate-900">
                  Nível das questões
                </label>

                <select
                  value={dificuldade}
                  onChange={(event) =>
                    setDificuldade(
                      event.target.value
                    )
                  }
                  className="w-full cursor-pointer rounded-xl border-2 border-emerald-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="Mais fáceis">
                    Mais fáceis
                  </option>
                  <option value="Fáceis">
                    Fáceis
                  </option>
                  <option value="Médias">
                    Médias
                  </option>
                  <option value="Difíceis">
                    Difíceis
                  </option>
                  <option value="Mais difíceis">
                    Mais difíceis
                  </option>
                  <option value="Misto">
                    Misto
                  </option>
                </select>

                <p className="mt-2 text-xs font-semibold leading-5 text-emerald-800">
                  A IA respeitará a série, o conteúdo ensinado e o nível escolhido.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4">
              <label className="mb-2 flex items-center gap-2 text-lg font-extrabold text-slate-900">
                <ClipboardList
                  size={22}
                  className="text-green-700"
                />

                Conteúdos que serão avaliados

                <span className="text-red-500">
                  *
                </span>
              </label>

              <p className="mb-3 text-sm font-semibold leading-5 text-slate-600">
                Informe os conteúdos e, se quiser, escreva também pedidos específicos para a avaliação. O PlanejAI deve respeitar essas instruções.
              </p>

              <textarea
                value={conteudos}
                onChange={(event) =>
                  setConteudos(
                    event.target.value
                  )
                }
                placeholder="Exemplo: rotação e translação da Terra. Quero uma questão com imagem mostrando os movimentos da Terra e outra questão comparando rotação e translação."
                rows={6}
                className="w-full resize-none rounded-xl border-2 border-green-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-200"
              />
            </div>
          </div>

          {erro && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {erro}
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/")}
              disabled={gerando}
              className="cursor-pointer rounded-xl border-2 border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Voltar ao painel
            </button>

            <button
              type="button"
              onClick={gerarProva}
              disabled={gerando}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {gerando ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Gerando avaliação...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Gerar avaliação
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

type CampoQuantidadeProps = {
  titulo: string;
  valor: string;
  alterar: (valor: string) => void;
};

function CampoQuantidade({
  titulo,
  valor,
  alterar,
}: CampoQuantidadeProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {titulo}
      </label>

      <input
        type="number"
        min="0"
        max="30"
        value={valor}
        onChange={(event) =>
          alterar(event.target.value)
        }
        className="w-full cursor-pointer rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition hover:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-200"
      />
    </div>
  );
}