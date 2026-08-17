"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buscarPerfil } from "@/app/lib/profile";

export default function Pendente() {
  const router = useRouter();

  const [status, setStatus] = useState<
    "verificando" | "premium" | "erro"
  >("verificando");

  const [mensagem, setMensagem] = useState(
    "Estamos confirmando seu pagamento."
  );

  useEffect(() => {
    let tentativas = 0;
    const maxTentativas = 20;

    async function verificarPremium() {
      try {
        const perfil = await buscarPerfil();

        if (perfil?.plano === "premium") {
          localStorage.removeItem("testeGratisAtivo");

          setStatus("premium");
          setMensagem(
            "Pagamento confirmado! Seu Plano Premium já está ativo."
          );

          return true;
        }

        tentativas += 1;

        if (tentativas >= maxTentativas) {
          setStatus("erro");
          setMensagem(
            "Seu pagamento ainda está sendo confirmado. Aguarde alguns instantes e tente novamente."
          );

          return true;
        }

        return false;
      } catch (error) {
        console.error(
          "Erro ao verificar Premium:",
          error
        );

        tentativas += 1;

        if (tentativas >= maxTentativas) {
          setStatus("erro");
          setMensagem(
            "Não foi possível confirmar seu pagamento agora. Tente novamente em alguns instantes."
          );

          return true;
        }

        return false;
      }
    }

    async function iniciarVerificacao() {
      const finalizado =
        await verificarPremium();

      if (finalizado) {
        return;
      }

      const intervalo = setInterval(
        async () => {
          const terminou =
            await verificarPremium();

          if (terminou) {
            clearInterval(intervalo);
          }
        },
        3000
      );

      return intervalo;
    }

    let intervalo:
      | ReturnType<typeof setInterval>
      | undefined;

    iniciarVerificacao().then(
      (resultado) => {
        intervalo = resultado;
      }
    );

    return () => {
      if (intervalo) {
        clearInterval(intervalo);
      }
    };
  }, []);

  async function verificarNovamente() {
    setStatus("verificando");
    setMensagem(
      "Estamos verificando seu pagamento novamente."
    );

    try {
      const perfil = await buscarPerfil();

      if (perfil?.plano === "premium") {
        localStorage.removeItem(
          "testeGratisAtivo"
        );

        setStatus("premium");
        setMensagem(
          "Pagamento confirmado! Seu Plano Premium já está ativo."
        );

        return;
      }

      setStatus("erro");
      setMensagem(
        "Seu pagamento ainda está sendo confirmado. Aguarde alguns instantes e tente novamente."
      );
    } catch (error) {
      console.error(
        "Erro ao verificar Premium:",
        error
      );

      setStatus("erro");
      setMensagem(
        "Não foi possível confirmar seu pagamento agora. Tente novamente."
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        {status === "premium" ? (
          <>
            <div className="text-6xl">
              🎉
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-emerald-700">
              Pagamento confirmado!
            </h1>

            <p className="mt-3 text-base leading-7 text-slate-600">
              {mensagem}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/atividades")
              }
              className="mt-6 w-full cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-700"
            >
              Ir para minha conta Premium
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl">
              ⏳
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
              Confirmando pagamento
            </h1>

            <p className="mt-3 text-base leading-7 text-slate-600">
              {mensagem}
            </p>

            {status ===
              "verificando" && (
              <p className="mt-3 text-sm text-slate-500">
                Esta página será atualizada
                automaticamente.
              </p>
            )}

            {status === "erro" && (
              <button
                type="button"
                onClick={
                  verificarNovamente
                }
                className="mt-6 w-full cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-700"
              >
                Verificar novamente
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}