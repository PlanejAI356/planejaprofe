"use client";

import { useEffect, useState } from "react";

type PlanoCompletoProps = {
  onExportar?: () => void;
  onVoltar?: () => void;
};

export default function PlanoCompleto({
  onExportar,
  onVoltar,
}: PlanoCompletoProps) {
  const [aba, setAba] = useState("temas");

  const [temasSalvos, setTemasSalvos] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [metodologia, setMetodologia] = useState("");
  const [avaliacao, setAvaliacao] = useState("");
  const [referencias, setReferencias] = useState("");
  const [atividade, setAtividade] = useState("");

  useEffect(() => {
    setTemasSalvos(localStorage.getItem("temasPlano") || "");
    setObjetivos(localStorage.getItem("objetivosPlano") || "");
    setMetodologia(localStorage.getItem("metodologiaPlano") || "");
    setAvaliacao(localStorage.getItem("avaliacaoPlano") || "");
    setReferencias(localStorage.getItem("referenciasPlano") || "");
    setAtividade(localStorage.getItem("atividadePlano") || "");
  }, []);

  async function gerarParte(tipo: string) {
    const resposta = await fetch("/api/gerar-plano", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tipo,
    aulas: temasSalvos,
    serie: localStorage.getItem("serieSelecionada") || "",
    disciplina: localStorage.getItem("disciplinaSelecionada") || "",
    etapa: localStorage.getItem("etapaEnsino") || "",
    tipoPlanejamento:
      localStorage.getItem("tipoPlanejamento") || "aula",
  }),
});

    const dados = await resposta.json();

    if (tipo === "objetivos") {
      setObjetivos(dados.texto);
      localStorage.setItem("objetivosPlano", dados.texto);
    }

    if (tipo === "metodologia") {
      setMetodologia(dados.texto);
      localStorage.setItem("metodologiaPlano", dados.texto);
    }

    if (tipo === "avaliacao") {
      setAvaliacao(dados.texto);
      localStorage.setItem("avaliacaoPlano", dados.texto);
    }

    if (tipo === "referencias") {
      setReferencias(dados.texto);
      localStorage.setItem("referenciasPlano", dados.texto);
    }

    if (tipo === "atividade") {
      setAtividade(dados.texto);
      localStorage.setItem("atividadePlano", dados.texto);
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
    if (aba === "metodologia") return metodologia;
    if (aba === "avaliacao") return avaliacao;
    if (aba === "referencias") return referencias;
    if (aba === "atividade") return atividade;

    return "";
  }

  function copiarTexto() {
    navigator.clipboard.writeText(textoAtual());
    alert("Conteúdo copiado!");
  }

  function refazerTexto() {
    if (aba === "objetivos") {
      setObjetivos("");
      localStorage.removeItem("objetivosPlano");
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
      className={`px-4 py-2 rounded-xl cursor-pointer ${
        aba === id ? "bg-blue-600 text-white" : "bg-slate-200"
      }`}
    >
      {nome}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Plano Completo</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {botaoAba("temas", "Temas")}
        {botaoAba("objetivos", "Objetivos e Habilidades")}
        {botaoAba("metodologia", "Metodologia")}
        {botaoAba("avaliacao", "Avaliação")}
        {botaoAba("referencias", "Referências")}
        {botaoAba("atividade", "Atividade para Casa")}
      </div>

      <div className="bg-slate-100 p-4 rounded-xl">
        <div className="flex gap-2 mb-3">
          <button
            onClick={gerarAbaAtual}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl cursor-pointer"
          >
            ✨ Gerar com IA
          </button>

          <button
            onClick={copiarTexto}
            className="bg-slate-700 text-white px-4 py-2 rounded-xl cursor-pointer"
          >
            📋 Copiar
          </button>

          <button
            onClick={refazerTexto}
            className="bg-slate-200 px-4 py-2 rounded-xl cursor-pointer"
          >
            🔄 Refazer
          </button>
        </div>

        {aba === "temas" && (
          <textarea
            value={temasSalvos}
            onChange={(e) => {
              setTemasSalvos(e.target.value);
              localStorage.setItem("temasPlano", e.target.value);
            }}
            className="w-full min-h-[350px] border p-3 rounded-xl"
            placeholder="Temas das aulas..."
          />
        )}

        {aba === "objetivos" && (
          <textarea
            value={objetivos}
            onChange={(e) => {
              setObjetivos(e.target.value);
              localStorage.setItem("objetivosPlano", e.target.value);
            }}
            className="w-full min-h-[350px] border p-3 rounded-xl"
            placeholder="Clique em Gerar com IA para criar objetivos e habilidades..."
          />
        )}

        {aba === "metodologia" && (
          <textarea
            value={metodologia}
            onChange={(e) => {
              setMetodologia(e.target.value);
              localStorage.setItem("metodologiaPlano", e.target.value);
            }}
            className="w-full min-h-[350px] border p-3 rounded-xl"
            placeholder="Clique em Gerar com IA para criar a metodologia..."
          />
        )}

        {aba === "avaliacao" && (
          <textarea
            value={avaliacao}
            onChange={(e) => {
              setAvaliacao(e.target.value);
              localStorage.setItem("avaliacaoPlano", e.target.value);
            }}
            className="w-full min-h-[350px] border p-3 rounded-xl"
            placeholder="Clique em Gerar com IA para criar a avaliação..."
          />
        )}

        {aba === "referencias" && (
          <textarea
            value={referencias}
            onChange={(e) => {
              setReferencias(e.target.value);
              localStorage.setItem("referenciasPlano", e.target.value);
            }}
            className="w-full min-h-[350px] border p-3 rounded-xl"
            placeholder="Clique em Gerar com IA para criar as referências..."
          />
        )}

        {aba === "atividade" && (
          <textarea
            value={atividade}
            onChange={(e) => {
              setAtividade(e.target.value);
              localStorage.setItem("atividadePlano", e.target.value);
            }}
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
  );
}