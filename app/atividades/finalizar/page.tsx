"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Printer,
  Save,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ConfiguracaoAtividadeImagem = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  pedido?: string;
  quantidadeQuestoes?: number;
};

const CABECALHO_PADRAO = `
<table style="width:100%; border-collapse:collapse; font-family:Arial, Helvetica, sans-serif; font-size:12px;">
  <tbody>
    <tr>
      <td rowspan="4" style="width:120px; border:1px solid #000; text-align:center; vertical-align:middle; padding:8px;">
        <strong>LOGO</strong>
      </td>

      <td colspan="2" style="border:1px solid #000; text-align:center; padding:6px; font-weight:700;">
        NOME DA ESCOLA
      </td>

      <td rowspan="2" style="width:120px; border:1px solid #000; text-align:center; vertical-align:middle; padding:6px;">
        <strong>DATA</strong><br><br>
        ____/____/______
      </td>
    </tr>

    <tr>
      <td style="border:1px solid #000; padding:6px;">
        <strong>Componente Curricular:</strong>
      </td>

      <td style="border:1px solid #000; padding:6px;">
        <strong>Professor(a):</strong>
      </td>
    </tr>

    <tr>
      <td style="border:1px solid #000; padding:6px;">
        <strong>Turno:</strong>
      </td>

      <td style="border:1px solid #000; padding:6px;">
        <strong>Série:</strong>
      </td>

      <td style="border:1px solid #000; text-align:center; padding:6px;">
        <strong>NOTA</strong>
      </td>
    </tr>

    <tr>
      <td colspan="2" style="border:1px solid #000; padding:6px;">
        <strong>Objeto(s) de Conhecimento:</strong>
      </td>

      <td style="border:1px solid #000; padding:6px;">
        &nbsp;
      </td>
    </tr>

    <tr>
      <td colspan="4" style="border:1px solid #000; padding:6px;">
        <strong>Aluno(a):</strong>
      </td>
    </tr>
  </tbody>
</table>
`;

