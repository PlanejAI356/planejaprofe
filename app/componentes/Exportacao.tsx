"use client";

type ExportacaoProps = {
  onVoltar?: () => void;
};

type DadosPlano = {
  temas: string;
  objetivos: string;
  recursos: string;
  metodologia: string;
  avaliacao: string;
  referencias: string;
  atividade: string;
  serie: string;
  disciplina: string;
  etapa: string;
  periodo: string;
};

type SecaoPlano = {
  titulo: string;
  conteudo: string;
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
      "etapaSelecionada",
      "tipoPlanejamento",
      "turmaInfantilDetalhe",
      "periodoPlanejamento",
      "periodoSelecionado",
      "dataInicio",
      "dataFim",
      "dataInicial",
      "dataFinal",
      "planoSalvoId",
      "planoSalvoChave",
    ];

    chaves.forEach((chave) => localStorage.removeItem(chave));
  }

  function novoPlanejamento() {
    limparPlanejamentoAnterior();
    window.location.reload();
  }

  function obterDadosPlano(): DadosPlano {
    const dataInicio =
      localStorage.getItem("dataInicio") ||
      localStorage.getItem("dataInicial") ||
      "";

    const dataFim =
      localStorage.getItem("dataFim") ||
      localStorage.getItem("dataFinal") ||
      "";

    const periodoSalvo =
      localStorage.getItem("periodoPlanejamento") ||
      localStorage.getItem("periodoSelecionado") ||
      "";

    const periodo =
      periodoSalvo ||
      (dataInicio && dataFim
        ? `${dataInicio} a ${dataFim}`
        : dataInicio || dataFim || "");

    return {
      temas: localStorage.getItem("temasPlano") || "",
      objetivos: localStorage.getItem("objetivosPlano") || "",
      recursos: localStorage.getItem("recursosPlano") || "",
      metodologia: localStorage.getItem("metodologiaPlano") || "",
      avaliacao: localStorage.getItem("avaliacaoPlano") || "",
      referencias: localStorage.getItem("referenciasPlano") || "",
      atividade: localStorage.getItem("atividadePlano") || "",
      serie:
        localStorage.getItem("turmaInfantilDetalhe") ||
        localStorage.getItem("serieSelecionada") ||
        "",
      disciplina:
        localStorage.getItem("disciplinaSelecionada") || "",
      etapa:
        localStorage.getItem("etapaEnsino") ||
        localStorage.getItem("etapaSelecionada") ||
        "",
      periodo,
    };
  }

  function montarSecoes(dados: DadosPlano): SecaoPlano[] {
    const secoes: SecaoPlano[] = [
      {
        titulo: "Temas",
        conteudo: dados.temas,
      },
      {
        titulo: "Objetivos e Habilidades",
        conteudo: dados.objetivos,
      },
    ];

    if (dados.recursos.trim()) {
      secoes.push({
        titulo: "Recursos e Materiais",
        conteudo: dados.recursos,
      });
    }

    secoes.push(
      {
        titulo: "Metodologia",
        conteudo: dados.metodologia,
      },
      {
        titulo: "Avaliação",
        conteudo: dados.avaliacao,
      },
      {
        titulo: "Referências",
        conteudo: dados.referencias,
      },
      {
        titulo: "Atividade para Casa",
        conteudo: dados.atividade,
      }
    );

    return secoes;
  }

  function montarPlano() {
    const dados = obterDadosPlano();
    const secoes = montarSecoes(dados);

    const identificacao = [
      "PLANO DE AULA",
      "",
      `ETAPA DE ENSINO: ${dados.etapa || "Não informada"}`,
      `SÉRIE/TURMA: ${dados.serie || "Não informada"}`,
      `DISCIPLINA: ${dados.disciplina || "Não informada"}`,
      `PERÍODO: ${dados.periodo || "Não informado"}`,
      "",
    ];

    const conteudo = secoes.flatMap((secao, indice) => [
      `${indice + 1}. ${secao.titulo.toUpperCase()}`,
      secao.conteudo.trim() || "Não informado.",
      "",
    ]);

    return [...identificacao, ...conteudo].join("\n").trim();
  }

  function escaparHTML(texto: string) {
    return texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatarConteudo(texto: string) {
    if (!texto.trim()) {
      return `<p class="conteudo-vazio">Não informado.</p>`;
    }

    return escaparHTML(texto)
      .split("\n")
      .map((linha) => {
        const linhaLimpa = linha.trim();

        if (!linhaLimpa) {
          return `<div class="espaco"></div>`;
        }

        const ehTituloAula =
          /^AULA\s*\d+/i.test(linhaLimpa) ||
          /^\d+ª?\s*SEMANA/i.test(linhaLimpa) ||
          /^SEMANA\s*\d+/i.test(linhaLimpa) ||
          /^CONTEÚDO\s*\d+/i.test(linhaLimpa);

        if (ehTituloAula) {
          return `<p class="titulo-aula">${linhaLimpa}</p>`;
        }

        return `<p>${linhaLimpa}</p>`;
      })
      .join("");
  }

  function montarSecoesHTML(dados: DadosPlano) {
    return montarSecoes(dados)
      .map(
        (secao, indice) => `
          <section class="secao">
            <h2 class="secao-titulo">
              ${indice + 1}. ${escaparHTML(secao.titulo)}
            </h2>

            <div class="secao-conteudo">
              ${formatarConteudo(secao.conteudo)}
            </div>
          </section>
        `
      )
      .join("");
  }

  function montarDocumentoHTML(dados: DadosPlano, paraWord = false) {
    const dataGeracao = new Date().toLocaleDateString("pt-BR");

    const etapa = escaparHTML(dados.etapa || "Não informada");
    const serie = escaparHTML(dados.serie || "Não informada");
    const disciplina = escaparHTML(
      dados.disciplina || "Não informada"
    );
    const periodo = escaparHTML(
      dados.periodo || "Não informado"
    );

    const caminhoLogo = paraWord
      ? `${window.location.origin}/logo-planejai-nova.png`
      : "/logo-planejai-nova.png";

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>PlanejAI - Plano de Aula</title>

          <style>
            @page {
              size: A4;
              margin: 14mm 16mm 16mm 16mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }

            body {
              font-family: "Times New Roman", Times, serif;
              color: #000000;
              font-size: 12pt;
              line-height: 1.45;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .documento {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
            }

            .cabecalho {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 20px;
              padding: 0 0 12px;
              margin-bottom: 18px;
              border-bottom: 2px solid #166534;
              page-break-inside: avoid;
            }

            .marca {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .logo {
              width: 54px;
              height: 54px;
              object-fit: contain;
            }

            .nome-marca {
              margin: 0;
              color: #166534;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 23px;
              font-weight: 800;
            }

            .slogan {
              margin: 3px 0 0;
              color: #333333;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 9.5pt;
            }

            .tipo-documento {
              text-align: right;
            }

            .tipo-documento h1 {
              margin: 0;
              color: #000000;
              font-size: 17pt;
              font-weight: 700;
            }

            .tipo-documento p {
              margin: 5px 0 0;
              color: #444444;
              font-size: 9.5pt;
            }

            .identificacao {
              margin-bottom: 22px;
              page-break-inside: avoid;
            }

            .linha-identificacao {
              display: flex;
              gap: 8px;
              margin-bottom: 7px;
              padding-bottom: 3px;
              border-bottom: 1px solid #9ca3af;
            }

            .linha-identificacao:last-child {
              margin-bottom: 0;
            }

            .rotulo {
              flex: 0 0 auto;
              font-weight: 700;
              text-transform: uppercase;
            }

            .valor {
              flex: 1;
              min-width: 0;
              overflow-wrap: anywhere;
            }

            .secao {
              margin-bottom: 15px;
              page-break-before: auto;
              page-break-after: auto;
              page-break-inside: auto;
              break-before: auto;
              break-after: auto;
              break-inside: auto;
            }

            .secao-titulo {
              margin: 0 0 8px;
              padding: 0 0 4px;
              color: #166534;
              font-size: 12.5pt;
              font-weight: 700;
              text-transform: uppercase;
              border-bottom: 1px solid #166534;
              page-break-after: avoid;
              break-after: avoid;
            }

            .secao-conteudo {
              padding: 0;
              color: #000000;
              font-weight: 400;
              overflow-wrap: anywhere;
            }

            .secao-conteudo p {
              margin: 0 0 6px;
              color: #000000;
              font-weight: 400;
              text-align: justify;
              orphans: 2;
              widows: 2;
            }

            .secao-conteudo p:last-child {
              margin-bottom: 0;
            }

            .titulo-aula {
              margin-top: 9px !important;
              margin-bottom: 4px !important;
              color: #000000 !important;
              font-weight: 400 !important;
              text-align: left !important;
              page-break-after: auto;
              break-after: auto;
            }

            .titulo-aula:first-child {
              margin-top: 0 !important;
            }

            .espaco {
              height: 4px;
            }

            .conteudo-vazio {
              color: #555555;
              font-style: italic;
              text-align: left !important;
            }

            .rodape {
              margin-top: 22px;
              padding-top: 8px;
              border-top: 1px solid #9ca3af;
              color: #444444;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 8.5pt;
              text-align: center;
              page-break-inside: avoid;
            }

            @media print {
              html,
              body,
              .documento {
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
              }

              .cabecalho,
              .identificacao {
                page-break-inside: avoid;
                break-inside: avoid;
              }

              .secao {
                page-break-inside: auto;
                break-inside: auto;
              }

              .secao-titulo {
                page-break-after: avoid;
                break-after: avoid;
              }

              .secao-conteudo,
              .secao-conteudo p,
              .titulo-aula {
                color: #000000 !important;
                font-weight: 400 !important;
              }
            }
          </style>
        </head>

        <body>
          <main class="documento">
            <header class="cabecalho">
              <div class="marca">
                <img
                  src="${caminhoLogo}"
                  alt="Logo do PlanejAI"
                  class="logo"
                />

                <div>
                  <p class="nome-marca">PlanejAI</p>
                  <p class="slogan">
                    Planejamento inteligente, do seu jeito.
                  </p>
                </div>
              </div>

              <div class="tipo-documento">
                <h1>PLANO DE AULA</h1>
                <p>Gerado em ${dataGeracao}</p>
              </div>
            </header>

            <section class="identificacao">
              <div class="linha-identificacao">
                <span class="rotulo">Etapa de ensino:</span>
                <span class="valor">${etapa}</span>
              </div>

              <div class="linha-identificacao">
                <span class="rotulo">Série/Turma:</span>
                <span class="valor">${serie}</span>
              </div>

              <div class="linha-identificacao">
                <span class="rotulo">Disciplina:</span>
                <span class="valor">${disciplina}</span>
              </div>

              <div class="linha-identificacao">
                <span class="rotulo">Período:</span>
                <span class="valor">${periodo}</span>
              </div>
            </section>

            ${montarSecoesHTML(dados)}

            <footer class="rodape">
              Documento gerado pelo PlanejAI em ${dataGeracao}.
            </footer>
          </main>
        </body>
      </html>
    `;
  }

  function copiarPlano() {
    navigator.clipboard
      .writeText(montarPlano())
      .then(() => {
        alert("Plano copiado!");
      })
      .catch(() => {
        alert("Não foi possível copiar o plano.");
      });
  }

  function exportarPDF() {
    const dados = obterDadosPlano();
    const janela = window.open("", "_blank");

    if (!janela) {
      alert(
        "Não foi possível abrir a janela de impressão. Verifique se o navegador bloqueou a abertura."
      );
      return;
    }

    janela.document.open();
    janela.document.write(montarDocumentoHTML(dados));
    janela.document.close();

    janela.onload = function () {
      setTimeout(() => {
        janela.focus();
        janela.print();
      }, 500);
    };
  }

  function exportarWord() {
    const dados = obterDadosPlano();
    const html = montarDocumentoHTML(dados, true);

    const blob = new Blob(["\ufeff", html], {
      type: "application/msword;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "plano-de-aula-planejai.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-100 bg-white p-5 shadow-xl md:p-6">
        <h1 className="mb-2 text-2xl font-extrabold text-slate-900">
          Exportação
        </h1>

        <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
          Seu plano está pronto! 🎉
        </h2>

        <p className="mb-6 mt-2 text-slate-600">
          Agora escolha como deseja exportar ou compartilhar o
          planejamento.
        </p>

        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">
            Escolha uma opção
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={exportarPDF}
              className="cursor-pointer rounded-2xl border border-red-200 bg-white p-5 font-bold text-red-600 transition-all hover:bg-red-50 hover:shadow-md"
            >
              📄 Exportar PDF
            </button>

            <button
              type="button"
              onClick={exportarWord}
              className="cursor-pointer rounded-2xl border border-blue-200 bg-white p-5 font-bold text-blue-600 transition-all hover:bg-blue-50 hover:shadow-md"
            >
              📝 Exportar Word
            </button>

            <button
              type="button"
              onClick={copiarPlano}
              className="cursor-pointer rounded-2xl border border-green-200 bg-white p-5 font-bold text-green-600 transition-all hover:bg-green-50 hover:shadow-md"
            >
              📋 Copiar Plano
            </button>
          </div>

          <button
            type="button"
            onClick={onVoltar}
            className="mt-6 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Voltar para o Plano Completo
          </button>

          <button
            type="button"
            onClick={novoPlanejamento}
            className="mt-4 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-3 font-bold text-white shadow-md transition hover:scale-[1.01]"
          >
            ➕ Criar Novo Planejamento
          </button>
        </div>
      </div>
    </div>
  );
}