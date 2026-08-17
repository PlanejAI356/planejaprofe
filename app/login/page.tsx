"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] =
    useState(false);
  const [carregando, setCarregando] =
    useState(false);

  async function sincronizarPerfil(
    accessToken: string
  ) {
    const resposta = await fetch(
      "/api/perfil/sincronizar",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
        },
      }
    );

    const resultado =
      await resposta
        .json()
        .catch(() => null);

    if (!resposta.ok) {
      throw new Error(
        resultado?.erro ||
          "Não foi possível verificar os dados da sua conta."
      );
    }

    return resultado;
  }

  async function entrar(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (carregando) return;

    const emailNormalizado =
      email.trim().toLowerCase();

    const senhaNormalizada =
      senha.trim();

    if (!emailNormalizado) {
      alert("Informe seu e-mail.");
      return;
    }

    if (!senhaNormalizada) {
      alert("Informe sua senha.");
      return;
    }

    setCarregando(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email:
            emailNormalizado,
          password:
            senhaNormalizada,
        });

      if (error) {
        console.error(
          "Erro no login:",
          error
        );

        const mensagem =
          error.message.toLowerCase();

        if (
          mensagem.includes(
            "invalid login credentials"
          ) ||
          mensagem.includes(
            "invalid credentials"
          )
        ) {
          alert(
            "E-mail ou senha incorretos."
          );
          return;
        }

        if (
          mensagem.includes(
            "email not confirmed"
          )
        ) {
          alert(
            "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada."
          );
          return;
        }

        alert(
          "Não foi possível entrar na sua conta. Tente novamente."
        );
        return;
      }

      const accessToken =
        data.session?.access_token;

      if (
        !data.user ||
        !accessToken
      ) {
        console.error(
          "Login concluído sem usuário ou sessão válida."
        );

        alert(
          "Não foi possível concluir o acesso à sua conta. Tente novamente."
        );
        return;
      }

      await sincronizarPerfil(
        accessToken
      );

      /*
       * Se o usuário chegou ao login
       * vindo de uma página específica,
       * volta para ela depois do acesso.
       *
       * Exemplo:
       * /login?next=/admin
       */
      const params =
        new URLSearchParams(
          window.location.search
        );

      const destinoRecebido =
        params.get("next") || "/";

      /*
       * Segurança:
       * só aceita caminhos internos
       * do próprio PlanejAI.
       */
      const destinoSeguro =
        destinoRecebido.startsWith("/") &&
        !destinoRecebido.startsWith("//")
          ? destinoRecebido
          : "/";

      window.location.href =
        destinoSeguro;
    } catch (error) {
      console.error(
        "Erro ao verificar o perfil após o login:",
        error
      );

      await supabase.auth
        .signOut()
        .catch(
          () => undefined
        );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível verificar sua conta. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-white to-green-100 p-4">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-green-200/50 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border-2 border-green-200 bg-white p-8 shadow-2xl sm:p-10">
        <h1 className="mb-2 text-center text-4xl font-extrabold tracking-wide text-slate-900">
          ENTRAR
        </h1>

        <p className="mb-8 text-center text-slate-500">
          Acesse sua conta do PlanejAI.
        </p>

        <form
          onSubmit={entrar}
          className="space-y-5"
        >
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
            required
          />

          <div className="relative">
            <input
              type={
                mostrarSenha
                  ? "text"
                  : "password"
              }
              placeholder="Senha"
              value={senha}
              onChange={(e) =>
                setSenha(
                  e.target.value
                )
              }
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-300 px-4 py-4 pr-12 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              required
            />

            <button
              type="button"
              onClick={() =>
                setMostrarSenha(
                  (
                    valorAtual
                  ) =>
                    !valorAtual
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-green-600"
              aria-label={
                mostrarSenha
                  ? "Ocultar senha"
                  : "Mostrar senha"
              }
            >
              {mostrarSenha ? (
                <EyeOff
                  size={20}
                />
              ) : (
                <Eye
                  size={20}
                />
              )}
            </button>
          </div>

          <div className="text-right">
            <a
              href="/recuperar-senha"
              className="text-sm font-semibold text-blue-600 hover:text-green-600"
            >
              Esqueceu sua senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-green-600 py-4 text-lg font-bold text-white transition hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando
              ? "Verificando sua conta..."
              : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}