export default function FinalizarAtividadePage() {
  const router = useRouter();

  const [imagem, setImagem] = useState("");
  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividadeImagem | null>(null);

  const [cabecalhoPadrao, setCabecalhoPadrao] =
    useState(CABECALHO_PADRAO);

  const [cabecalhoAtual, setCabecalhoAtual] =
    useState(CABECALHO_PADRAO);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    try {
      const imagemSalva =
        localStorage.getItem("atividadeImagem");

      const configuracaoSalva =
        localStorage.getItem(
          "configuracaoAtividadeImagem"
        );

      const cabecalhoSalvo =
        localStorage.getItem(
          "cabecalhoAtividadePadrao"
        );

      if (
        !imagemSalva ||
        !imagemSalva.startsWith("data:image/")
      ) {
        setErro(
          "Não encontrei a atividade gerada. Volte e gere uma nova atividade."
        );
        return;
      }

      setImagem(imagemSalva);

      if (configuracaoSalva) {
        setConfiguracao(
          JSON.parse(configuracaoSalva)
        );
      }

      if (cabecalhoSalvo) {
        setCabecalhoPadrao(cabecalhoSalvo);
        setCabecalhoAtual(cabecalhoSalvo);
      }
    } catch (error) {
      console.error(
        "Erro ao carregar finalização da atividade:",
        error
      );

      setErro(
        "Não foi possível carregar os dados da atividade."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  const resumo = useMemo(() => {
    if (!configuracao) return "";

    const partes = [
      configuracao.serie,
      configuracao.disciplina,
      configuracao.quantidadeQuestoes
        ? `${configuracao.quantidadeQuestoes} questões`
        : "",
    ].filter(Boolean);

    return partes.join(" • ");
  }, [configuracao]);

  function salvarComoPadrao() {
    localStorage.setItem(
      "cabecalhoAtividadePadrao",
      cabecalhoAtual
    );

    setCabecalhoPadrao(cabecalhoAtual);
    setMensagem(
      "Cabeçalho salvo como padrão para as próximas atividades."
    );
  }

  function restaurarPadrao() {
    setCabecalhoAtual(cabecalhoPadrao);
    setMensagem(
      "Cabeçalho padrão restaurado nesta atividade."
    );
  }

  function imprimirOuSalvarPDF() {
    window.print();
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-emerald-700">
          Preparando atividade...
        </p>
      </main>
    );
  }

  if (erro || !imagem) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-red-700">
            {erro ||
              "Atividade não encontrada."}
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

  return (
    <main className="min-h-screen bg-slate-100">
      <style jsx global>{`
        .editor-cabecalho table,
        .cabecalho-final table {
          width: 100% !important;
          border-collapse: collapse !important;
        }

        .editor-cabecalho td,
        .editor-cabecalho th,
        .cabecalho-final td,
        .cabecalho-final th {
          border: 1px solid #000 !important;
        }

        .editor-cabecalho img,
        .cabecalho-final img {
          max-height: 82px;
          max-width: 115px;
          object-fit: contain;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 7mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          .nao-imprimir {
            display: none !important;
          }

          .pagina-final {
            width: 196mm !important;
            max-width: 196mm !important;
            min-height: 0 !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          .cabecalho-final {
            width: 100% !important;
            margin-bottom: 4mm !important;
            font-size: 9pt !important;
            line-height: 1.15 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .cabecalho-final table {
            width: 100% !important;
            table-layout: fixed !important;
          }

          .cabecalho-final td,
          .cabecalho-final th {
            padding: 2.2mm !important;
            border: 1px solid #000 !important;
          }

          .imagem-atividade-final {
            display: block !important;
            width: 100% !important;
            max-height: 238mm !important;
            height: auto !important;
            object-fit: contain !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      <header className="nao-imprimir border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Finalizar atividade
            </h1>

            <p className="text-sm text-slate-700">
              Ajuste o cabeçalho e confira a folha antes de imprimir.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/atividades/resultado")
            }
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
          >
            <ArrowLeft size={19} />
            Voltar para a atividade
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {resumo && (
          <div className="nao-imprimir mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              {resumo}
            </p>
          </div>
        )}

        <div className="nao-imprimir mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Cabeçalho
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Edite o cabeçalho desta atividade. As alterações só serão salvas para as próximas atividades se você clicar em “Salvar como padrão”.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={restaurarPadrao}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700"
              >
                <RotateCcw size={16} />
                Restaurar padrão
              </button>

              <button
                type="button"
                onClick={salvarComoPadrao}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white"
              >
                <Save size={17} />
                Salvar como padrão
              </button>
            </div>
          </div>

          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => {
              setCabecalhoAtual(
                event.currentTarget.innerHTML
              );
              setMensagem("");
            }}
            className="editor-cabecalho mt-4 min-h-40 overflow-x-auto rounded-xl border-2 border-slate-300 bg-white p-4 outline-none focus:border-emerald-500"
            dangerouslySetInnerHTML={{
              __html: cabecalhoAtual,
            }}
          />

          {mensagem && (
            <p className="mt-3 text-sm font-semibold text-emerald-700">
              {mensagem}
            </p>
          )}
        </div>

        <div className="pagina-final mx-auto w-full max-w-[794px] bg-white p-6 shadow-xl">
          <div
            className="cabecalho-final overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: cabecalhoAtual,
            }}
          />

          <img
            src={imagem}
            alt="Atividade pedagógica final"
            className="imagem-atividade-final mt-4 block h-auto w-full object-contain"
          />
        </div>

        <div className="nao-imprimir mt-6 flex justify-center">
          <button
            type="button"
            onClick={imprimirOuSalvarPDF}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white"
          >
            <Printer size={19} />
            Imprimir ou salvar em PDF
          </button>
        </div>
      </section>
    </main>
  );
}