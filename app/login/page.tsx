"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha.trim(),
    });

    setCarregando(false);

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-white to-green-100 flex items-center justify-center p-4">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-green-200/50 blur-3xl" />

      <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-green-200 p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-4xl font-extrabold tracking-wide text-center text-slate-900 mb-2">
          ENTRAR
        </h1>

        <p className="text-center text-slate-500 mb-8">
          Acesse sua conta do PlanejAI.
        </p>

        <form onSubmit={entrar} className="space-y-5">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-4 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
            required
          />

          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-4 pr-12 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
              required
            />

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-green-600"
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-right">
            <a
              href="/recuperar-senha"
              className="text-sm text-blue-600 hover:text-green-600 font-semibold"
            >
              Esqueceu sua senha?
            </a>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-xl text-lg font-bold transition hover:scale-[1.01] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}