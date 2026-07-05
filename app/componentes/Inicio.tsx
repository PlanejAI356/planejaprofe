"use client";

import { supabase } from "../lib/supabase";

type InicioProps = {
  onComecar: () => void;
};

export default function Inicio({ onComecar }: InicioProps) {
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

  async function iniciarNovoPlano() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/login";
      return;
    }

    limparPlanejamentoAnterior();
    onComecar();
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
     <div className="relative w-full max-w-4xl bg-white rounded-[28px] shadow-xl border border-slate-100 py-6 px-8 text-center">
        <div className="relative z-10">
          <img
            src="/logo-planejai.png"
            alt="PlanejAI"
            className="w-20 mx-auto mb-2"
          />

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
            PlanejAI
          </h1>

          <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
            Menos tempo planejando. <br className="hidden md:block" />
            <span className="text-green-600">Mais tempo ensinando.</span>
          </h2>

          <p className="max-w-3xl mx-auto text-sm md:text-base text-slate-600 leading-relaxed mb-6">
            Crie planos de aula completos, personalizados e alinhados à{" "}
            <span className="font-bold text-green-600">BNCC</span>{" "}
            com o apoio da{" "}
            <span className="font-bold text-blue-600">
              Inteligência Artificial
            </span>{" "}
            em poucos minutos.
          </p>

          <button
            onClick={iniciarNovoPlano}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white w-44 py-2 rounded-2xl rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition cursor-pointer"
          >
            🚀 COMEÇAR
          </button>
        </div>
      </div>
    </div>
  );
}