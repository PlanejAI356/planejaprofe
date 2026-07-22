"use client";

import { useEffect, useState } from "react";

type PlanoCompletoProps = {
  onExportar?: () => void;
  onVoltar?: () => void;
};

export default function PlanoCompleto({ onExportar, onVoltar }: PlanoCompletoProps) {
  const [aba, setAba] = useState("temas");

  const [temasSalvos, setTemasSalvos] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [recursos, setRecursos] = useState("");
  const [metodologia, setMetodologia] = useState("");
  const [avaliacao, setAvaliacao] = useState("");
  const [referencias, setReferencias] = useState("");
  const [atividade, setAtividade] = useState("");
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [mostrarReferencias, setMostrarReferencias] = useState(false);
  const [sugestoesMetodologia, setSugestoesMetodologia] = useState("");
  const [ehCreche, setEhCreche] = useState(false);
  const [referenciasSalvasProfessor, setReferenciasSalvasProfessor] = useState("");
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    setTemasSalvos(ajustarEspacamento(localStorage.getItem("temasPlano") || ""));
    setObjetivos(ajustarEspacamento(localStorage.getItem("objetivosPlano") || ""));
    setRecursos(ajustarEspacamento(localStorage.getItem("recursosPlano") || ""));
    setMetodologia(ajustarEspacamento(localStorage.getItem("metodologiaPlano") || ""));
    setAvaliacao(ajustarEspacamento(localStorage.getItem("avaliacaoPlano") || ""));
    setReferencias(ajustarEspacamento(localStorage.getItem("referenciasPlano") || ""));
    setAtividade(ajustarEspacamento(localStorage.getItem("atividadePlano") || ""));
    setReferenciasSalvasProfessor(
      ajustarEspacamento(localStorage.getItem("referenciasSalvasProfessor") || "")
    );

    const turma = localStorage.getItem("turmaInfantilDetalhe") || "";

    setEhCreche(
      turma === "Berçário" ||
        turma === "Maternal I" ||
        turma === "Maternal II"
    );
  }, []);

 function ajustarEspacamento(texto: string) {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\s*(2ª SEMANA\s*-)/g, "\n$1")
    .replace(/\s*(3ª SEMANA\s*-)/g, "\n$1")
    .replace(/\s*(4ª SEMANA\s*-)/g, "\n$1")
    .replace(/\n{2,}(?=AULA\s\d+)/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

  async function gerarParte(tipo: string) {
    if (gerando) return;

    setGerando(true);

    try {
      const estiloAula =
        tipo === "referencias" && referenciasSalvasProfessor.trim()
          ? referenciasSalvasProfessor
          : sugestoesMetodologia;

      const resposta = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo,
          aulas: temasSalvos,
          serie:
            localStorage.getItem("turmaInfantilDetalhe") ||
            localStorage.getItem("serieSelecionada") ||
            "",
          disciplina: localStorage.getItem("disciplinaSelecionada") || "",
          etapa: localStorage.getItem("etapaEnsino") || "",
          tipoPlanejamento:
            localStorage.getItem("tipoPlanejamento") || "aula",
          estiloAula,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível gerar o conteúdo.");
      }

      const dados = await resposta.json();
      const textoLimpo = ajustarEspacamento(dados.texto || "");

      if (!textoLimpo) {
        throw new Error("A IA não retornou conteúdo. Tente novamente.");
      }

      if (tipo === "objetivos") {
        setObjetivos(textoLimpo);
        localStorage.setItem("objetivosPlano", textoLimpo);
      }

      if (tipo === "recursos") {
        setRecursos(textoLimpo);
        localStorage.setItem("recursosPlano", textoLimpo);
      }

      if (tipo === "metodologia") {
        setMetodologia(textoLimpo);
        localStorage.setItem("metodologiaPlano", textoLimpo);
      }

      if (tipo === "avaliacao") {
        setAvaliacao(textoLimpo);
        localStorage.setItem("avaliacaoPlano", textoLimpo);
      }

      if (tipo === "referencias") {
        setReferencias(textoLimpo);
        localStorage.setItem("referenciasPlano", textoLimpo);
      }

      if (tipo === "atividade") {
        setAtividade(textoLimpo);
        localStorage.setItem("atividadePlano", textoLimpo);
      }
    } catch (erro) {
      const mensagem =
        erro instanceof Error
          ? erro.message
          : "Ocorreu um erro ao gerar o conteúdo.";

      alert(mensagem);
    } finally {
      setGerando(false);
    }
  }

  function salvarReferenciasProfessor() {
    const textoLimpo = ajustarEspacamento(referenciasSalvasProfessor);

    if (!textoLimpo) {
      alert("Escreva pelo menos uma referência antes de salvar.");
      return;
    }

    setReferenciasSalvasProfessor(textoLimpo);
    localStorage.setItem("referenciasSalvasProfessor", textoLimpo);
    alert("Referências salvas para os próximos planejamentos.");
  }

  function limparReferenciasProfessor() {
    setReferenciasSalvasProfessor("");
    localStorage.removeItem("referenciasSalvasProfessor");
  }

  function gerarAbaAtual() {
    if (aba === "temas") {
      alert("Os temas já foram gerados na tela de Conteúdos.");
      return;
    }

    gerarParte(aba);
  }

  function textoAtual() {
    if (aba === "temas") return temasSalvos;
    if (aba === "objetivos") return objetivos;
    if (aba === "recursos") return recursos;
    if (aba === "metodologia") return metodologia;
    if (aba === "avaliacao") return avaliacao;
    if (aba === "referencias") return referencias;
    if (aba === "atividade") return atividade;

    return "";
  }

  function copiarTexto() {
    navigator.clipboard.writeText(ajustarEspacamento(textoAtual()));
  }

  function refazerTexto() {
    if (aba === "objetivos") {
      setObjetivos("");
      localStorage.removeItem("objetivosPlano");
    }

    if (aba === "recursos") {
      setRecursos("");
      localStorage.removeItem("recursosPlano");
    }

    if (aba === "metodologia") {
      setMetodologia("");
      localStorage.removeItem("metodologiaPlano");
    }

    if (aba === "avaliacao") {
      setAvaliacao("");
      localStorage.removeItem("avaliacaoPlano");
    }

    if (aba === "referencias") {
      setReferencias("");
      localStorage.removeItem("referenciasPlano");
    }

    if (aba === "atividade") {
      setAtividade("");
      localStorage.removeItem("atividadePlano");
    }
  }

  const botaoAba = (id: string, nome: string) => (
    <button
      onClick={() => setAba(id)}
      className={`shrink-0 whitespace-nowrap px-5 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
        aba === id
          ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg ring-2 ring-blue-100"
          : "bg-white border border-slate-200 text-slate-700 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-400 hover:bg-slate-50"
      }`}
    >
      {nome}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">

        <div className="flex flex-wrap gap-2 mb-6">
          {ehCreche ? (
            <>
              {botaoAba("temas", "Tema")}
              {botaoAba("objetivos", "Objetivos de Aprendizagem")}
              {botaoAba("recursos", "Recursos e Materiais")}
              {botaoAba("metodologia", "Metodologia (Desenvolvimento)")}
              {botaoAba("avaliacao", "Avaliação Formativa")}
            </>
          ) : (
            <>
              {botaoAba("temas", "Temas")}
              {botaoAba("objetivos", "Objetivos e Habilidades")}
              {botaoAba("metodologia", "Metodologia")}
              {botaoAba("avaliacao", "Avaliação")}
              {botaoAba("referencias", "Referências")}
              {botaoAba("atividade", "Atividade para Casa")}
            </>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="flex flex-wrap gap-2 mb-3">
            {aba !== "temas" && (
  <button
    onClick={gerarAbaAtual}
    disabled={gerando}
    className={`rounded-xl px-4 py-2 font-semibold transition-all duration-200 ${
  gerando
    ? "cursor-not-allowed bg-slate-400 text-white shadow-sm"
    : "cursor-pointer bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
}`}
  >
    {gerando ? "⏳ Gerando..." : "✨ Gerar com IA"}
  </button>
)}

            {aba !== "temas" && (
  <button
    type="button"
    onClick={() => setMostrarSugestoes(!mostrarSugestoes)}
    className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold shadow-sm transition ${
      mostrarSugestoes
        ? "border-blue-500 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
    }`}
  >
    🎯 Meu estilo
  </button>
)}
{aba === "referencias" && (
  <button
    type="button"
    onClick={() => setMostrarReferencias(!mostrarReferencias)}
    className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold shadow-sm transition ${
      mostrarReferencias
        ? "border-blue-500 bg-blue-50 text-blue-700"
        : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
    }`}
  >
    📚 Minhas referências
  </button>
)}
           <button
  type="button"
  onClick={copiarTexto}
  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg"
>
  📋 Copiar
</button>

{aba !== "temas" && (
  <button
    type="button"
    onClick={refazerTexto}
    className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-lg"
  >
    🔄 Refazer
  </button>
)}
          </div>

          {aba !== "temas" && mostrarSugestoes && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="mb-1 font-bold text-blue-700">
  🎯 Meu estilo
</h3>

<p className="mb-1 font-semibold text-slate-700">
  Como você quer que esta parte do plano seja gerada?
</p>

<p className="mb-3 text-sm text-slate-600">
  Conte à IA como você prefere que esta parte do plano seja elaborada.
</p>

              <textarea
  value={sugestoesMetodologia}
  onChange={(e) => setSugestoesMetodologia(e.target.value)}
  placeholder={
    aba === "objetivos"
      ? `Exemplo:
Quero objetivos claros e específicos.
Utilize apenas o código da BNCC.
Evite repetir os mesmos verbos.
Relacione os objetivos com o tema da aula.`

      : aba === "recursos"
      ? `Exemplo:
Utilize quadro, livro didático, caderno e materiais de baixo custo.
Evite recursos tecnológicos quando não forem necessários.`

      : aba === "metodologia"
      ? `Exemplo:
Sempre começo com perguntas norteadoras.
Faço uma conversa inicial.
Utilizo o livro didático.
Finalizo com atividade no caderno.`

      : aba === "avaliacao"
      ? `Exemplo:
Quero uma avaliação realizada durante a aula.
Avaliar participação, interesse e realização das atividades.
Não repetir o conteúdo da aula.`

      : aba === "referencias"
      ? `Exemplo:
Utilize a BNCC, o livro didático adotado pela escola e documentos oficiais.`

      : `Exemplo:
Organize as atividades para casa em 4 semanas.
Proponha atividades curtas relacionadas ao conteúdo trabalhado.`
  }
  className="mt-2 w-full min-h-[180px] resize-y rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
/>
              
            </div>
          )}

          {aba === "temas" && (
            <textarea
              value={temasSalvos}
              onChange={(e) => {
                const textoLimpo = ajustarEspacamento(e.target.value);
                setTemasSalvos(e.target.value);
                localStorage.setItem("temasPlano", textoLimpo);
              }}
              onBlur={() => setTemasSalvos(ajustarEspacamento(temasSalvos))}
              className="w-full min-h-[350px] rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-[15px] leading-7 text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Temas das aulas..."
            />
          )}

          {aba === "objetivos" && (
            <textarea
              value={objetivos}
              onChange={(e) => {
                setObjetivos(e.target.value);
                localStorage.setItem("objetivosPlano", ajustarEspacamento(e.target.value));
              }}
              onBlur={() => setObjetivos(ajustarEspacamento(objetivos))}
              className="w-full min-h-[350px] rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-[15px] leading-7 text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder={
                ehCreche
                  ? "Clique em Gerar com IA para criar objetivos de aprendizagem..."
                  : "Clique em Gerar com IA para criar objetivos e habilidades..."
              }
            />
          )}

          {aba === "recursos" && (
            <textarea
              value={recursos}
              onChange={(e) => {
                setRecursos(e.target.value);
                localStorage.setItem("recursosPlano", ajustarEspacamento(e.target.value));
              }}
              onBlur={() => setRecursos(ajustarEspacamento(recursos))}
              className="w-full min-h-[350px] border p-3 rounded-xl"
              placeholder="Clique em Gerar com IA para criar recursos e materiais..."
            />
          )}

          {aba === "metodologia" && (
            <>
              <textarea
                value={metodologia}
                onChange={(e) => {
                  setMetodologia(e.target.value);
                  localStorage.setItem("metodologiaPlano", ajustarEspacamento(e.target.value));
                }}
                onBlur={() => setMetodologia(ajustarEspacamento(metodologia))}
                className="w-full min-h-[350px] border p-3 rounded-xl"
                placeholder={
                  ehCreche
                    ? "Clique em Gerar com IA para criar a metodologia de desenvolvimento..."
                    : "Clique em Gerar com IA para criar a metodologia..."
                }
              />
            </>
          )}

          {aba === "avaliacao" && (
            <textarea
              value={avaliacao}
              onChange={(e) => {
                setAvaliacao(e.target.value);
                localStorage.setItem("avaliacaoPlano", ajustarEspacamento(e.target.value));
              }}
              onBlur={() => setAvaliacao(ajustarEspacamento(avaliacao))}
              className="w-full min-h-[350px] border p-3 rounded-xl"
              placeholder={
                ehCreche
                  ? "Clique em Gerar com IA para criar a avaliação formativa..."
                  : "Clique em Gerar com IA para criar a avaliação..."
              }
            />
          )}

          {!ehCreche && aba === "referencias" && (
            <div className="space-y-4">
              {mostrarReferencias && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="font-bold text-blue-800">
                    📚 Minhas referências mais usadas
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Salve aqui os livros, documentos e materiais que você costuma
                    utilizar. Eles ficarão disponíveis nos próximos planejamentos.
                  </p>

                  <textarea
                    value={referenciasSalvasProfessor}
                    onChange={(e) =>
                      setReferenciasSalvasProfessor(e.target.value)
                    }
                    className="mt-3 min-h-[130px] w-full resize-y rounded-xl border border-blue-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder={`Exemplo:
BRASIL. Base Nacional Comum Curricular (BNCC).
Livro didático adotado pela escola.
Materiais complementares utilizados pelo professor.`}
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={salvarReferenciasProfessor}
                      className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                    >
                      💾 Salvar referências
                    </button>

                    {referenciasSalvasProfessor && (
                      <button
                        type="button"
                        onClick={limparReferenciasProfessor}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        🗑️ Limpar salvas
                      </button>
                    )}
                  </div>
                </div>
              )}

              <textarea
                value={referencias}
                onChange={(e) => {
                  setReferencias(e.target.value);
                  localStorage.setItem(
                    "referenciasPlano",
                    ajustarEspacamento(e.target.value)
                  );
                }}
                onBlur={() => setReferencias(ajustarEspacamento(referencias))}
                className="w-full min-h-[350px] border p-3 rounded-xl"
                placeholder="Clique em Gerar com IA para criar as referências..."
              />
            </div>
          )}

          {!ehCreche && aba === "atividade" && (
            <textarea
              value={atividade}
              onChange={(e) => {
                setAtividade(e.target.value);
                localStorage.setItem("atividadePlano", ajustarEspacamento(e.target.value));
              }}
              onBlur={() => setAtividade(ajustarEspacamento(atividade))}
              className="w-full min-h-[350px] border p-3 rounded-xl"
              placeholder="Clique em Gerar com IA para criar a atividade para casa..."
            />
          )}
        </div>

        <button
          onClick={onVoltar}
          className="bg-slate-300 text-black px-6 py-3 rounded-xl mt-6 w-full cursor-pointer font-semibold"
        >
          Voltar para Conteúdos
        </button>

        <button
          onClick={onExportar}
          className="bg-green-600 text-white px-6 py-3 rounded-xl mt-6 w-full cursor-pointer font-semibold"
        >
          Ir para Exportação
        </button>
      </div>
    </div>
  );
}