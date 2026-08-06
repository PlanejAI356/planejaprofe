"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  ImageIcon,
  Printer,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ConfiguracaoAtividade = {
  modoCriacao: "automatica" | "personalizada";
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
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
  fonteAtividade?: string;
  usarMaiusculas?: boolean;
  quantidadePaginas?: number;
  exercicios: Exercicio[];
};

const CABECALHO_PADRAO =
  "<strong>ESCOLA:</strong> ________________________________________________<br>" +
  "<strong>ALUNO(A):</strong> _____________________________________________<br>" +
  "<strong>PROFESSOR(A):</strong> ____________________ " +
  "<strong>DATA:</strong> ____/____/______";

function tituloTipo(tipo: string) {
  return tipo
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function LinhasResposta({ quantidade = 2 }: { quantidade?: number }) {
  return (
    <div className="mt-3 space-y-5">
      {Array.from({ length: quantidade }).map((_, indice) => (
        <div
          key={indice}
          className="h-5 border-b border-black"
        />
      ))}
    </div>
  );
}

function ImagemPendente({
  descricao,
}: {
  descricao: string;
}) {
  return (
    <div className="mt-3 flex min-h-28 items-center justify-center rounded border border-dashed border-slate-400 p-3 text-center">
      <div>
        <ImageIcon className="mx-auto mb-2 text-slate-500" size={25} />
        <p className="text-xs text-slate-600">
          {descricao || "Espaço reservado para imagem"}
        </p>
      </div>
    </div>
  );
}

function RenderizarItem({
  item,
  indice,
  tipo,
}: {
  item: ItemExercicio;
  indice: number;
  tipo: string;
}) {
  if (item.colunaA || item.colunaB) {
    return (
      <div className="grid grid-cols-[32px_1fr_1fr] gap-3 border-b border-slate-300 py-2">
        <span>{indice + 1}.</span>
        <span>{item.colunaA}</span>
        <span>{item.colunaB}</span>
      </div>
    );
  }

  if (item.alternativas.length > 0) {
    return (
      <div className="mb-5 break-inside-avoid">
        <p>
          {indice + 1}. {item.texto}
        </p>
        <div className="mt-2 space-y-1 pl-5">
          {item.alternativas.map((alternativa, alternativaIndice) => (
            <p key={alternativaIndice}>
              ( ) {String.fromCharCode(65 + alternativaIndice)}){" "}
              {alternativa}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (typeof item.verdadeiro === "boolean") {
    return (
      <p className="mb-2">
        ( ) {item.texto}
      </p>
    );
  }

  const tipoComImagem =
    tipo === "ditado_ilustrado" ||
    tipo === "escreva_nome_figuras" ||
    tipo === "circule_figuras" ||
    item.imagemNecessaria;

  if (tipoComImagem) {
    return (
      <div className="break-inside-avoid rounded border border-slate-300 p-3">
        {item.imagemNecessaria &&
          (item.resposta || item.texto) && (
            <p className="mb-2 text-center font-semibold">
              {item.texto}
            </p>
          )}

        <ImagemPendente descricao={item.imagemDescricao} />

        {(tipo === "ditado_ilustrado" ||
          tipo === "escreva_nome_figuras") && (
          <div className="mt-4 h-6 border-b border-black" />
        )}
      </div>
    );
  }

  return (
    <div className="mb-3 break-inside-avoid">
      <p>
        {indice + 1}. {item.texto || item.resposta}
      </p>

      {(tipo === "discursiva" ||
        tipo === "interpretacao_texto" ||
        tipo === "problema_matematico") && (
        <LinhasResposta quantidade={2} />
      )}
    </div>
  );
}

function RenderizarExercicio({
  exercicio,
}: {
  exercicio: Exercicio;
}) {
  const ehVisual =
    exercicio.tipo === "ditado_ilustrado" ||
    exercicio.tipo === "escreva_nome_figuras" ||
    exercicio.tipo === "circule_figuras" ||
    exercicio.tipo === "pinte";

  return (
    <section className="mb-7 break-inside-avoid">
      <h2 className="font-bold">
        {exercicio.numero}. {exercicio.titulo}
      </h2>

      {exercicio.comando && (
        <p className="mt-1 font-semibold">{exercicio.comando}</p>
      )}

      {exercicio.textoApoio && (
        <div className="mt-3 rounded border border-black p-3 text-justify">
          {exercicio.textoApoio}
        </div>
      )}

      {exercicio.conteudoLivre && (
        <div className="mt-3 whitespace-pre-wrap">
          {exercicio.conteudoLivre}
        </div>
      )}

      {exercicio.imagemNecessaria && (
        <ImagemPendente descricao={exercicio.imagemDescricao} />
      )}

      {exercicio.itens.length > 0 && (
        <div
          className={
            ehVisual
              ? "mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3"
              : "mt-4"
          }
        >
          {exercicio.itens.map((item, indice) => (
            <RenderizarItem
              key={item.id || `${exercicio.id}-${indice}`}
              item={item}
              indice={indice}
              tipo={exercicio.tipo}
            />
          ))}
        </div>
      )}

      {exercicio.palavras.length > 0 && (
        <div className="mt-4 rounded border border-black p-3">
          <strong>PALAVRAS:</strong>{" "}
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
        <div className="mt-4 overflow-hidden rounded border border-black p-4 text-center font-mono leading-8 tracking-widest">
          {exercicio.grade.map((linha, indice) => (
            <div key={indice} className="whitespace-pre">
              {linha}
            </div>
          ))}
        </div>
      )}

      {exercicio.tipo === "producao_texto" && (
        <LinhasResposta quantidade={8} />
      )}

      {exercicio.tipo === "tracejado" && (
        <div className="mt-5 space-y-4 text-center text-3xl tracking-[0.35em] text-slate-400">
          <p>{exercicio.conteudoLivre}</p>
          <p>{exercicio.conteudoLivre}</p>
          <p>{exercicio.conteudoLivre}</p>
        </div>
      )}
    </section>
  );
}

export default function ResultadoAtividadePage() {
  const router = useRouter();
  const documentoRef = useRef<HTMLDivElement>(null);

  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividade | null>(null);

  const [atividade, setAtividade] =
    useState<AtividadeGerada | null>(null);

  const [cabecalho, setCabecalho] = useState(CABECALHO_PADRAO);
  const [cabecalhoSalvo, setCabecalhoSalvo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    try {
      const configuracaoSalva = localStorage.getItem(
        "configuracaoAtividade"
      );

      const atividadeSalva =
        localStorage.getItem("atividadeJson");

      const cabecalhoSalvoLocal =
        localStorage.getItem("cabecalhoAtividade");

      if (!configuracaoSalva || !atividadeSalva) {
        setErro(
          "Não encontrei a atividade montada. Volte e gere uma nova atividade."
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
        !Array.isArray(atividadeRecebida.exercicios)
      ) {
        throw new Error("Atividade inválida.");
      }

      setConfiguracao(configuracaoRecebida);
      setAtividade(atividadeRecebida);

      if (cabecalhoSalvoLocal) {
        setCabecalho(cabecalhoSalvoLocal);
        setCabecalhoSalvo(true);
      }
    } catch (error) {
      console.error("Erro ao carregar atividade:", error);
      setErro(
        "Os dados da atividade estão inválidos. Volte e gere novamente."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  function salvarCabecalho() {
    localStorage.setItem("cabecalhoAtividade", cabecalho);
    setCabecalhoSalvo(true);
  }

  function imprimirOuSalvarPDF() {
    window.print();
  }

  function baixarHtmlWord() {
    if (!documentoRef.current || !atividade) return;

    const conteudo = documentoRef.current.innerHTML;

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>${atividade.titulo}</title>
          <style>
            body {
              font-family: "Times New Roman", serif;
              margin: 2cm;
              color: #000;
              font-size: 12pt;
              line-height: 1.5;
            }
            img { max-width: 180px; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #000; padding: 6px; }
          </style>
        </head>
        <body>${conteudo}</body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "atividade-pedagogica.doc";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-semibold text-emerald-700">
          Carregando atividade...
        </p>
      </main>
    );
  }

  if (erro || !configuracao || !atividade) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <FileText className="mx-auto text-red-500" size={35} />
          <p className="mt-3 font-bold text-red-700">
            {erro || "Atividade não encontrada."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/atividades")}
            className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white"
          >
            Voltar para atividades
          </button>
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
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.4cm;
          }

          body {
            background: white !important;
          }

          .nao-imprimir {
            display: none !important;
          }

          .folha-impressao {
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
          }

          .quebra-evitar {
            break-inside: avoid;
          }
        }
      `}</style>

      <header className="nao-imprimir border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Folha final da atividade
            </h1>
            <p className="text-sm text-slate-700">
              Revise o cabeçalho e salve ou imprima.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/atividades/revisao")}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm"
          >
            <ArrowLeft size={19} />
            Voltar à revisão
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="nao-imprimir mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block font-bold text-slate-900">
            Cabeçalho da escola
          </label>

          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => {
              setCabecalho(event.currentTarget.innerHTML);
              setCabecalhoSalvo(false);
            }}
            className="mt-3 min-h-28 rounded-xl border border-slate-300 bg-white p-4 outline-none focus:border-emerald-500"
            dangerouslySetInnerHTML={{ __html: cabecalho }}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p
              className={`text-sm ${
                cabecalhoSalvo
                  ? "font-semibold text-emerald-700"
                  : "text-slate-500"
              }`}
            >
              {cabecalhoSalvo
                ? "Cabeçalho salvo para as próximas atividades."
                : "Edite ou cole o cabeçalho utilizado pela escola."}
            </p>

            <button
              type="button"
              onClick={salvarCabecalho}
              className="flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 font-bold text-emerald-700"
            >
              <Save size={17} />
              Salvar cabeçalho
            </button>
          </div>
        </div>

        <div
          ref={documentoRef}
          className={`folha-impressao mx-auto min-h-[1123px] max-w-[794px] bg-white p-10 shadow-md ${
            usarMaiusculas ? "uppercase" : ""
          }`}
          style={{
            fontFamily: `"${fonte}", "Times New Roman", serif`,
          }}
        >
          <div
            className="mb-5 border-b border-black pb-4 leading-7"
            dangerouslySetInnerHTML={{ __html: cabecalho }}
          />

          <div className="mb-7 text-center">
            <h1 className="text-xl font-bold">
              {atividade.titulo}
            </h1>

            {atividade.subtitulo && (
              <p className="mt-1">
                {atividade.subtitulo}
              </p>
            )}

            <p className="mt-1 text-sm">
              {configuracao.disciplina} — {configuracao.serie}
            </p>
          </div>

          {atividade.exercicios.map((exercicio) => (
            <RenderizarExercicio
              key={exercicio.id}
              exercicio={exercicio}
            />
          ))}
        </div>

        <div className="nao-imprimir mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={baixarHtmlWord}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700"
          >
            <Download size={19} />
            Baixar Word
          </button>

          <button
            type="button"
            onClick={imprimirOuSalvarPDF}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 font-bold text-white"
          >
            <Printer size={19} />
            Imprimir ou salvar em PDF
          </button>
        </div>
      </section>
    </main>
  );
}