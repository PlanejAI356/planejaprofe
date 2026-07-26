"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Loader2,
  Sparkles,
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

const niveisDificuldade = ["Fácil", "Médio", "Difícil", "Misto"];

function transformarEmNumero(valor: string) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0) {
    return 0;
  }

  return Math.floor(numero);
}

export default function AvaliacoesPage() {
  const router = useRouter();

  const [etapaEnsino, setEtapaEnsino] = useState("");
  const [serie, setSerie] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [tipoAvaliacao, setTipoAvaliacao] = useState("");
  const [conteudos, setConteudos] = useState("");
  const [dificuldade, setDificuldade] = useState("Misto");
  const [valorAvaliacao, setValorAvaliacao] = useState("10");

  const [quantidadeMultiplaEscolha, setQuantidadeMultiplaEscolha] =
    useState("5");

  const [quantidadeDiscursivas, setQuantidadeDiscursivas] = useState("3");

  const [quantidadeVerdadeiroFalso, setQuantidadeVerdadeiroFalso] =
    useState("2");

  const [quantidadeComplete, setQuantidadeComplete] = useState("0");

  const [quantidadeRelacione, setQuantidadeRelacione] = useState("0");

  const [incluirGabarito, setIncluirGabarito] = useState(true);
  const [incluirBncc, setIncluirBncc] = useState(false);
  const [incluirTextoApoio, setIncluirTextoApoio] = useState(false);

  const [gerando, setGerando] = useState(false);
  const [provaGerada, setProvaGerada] = useState("");
  const [erro, setErro] = useState("");

  const totalQuestoes = useMemo(() => {
    return (
      transformarEmNumero(quantidadeMultiplaEscolha) +
      transformarEmNumero(quantidadeDiscursivas) +
      transformarEmNumero(quantidadeVerdadeiroFalso) +
      transformarEmNumero(quantidadeComplete) +
      transformarEmNumero(quantidadeRelacione)
    );
  }, [
    quantidadeMultiplaEscolha,
    quantidadeDiscursivas,
    quantidadeVerdadeiroFalso,
    quantidadeComplete,
    quantidadeRelacione,
  ]);

  async function gerarProva() {
    setErro("");

    if (
      !etapaEnsino ||
      !serie.trim() ||
      !disciplina ||
      !tipoAvaliacao ||
      !conteudos.trim()
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (totalQuestoes === 0) {
      setErro("Informe pelo menos um tipo de questão.");
      return;
    }

    if (totalQuestoes > 30) {
      setErro("A avaliação pode ter no máximo 30 questões.");
      return;
    }

    try {
      setGerando(true);

      const resposta = await fetch("/api/gerar", {
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
          dificuldade,
          valorAvaliacao,
          quantidadeMultiplaEscolha:
            transformarEmNumero(quantidadeMultiplaEscolha),
          quantidadeDiscursivas:
            transformarEmNumero(quantidadeDiscursivas),
          quantidadeVerdadeiroFalso:
            transformarEmNumero(quantidadeVerdadeiroFalso),
          quantidadeComplete: transformarEmNumero(quantidadeComplete),
          quantidadeRelacione: transformarEmNumero(quantidadeRelacione),
          totalQuestoes,
          incluirGabarito,
          incluirBncc,
          incluirTextoApoio,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível gerar a avaliação.");
      }

      const textoRecebido = dados.texto || "";

      if (!textoRecebido.trim()) {
        throw new Error("A inteligência artificial não retornou a avaliação.");
      }

      setProvaGerada(textoRecebido);

      localStorage.setItem(
        "configuracaoAvaliacao",
        JSON.stringify({
          etapaEnsino,
          serie,
          disciplina,
          tipoAvaliacao,
          conteudos,
          dificuldade,
          valorAvaliacao,
          quantidadeMultiplaEscolha,
          quantidadeDiscursivas,
          quantidadeVerdadeiroFalso,
          quantidadeComplete,
          quantidadeRelacione,
          totalQuestoes,
          incluirGabarito,
          incluirBncc,
          incluirTextoApoio,
        })
      );

      localStorage.setItem("provaGerada", textoRecebido);
    } catch (error) {
      console.error("Erro ao gerar prova:", error);

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/logo-planejai.png"
              alt="PlanejAI"
              className="h-9 w-9 object-contain"
            />

            <span className="text-lg font-extrabold text-slate-900">
              Planej<span className="text-green-600">AI</span>
            </span>
          </div>

          <div className="w-[82px]" />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <ClipboardList size={34} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Criar avaliação
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Escolha os tipos de questões e informe os conteúdos que serão
            avaliados.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <GraduationCap size={24} />
            </div>

            <div>
              <h2 className="font-extrabold text-slate-900">
                Configuração da avaliação
              </h2>

              <p className="text-sm text-slate-500">
                Os campos com asterisco são obrigatórios.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Etapa de ensino *
              </label>

              <select
                value={etapaEnsino}
                onChange={(event) => setEtapaEnsino(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Série ou turma *
              </label>

              <input
                type="text"
                value={serie}
                onChange={(event) => setSerie(event.target.value)}
                placeholder="Ex.: 6º ano"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Disciplina *
              </label>

              <select
                value={disciplina}
                onChange={(event) => setDisciplina(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Tipo de avaliação *
              </label>

              <select
                value={tipoAvaliacao}
                onChange={(event) => setTipoAvaliacao(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

          <div className="mt-5">
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <BookOpen size={17} />
              Conteúdos que serão avaliados *
            </label>

            <textarea
              value={conteudos}
              onChange={(event) => setConteudos(event.target.value)}
              placeholder="Ex.: Sistema Solar; movimentos da Terra; fases da Lua."
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separe os conteúdos por ponto e vírgula ou escreva um conteúdo em
              cada linha.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="font-extrabold text-slate-900">
                Quantidade por tipo de questão
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Informe zero nos tipos que não deseja utilizar.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CampoQuantidade
                titulo="Múltipla escolha"
                valor={quantidadeMultiplaEscolha}
                alterar={setQuantidadeMultiplaEscolha}
              />

              <CampoQuantidade
                titulo="Questões discursivas"
                valor={quantidadeDiscursivas}
                alterar={setQuantidadeDiscursivas}
              />

              <CampoQuantidade
                titulo="Verdadeiro ou falso"
                valor={quantidadeVerdadeiroFalso}
                alterar={setQuantidadeVerdadeiroFalso}
              />

              <CampoQuantidade
                titulo="Complete"
                valor={quantidadeComplete}
                alterar={setQuantidadeComplete}
              />

              <CampoQuantidade
                titulo="Relacione as colunas"
                valor={quantidadeRelacione}
                alterar={setQuantidadeRelacione}
              />
            </div>

            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center">
              <span className="text-sm font-bold text-blue-900">
                Total de questões: {totalQuestoes}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Nível de dificuldade
              </label>

              <select
                value={dificuldade}
                onChange={(event) => setDificuldade(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {niveisDificuldade.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Valor total da avaliação
              </label>

              <input
                type="number"
                min="0"
                step="0.5"
                value={valorAvaliacao}
                onChange={(event) => setValorAvaliacao(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-extrabold text-blue-900">
              <FileText size={20} />
              Opções da avaliação
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <Opcao
                marcada={incluirGabarito}
                alterar={setIncluirGabarito}
                texto="Incluir gabarito"
              />

              <Opcao
                marcada={incluirBncc}
                alterar={setIncluirBncc}
                texto="Incluir habilidades da BNCC"
              />

              <Opcao
                marcada={incluirTextoApoio}
                alterar={setIncluirTextoApoio}
                texto="Incluir texto de apoio"
              />
            </div>
          </div>

          {erro && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
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
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {gerando ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Gerando prova...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Gerar prova
                </>
              )}
            </button>
          </div>
        </div>

        {provaGerada && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold text-slate-900">
                Prova gerada
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
              className="min-h-[700px] w-full resize-y rounded-xl border border-slate-300 bg-white p-5 text-sm leading-7 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={gerarProva}
                disabled={gerando}
                className="flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-5 py-3 text-sm font-extrabold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

type OpcaoProps = {
  marcada: boolean;
  alterar: (valor: boolean) => void;
  texto: string;
};

function Opcao({ marcada, alterar, texto }: OpcaoProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm">
      <input
        type="checkbox"
        checked={marcada}
        onChange={(event) => alterar(event.target.checked)}
        className="h-4 w-4 accent-blue-600"
      />

      {texto}
    </label>
  );
}