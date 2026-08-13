"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Headphones,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
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
    "Suporte dedicado",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <section className="mb-8 text-center sm:mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-extrabold text-green-700 shadow-sm">
            <Sparkles size={17} />
            PLANEJAI PREMIUM
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Continue planejando com{" "}
            <span className="text-green-600">
              mais praticidade
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Assine o Plano Premium e tenha acesso completo
            aos recursos do PlanejAI para organizar seu
            trabalho com mais agilidade.
          </p>
        </section>

        <section className="relative mx-auto overflow-hidden rounded-[28px] border-2 border-green-500 bg-white shadow-xl">
          <div className="absolute right-5 top-0 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-green-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg sm:right-8">
            Mais escolhido
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 border-b border-slate-200 pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <BadgeCheck size={30} />
                </div>

                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-green-600">
                    Premium
                  </p>

                  <div className="mt-1 flex flex-wrap items-end gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                      R$ 29,90
                    </span>

                    <span className="mb-1 text-sm font-semibold text-slate-500">
                      /mês
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    Para economizar tempo todos os meses.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-x-10 gap-y-3 py-7 md:grid-cols-2">
              {beneficios.map((beneficio) => (
                <div
                  key={beneficio}
                  className="flex items-start gap-3 text-sm font-medium text-slate-700 sm:text-base"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                    ✓
                  </span>
                  <span>{beneficio}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={23}
                  className="mt-0.5 shrink-0 text-green-700"
                />

                <div>
                  <p className="font-extrabold text-green-800">
                    Dezembro e janeiro sem cobrança
                  </p>

                  <p className="mt-1 text-sm leading-6 text-green-800/80">
                    Você continua aproveitando os benefícios
                    do Premium sem cobrança nesses meses.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] md:items-end">
                <div>
                  <label
                    htmlFor="cupom"
                    className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"
                  >
                    <Tag
                      size={18}
                      className="text-green-600"
                    />
                    Possui um cupom de indicação?
                  </label>

                  <input
                    id="cupom"
                    type="text"
                    value={cupom}
                    onChange={(e) => {
                      setCupom(
                        e.target.value.toUpperCase()
                      );
                      setMensagemErro("");
                    }}
                    placeholder="Ex.: MARIA"
                    maxLength={30}
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 uppercase outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                  />
                </div>

                <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                  O cupom identifica o professor ou parceiro
                  que indicou o PlanejAI. O valor da
                  assinatura continua R$ 29,90.
                </p>
              </div>
            </div>

            {mensagemErro && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-700">
                  {mensagemErro}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={assinarPremium}
              disabled={carregando}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              <LockKeyhole size={20} />
              {carregando
                ? "Preparando pagamento..."
                : "Assinar Premium"}
            </button>
          </div>
        </section>

        <section className="mt-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-3">
          <div className="flex items-start gap-3 p-5 md:border-r md:border-slate-200">
            <ShieldCheck
              size={25}
              className="shrink-0 text-green-600"
            />

            <div>
              <p className="font-extrabold text-slate-900">
                Pagamento seguro
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Seus dados protegidos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-slate-200 p-5 md:border-r md:border-t-0">
            <RefreshCw
              size={24}
              className="shrink-0 text-green-600"
            />

            <div>
              <p className="font-extrabold text-slate-900">
                Cancele quando quiser
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Sem burocracia.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 border-t border-slate-200 p-5 md:border-t-0">
            <Headphones
              size={25}
              className="shrink-0 text-green-600"
            />

            <div>
              <p className="font-extrabold text-slate-900">
                Suporte dedicado
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Estamos aqui para ajudar.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-500">
          <LockKeyhole size={14} />
          Ambiente seguro para realizar sua assinatura.
        </p>
      </div>
    </main>
  );
}