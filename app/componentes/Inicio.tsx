"use client";

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

  function iniciarTesteGratis() {
    limparPlanejamentoAnterior();
    onComecar();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 md:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/logo-planejai.png"
            alt="PlanejAI"
            className="h-12 w-12 object-contain"
          />

          <span className="text-2xl font-extrabold text-slate-900">
            Planej<span className="text-green-600">AI</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/login";
          }}
          className="rounded-xl border border-blue-500 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50"
        >
          Já tenho uma conta
        </button>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-10 md:flex-row md:py-16">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 md:text-6xl">
            Crie seu plano
            <br />
            de aula
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Teste o PlanejAI e veja como a Inteligência Artificial pode
            facilitar o seu planejamento.
          </p>

          <div className="mt-8 flex max-w-md flex-col gap-3">
            <button
              type="button"
              onClick={iniciarTesteGratis}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02]"
            >
              🚀 Testar grátis
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/cadastro";
              }}
              className="w-full rounded-2xl border-2 border-blue-500 bg-white px-6 py-4 text-lg font-bold text-blue-600 hover:bg-blue-50"
            >
              Criar conta
            </button>
          </div>
        </div>

        <div className="flex flex-1 justify-center">
          <img
            src="/logo-planejai.png"
            alt="PlanejAI"
            className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-12 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mb-2 text-3xl">📚</div>
          <h2 className="font-bold text-slate-900">
            Planos alinhados à BNCC
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mb-2 text-3xl">⏱️</div>
          <h2 className="font-bold text-slate-900">
            Geração em poucos minutos
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mb-2 text-3xl">📄</div>
          <h2 className="font-bold text-slate-900">
            Exportação do planejamento
          </h2>
        </div>
      </section>
    </main>
  );
}