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

  function obterDadosPlano(): DadosPlano {
    return {
      temas: localStorage.getItem("temasPlano") || "",
      objetivos: localStorage.getItem("objetivosPlano") || "",
      recursos: localStorage.getItem("recursosPlano") || "",
      metodologia: localStorage.getItem("metodologiaPlano") || "",
      avaliacao: localStorage.getItem("avaliacaoPlano") || "",
      referencias: localStorage.getItem("referenciasPlano") || "",
      atividade: localStorage.getItem("atividadePlano") || "",
      serie: localStorage.getItem("serieSelecionada") || "",
      disciplina: localStorage.getItem("disciplinaSelecionada") || "",
      etapa: localStorage.getItem("etapaEnsino") || "",
    };
  }

  function montarPlano() {
    const dados = obterDadosPlano();

    return `
PLANO DE AULA

ETAPA: ${dados.etapa}
SÉRIE: ${dados.serie}
DISCIPLINA: ${dados.disciplina}

TEMAS
${dados.temas}

OBJETIVOS E HABILIDADES
${dados.objetivos}

RECURSOS E MATERIAIS
${dados.recursos}

METODOLOGIA
${dados.metodologia}

AVALIAÇÃO
${dados.avaliacao}

REFERÊNCIAS
${dados.referencias}

ATIVIDADE PARA CASA
${dados.atividade}
`.trim();
  }

  function escaparHTML(texto: string) {
    return texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatarConteudoPDF(texto: string) {
    if (!texto.trim()) {
      return `<p class="conteudo-vazio">Não informado.</p>`;
    }

    const textoSeguro = escaparHTML(texto);

    return textoSeguro
      .split("\n")
      .map((linha) => {
        const linhaLimpa = linha.trim();

        if (!linhaLimpa) {
          return `<div class="espaco"></div>`;
        }

        const ehTituloAula =
          /^AULA\s*\d+/i.test(linhaLimpa) ||
          /^SEMANA\s*\d+/i.test(linhaLimpa) ||
          /^CONTEÚDO\s*\d+/i.test(linhaLimpa);

        if (ehTituloAula) {
          return `<p class="titulo-aula">${linhaLimpa}</p>`;
        }

        return `<p>${linhaLimpa}</p>`;
      })
      .join("");
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

    const dataGeracao = new Date().toLocaleDateString("pt-BR");

    const etapa = escaparHTML(dados.etapa || "Não informada");
    const serie = escaparHTML(dados.serie || "Não informada");
    const disciplina = escaparHTML(
      dados.disciplina || "Não informada"
    );

    janela.document.write(`
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
              margin: 18mm 14mm 20mm 14mm;
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
              font-family: Arial, Helvetica, sans-serif;
              color: #1e293b;
              font-size: 11.5px;
              line-height: 1.55;
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
              gap: 18px;
              padding: 16px 18px;
              margin-bottom: 18px;
              border: 1px solid #bbf7d0;
              border-radius: 16px;
              background: linear-gradient(
                135deg,
                #f0fdf4 0%,
                #ecfdf5 100%
              );
              page-break-inside: avoid;
            }

            .marca {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .logo-container {
              width: 54px;
              height: 54px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              border-radius: 16px;
              background: #ffffff;
              border: 1px solid #bbf7d0;
              overflow: hidden;
            }

            .logo {
              width: 46px;
              height: 46px;
              object-fit: contain;
            }

            .logo-substituto {
              width: 46px;
              height: 46px;
              display: none;
              align-items: center;
              justify-content: center;
              border-radius: 13px;
              background: linear-gradient(
                135deg,
                #16a34a,
                #059669
              );
              color: #ffffff;
              font-size: 25px;
              font-weight: 800;
            }

            .nome-marca {
              margin: 0;
              color: #166534;
              font-size: 25px;
              font-weight: 800;
              letter-spacing: -0.8px;
            }

            .slogan {
              margin: 2px 0 0;
              color: #475569;
              font-size: 10.5px;
            }

            .tipo-documento {
              text-align: right;
            }

            .tipo-documento h1 {
              margin: 0;
              color: #14532d;
              font-size: 19px;
              line-height: 1.2;
            }

            .tipo-documento p {
              margin: 5px 0 0;
              color: #64748b;
              font-size: 10px;
            }

            .identificacao {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px;
              margin-bottom: 18px;
              page-break-inside: avoid;
            }

            .campo {
              min-height: 62px;
              padding: 11px 12px;
              border: 1px solid #d1fae5;
              border-radius: 12px;
              background: #f8fafc;
            }

            .campo-label {
              display: block;
              margin-bottom: 4px;
              color: #15803d;
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.7px;
              text-transform: uppercase;
            }

            .campo-valor {
              color: #0f172a;
              font-size: 11.5px;
              font-weight: 700;
              overflow-wrap: anywhere;
            }

            .secao {
              margin-bottom: 14px;
              border: 1px solid #dbe7df;
              border-radius: 14px;
              overflow: hidden;
              background: #ffffff;
              page-break-inside: auto;
            }

            .secao-titulo {
              display: flex;
              align-items: center;
              gap: 9px;
              padding: 9px 13px;
              color: #14532d;
              font-size: 11.5px;
              font-weight: 800;
              letter-spacing: 0.35px;
              text-transform: uppercase;
              background: #ecfdf5;
              border-bottom: 1px solid #d1fae5;
              page-break-after: avoid;
            }

            .secao-numero {
              width: 23px;
              height: 23px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              border-radius: 50%;
              background: #16a34a;
              color: #ffffff;
              font-size: 10px;
              font-weight: 800;
            }

            .secao-conteudo {
              padding: 12px 14px;
              white-space: normal;
              overflow-wrap: anywhere;
            }

            .secao-conteudo p {
              margin: 0 0 6px;
              text-align: justify;
            }

            .secao-conteudo p:last-child {
              margin-bottom: 0;
            }

            .titulo-aula {
              margin-top: 10px !important;
              margin-bottom: 5px !important;
              padding: 6px 8px;
              color: #166534;
              font-weight: 800;
              text-align: left !important;
              border-left: 3px solid #22c55e;
              background: #f0fdf4;
              page-break-after: avoid;
            }

            .titulo-aula:first-child {
              margin-top: 0 !important;
            }

            .espaco {
              height: 4px;
            }

            .conteudo-vazio {
              color: #94a3b8;
              font-style: italic;
              text-align: left !important;
            }

            .rodape {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              margin-top: 18px;
              padding-top: 10px;
              border-top: 1px solid #bbf7d0;
              color: #64748b;
              font-size: 9px;
              page-break-inside: avoid;
            }

            .rodape strong {
              color: #15803d;
            }

            @media print {
              body {
                background: #ffffff;
              }

              .documento {
                width: 100%;
              }

              .secao {
                break-inside: auto;
              }

              .secao-titulo,
              .titulo-aula,
              .cabecalho,
              .identificacao,
              .campo {
                break-inside: avoid;
              }
            }

            @media screen and (max-width: 700px) {
              body {
                padding: 20px;
              }

              .cabecalho {
                align-items: flex-start;
                flex-direction: column;
              }

              .tipo-documento {
                text-align: left;
              }

              .identificacao {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>

        <body>
          <main class="documento">
            <header class="cabecalho">
              <div class="marca">
                <div class="logo-container">
                  <img
  src="/logo-planejai-nova.png"
                    alt="Logo do PlanejAI"
                    class="logo"
                    onerror="
                      this.style.display='none';
                      this.nextElementSibling.style.display='flex';
                    "
                  />

                  <div class="logo-substituto">P</div>
                </div>

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
              <div class="campo">
                <span class="campo-label">Etapa de ensino</span>
                <span class="campo-valor">${etapa}</span>
              </div>

              <div class="campo">
                <span class="campo-label">Série / turma</span>
                <span class="campo-valor">${serie}</span>
              </div>

              <div class="campo">
                <span class="campo-label">Disciplina</span>
                <span class="campo-valor">${disciplina}</span>
              </div>
            </section>

            <section class="secao">
              <div class="secao-titulo">
                <span class="secao-numero">1</span>
                Temas
              </div>

              <div class="secao-conteudo">
                ${formatarConteudoPDF(dados.temas)}
              </div>
            </section>

            <section class="secao">
              <div class="secao-titulo">
                <span class="secao-numero">2</span>
                Objetivos e habilidades
              </div>

              <div class="secao-conteudo">
                ${formatarConteudoPDF(dados.objetivos)}
              </div>
            </section>

            <section class="secao">
              <div class="secao-titulo">
                <span class="secao-numero">3</span>
                Recursos e materiais
              </div>

              <div class="secao-conteudo">
                ${formatarConteudoPDF(dados.recursos)}
              </div>
            </section>

            <section class="secao">
              <div class="secao-titulo">
                <span class="secao-numero">4</span>
                Metodologia
              </div>

              <div class="secao-conteudo">
                ${formatarConteudoPDF(dados.metodologia)}
              </div>
            </section>

            <section class="secao">
              <div class="secao-titulo">
                <span class="secao-numero">5</span>
                Avaliação
              </div>

              <div class="secao-conteudo">
                ${formatarConteudoPDF(dados.avaliacao)}
              </div>
            </section>

            <section class="secao">
              <div class="secao-titulo">
                <span class="secao-numero">6</span>
                Referências
              </div>

              <div class="secao-conteudo">
                ${formatarConteudoPDF(dados.referencias)}
              </div>
            </section>

            <section class="secao">
              <div class="secao-titulo">
                <span class="secao-numero">7</span>
                Atividade para casa
              </div>

              <div class="secao-conteudo">
                ${formatarConteudoPDF(dados.atividade)}
              </div>
            </section>

            <footer class="rodape">
              <span>
                <strong>PlanejAI</strong> — planejamento inteligente
              </span>

              <span>Documento gerado em ${dataGeracao}</span>
            </footer>
          </main>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    janela.document.close();
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

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 p-5 md:p-6">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          Exportação
        </h1>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Seu plano está pronto! 🎉
        </h2>

        <p className="text-slate-600 mt-2 mb-6">
          Agora escolha como deseja exportar ou compartilhar o
          planejamento.
        </p>

        <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            Escolha uma opção
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={exportarPDF}
              className="bg-white border border-red-200 text-red-600 p-5 rounded-2xl font-bold cursor-pointer hover:bg-red-50 hover:shadow-md transition-all"
            >
              📄 Exportar PDF
            </button>

            <button
              type="button"
              onClick={exportarWord}
              className="bg-white border border-blue-200 text-blue-600 p-5 rounded-2xl font-bold cursor-pointer hover:bg-blue-50 hover:shadow-md transition-all"
            >
              📝 Exportar Word
            </button>

            <button
              type="button"
              onClick={copiarPlano}
              className="bg-white border border-green-200 text-green-600 p-5 rounded-2xl font-bold cursor-pointer hover:bg-green-50 hover:shadow-md transition-all"
            >
              📋 Copiar Plano
            </button>
          </div>

          <button
            type="button"
            onClick={onVoltar}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl w-full cursor-pointer mt-6 font-bold hover:bg-slate-50 shadow-sm"
          >
            Voltar para o Plano Completo
          </button>

          <button
            type="button"
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