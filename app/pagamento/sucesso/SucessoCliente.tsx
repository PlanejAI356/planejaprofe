"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

type StatusPagamento =
  | "verificando"
  | "aguardando"
  | "confirmado"
  | "erro"
  | "nao_autenticado";

export default function SucessoCliente() {
  const [status, setStatus] =
    useState<StatusPagamento>("verificando");

  const [mensagem, setMensagem] = useState(
    "Estamos confirmando sua assinatura..."
  );

  const [verificandoManual, setVerificandoManual] =
    useState(false);

  async function verificarPremium(manual = false) {
    if (manual) {
      setVerificandoManual(true);
    }

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario) {
        console.error(
          "Erro ao identificar usuário após pagamento:",
          erroUsuario
        );
      }

      if (!user) {
        setStatus("nao_autenticado");
        setMensagem(
          "Entre na sua conta para concluir a confirmação da assinatura."
        );
        return;
      }

      const {
        data: perfil,
        error: erroPerfil,
      } = await supabase
        .from("profiles")
        .select("plano, mercado_pago_id")
        .eq("id", user.id)
        .maybeSingle();

      if (erroPerfil) {
        console.error(
          "Erro ao verificar Premium após pagamento:",
          erroPerfil
        );

        setStatus("erro");
        setMensagem(
          "Não conseguimos verificar sua assinatura neste momento. Tente novamente em alguns segundos."
        );
        return;
      }

      if (perfil?.plano === "premium") {
        setStatus("confirmado");
        setMensagem(
          "Sua assinatura foi confirmada e sua conta já está com acesso Premium."
        );
        return;
      }

      setStatus("aguardando");
      setMensagem(
        "Seu pagamento foi recebido e estamos aguardando a confirmação final. Isso costuma levar apenas alguns instantes."
      );
    } catch (error) {
      console.error(
        "Erro inesperado ao verificar pagamento:",
        error
      );

      setStatus("erro");
      setMensagem(
        "Não conseguimos verificar sua assinatura neste momento. Tente novamente."
      );
    } finally {
      if (manual) {
        setVerificandoManual(false);
      }
    }
  }

  useEffect(() => {
    verificarPremium();

    const intervalo = window.setInterval(() => {
      verificarPremium();
    }, 5000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, []);

  function acessarPlanejAI() {
    window.location.href = "/";
  }

  function irParaLogin() {
    window.location.href = "/login";
  }

  const confirmado = status === "confirmado";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-10">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            confirmado
              ? "bg-emerald-100 text-emerald-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {confirmado ? (
            <CheckCircle2 size={42} />
          ) : (
            <Loader2
              size={38}
              className={
                status === "verificando" ||
                status === "aguardando"
                  ? "animate-spin"
                  : ""
              }
            />
          )}
        </div>

        <div className="mt-6">
          {confirmado ? (
            <>
              <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-extrabold text-emerald-700">
                <Sparkles size={16} />
                PLANEJAI PREMIUM
              </div>

              <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
                Pagamento confirmado!
              </h1>

              <p className="mt-3 text-lg font-bold text-emerald-700">
                Sua conta agora é Premium.
              </p>
            </>
          ) : (
            <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
              Confirmando sua assinatura
            </h1>
          )}

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            {mensagem}
          </p>
        </div>

        {confirmado ? (
          <div className="mt-8">
            <button
              type="button"
              onClick={acessarPlanejAI}
              className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl sm:w-auto sm:min-w-72"
            >
              Acessar o PlanejAI
            </button>

            <p className="mt-4 text-xs text-slate-500">
              Seu acesso Premium já está liberado nesta conta.
            </p>
          </div>
        ) : status === "nao_autenticado" ? (
          <div className="mt-8">
            <button
              type="button"
              onClick={irParaLogin}
              className="w-full cursor-pointer rounded-2xl bg-emerald-600 px-6 py-4 font-extrabold text-white transition hover:bg-emerald-700 sm:w-auto sm:min-w-64"
            >
              Entrar na minha conta
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => verificarPremium(true)}
              disabled={verificandoManual}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-white px-6 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verificandoManual ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={18} />
              )}

              {verificandoManual
                ? "Verificando..."
                : "Verificar novamente"}
            </button>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Você pode permanecer nesta página enquanto a confirmação é concluída.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}