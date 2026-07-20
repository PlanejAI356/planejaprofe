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
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Formas decorativas do fundo */}
      <div className="pointer-events-none absolute -left-32 bottom-[-180px] h-[430px] w-[650px] rounded-[50%] bg-gradient-to-r from-blue-100/70 to-green-100/70 blur-2xl" />

      <div className="pointer-events-none absolute -right-44 top-20 h-[420px] w-[620px] rounded-[50%] bg-green-100/70 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-220px] right-[-80px] h-[440px] w-[720px] rotate-[-8deg] rounded-[50%] bg-gradient-to-r from-green-100/60 to-blue-100/40 blur-2xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-3">
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
            className="rounded-xl border border-blue-500 bg-white/90 px-4 py-2 text-sm font-bold text-blue-600 shadow-sm transition hover:bg-blue-50"
          >
            Já tenho uma conta
          </button>
        </header>

        <section className="grid flex-1 items-center gap-8 py-5 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center rounded-full bg-green-100/90 px-3 py-1.5 text-xs font-bold text-green-700">
              ✨ Planejamento com Inteligência Artificial
            </div>

            <h1 className="max-w-lg text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Planeje suas aulas
              <span className="block text-green-600">
                do seu jeito.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
              Crie planos de aula personalizados, alinhados à BNCC e adaptados
              ao seu estilo de ensino.
            </p>

            <div className="mt-6 max-w-lg">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={iniciarTeste}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
                >
                  🚀 Testar grátis
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/cadastro";
                  }}
                  className="flex-1 rounded-2xl border-2 border-blue-500 bg-white/90 px-6 py-3 text-base font-bold text-blue-600 shadow-sm transition hover:bg-blue-50"
                >
                  Criar conta
                </button>
              </div>

              <p className="mt-3 text-center text-xs font-medium text-slate-500 sm:text-left">
                Crie seu primeiro plano gratuitamente, sem cadastro.
              </p>
            </div>
          </div>

          <div className="relative flex min-h-0 items-center justify-center">
            {/* Brilho suave atrás do vídeo */}
            <div className="pointer-events-none absolute h-[85%] w-[90%] rounded-[45%] bg-gradient-to-br from-green-100/80 via-blue-50/70 to-transparent blur-2xl" />

            <div className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-2xl">
              <video
                src="/video-planejai.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-auto w-full rounded-[22px]"
              />
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