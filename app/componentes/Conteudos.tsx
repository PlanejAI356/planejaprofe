"use client";

import { useState } from "react";
import BarraProgresso from "./BarraProgresso";
import { usarPlanejamentoGratis } from "../lib/profile";

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
  const [carregando, setCarregando] = useState(false);

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

    setCarregando(true);

    const permissao = await usarPlanejamentoGratis();

    if (!permissao.permitido) {
      setCarregando(false);
      alert(permissao.mensagem);
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

    setCarregando(false);
  }

  function continuar() {
    if (tipoPlanejamento === "mensal") {
      if (!resultadoIA.trim()) {
        alert("Digite os conteúdos do mês antes de continuar.");
        return;
      }

      localStorage.setItem("temasPlano", resultadoIA);
      localStorage.setItem("tipoPlanejamento", "mensal");
      onContinuar();
      return;
    }

    const textoParaSalvar = resultadoIA || textoAulas;

    if (!textoParaSalvar.trim()) {
      alert("Informe ou gere os temas das aulas antes de continuar.");
      return;
    }

    localStorage.setItem("temasPlano", textoParaSalvar);
    localStorage.setItem("tipoPlanejamento", "aula");
    onContinuar();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 p-5 md:p-6">
        <BarraProgresso etapaAtual="conteudos" />

        <label className="font-bold block mb-2 text-slate-800">
          Tema geral:
        </label>

        <input
          type="text"
          placeholder="Ex: Água"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition mb-5"
        />

        {tipoPlanejamento === "aula" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => {
                  setModo("ia");
                  gerarPlanoIA();
                }}
                disabled={carregando}
                className="bg-gradient-to-r from-blue-600 to-green-600 shadow-lg hover:scale-[1.02] transition-all text-white p-3 rounded-xl font-semibold cursor-pointer disabled:opacity-60"
              >
                {carregando ? "Gerando..." : "✨ Destrinchar com IA"}
              </button>

              <button
                onClick={() => {
                  setModo("manual");
                  setResultadoIA(textoAulas);
                }}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all p-3 rounded-xl font-semibold cursor-pointer"
              >
                ✍️ Informar os temas das aulas
              </button>
            </div>

            {modo && (
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-sm">
                <h2 className="font-bold mb-3 text-slate-800">
                  Conteúdos das aulas
                </h2>

                <textarea
                  value={resultadoIA || textoAulas}
                  onChange={(e) => {
                    setResultadoIA(e.target.value);
                    localStorage.setItem("temasPlano", e.target.value);
                  }}
                  placeholder="AULA 01 - 06/07/2026 - Tema da aula"
                  className="w-full rounded-2xl border border-slate-200 p-4 min-h-[260px] resize-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            )}
          </>
        )}

        {tipoPlanejamento === "mensal" && (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-sm">
            <h2 className="font-bold mb-3 text-slate-800">
              Conteúdos do mês
            </h2>

            <textarea
              value={resultadoIA}
              onChange={(e) => {
                setResultadoIA(e.target.value);
                localStorage.setItem("temasPlano", e.target.value);
              }}
              placeholder="Digite ou edite os conteúdos do mês..."
              className="w-full rounded-2xl border border-slate-200 p-4 min-h-[260px] resize-none outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3 mt-6">
          <button
            onClick={onVoltar}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm p-3 rounded-xl w-full cursor-pointer font-semibold"
          >
            Voltar para o Calendário
          </button>

          <button
            onClick={continuar}
            className="bg-gradient-to-r from-blue-600 to-green-600 shadow-lg hover:scale-[1.01] transition-all text-white p-3 rounded-xl w-full font-semibold cursor-pointer"
          >
            Continuar para o Plano Completo
          </button>
        </div>
      </div>
    </div>
  );
}