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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
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
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          PlanejAI Premium
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Gratuito</h2>

            <ul className="space-y-2 mb-6">
              <li>✅ Até 3 planejamentos por mês</li>
              <li>✅ Recursos básicos</li>
            </ul>

            <button className="w-full bg-gray-500 text-white rounded-xl py-3">
              Continuar Gratuito
            </button>
          </div>

          <div className="border-2 border-green-600 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Premium</h2>

            <p className="text-5xl font-bold text-green-600 mb-6">
              R$ 29,90
            </p>

            <ul className="space-y-2 mb-6">
              <li>✅ IA ilimitada</li>
              <li>✅ Exportação PDF</li>
              <li>✅ Exportação Word</li>
              <li>✅ Histórico completo</li>
              <li>✅ Atualizações futuras</li>
            </ul>

            <button
              onClick={assinarPremium}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3"
            >
              Assinar Premium
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}