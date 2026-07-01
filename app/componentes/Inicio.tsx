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

  function iniciarNovoPlano() {
    limparPlanejamentoAnterior();
    onComecar();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden py-6 md:py-8 md:px-14 md:py-12 text-center">
        <div className="absolute top-8 right-10 hidden md:grid grid-cols-6 gap-2 opacity-40">
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} className="w-2 h-2 rounded-full bg-blue-300" />
          ))}
        </div>

        <div className="absolute left-0 bottom-0 w-40 h-40 bg-blue-100 rounded-full -translate-x-16 translate-y-16 opacity-60" />
        <div className="absolute right-0 top-1/3 w-44 h-44 bg-green-100 rounded-full translate-x-20 opacity-60" />

        <div className="relative z-10">
          <img
            src="/logo-planejai.png"
            alt="PlanejAI"
            className="w-24 md:w-28 mx-auto mb-3"
          />

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-4">
            Vamos criar seu <br className="hidden md:block" />
            <span className="text-green-600">planejamento</span> de aula?
          </h1>

          <p className="max-w-3xl mx-auto text-sm md:text-basev text-slate-600 leading-relaxed mb-6">
            Use o poder da{" "}
            <span className="font-bold text-blue-600">
              Inteligência Artificial
            </span>{" "}
            para criar planos completos, personalizados e alinhados à{" "}
            <span className="font-bold text-green-600">BNCC</span> em poucos
            minutos.
          </p>

          <button
            onClick={iniciarNovoPlano}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white w-48 py-2.5 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition cursor-pointer"
          >
            🚀 COMEÇAR
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/80 shadow-sm border border-slate-100 rounded-2xl p-2.5">
              <div className="text-2xl mb-2">⏱️</div>
              <p className="font-bold text-slate-800">Economize tempo</p>
            </div>

            <div className="bg-white/80 shadow-sm border border-slate-100 rounded-2xl p-2.5">
              <div className="text-2xl mb-2">📋</div>
              <p className="font-bold text-slate-800">Planos completos</p>
            </div>

            <div className="bg-white/80 shadow-sm border border-slate-100 rounded-2xl p-2.5">
              <div className="text-2xl mb-2">🤖</div>
              <p className="font-bold text-slate-800">
                Inteligência Artificial
              </p>
            </div>

            <div className="bg-white/80 shadow-sm border border-slate-100 rounded-2xl p-2.5">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-bold text-slate-800">Editável e exportável</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}