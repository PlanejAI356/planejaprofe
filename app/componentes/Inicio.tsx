"use client";

export default function Inicio() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfefc]">
      {/* FUNDO DECORATIVO */}

      <div className="pointer-events-none absolute -left-40 -top-32 h-[360px] w-[620px] rounded-[50%] bg-green-100/60 blur-2xl" />

      <div className="pointer-events-none absolute -right-48 top-20 h-[480px] w-[650px] rounded-[50%] bg-emerald-100/50 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-52 left-[-100px] h-[430px] w-[800px] rounded-[50%] bg-gradient-to-r from-green-100/70 via-emerald-50/60 to-blue-50/40 blur-2xl" />

      <div className="pointer-events-none absolute -bottom-56 right-[-120px] h-[420px] w-[760px] rounded-[50%] bg-gradient-to-r from-green-50/50 to-green-100/70 blur-2xl" />

      {/* PONTINHOS DECORATIVOS */}

      <div className="pointer-events-none absolute left-8 top-48 grid grid-cols-4 gap-3 opacity-40">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        ))}
      </div>

      <div className="pointer-events-none absolute right-10 top-40 grid grid-cols-4 gap-3 opacity-30">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        ))}
      </div>

      {/* BRILHOS */}

      <span className="pointer-events-none absolute left-[15%] top-[42%] text-2xl text-green-500">
        ✦
      </span>

      <span className="pointer-events-none absolute right-[13%] top-[34%] text-3xl text-green-400">
        ✦
      </span>

      <span className="pointer-events-none absolute bottom-[23%] right-[18%] text-2xl text-blue-500">
        ✦
      </span>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-4">
        {/* CABEÇALHO */}

        <header className="flex h-16 shrink-0 items-center">
          <div className="flex items-center gap-2">
            <img
              src="/logo-planejai-nova.png"
              alt="PlanejAI"
              className="h-12 w-12 object-contain"
            />

            <span className="text-2xl font-extrabold text-slate-900">
              Planej<span className="text-green-600">AI</span>
            </span>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}

        <section className="relative flex flex-1 items-center justify-center py-3">
          <div className="relative w-full max-w-4xl">
            {/* CARD PLANEJAMENTOS */}

            <div className="absolute -left-6 top-20 z-20 hidden rotate-[-4deg] rounded-3xl border border-green-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-4xl">
                📚
              </div>

              <p className="font-bold text-green-700">
                Planejamentos
              </p>
            </div>

            {/* CARD AVALIAÇÕES */}

            <div className="absolute -left-2 bottom-16 z-20 hidden rotate-[2deg] rounded-3xl border border-blue-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-4xl">
                📝
              </div>

              <p className="font-bold text-blue-700">
                Avaliações
              </p>
            </div>

            {/* CARD ATIVIDADES */}

            <div className="absolute -right-5 top-36 z-20 hidden rotate-[4deg] rounded-3xl border border-orange-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-4xl">
                ✏️
              </div>

              <p className="font-bold text-orange-600">
                Atividades
              </p>
            </div>

            {/* CARD CENTRAL */}

            <div className="relative mx-auto max-w-3xl rounded-[32px] border border-slate-200/80 bg-white/90 px-6 py-8 text-center shadow-[0_25px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:px-10 md:py-10">
              <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                Crie seus materiais

                <span className="block">
                  pedagógicos
                </span>

                <span className="block text-green-600">
                  do seu jeito.
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Planejamentos, avaliações e atividades personalizadas
                para facilitar o seu dia a dia.
              </p>

              {/* BOTÕES */}

              <div className="mx-auto mt-6 flex max-w-xl flex-col gap-4 sm:flex-row">
                {/* CRIAR CONTA */}

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/cadastro";
                  }}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4 text-base font-bold text-white shadow-lg transition duration-200 hover:scale-[1.02] hover:shadow-xl"
                >
                  Criar conta
                </button>

                {/* JÁ TENHO UMA CONTA */}

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="flex-1 rounded-2xl border-2 border-blue-500 bg-white px-6 py-4 text-base font-bold text-blue-600 shadow-sm transition duration-200 hover:bg-blue-50 hover:shadow-md"
                >
                  Já tenho uma conta
                </button>
              </div>

              {/* AVISO DOS 3 TESTES */}

              <p className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-green-500 text-xs font-bold text-green-600">
                  ✓
                </span>

                <span>
                  Ao se cadastrar, você ganha{" "}
                  <strong className="font-bold text-green-600">
                    3 testes gratuitos
                  </strong>{" "}
                  para conhecer o PlanejAI.
                </span>
              </p>
            </div>

            {/* LINHAS DECORATIVAS */}

            <div className="pointer-events-none absolute left-12 top-48 hidden h-28 w-28 rounded-full border-b-2 border-l-2 border-dashed border-green-300 lg:block" />

            <div className="pointer-events-none absolute bottom-20 right-12 hidden h-28 w-28 rounded-full border-b-2 border-r-2 border-dashed border-green-300 lg:block" />
          </div>
        </section>

        {/* SEGURANÇA */}

        <div className="flex shrink-0 justify-center pb-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-xl">
              🔒
            </div>

            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">
                Seus dados estão seguros
              </p>

              <p className="text-xs text-slate-500">
                Privacidade e segurança em primeiro lugar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}