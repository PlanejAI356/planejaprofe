"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function recuperarSenha(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/nova-senha`,
    });

    setCarregando(false);

    if (error) {
      alert("Erro ao enviar recuperação: " + error.message);
      return;
    }

    alert("Enviamos um link para seu e-mail criar uma nova senha.");
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">
          Recuperar senha
        </h1>

        <p className="text-center text-slate-500 mb-6">
          Digite seu e-mail para receber o link de recuperação.
        </p>

        <form onSubmit={recuperarSenha} className="space-y-4">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3"
            required
          />

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-xl font-bold cursor-pointer"
          >
            {carregando ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a
            href="/login"
            className="font-bold text-blue-600 hover:text-green-600"
          >
            Voltar para o login
          </a>
        </div>
      </div>
    </main>
  );
}