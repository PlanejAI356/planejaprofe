"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
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

      const params =
        new URLSearchParams(
          window.location.search
        );

      const destinoRecebido =
        params.get("next") || "/";

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
    <main className="relative min-h-screen overflow-hidden bg-[#fbfefc]">
      {/* FUNDO DECORATIVO */}
      <div className="pointer-events-none absolute -left-44 -top-28 h-[380px] w-[620px] rounded-[50%] bg-green-100/55 blur-3xl" />
      <div className="pointer-events-none absolute -right-52 top-16 h-[500px] w-[680px] rounded-[50%] bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 left-[-100px] h-[420px] w-[760px] rounded-[50%] bg-gradient-to-r from-green-100/60 via-emerald-50/50 to-blue-50/40 blur-3xl" />

      {/* PONTOS */}
      <div className="pointer-events-none absolute left-8 top-[40%] hidden grid-cols-3 gap-3 opacity-35 lg:grid">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={`ponto-esquerda-${index}`}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        ))}
      </div>

      <div className="pointer-events-none absolute right-10 top-[22%] hidden grid-cols-3 gap-3 opacity-30 lg:grid">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={`ponto-direita-${index}`}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        ))}
      </div>

      <span className="pointer-events-none absolute left-[12%] top-[48%] hidden text-3xl text-green-500 lg:block">
        ✦
      </span>

      <span className="pointer-events-none absolute right-[13%] top-[38%] hidden text-3xl text-blue-500 lg:block">
        ✦
      </span>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        {/* CABEÇALHO */}
        <header className="flex shrink-0 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="flex cursor-pointer items-center gap-3"
          >
            <img
              src="/logo-planejai-nova.png"
              alt="PlanejAI"
              className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            />

            <span className="text-3xl font-black tracking-tight text-[#071c4d] sm:text-4xl">
              Planej<span className="text-green-600">AI</span>
            </span>
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 shadow-sm md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-800">
                Seus dados estão seguros
              </p>

              <p className="text-xs text-slate-500">
                Privacidade e segurança em primeiro lugar.
              </p>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <section className="relative flex flex-1 items-center justify-center py-6">
          <div className="relative w-full max-w-6xl">
            {/* CARDS LATERAIS */}
            <div className="absolute -left-2 top-16 z-20 hidden rotate-[-5deg] rounded-[28px] border border-green-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
                📚
              </div>

              <p className="font-extrabold text-green-700">
                Planejamentos
              </p>
            </div>

            <div className="absolute left-0 bottom-20 z-20 hidden rotate-[3deg] rounded-[28px] border border-blue-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl">
                📝
              </div>

              <p className="font-extrabold text-blue-700">
                Avaliações
              </p>
            </div>

            <div className="absolute -right-1 top-40 z-20 hidden rotate-[5deg] rounded-[28px] border border-orange-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-4xl">
                ✏️
              </div>

              <p className="font-extrabold text-orange-600">
                Atividades
              </p>
            </div>

            {/* BLOCO CENTRAL */}
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
                  <LogIn size={30} strokeWidth={2.3} />
                </div>

                <h1 className="text-4xl font-black tracking-[-0.04em] text-[#071c4d] sm:text-5xl md:text-6xl">
                  Acesse sua{" "}
                  <span className="text-green-600">
                    conta
                  </span>
                </h1>

                <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-green-500" />

                <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
                  Entre para continuar criando seus materiais no PlanejAI.
                </p>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-7">
                <form
                  onSubmit={entrar}
                  className="space-y-4"
                >
                  {/* E-MAIL */}
                  <div className="relative">
                    <Mail
                      size={21}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                    />

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
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    />
                  </div>

                  {/* SENHA */}
                  <div className="relative">
                    <LockKeyhole
                      size={21}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                    />

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
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-base outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
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
                          size={21}
                        />
                      ) : (
                        <Eye
                          size={21}
                        />
                      )}
                    </button>
                  </div>

                  {/* ESQUECEU A SENHA */}
                  <div className="text-right">
                    <a
                      href="/recuperar-senha"
                      className="text-sm font-semibold text-blue-600 transition hover:text-green-600"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>

                  {/* BOTÃO */}
                  <button
                    type="submit"
                    disabled={carregando}
                    className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogIn size={23} />

                    {carregando
                      ? "Verificando sua conta..."
                      : "Entrar"}
                  </button>
                </form>

                {/* CRIAR CONTA */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <p className="text-sm text-slate-600">
                    Ainda não possui uma conta?
                  </p>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/cadastro";
                  }}
                  className="mx-auto mt-4 flex cursor-pointer items-center gap-2 font-extrabold text-blue-600 transition hover:text-green-600"
                >
                  Criar conta
                </button>
              </div>
            </div>

            {/* LINHAS DECORATIVAS */}
            <div className="pointer-events-none absolute left-20 top-44 hidden h-36 w-32 rounded-full border-b-2 border-l-2 border-dashed border-green-300 lg:block" />

            <div className="pointer-events-none absolute bottom-20 right-20 hidden h-36 w-32 rounded-full border-b-2 border-r-2 border-dashed border-green-300 lg:block" />
          </div>
        </section>
      </div>
    </main>
  );
}
