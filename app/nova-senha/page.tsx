"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function NovaSenhaPage() {
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function salvarNovaSenha(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const { error } = await supabase.auth.updateUser({
      password: novaSenha.trim(),
    });

    setCarregando(false);

    if (error) {
      alert("Erro ao alterar senha: " + error.message);
      return;
    }

    alert("Senha alterada com sucesso! Faça login novamente.");
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">
          Criar nova senha
        </h1>

        <p className="text-center text-slate-500 mb-6">
          Digite sua nova senha para acessar o PlanejAI.
        </p>

        <form onSubmit={salvarNovaSenha} className="space-y-4">
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Nova senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12"
              required
              minLength={6}
            />

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-xl font-bold cursor-pointer"
          >
            {carregando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </main>
  );
}