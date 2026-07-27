"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  GraduationCap,
  ListChecks,
  Loader2,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

const etapasEnsino = [
  "Ensino Fundamental - Anos Iniciais",
  "Ensino Fundamental - Anos Finais",
  "Ensino Médio",
  "EJA",
];

const disciplinas = [
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
];

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
  const complete = Math.ceil((quantidade - verdadeiroFalso) / 2);
  const relacione = quantidade - verdadeiroFalso - complete;

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

  const [quantidadeMultiplaEscolha, setQuantidadeMultiplaEscolha] =
    useState("5");
  const [quantidadeDiscursivas, setQuantidadeDiscursivas] = useState("3");
  const [quantidadeMistas, setQuantidadeMistas] = useState("2");

  const [incluirBncc, setIncluirBncc] = useState(false);
  const [incluirTextoApoio, setIncluirTextoApoio] = useState(false);

  const [gerando, setGerando] = useState(false);
  const [provaGerada, setProvaGerada] = useState("");
  const [erro, setErro] = useState("");

  const totalQuestoes = useMemo(() => {
    return (
      transformarEmNumero(quantidadeMultiplaEscolha) +
      transformarEmNumero(quantidadeDiscursivas) +
      transformarEmNumero(quantidadeMistas)
    );
  }, [
    quantidadeMultiplaEscolha,
    quantidadeDiscursivas,
    quantidadeMistas,
  ]);

  async function gerarProva() {
    setErro("");

    if (
      !etapaEnsino ||
      !serie.trim() ||
      !disciplina ||
      !conteudos.trim()
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (totalQuestoes === 0) {
      setErro("Informe pelo menos uma questão.");
      return;
    }

    if (totalQuestoes > 30) {
      setErro("A avaliação pode ter no máximo 30 questões.");
      return;
    }

    const quantidadeMistasNumero =
      transformarEmNumero(quantidadeMistas);

    const distribuicaoMista =
      dividirQuestoesMistas(quantidadeMistasNumero);

    try {
      setGerando(true);

      const resposta = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "prova",
          etapaEnsino,
          serie,
          disciplina,
          tipoAvaliacao,
          conteudos,
          dificuldade: "Misto",
          valorAvaliacao: "10",
          incluirBncc,
          incluirTextoApoio,
          quantidadeMultiplaEscolha:
            transformarEmNumero(quantidadeMultiplaEscolha),
          quantidadeDiscursivas:
            transformarEmNumero(quantidadeDiscursivas),
          quantidadeVerdadeiroFalso:
            distribuicaoMista.verdadeiroFalso,
          quantidadeComplete: distribuicaoMista.complete,
          quantidadeRelacione: distribuicaoMista.relacione,
          totalQuestoes,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível gerar a avaliação."
        );
      }

      const textoRecebido = dados.texto || "";

      if (!textoRecebido.trim()) {
        throw new Error(
          "A inteligência artificial não retornou a avaliação."
        );
      }

      localStorage.setItem("provaGerada", textoRecebido);

localStorage.setItem(
  "configuracaoAvaliacao",
        JSON.stringify({
          etapaEnsino,
          serie,
          disciplina,
          tipoAvaliacao,
          conteudos,
          quantidadeMultiplaEscolha,
          quantidadeDiscursivas,
          quantidadeMistas,
          incluirBncc,
          incluirTextoApoio,
          totalQuestoes,
        })
      );

      router.push("/avaliacoes/resultado");
    } catch (error) {
      console.error("Erro ao gerar avaliação:", error);

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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-green-50 hover:text-green-800"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <span className="text-xl font-extrabold text-slate-900">
            Planej<span className="text-green-600">AI</span>
          </span>

          <div className="w-[82px]" />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <GraduationCap size={27} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Configuração da avaliação
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Os campos com asterisco são obrigatórios.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <GraduationCap size={18} className="text-green-600" />
                Etapa de ensino <span className="text-red-500">*</span>
              </label>

              <select
                value={etapaEnsino}
                onChange={(event) => setEtapaEnsino(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Selecione a etapa</option>

                {etapasEnsino.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Users size={18} className="text-green-600" />
                Série ou turma <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={serie}
                onChange={(event) => setSerie(event.target.value)}
                placeholder="Ex.: 6º ano"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <BookOpen size={18} className="text-green-600" />
                Disciplina <span className="text-red-500">*</span>
              </label>

              <select
                value={disciplina}
                onChange={(event) => setDisciplina(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Selecione a disciplina</option>

                {disciplinas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <ClipboardList size={18} className="text-green-600" />
                Tipo de avaliação
              </label>

              <select
                value={tipoAvaliacao}
                onChange={(event) => setTipoAvaliacao(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Selecione o tipo</option>

                {tiposAvaliacao.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <label className="mb-3 flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <ClipboardList size={22} className="text-green-600" />
              Conteúdos que serão avaliados
              <span className="text-red-500">*</span>
            </label>

            <textarea
              value={conteudos}
              onChange={(event) => setConteudos(event.target.value)}
              placeholder="Digite ou cole os conteúdos aqui..."
              rows={5}
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="mb-5 flex items-center gap-2">
              <ListChecks size={23} className="text-green-600" />

              <h2 className="text-lg font-extrabold text-slate-900">
                Quantidade por tipo de questão
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Total de questões
                </label>

                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-extrabold text-green-700">
                  {totalQuestoes}
                </div>
              </div>

              <CampoQuantidade
                titulo="Só múltipla escolha"
                valor={quantidadeMultiplaEscolha}
                alterar={setQuantidadeMultiplaEscolha}
              />

              <CampoQuantidade
                titulo="Só discursivas"
                valor={quantidadeDiscursivas}
                alterar={setQuantidadeDiscursivas}
              />

              <CampoQuantidade
                titulo="Misto"
                valor={quantidadeMistas}
                alterar={setQuantidadeMistas}
              />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Settings size={23} className="text-green-600" />

              <h2 className="text-lg font-extrabold text-slate-900">
                Opções da avaliação
              </h2>

              <span className="text-sm font-medium italic text-green-600">
                não obrigatório
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-green-300 hover:bg-green-50">
                <input
                  type="checkbox"
                  checked={incluirBncc}
                  onChange={(event) => setIncluirBncc(event.target.checked)}
                  className="h-5 w-5 accent-green-600"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Incluir habilidade da BNCC
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-green-300 hover:bg-green-50">
                <input
                  type="checkbox"
                  checked={incluirTextoApoio}
                  onChange={(event) =>
                    setIncluirTextoApoio(event.target.checked)
                  }
                  className="h-5 w-5 accent-green-600"
                />

                <span className="text-sm font-semibold text-slate-700">
                  Incluir texto de apoio
                </span>
              </label>
            </div>
          </div>

          {erro && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {erro}
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/")}
              disabled={gerando}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Voltar ao painel
            </button>

            <button
              type="button"
              onClick={gerarProva}
              disabled={gerando}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {gerando ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
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

        {provaGerada && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-4 border-b border-green-100 pb-4">
              <h2 className="text-xl font-extrabold text-slate-900">
                Avaliação gerada
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Clique no texto para corrigir ou alterar qualquer parte.
              </p>
            </div>

            <textarea
              value={provaGerada}
              onChange={(event) => {
                setProvaGerada(event.target.value);
                localStorage.setItem("provaGerada", event.target.value);
              }}
              rows={30}
              className="min-h-[700px] w-full resize-y rounded-xl border border-slate-300 bg-white p-5 text-sm leading-7 text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={gerarProva}
                disabled={gerando}
                className="flex items-center justify-center gap-2 rounded-xl border border-green-700 px-5 py-3 text-sm font-extrabold text-green-800 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {gerando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Gerar novamente
                  </>
                )}
              </button>
            </div>
          </div>
        )}
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
        onChange={(event) => alterar(event.target.value)}
        className="w-fulgit pushl rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
      />
    </div>
  );
}