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
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-10">
        <div className="flex items-center gap-2">
          <img
            src="/logo-planejai.png"
            alt="PlanejAI"
            className="h-10 w-10 object-contain"
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
          className="rounded-xl border border-blue-500 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
        >
          Já tenho uma conta
        </button>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-7 md:px-8">
        <div className="grid items-center gap-7 md:grid-cols-2">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              ✨ Planejamento com Inteligência Artificial
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              Crie seu plano de aula
              <span className="block text-green-600">
                em poucos minutos
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Teste o PlanejAI e veja como a Inteligência Artificial pode
              facilitar o seu planejamento.
            </p>

            <div className="mt-6 flex max-w-md flex-col gap-3">
              <button
                type="button"
                onClick={iniciarTeste}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-3.5 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02]"
              >
                🚀 Testar agora
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/cadastro";
                }}
                className="w-full rounded-2xl border-2 border-blue-500 bg-white px-6 py-3.5 text-lg font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Criar conta
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-slate-200 bg-white p-7 shadow-xl">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-green-100" />
              <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-blue-100" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-green-50 shadow-inner">
                  <img
                    src="/logo-planejai.png"
                    alt="Logo PlanejAI"
                    className="h-24 w-24 object-contain"
                  />
                </div>

                <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
                  Planejamento mais simples
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                  Escolha a etapa, a turma, as datas e o conteúdo. O PlanejAI
                  ajuda você a organizar o restante.
                </p>

                <div className="mt-5 grid w-full grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <div className="text-2xl">📚</div>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      BNCC
                    </p>
                  </div>

                  <div className="rounded-2xl bg-green-50 p-3">
                    <div className="text-2xl">⏱️</div>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      Mais rapidez
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          🔒 Seus dados estão protegidos.
        </p>
      </section>
    </main>
  );
}