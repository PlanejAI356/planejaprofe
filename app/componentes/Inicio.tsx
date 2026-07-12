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

  function iniciarTeste() {
    limparPlanejamentoAnterior();
    onComecar();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-3">
        <header className="flex h-14 shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo-planejai.png"
              alt="Logo PlanejAI"
              className="h-9 w-9 object-contain"
            />

            <span className="text-xl font-bold text-slate-900">
              Planej<span className="text-green-600">AI</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/login";
            }}
            className="rounded-xl border border-blue-500 bg-white px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
          >
            Já tenho uma conta
          </button>
        </header>

       <section className="grid flex-1 items-center gap-5 py-4 md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
              ✨ Planejamento com Inteligência Artificial
            </div>

            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Crie seu plano de aula
              <span className="block text-green-600">
                em poucos minutos
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
              Teste o PlanejAI e veja como a Inteligência Artificial pode
              facilitar o seu planejamento.
            </p>

            <div className="mt-4 flex max-w-md flex-col gap-2">
              <button
                type="button"
                onClick={iniciarTeste}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-[1.02]"
              >
                🚀 Testar agora
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/cadastro";
                }}
                className="w-full rounded-2xl border-2 border-blue-500 bg-white px-6 py-3 text-base font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Criar conta
              </button>
            </div>
          </div>

          <div className="flex min-h-0 items-center justify-center">
            <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-xl">
              <img
                src="/hero-planejai.png"
                alt="Apresentação do PlanejAI"
                className="h-auto max-h-[240px] w-full rounded-[22px] object-contain sm:max-h-[330px]"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-2.5 pb-3 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-2xl">📖</div>

            <div>
              <h3 className="font-bold text-slate-900">
                Planos alinhados à BNCC
              </h3>

              <p className="text-sm text-slate-500">
                Objetivos e habilidades organizados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-2xl">⚡</div>

            <div>
              <h3 className="font-bold text-slate-900">
                Geração rápida
              </h3>

              <p className="text-sm text-slate-500">
                Planejamento em poucos minutos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-2xl">📄</div>

            <div>
              <h3 className="font-bold text-slate-900">
                Exportação do plano
              </h3>

              <p className="text-sm text-slate-500">
                Organize e exporte o planejamento.
              </p>
            </div>
          </div>
        </section>

        <p className="shrink-0 pb-1 text-center text-xs text-slate-500">
          🔒 Seus dados estão protegidos.
        </p>
      </div>
    </main>
  );
}