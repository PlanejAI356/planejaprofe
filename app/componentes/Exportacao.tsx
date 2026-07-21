"use client";


type ExportacaoProps = {
  onVoltar?: () => void;
};

export default function Exportacao({ onVoltar }: ExportacaoProps) {
  function limparPlanejamentoAnterior() {
    const chaves = [
      "temasPlano",
      "objetivosPlano",
      "recursosPlano",
      "metodologiaPlano",
      "avaliacaoPlano",
      "referenciasPlano",
      "atividadePlano",
      "temasGerados",
      "conteudosMensais",
      "serieSelecionada",
      "disciplinaSelecionada",
      "etapaEnsino",
      "tipoPlanejamento",
      "turmaInfantilDetalhe",
    ];

    chaves.forEach((chave) => localStorage.removeItem(chave));
  }

  function novoPlanejamento() {
    limparPlanejamentoAnterior();
    window.location.reload();
  }

  function montarPlano() {
    const temas = localStorage.getItem("temasPlano") || "";
    const objetivos = localStorage.getItem("objetivosPlano") || "";
    const recursos = localStorage.getItem("recursosPlano") || "";
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

RECURSOS E MATERIAIS
${recursos}

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 p-5 md:p-6">

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          Exportação
        </h1>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Seu plano está pronto! 🎉
        </h1>

        <p className="text-slate-600 mt-2 mb-6">
          Agora escolha como deseja exportar ou compartilhar o planejamento.
        </p>

        <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Escolha uma opção</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={exportarPDF}
              className="bg-white border border-red-200 text-red-600 p-5 rounded-2xl font-bold cursor-pointer hover:bg-red-50 hover:shadow-md transition-all"
            >
              📄 Exportar PDF
            </button>

            <button
              onClick={exportarWord}
              className="bg-white border border-blue-200 text-blue-600 p-5 rounded-2xl font-bold cursor-pointer hover:bg-blue-50 hover:shadow-md transition-all"
            >
              📝 Exportar Word
            </button>

            <button
              onClick={copiarPlano}
              className="bg-white border border-green-200 text-green-600 p-5 rounded-2xl font-bold cursor-pointer hover:bg-green-50 hover:shadow-md transition-all"
            >
              📋 Copiar Plano
            </button>
          </div>

          <button
            onClick={onVoltar}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl w-full cursor-pointer mt-6 font-bold hover:bg-slate-50 shadow-sm"
          >
            Voltar para o Plano Completo
          </button>

          <button
            onClick={novoPlanejamento}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl w-full cursor-pointer mt-4 font-bold hover:scale-[1.01] transition shadow-md"
          >
            ➕ Criar Novo Planejamento
          </button>
        </div>
      </div>
    </div>
  );
}