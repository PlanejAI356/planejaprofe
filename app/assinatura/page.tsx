"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function Assinatura() {
  const [cupom, setCupom] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  async function assinarPremium() {
    try {
      setCarregando(true);
      setMensagemErro("");

      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;

      if (!email) {
        setMensagemErro(
          "Você precisa estar logado para assinar o Plano Premium."
        );
        setCarregando(false);
        return;
      }

      const cupomNormalizado = cupom.trim().toUpperCase();

      const resposta = await fetch("/api/pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          cupom: cupomNormalizado || null,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagemErro(
          dados?.erro || "Não foi possível iniciar o pagamento."
        );
        setCarregando(false);
        return;
      }

      if (dados.init_point) {
        window.location.href = dados.init_point;
        return;
      }

      setMensagemErro("Não foi possível criar o pagamento.");
      setCarregando(false);
    } catch (erro) {
      console.error("Erro ao iniciar pagamento:", erro);

      setMensagemErro(
        "Erro ao conectar com o Mercado Pago. Tente novamente."
      );

      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-extrabold text-green-700">
            🚀 PLANEJAI PREMIUM
          </div>

          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 md:text-4xl">
            Menos tempo planejando.
          </h1>

          <h2 className="text-xl font-extrabold text-green-600 md:text-3xl">
            Mais tempo ensinando.
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            Continue criando planejamentos completos com Inteligência
            Artificial.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* TESTE GRÁTIS */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6">
            <h2 className="mb-1 text-xl font-extrabold text-slate-800">
              Teste grátis
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Para conhecer o PlanejAI antes de assinar.
            </p>

            <p className="mb-4 text-3xl font-extrabold text-slate-700">
              R$ 0
            </p>

            <ul className="mb-6 space-y-2 text-sm text-slate-700">
              <li>✅ 1 planejamento gratuito para testar</li>
              <li>✅ Geração com Inteligência Artificial</li>
              <li>✅ Plano editável</li>
              <li>✅ Experimente antes de assinar</li>
            </ul>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="w-full rounded-2xl bg-slate-500 py-3 font-bold text-white transition hover:bg-slate-600"
            >
              Fazer meu teste grátis
            </button>
          </div>

          {/* PLANO PREMIUM */}
          <div className="relative rounded-3xl border-2 border-green-500 bg-white p-5 shadow-lg md:p-6">
            <div className="absolute -top-4 right-5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 px-4 py-1.5 text-xs font-bold text-white shadow">
              Mais escolhido
            </div>

            <h2 className="mb-1 text-xl font-extrabold text-slate-900">
              Premium
            </h2>

            <p className="mb-3 text-sm text-slate-500">
              Para economizar tempo todos os meses.
            </p>

            <div className="mb-4 flex items-end gap-2">
              <p className="text-4xl font-extrabold text-green-600 md:text-5xl">
                R$ 29,90
              </p>

              <span className="mb-1 text-sm text-slate-500">/mês</span>
            </div>

            <ul className="mb-6 space-y-2 text-sm text-slate-700">
              <li>✅ Planejamentos completos com IA</li>
              <li>✅ Objetivos e habilidades da BNCC</li>
              <li>✅ Metodologia, avaliação e referências</li>
              <li>✅ Atividade para casa</li>
              <li>✅ Avaliações pedagógicas</li>
              <li>✅ Atividades pedagógicas</li>
              <li>✅ Exportação em PDF e Word</li>
              <li>✅ Atualizações futuras</li>
            </ul>

            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="text-center text-sm font-bold text-green-800">
                💚 Dezembro e janeiro sem cobrança
              </p>
            </div>

            {/* CUPOM DE PARCEIRO */}
            <div className="mb-5">
              <label
                htmlFor="cupom"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Possui um cupom de indicação?
              </label>

              <input
                id="cupom"
                type="text"
                value={cupom}
                onChange={(e) => {
                  setCupom(e.target.value.toUpperCase());
                  setMensagemErro("");
                }}
                placeholder="Ex.: AILA"
                maxLength={30}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                O cupom identifica o professor ou parceiro que indicou o
                PlanejAI. O valor da assinatura continua R$ 29,90.
              </p>
            </div>

            {mensagemErro && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-700">
                  {mensagemErro}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={assinarPremium}
              disabled={carregando}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 py-3 font-extrabold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {carregando
                ? "Preparando pagamento..."
                : "Assinar Premium"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}