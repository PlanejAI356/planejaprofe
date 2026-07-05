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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 md:p-10">
        <div className="text-center mb-8">
          <p className="text-sm font-bold text-green-600 mb-2">
            🚀 PLANEJAI PREMIUM
          </p>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900">
            Menos tempo planejando.
          </h1>

          <h2 className="text-2xl md:text-4xl font-extrabold text-green-600 mt-2">
            Mais tempo ensinando.
          </h2>

          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            Escolha o plano ideal para continuar criando planejamentos completos
            com Inteligência Artificial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
              Gratuito
            </h2>

            <p className="text-slate-500 mb-6">
              Ideal para conhecer o PlanejAI.
            </p>

            <p className="text-4xl font-extrabold text-slate-700 mb-6">
              R$ 0
            </p>

            <ul className="space-y-3 text-slate-700 mb-8">
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

          <div className="relative rounded-3xl border-2 border-green-500 bg-white p-6 md:p-8 shadow-xl">
            <div className="absolute -top-4 right-6 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
              Mais escolhido
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Premium
            </h2>

            <p className="text-slate-500 mb-4">
              Para professores que querem economizar tempo todos os meses.
            </p>

            <div className="flex items-end gap-2 mb-6">
              <p className="text-5xl md:text-6xl font-extrabold text-green-600">
                R$ 29,90
              </p>
              <span className="text-slate-500 mb-2">/mês</span>
            </div>

            <ul className="space-y-3 text-slate-700 mb-8">
              <li>✅ Planejamentos com IA</li>
              <li>✅ Objetivos e habilidades da BNCC</li>
              <li>✅ Metodologia, avaliação e referências</li>
              <li>✅ Atividade para casa</li>
              <li>✅ Exportação PDF e Word</li>
              <li>✅ Atualizações futuras</li>
            </ul>

            <button
              onClick={assinarPremium}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 hover:scale-[1.02] text-white py-4 font-extrabold shadow-lg transition"
            >
              Assinar Premium
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}