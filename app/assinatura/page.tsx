"use client";

import { useEffect, useState } from "react";

import {
  BadgeCheck,
  CalendarDays,
  LockKeyhole,
  Sparkles,
  Tag,
  RefreshCw,
  BookOpen,
} from "lucide-react";

import { supabase } from "@/app/lib/supabase";

export default function Assinatura() {
  const [cupom, setCupom] = useState("");

  const [carregando, setCarregando] =
    useState(false);

  const [
    carregandoBiblioteca,
    setCarregandoBiblioteca,
  ] = useState(false);

  const [
    carregandoPerfil,
    setCarregandoPerfil,
  ] = useState(true);

  const [
    mensagemErro,
    setMensagemErro,
  ] = useState("");

  const [ehRenovacao, setEhRenovacao] =
    useState(false);

  const [premiumAte, setPremiumAte] =
    useState<string | null>(null);

  const [tipoPremium, setTipoPremium] =
    useState<string | null>(null);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const { data } =
          await supabase.auth.getUser();

        const usuario = data.user;

        if (!usuario) {
          return;
        }

        const { data: perfil, error } =
          await supabase
            .from("profiles")
            .select(
              "plano, premium_ate, tipo_premium"
            )
            .eq("id", usuario.id)
            .maybeSingle();

        if (error) {
          console.error(
            "Erro ao carregar assinatura:",
            error
          );
          return;
        }

        if (!perfil) {
          return;
        }

        setPremiumAte(
          perfil.premium_ate ?? null
        );

        setTipoPremium(
          perfil.tipo_premium ?? null
        );

        /*
         * Só consideramos renovação
         * para Premium de pagamento.
         *
         * Parceiros e cortesias não
         * recebem cobrança.
         */
        const acessoEspecial =
          perfil.tipo_premium ===
            "parceiro" ||
          perfil.tipo_premium ===
            "cortesia";

        let assinaturaVencida = false;

        if (
          perfil.plano === "premium" &&
          !acessoEspecial
        ) {
          if (!perfil.premium_ate) {
            assinaturaVencida = true;
          } else {
            const vencimento = new Date(
              perfil.premium_ate
            );

            assinaturaVencida =
              Number.isNaN(
                vencimento.getTime()
              ) ||
              vencimento <= new Date();
          }
        }

        setEhRenovacao(
          assinaturaVencida
        );
      } catch (erro) {
        console.error(
          "Erro ao verificar assinatura:",
          erro
        );
      } finally {
        setCarregandoPerfil(false);
      }
    }

    carregarPerfil();
  }, []);

  /*
   * PAGAMENTO PREMIUM
   * R$ 29,90
   */
  async function assinarPremium() {
    try {
      setCarregando(true);
      setMensagemErro("");

      const {
        data,
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario) {
        console.error(
          "Erro ao identificar usuário:",
          erroUsuario
        );
      }

      const email = data.user?.email;

      if (!email) {
        setMensagemErro(
          "Você precisa estar logado para continuar."
        );
        return;
      }

      const cupomNormalizado = cupom
        .trim()
        .toUpperCase();

      const resposta = await fetch(
        "/api/pagamento",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            cupom:
              cupomNormalizado || null,
          }),
        }
      );

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
        window.location.href =
          dados.init_point;
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

  /*
   * PAGAMENTO BIBLIOTECA
   * R$ 9,99 - 30 DIAS
   */
  async function assinarBiblioteca() {
    try {
      setCarregandoBiblioteca(true);
      setMensagemErro("");

      const {
        data,
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario) {
        console.error(
          "Erro ao identificar usuário:",
          erroUsuario
        );
      }

      const email = data.user?.email;

      if (!email) {
        window.location.href =
          `/login?next=${encodeURIComponent(
            "/assinatura"
          )}`;
        return;
      }

      const resposta = await fetch(
        "/api/pagamento-biblioteca",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const dados = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        setMensagemErro(
          dados?.erro ||
            "Não foi possível iniciar o pagamento da Biblioteca."
        );
        return;
      }

      if (dados?.init_point) {
        window.location.href =
          dados.init_point;
        return;
      }

      setMensagemErro(
        "Não foi possível criar o pagamento da Biblioteca."
      );
    } catch (erro) {
      console.error(
        "Erro ao iniciar pagamento da Biblioteca:",
        erro
      );

      setMensagemErro(
        "Erro ao conectar com o Mercado Pago. Tente novamente."
      );
    } finally {
      setCarregandoBiblioteca(false);
    }
  }

  function formatarData(
    data: string | null
  ) {
    if (!data) {
      return null;
    }

    const dataFormatada =
      new Date(data);

    if (
      Number.isNaN(
        dataFormatada.getTime()
      )
    ) {
      return null;
    }

    return dataFormatada.toLocaleDateString(
      "pt-BR"
    );
  }

  const beneficiosBiblioteca = [
    "Download de todas as atividades da Biblioteca",
    "Materiais prontos para imprimir e utilizar",
    "Acesso às novas atividades adicionadas",
    "Acesso liberado por 30 dias",
  ];

  const naoIncluiBiblioteca = [
    "Não gera planos de aula com IA",
    "Não gera avaliações com IA",
    "Não gera novas atividades com IA",
  ];

  const beneficiosPremium = [
    "Planejamentos completos com IA",
    "Objetivos e habilidades da BNCC",
    "Metodologia, avaliação e referências",
    "Atividade para casa",
    "Avaliações pedagógicas",
    "Geração de atividades pedagógicas",
    "Biblioteca de materiais incluída",
    "Exportação em PDF e Word",
  ];

  /*
   * Parceiros e cortesias continuam
   * Premium sem tela de renovação.
   */
  const acessoEspecial =
    tipoPremium === "parceiro" ||
    tipoPremium === "cortesia";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-4 py-5 sm:py-7">
      <div className="mx-auto w-full max-w-6xl">

        {/* TÍTULO */}
        <section className="mb-7 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-extrabold text-green-700 shadow-sm">
            <Sparkles size={16} />
            ESCOLHA SEU ACESSO
          </div>

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            Escolha a opção que{" "}
            <span className="text-green-600">
              combina com você
            </span>
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Você pode acessar somente os
            materiais prontos da Biblioteca
            ou utilizar todos os recursos do
            PlanejAI Premium.
          </p>
        </section>

        {/* AVISO DE RENOVAÇÃO PREMIUM */}
        {ehRenovacao && premiumAte && (
          <section className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={24}
                className="shrink-0 text-amber-700"
              />

              <div>
                <p className="font-extrabold text-amber-900">
                  Sua assinatura Premium
                </p>

                <p className="text-sm text-amber-800">
                  Validade atual até{" "}
                  <strong>
                    {formatarData(
                      premiumAte
                    )}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </section>
        )}

        {/* PARCEIRO OU CORTESIA */}
        {acessoEspecial && (
          <section className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="font-extrabold text-green-900">
              Seu acesso Premium está ativo
            </p>

            <p className="mt-1 text-sm text-green-800">
              Seu acesso não necessita de
              renovação mensal e já inclui a
              Biblioteca.
            </p>
          </section>
        )}

        {/* PLANOS */}
        <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">

          {/* BIBLIOTECA */}
          <section className="relative flex h-full flex-col rounded-[24px] border border-blue-300 bg-white px-5 py-6 shadow-lg sm:px-7">

            <div className="absolute right-5 top-0 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-2 text-[11px] font-extrabold uppercase text-white shadow-md">
              Materiais prontos
            </div>

            <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <BookOpen size={29} />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-blue-600">
                  Biblioteca
                </p>

                <div className="mt-0.5 flex flex-wrap items-end gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-950">
                    R$ 9,99
                  </span>

                  <span className="mb-1 text-sm font-semibold text-slate-500">
                    /30 dias
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  Para quem quer atividades
                  prontas para baixar.
                </p>
              </div>
            </div>

            <div className="flex-1 py-5">
              <p className="mb-3 text-sm font-extrabold text-slate-800">
                Com este acesso você pode:
              </p>

              <div className="space-y-2.5">
                {beneficiosBiblioteca.map(
                  (beneficio) => (
                    <div
                      key={beneficio}
                      className="flex items-start gap-3 text-sm font-medium text-slate-700"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        ✓
                      </span>

                      <span>
                        {beneficio}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="my-4 border-t border-slate-200" />

              <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Este acesso não inclui:
              </p>

              <div className="space-y-2">
                {naoIncluiBiblioteca.map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 text-sm text-slate-500"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-extrabold text-slate-600">
                        ×
                      </span>

                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {!acessoEspecial ? (
              <button
                type="button"
                onClick={
                  assinarBiblioteca
                }
                disabled={
                  carregandoBiblioteca ||
                  carregandoPerfil
                }
                className="mt-auto flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-extrabold text-white shadow-md transition hover:scale-[1.01] hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BookOpen size={19} />

                {carregandoBiblioteca
                  ? "Preparando pagamento..."
                  : "Liberar Biblioteca"}
              </button>
            ) : (
              <div className="mt-auto rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">
                Biblioteca já incluída no
                seu Premium
              </div>
            )}

            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              Pagamento único para 30 dias
              de acesso. Sem renovação
              automática.
            </p>
          </section>

          {/* PREMIUM */}
          <section className="relative flex h-full flex-col rounded-[24px] border-2 border-green-500 bg-white px-5 py-6 shadow-xl sm:px-7">

            <div className="absolute right-5 top-0 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-green-600 px-4 py-2 text-[11px] font-extrabold uppercase text-white shadow-md">
              Acesso completo
            </div>

            <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <BadgeCheck size={29} />
              </div>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-green-600">
                  PlanejAI Premium
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
                  Para quem quer criar,
                  organizar e baixar.
                </p>
              </div>
            </div>

            <div className="flex-1 py-5">
              <p className="mb-3 text-sm font-extrabold text-slate-800">
                Tudo do PlanejAI em um só
                acesso:
              </p>

              <div className="space-y-2.5">
                {beneficiosPremium.map(
                  (beneficio) => (
                    <div
                      key={beneficio}
                      className="flex items-start gap-3 text-sm font-medium text-slate-700"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                        ✓
                      </span>

                      <span>
                        {beneficio}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {!acessoEspecial && (
              <div className="mt-auto border-t border-slate-200 pt-4">

                <label
                  htmlFor="cupom"
                  className="mb-1.5 flex items-center gap-2 text-xs font-extrabold text-slate-700"
                >
                  <Tag
                    size={15}
                    className="text-green-600"
                  />

                  Possui um cupom de
                  indicação?
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm uppercase outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  O cupom identifica quem
                  indicou o PlanejAI. O valor
                  continua R$ 29,90.
                </p>

                <button
                  type="button"
                  onClick={assinarPremium}
                  disabled={
                    carregando ||
                    carregandoPerfil ||
                    carregandoBiblioteca
                  }
                  className="mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-3 font-extrabold text-white shadow-md transition hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ehRenovacao ? (
                    <RefreshCw
                      size={18}
                    />
                  ) : (
                    <LockKeyhole
                      size={18}
                    />
                  )}

                  {carregando
                    ? "Preparando..."
                    : ehRenovacao
                    ? "Renovar Premium"
                    : "Assinar Premium"}
                </button>
              </div>
            )}

            {acessoEspecial && (
              <div className="mt-auto rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">
                Seu Premium já está ativo
              </div>
            )}
          </section>
        </div>

        {/* ERROS */}
        {mensagemErro && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-center text-sm font-semibold text-red-700">
              {mensagemErro}
            </p>
          </div>
        )}

        {/* SEGURANÇA */}
        <div className="mx-auto mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
          <LockKeyhole size={14} />
          Pagamento seguro via Mercado
          Pago.
        </div>

        {/* AVISO */}
        <section className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
              <CalendarDays size={21} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-green-900">
                Premium: dezembro e janeiro
                sem cobrança
              </p>

              <p className="text-xs leading-5 text-green-800/80">
                Essa condição é do Plano
                Premium. O acesso à Biblioteca
                de R$ 9,99 tem validade de
                30 dias.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}