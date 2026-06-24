"use client";

import { useState } from "react";

type DataAula = {
  data: string;
  aulas: number;
};

type ConteudosProps = {
  datasSelecionadas: DataAula[];
  tipoPlanejamento: string;
  onContinuar: () => void;
  onVoltar: () => void;
};

export default function Conteudos({
  datasSelecionadas,
  tipoPlanejamento,
  onContinuar,
  onVoltar,
}: ConteudosProps) {
  const [modo, setModo] = useState("");
  const [tema, setTema] = useState("");
  const [resultadoIA, setResultadoIA] = useState("");

  const aulas = Array.isArray(datasSelecionadas)
    ? datasSelecionadas.flatMap((item) =>
        Array.from({ length: item.aulas }, () => item.data)
      )
    : [];

  const textoAulas = aulas
    .map(
      (data, index) =>
        `AULA ${String(index + 1).padStart(2, "0")} - ${data} - `
    )
    .join("\n");

  async function gerarPlanoIA() {
    if (!tema.trim()) {
      alert("Digite o tema geral antes de gerar com IA.");
      return;
    }

    try {
      const resposta = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "temas",
          tema,
          aulas: textoAulas,
          etapa: localStorage.getItem("etapaEnsino") || "Ensino Fundamental",
          serie: localStorage.getItem("serieSelecionada") || "6º ano",
          disciplina:
            localStorage.getItem("disciplinaSelecionada") || "Ciências",
        }),
      });

      const dados = await resposta.json();

      setResultadoIA(dados.texto);
      localStorage.setItem("temasPlano", dados.texto);
    } catch (erro) {
      alert("Erro ao gerar plano");
    }
  }

  function continuar() {
  if (tipoPlanejamento === "mensal") {
    if (!resultadoIA.trim()) {
      alert("Digite os conteúdos do mês antes de continuar.");
      return;
    }

    localStorage.setItem("temasPlano", resultadoIA);
    onContinuar();
    return;
  }

  const textoParaSalvar = resultadoIA || textoAulas;

  if (!textoParaSalvar.trim()) {
    alert("Informe ou gere os temas das aulas antes de continuar.");
    return;
  }

  localStorage.setItem("temasPlano", textoParaSalvar);
  onContinuar();
}

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Conteúdos</h1>

      <label className="font-bold block mb-2">Tema geral:</label>

      <input
        type="text"
        placeholder="Ex: Água"
        value={tema}
        onChange={(e) => setTema(e.target.value)}
        className="border p-3 rounded-xl w-full mb-4"
      />

      {tipoPlanejamento === "aula" && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => {
                setModo("ia");
                gerarPlanoIA();
              }}
              className="bg-purple-600 text-white p-3 rounded-xl font-semibold cursor-pointer"
            >
              ✨ Destrinchar com IA
            </button>

            <button
              onClick={() => {
                setModo("manual");
                setResultadoIA(textoAulas);
              }}
              className="bg-slate-700 text-white p-3 rounded-xl font-semibold cursor-pointer"
            >
              ✍️ Informar os temas das aulas
            </button>
          </div>

          {modo && (
            <div className="bg-slate-100 p-4 rounded-xl">
              <h2 className="font-bold mb-3">Conteúdos das aulas</h2>

              <textarea
                value={resultadoIA || textoAulas}
                onChange={(e) => {
                  setResultadoIA(e.target.value);
                  localStorage.setItem("temasPlano", e.target.value);
                }}
                placeholder="AULA 01 - 06/07/2026 - Tema da aula"
                className="border p-3 rounded-xl w-full min-h-[250px]"
              />
            </div>
          )}
        </>
      )}

      {tipoPlanejamento === "mensal" && (
        <div className="bg-slate-100 p-4 rounded-xl">
          <h2 className="font-bold mb-3">Conteúdos do mês</h2>

          <textarea
            value={resultadoIA}
            onChange={(e) => {
              setResultadoIA(e.target.value);
              localStorage.setItem("temasPlano", e.target.value);
            }}
            placeholder="Digite ou edite os conteúdos do mês..."
            className="border p-3 rounded-xl w-full min-h-[250px]"
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3 mt-6">
        <button
          onClick={onVoltar}
          className="bg-slate-300 text-black p-3 rounded-xl w-full cursor-pointer"
        >
          Voltar para o Calendário
        </button>

        <button
          onClick={continuar}
          className="bg-green-600 text-white p-3 rounded-xl w-full font-semibold cursor-pointer"
        >
          Continuar para o Plano Completo
        </button>
      </div>
    </div>
  );
}