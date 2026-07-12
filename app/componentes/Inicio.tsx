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
    <main className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-2">
        <header className="flex h-14 shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo-planejai.png"
              alt="PlanejAI"
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

        <section className="grid min-h-0 flex-1 items-center gap-5 md:grid-cols-[0.95fr_1.05fr]">
          <div>
           <div className="mb-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
              ✨ Planejamento com Inteligência Artificial
            </div>

            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">
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
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-xl">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-green-100" />
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-100" />

              <div className="relative z-10 grid items-center gap-5 md:grid-cols-[0.75fr_1.25fr]">
                <div className="text-center">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-green-50 shadow-inner">
                    <img
                      src="/logo-planejai.png"
                      alt="Logo PlanejAI"
                      className="h-20 w-20 object-contain"
                    />
                  </div>

                  <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
                    Planejamento mais simples
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Escolha a etapa, a turma, as datas e o conteúdo.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner">
                  <img
                    src="/tela-planejai.png"
                    alt="Tela do PlanejAI"
                    className="h-64 w-full rounded-xl object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid shrink-0 gap-3 pb-2 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-3xl">📖</div>
            <div>
              <h3 className="font-bold text-slate-900">
                Planos alinhados à BNCC
              </h3>
              <p className="text-sm text-slate-500">
                Objetivos e habilidades organizados.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="font-bold text-slate-900">
                Geração rápida
              </h3>
              <p className="text-sm text-slate-500">
                Planejamento em poucos minutos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-3xl">📄</div>
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