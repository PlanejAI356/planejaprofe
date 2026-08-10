"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();

    if (carregando) return;

    setCarregando(true);

    try {
      const nomeNormalizado = nome.trim();
      const emailNormalizado = email
        .trim()
        .toLowerCase();

      const whatsappNormalizado =
        whatsapp.trim();

      const senhaNormalizada =
        senha.trim();

      if (!nomeNormalizado) {
        alert("Informe seu nome.");
        return;
      }

      if (!emailNormalizado) {
        alert("Informe seu e-mail.");
        return;
      }

      if (!whatsappNormalizado) {
        alert(
          "Informe seu telefone ou WhatsApp."
        );
        return;
      }

      if (!senhaNormalizada) {
        alert("Informe uma senha.");
        return;
      }

      /*
       * 1. VERIFICA SE O E-MAIL
       * JÁ POSSUI PERFIL NO PLANEJAI
       */
      const respostaVerificacao =
        await fetch(
          "/api/verificar-email",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email: emailNormalizado,
            }),
          }
        );

      const dadosVerificacao =
        await respostaVerificacao.json();

      if (!respostaVerificacao.ok) {
        alert(
          dadosVerificacao?.erro ||
            "Não foi possível verificar o e-mail."
        );
        return;
      }

      /*
       * Se já existe perfil com esse e-mail,
       * não cria outra conta.
       */
      if (dadosVerificacao.existe) {
        alert(
          "Este e-mail já está cadastrado. Entre na sua conta ou recupere sua senha."
        );

        window.location.href = "/login";
        return;
      }

      /*
       * 2. CRIA A CONTA NO SUPABASE AUTH
       */
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email: emailNormalizado,
        password: senhaNormalizada,
        options: {
          data: {
            nome: nomeNormalizado,
            whatsapp: whatsappNormalizado,
          },
        },
      });

      if (error) {
        console.error(
          "Erro no cadastro:",
          error
        );

        /*
         * Segunda proteção.
         * Se o próprio Auth identificar
         * conflito de cadastro, mostramos
         * uma mensagem amigável.
         */
        const mensagemErro =
          error.message.toLowerCase();

        if (
          mensagemErro.includes(
            "already registered"
          ) ||
          mensagemErro.includes(
            "already exists"
          ) ||
          mensagemErro.includes(
            "user already"
          )
        ) {
          alert(
            "Este e-mail já está cadastrado. Entre na sua conta ou recupere sua senha."
          );

          window.location.href =
            "/login";
          return;
        }

        alert(
          "Erro ao criar conta: " +
            error.message
        );
        return;
      }

      console.log(
        "Cadastro criado:",
        data.user?.id
      );

      alert(
        "Cadastro realizado com sucesso! Agora faça login para acessar o PlanejAI."
      );

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Erro inesperado ao criar conta:",
        error
      );

      alert(
        "Não foi possível criar a conta. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-slate-900">
          Criar conta
        </h1>

        <p className="mb-6 text-center text-slate-500">
          Cadastre-se para usar o PlanejAI.
        </p>

        <form
          onSubmit={criarConta}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
            required
          />

          <input
            type="text"
            placeholder="Telefone / WhatsApp"
            value={whatsapp}
            onChange={(e) =>
              setWhatsapp(e.target.value)
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
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
                setSenha(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              required
            />

            <button
              type="button"
              onClick={() =>
                setMostrarSenha(
                  !mostrarSenha
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-slate-700"
              aria-label={
                mostrarSenha
                  ? "Ocultar senha"
                  : "Mostrar senha"
              }
            >
              {mostrarSenha ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-green-600 py-3 font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando
              ? "Criando conta..."
              : "Criar conta"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Já possui uma conta?

          <br />

          <a
            href="/login"
            className="mt-2 inline-block cursor-pointer font-bold text-blue-600 transition hover:text-green-600"
          >
            Entrar
          </a>
        </div>
      </div>
    </main>
  );
}