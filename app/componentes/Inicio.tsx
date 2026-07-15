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

        <section className="grid flex-1 items-center gap-6 py-5 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
              ✨ Planejamento com Inteligência Artificial
            </div>

            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              Crie seu plano de aula
              <span className="block text-green-600">
                em poucos minutos
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
              Planejamentos personalizados com IA, alinhados à BNCC e do seu jeito.
            </p>

            <div className="mt-5 flex max-w-md flex-col gap-2">
              <button
                type="button"
                onClick={iniciarTeste}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-[1.02]"
              >
                🚀 Testar grátis
              </button>

              <p className="text-center text-xs font-medium text-slate-500">
                Crie seu primeiro plano completo sem cadastro.
              </p>

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
            <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-xl">
              <video
  src="/video-planejai.mp4"
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  className="aspect-video w-full rounded-[22px] bg-slate-100 object-cover"
>
  Seu navegador não suporta vídeo.
</video>
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