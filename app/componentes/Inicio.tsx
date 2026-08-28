

import {
  BadgeCheck,
  Clock3,
  Gift,
  LogIn,
  ShieldCheck,
  Target,
  UserPlus,
} from "lucide-react";

export default function Inicio() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfefc] text-slate-900">
      <div className="pointer-events-none absolute -left-40 -top-32 h-[360px] w-[620px] rounded-[50%] bg-green-100/60 blur-2xl" />
      <div className="pointer-events-none absolute -right-48 top-20 h-[480px] w-[650px] rounded-[50%] bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 left-[-100px] h-[430px] w-[800px] rounded-[50%] bg-gradient-to-r from-green-100/70 via-emerald-50/60 to-blue-50/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-56 right-[-120px] h-[420px] w-[760px] rounded-[50%] bg-gradient-to-r from-green-50/50 to-green-100/70 blur-2xl" />

      <div className="pointer-events-none absolute left-8 top-56 hidden grid-cols-4 gap-3 opacity-40 sm:grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={`ponto-esquerda-${index}`}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        ))}
      </div>

      <div className="pointer-events-none absolute right-10 top-64 hidden grid-cols-4 gap-3 opacity-30 sm:grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={`ponto-direita-${index}`}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        ))}
      </div>

      <span className="pointer-events-none absolute left-[6%] top-[49%] text-3xl text-green-500">✦</span>
      <span className="pointer-events-none absolute right-[7%] top-[43%] text-4xl text-green-500">✦</span>
      <span className="pointer-events-none absolute bottom-[19%] right-[11%] text-3xl text-blue-500">✦</span>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-5 pb-8 pt-5 sm:px-8 lg:px-12">
        <header className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-planejai-nova.png"
              alt="PlanejAI"
              className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
            <span className="text-3xl font-black tracking-tight text-[#071c4d] sm:text-4xl">
              Planej<span className="text-green-600">AI</span>
            </span>
          </div>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 px-5 py-3 shadow-sm backdrop-blur md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ShieldCheck size={22} strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-green-700">Seus dados estão seguros</p>
              <p className="text-xs text-slate-500">Privacidade e segurança em primeiro lugar.</p>
            </div>
          </div>
        </header>

        <section className="relative mt-8 flex flex-1 items-center justify-center lg:mt-6">
          <div className="relative w-full max-w-6xl">
            <div className="absolute -left-2 top-24 z-20 hidden rotate-[-5deg] rounded-[28px] border border-green-100 bg-white/95 px-7 py-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.14)] lg:block">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50 text-5xl">📚</div>
              <p className="text-lg font-extrabold text-green-700">Planejamentos</p>
            </div>

            <div className="absolute left-1 bottom-24 z-20 hidden rotate-[3deg] rounded-[28px] border border-blue-100 bg-white/95 px-7 py-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.14)] lg:block">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-5xl">📝</div>
              <p className="text-lg font-extrabold text-blue-700">Avaliações</p>
            </div>

            <div className="absolute -right-1 top-44 z-20 hidden rotate-[5deg] rounded-[28px] border border-orange-100 bg-white/95 px-7 py-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.14)] lg:block">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-5xl">✏️</div>
              <p className="text-lg font-extrabold text-orange-600">Atividades</p>
            </div>

            <div className="relative mx-auto max-w-4xl rounded-[38px] border border-slate-200/80 bg-white/92 px-6 py-10 text-center shadow-[0_30px_90px_rgba(15,23,42,0.11)] backdrop-blur-sm sm:px-10 md:px-14 md:py-12 lg:px-20">
              <h1 className="mx-auto max-w-3xl text-[2.7rem] font-black leading-[0.98] tracking-[-0.045em] text-[#071c4d] sm:text-6xl lg:text-7xl">
                <span className="block">Crie seus</span>
                <span
                  className="mt-3 block text-green-600"
                  style={{
                    fontFamily: '"Segoe Print", "Comic Sans MS", cursive',
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  materiais pedagógicos
                </span>
                <span className="mt-2 block">
                  do seu{" "}
                  <span
                    className="relative inline-block"
                    style={{
                      fontFamily: '"Segoe Print", "Comic Sans MS", cursive',
                      fontWeight: 700,
                    }}
                  >
                    jeito.
                    <span className="absolute -bottom-2 left-0 h-1.5 w-full rotate-[-3deg] rounded-full bg-green-500" />
                  </span>
                </span>
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg md:text-xl">
                Planejamentos, avaliações e atividades personalizadas
                <span className="block">para facilitar o seu dia a dia.</span>
              </p>

              <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/cadastro";
                  }}
                  className="group flex flex-1 items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4 text-left text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <UserPlus size={28} className="shrink-0 transition group-hover:scale-105" />
                  <span>
                    <span className="block text-lg font-extrabold">Criar conta</span>
                    <span className="block text-sm text-white/85">Comece agora</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="group flex flex-1 items-center justify-center gap-4 rounded-2xl border-2 border-blue-500 bg-white px-6 py-4 text-left text-blue-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
                >
                  <LogIn size={28} className="shrink-0 transition group-hover:scale-105" />
                  <span>
                    <span className="block text-lg font-extrabold">Já tenho uma conta</span>
                    <span className="block text-sm text-slate-500">Fazer login</span>
                  </span>
                </button>
              </div>

              <div className="mx-auto mt-7 flex max-w-3xl items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-left shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Gift size={22} strokeWidth={2.5} />
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                  Ao se cadastrar, você ganha{" "}
                  <strong className="font-extrabold text-green-600">3 testes gratuitos</strong>{" "}
                  para conhecer o PlanejAI.
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute left-24 top-52 hidden h-36 w-32 rounded-full border-b-2 border-l-2 border-dashed border-green-300 lg:block" />
            <div className="pointer-events-none absolute bottom-24 right-24 hidden h-36 w-32 rounded-full border-b-2 border-r-2 border-dashed border-green-300 lg:block" />
          </div>
        </section>

        <section className="mx-auto mt-9 grid w-full max-w-6xl gap-4 md:grid-cols-3">
          <div className="flex items-start gap-4 rounded-2xl px-4 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-green-500 text-green-600">
              <Target size={26} strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-extrabold text-green-700">Personalizado</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Materiais sob medida para a sua realidade escolar.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl px-4 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-green-500 text-green-600">
              <Clock3 size={26} strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-extrabold text-green-700">Economize tempo</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Mais agilidade no seu planejamento e mais tempo para ensinar.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl px-4 py-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-green-500 text-green-600">
              <BadgeCheck size={26} strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-extrabold text-green-700">Confiável</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Conteúdo alinhado à BNCC e com qualidade pedagógica.</p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-center md:hidden">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ShieldCheck size={22} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Seus dados estão seguros</p>
              <p className="text-xs text-slate-500">Privacidade e segurança em primeiro lugar.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
