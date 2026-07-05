"use client";

import { supabase } from "@/app/lib/supabase";

export default function Assinatura() {
  async function assinarPremium() {
    try {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;

      if (!email) {
        alert("Você precisa estar logado para assinar o Premium.");
        return;
      }

      const resposta = await fetch("/api/pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const dados = await resposta.json();

      if (dados.sandbox_init_point || dados.init_point) {
        window.location.href = dados.sandbox_init_point || dados.init_point;
      } else {
        alert("Não foi possível criar o pagamento.");
      }
    } catch (erro) {
      console.error(erro);
      alert("Erro ao conectar com o Mercado Pago.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-xl border border-slate-100 p-5 md:p-7">
        <div className="text-center mb-5">
          <p className="text-xs font-extrabold text-green-600 mb-1">
            🚀 PLANEJAI PREMIUM
          </p>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Menos tempo planejando.
          </h1>

          <h2 className="text-xl md:text-3xl font-extrabold text-green-600">
            Mais tempo ensinando.
          </h2>

          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
            Continue criando planejamentos completos com Inteligência Artificial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6">
            <h2 className="text-xl font-extrabold text-slate-800 mb-1">
              Gratuito
            </h2>

            <p className="text-sm text-slate-500 mb-4">
              Para conhecer o PlanejAI.
            </p>

            <p className="text-3xl font-extrabold text-slate-700 mb-4">
              R$ 0
            </p>

            <ul className="space-y-2 text-sm text-slate-700 mb-6">
              <li>✅ Até 3 planejamentos gratuitos</li>
              <li>✅ Geração básica com IA</li>
              <li>✅ Planos editáveis</li>
            </ul>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full rounded-2xl bg-slate-500 hover:bg-slate-600 text-white py-3 font-bold transition"
            >
              Continuar Gratuito
            </button>
          </div>

          <div className="relative rounded-3xl border-2 border-green-500 bg-white p-5 md:p-6 shadow-lg">
            <div className="absolute -top-4 right-5 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow">
              Mais escolhido
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              Premium
            </h2>

            <p className="text-sm text-slate-500 mb-3">
              Para economizar tempo todos os meses.
            </p>

            <div className="flex items-end gap-2 mb-4">
              <p className="text-4xl md:text-5xl font-extrabold text-green-600">
                R$ 29,90
              </p>
              <span className="text-sm text-slate-500 mb-1">/mês</span>
            </div>

            <ul className="space-y-2 text-sm text-slate-700 mb-6">
              <li>✅ Planejamentos com IA</li>
              <li>✅ Objetivos e habilidades da BNCC</li>
              <li>✅ Metodologia, avaliação e referências</li>
              <li>✅ Atividade para casa</li>
              <li>✅ Exportação PDF e Word</li>
              <li>✅ Atualizações futuras</li>
            </ul>

            <button
              onClick={assinarPremium}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 hover:scale-[1.02] text-white py-3 font-extrabold shadow-lg transition"
            >
              Assinar Premium
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}