"use client";

import { useEffect, useState } from "react";
import BarraProgresso from "./BarraProgresso";

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
  const [sugestoesMetodologia, setSugestoesMetodologia] = useState("");
  const [ehCreche, setEhCreche] = useState(false);

  useEffect(() => {
    setTemasSalvos(ajustarEspacamento(localStorage.getItem("temasPlano") || ""));
    setObjetivos(ajustarEspacamento(localStorage.getItem("objetivosPlano") || ""));
    setRecursos(ajustarEspacamento(localStorage.getItem("recursosPlano") || ""));
    setMetodologia(ajustarEspacamento(localStorage.getItem("metodologiaPlano") || ""));
    setAvaliacao(ajustarEspacamento(localStorage.getItem("avaliacaoPlano") || ""));
    setReferencias(ajustarEspacamento(localStorage.getItem("referenciasPlano") || ""));
    setAtividade(ajustarEspacamento(localStorage.getItem("atividadePlano") || ""));

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
        tipoPlanejamento: localStorage.getItem("tipoPlanejamento") || "aula",
        estiloAula: sugestoesMetodologia,
      }),
    });

    const dados = await resposta.json();
    const textoLimpo = ajustarEspacamento(dados.texto || "");

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
      className={`px-5 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
        aba === id
          ? "bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md"
          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300"
      }`}
    >
      {nome}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 p-5 md:p-6">
        <BarraProgresso etapaAtual="planoCompleto" />

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

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {aba !== "temas" && (
  <button
    onClick={gerarAbaAtual}
    className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-xl cursor-pointer font-semibold shadow-md hover:scale-[1.02] transition"
  >
    ✨ Gerar com IA
  </button>
)}

            {aba !== "temas" && (
              <button
                onClick={() => setMostrarSugestoes(!mostrarSugestoes)}
                className="bg-amber-500 text-white px-4 py-2 rounded-xl cursor-pointer font-semibold shadow-sm hover:bg-amber-600"
              >
               ✨ Meu estilo de aula
              </button>
            )}

            <button
              onClick={copiarTexto}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl cursor-pointer font-semibold hover:bg-slate-50 shadow-sm"
            >
              📋 Copiar
            </button>

            {aba !== "temas" && (
              <button
                onClick={refazerTexto}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl cursor-pointer font-semibold hover:bg-slate-50 shadow-sm"
              >
                🔄 Refazer
              </button>
            )}
          </div>

          {aba !== "temas" && mostrarSugestoes && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-bold text-amber-700 mb-2">
                ✨ Meu estilo de aula
              </h3>

              <p className="text-sm text-slate-600 mb-3">
                Escreva aqui como o professor quer que essa parte seja gerada. Esse estilo será usado na aba atual.
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
              className="w-full min-h-[350px] border p-3 rounded-xl"
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
              className="w-full min-h-[350px] border p-3 rounded-xl"
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
            <textarea
              value={referencias}
              onChange={(e) => {
                setReferencias(e.target.value);
                localStorage.setItem("referenciasPlano", ajustarEspacamento(e.target.value));
              }}
              onBlur={() => setReferencias(ajustarEspacamento(referencias))}
              className="w-full min-h-[350px] border p-3 rounded-xl"
              placeholder="Clique em Gerar com IA para criar as referências..."
            />
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