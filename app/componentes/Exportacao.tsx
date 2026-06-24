"use client";

type ExportacaoProps = {
  onVoltar?: () => void;
};

export default function Exportacao({ onVoltar }: ExportacaoProps) {
  function montarPlano() {
    const temas = localStorage.getItem("temasPlano") || "";
    const objetivos = localStorage.getItem("objetivosPlano") || "";
    const metodologia = localStorage.getItem("metodologiaPlano") || "";
    const avaliacao = localStorage.getItem("avaliacaoPlano") || "";
    const referencias = localStorage.getItem("referenciasPlano") || "";
    const atividade = localStorage.getItem("atividadePlano") || "";
    const serie = localStorage.getItem("serieSelecionada") || "";
    const disciplina = localStorage.getItem("disciplinaSelecionada") || "";
    const etapa = localStorage.getItem("etapaEnsino") || "";

    return `
PLANO DE AULA

ETAPA: ${etapa}
SÉRIE: ${serie}
DISCIPLINA: ${disciplina}

TEMAS
${temas}

OBJETIVOS E HABILIDADES
${objetivos}

METODOLOGIA
${metodologia}

AVALIAÇÃO
${avaliacao}

REFERÊNCIAS
${referencias}

ATIVIDADE PARA CASA
${atividade}
`.trim();
  }

  function copiarPlano() {
    navigator.clipboard.writeText(montarPlano());
    alert("Plano copiado!");
  }

  function exportarPDF() {
    const plano = montarPlano();
    const janela = window.open("", "_blank");

    if (!janela) {
      alert("Não foi possível abrir a janela de impressão.");
      return;
    }

    janela.document.write(`
      <html>
        <head>
          <title>PlanejAI - Plano de Aula</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              line-height: 1.4;
              font-size: 12px;
            }
            h1 {
              text-align: center;
              font-size: 20px;
            }
            pre {
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <h1>PLANO DE AULA</h1>
          <pre>${plano}</pre>
        </body>
      </html>
    `);

    janela.document.close();
    janela.print();
  }

  function exportarWord() {
    const plano = montarPlano();
    const blob = new Blob([plano], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "plano-de-aula-planejai.doc";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Exportação</h1>

      <div className="bg-slate-100 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Escolha uma opção</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={exportarPDF}
            className="bg-red-600 text-white p-4 rounded-xl font-semibold cursor-pointer"
          >
            📄 Exportar PDF
          </button>

          <button
            onClick={exportarWord}
            className="bg-blue-600 text-white p-4 rounded-xl font-semibold cursor-pointer"
          >
            📝 Exportar Word
          </button>

          <button
            onClick={copiarPlano}
            className="bg-green-600 text-white p-4 rounded-xl font-semibold cursor-pointer"
          >
            📋 Copiar Plano
          </button>
        </div>

        <button
          onClick={onVoltar}
          className="bg-slate-300 text-black px-6 py-3 rounded-xl w-full cursor-pointer mt-6"
        >
          Voltar para o Plano Completo
        </button>
      </div>
    </div>
  );
}