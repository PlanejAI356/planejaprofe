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
import LetraTracejada from "../visualizacao/LetraTracejada";

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

function ImagemAtividade({
  descricao,
  url,
  tamanho = "medio",
}: {
  descricao: string;
  url?: string;
  tamanho?: "pequeno" | "medio" | "grande";
}) {
  const classeTamanho =
    tamanho === "pequeno"
      ? "h-20 w-20"
      : tamanho === "grande"
        ? "h-40 w-40"
        : "h-28 w-28";

  if (url) {
    return (
      <div className="flex justify-center">
        <img
          src={url}
          alt={descricao || "Imagem da atividade"}
          className={`${classeTamanho} object-contain`}
        />
      </div>
    );
  }

  return (
    <div className="imagem-pendente flex min-h-24 items-center justify-center rounded border border-dashed border-slate-300 p-2 text-center">
      <div>
        <ImageIcon
          className="mx-auto mb-1 text-slate-400"
          size={21}
        />

        <p className="text-[10px] leading-3 text-slate-500">
          {descricao || "Imagem"}
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
      <div className="item-ligue grid grid-cols-[28px_1fr_110px] items-center gap-3 border-b border-slate-300 py-2">
        <span>{indice + 1}.</span>

        <span className="font-medium">
          {item.colunaA || item.texto}
        </span>

        {item.imagemUrl ? (
          <ImagemAtividade
            descricao={
              item.imagemDescricao ||
              item.colunaB
            }
            url={item.imagemUrl}
            tamanho="pequeno"
          />
        ) : (
          <span className="text-sm">
            {item.colunaB}
          </span>
        )}
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

        <ImagemAtividade
          descricao={item.imagemDescricao}
          url={item.imagemUrl}
          tamanho="medio"
        />

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
    <section className="exercicio-impressao mb-5 break-inside-avoid">
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

      {exercicio.conteudoLivre &&
        exercicio.tipo !== "letra_tracejada" &&
        exercicio.tipo !== "tracejado" && (
          <div className="mt-3 whitespace-pre-wrap">
            {exercicio.conteudoLivre}
          </div>
        )}

      {exercicio.imagemNecessaria && (
        <ImagemAtividade
          descricao={exercicio.imagemDescricao}
          url={exercicio.imagemUrl}
          tamanho="grande"
        />
      )}

      {exercicio.itens.length > 0 && (
        <div
          className={
            ehVisual
              ? "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
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

      {(exercicio.tipo === "letra_tracejada" ||
        exercicio.tipo === "tracejado") && (
        <div className="mt-4">
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
              margin: 1.2cm;
              color: #000;
              font-size: 11pt;
              line-height: 1.3;
            }
            img {
              max-width: 130px;
              max-height: 130px;
              object-fit: contain;
            }
            section {
              page-break-inside: avoid;
              margin-bottom: 14px;
            }
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
        .folha-impressao {
          box-sizing: border-box;
        }

        .folha-impressao img {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 9mm 10mm 10mm;
          }

          html,
          body {
            width: 210mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            font-size: 11pt;
            line-height: 1.25;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .nao-imprimir {
            display: none !important;
          }

          .folha-impressao {
            width: 190mm !important;
            max-width: 190mm !important;
            min-height: 0 !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .folha-impressao h1 {
            font-size: 17pt !important;
            line-height: 1.15 !important;
          }

          .folha-impressao h2 {
            font-size: 11.5pt !important;
            line-height: 1.2 !important;
          }

          .folha-impressao p,
          .folha-impressao li,
          .folha-impressao span {
            orphans: 3;
            widows: 3;
          }

          .exercicio-impressao,
          .quebra-evitar,
          .item-ligue,
          img,
          svg {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .folha-impressao svg {
            max-width: 100% !important;
          }

          .folha-impressao svg text {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .exercicio-impressao {
            margin-bottom: 4mm !important;
          }

          .imagem-pendente {
            display: none !important;
          }

          img {
            max-width: 100% !important;
            height: auto;
          }

          button,
          details,
          summary {
            display: none !important;
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
          className={`folha-impressao mx-auto min-h-[1123px] max-w-[794px] bg-white px-10 py-8 shadow-md ${
            usarMaiusculas ? "uppercase" : ""
          }`}
          style={{
            fontFamily: `"${fonte}", "Times New Roman", serif`,
          }}
        >
          <div
            className="mb-4 border-b border-black pb-3 text-sm leading-6"
            dangerouslySetInnerHTML={{ __html: cabecalho }}
          />

          <div className="mb-5 text-center">
            <h1 className="text-2xl font-bold leading-tight">
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