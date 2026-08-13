"use client";

import { useState } from "react";ssss

import {
  BadgeCheck,
  CalendarDays,
  LockKeyhole,
  Sparkles,
  Tag,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

export default function Assinatura() {
  const [cupom, setCupom] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  async function assinarPremium() {
    try {
      setCarregando(true);
      setMensagemErro("");

      const { data, error: erroUsuario } =
        await supabase.auth.getUser();

      if (erroUsuario) {
        console.error(
          "Erro ao identificar usuário para assinatura:",
          erroUsuario
        );
      }

      const email = data.user?.email;

      if (!email) {
        setMensagemErro(
          "Você precisa estar logado para assinar o Plano Premium."
        );
        return;
      }

      const cupomNormalizado = cupom
        .trim()
        .toUpperCase();

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

      const dados = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        setMensagemErro(
          dados?.erro ||
            "Não foi possível iniciar o pagamento."
        );
        return;
      }

      if (dados?.init_point) {
        window.location.href = dados.init_point;
        return;
      }

      setMensagemErro(
        "Não foi possível criar o pagamento."
      );
    } catch (erro) {
      console.error(
        "Erro ao iniciar pagamento:",
        erro
      );

      setMensagemErro(
        "Erro ao conectar com o Mercado Pago. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const beneficios = [
    "Planejamentos completos com IA",
    "Objetivos e habilidades da BNCC",
    "Metodologia, avaliação e referências",
    "Atividade para casa",
    "Avaliações pedagógicas",
    "Atividades pedagógicas",
    "Exportação em PDF e Word",
    "Atualizações futuras",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-4 py-4 sm:py-5">
      <div className="mx-auto w-full max-w-5xl">
        <section className="mb-5 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-extrabold text-green-700 shadow-sm">
            <Sparkles size={16} />
            PLANEJAI PREMIUM
          </div>

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            Continue planejando com{" "}
            <span className="text-green-600">
              mais praticidade
            </span>
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-5 text-slate-600">
            Assine o Plano Premium e tenha acesso completo aos
            recursos do PlanejAI para organizar seu trabalho com
            mais agilidade.
          </p>
        </section>

        <section className="relative mx-auto rounded-[24px] border border-green-500 bg-white px-5 py-5 shadow-lg sm:px-7">
          <div className="absolute right-5 top-0 -translate-y-1/2 rounded-bl-2xl rounded-tr-[23px] bg-gradient-to-r from-blue-600 to-green-600 px-4 py-2 text-[11px] font-extrabold uppercase text-white shadow-md sm:right-0">
            Mais escolhido
          </div>

          <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <BadgeCheck size={29} />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-green-600">
                Premium
              </p>

              <div className="mt-0.5 flex flex-wrap items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-950">
                  R$ 29,90
                </span>
                <span className="mb-1 text-sm font-semibold text-slate-500">
                  /mês
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-600">
                Para economizar tempo todos os meses.
              </p>
            </div>
          </div>

          <div className="grid gap-x-12 gap-y-2 py-4 md:grid-cols-2">
            {beneficios.map((beneficio) => (
              <div
                key={beneficio}
                className="flex items-center gap-3 text-sm font-medium text-slate-700"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  ✓
                </span>
                <span>{beneficio}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-3 border-t border-slate-200 pt-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <div>
              <label
                htmlFor="cupom"
                className="mb-1.5 flex items-center gap-2 text-xs font-extrabold text-slate-700"
              >
                <Tag size={15} className="text-green-600" />
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
                placeholder="Ex.: MARIA"
                maxLength={30}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm uppercase outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <p className="text-xs leading-5 text-slate-500">
              O cupom identifica quem indicou o PlanejAI.
              O valor continua R$ 29,90.
            </p>

            <button
              type="button"
              onClick={assinarPremium}
              disabled={carregando}
              className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 px-7 py-2.5 font-extrabold text-white shadow-md transition hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole size={18} />
              {carregando
                ? "Preparando..."
                : "Assinar Plano Premium"}
            </button>
          </div>

          {mensagemErro && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-700">
                {mensagemErro}
              </p>
            </div>
          )}
        </section>

        <div className="mx-auto mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <LockKeyhole size={14} />
          Pagamento seguro via Mercado Pago.
        </div>

        <section className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
              <CalendarDays size={21} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-green-900">
                Dezembro e janeiro sem cobrança
              </p>
              <p className="text-xs leading-5 text-green-800/80">
                Nesses meses você continua com acesso liberado sem cobrança.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}