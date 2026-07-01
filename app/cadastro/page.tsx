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
    setCarregando(true);

    const { error } = await supabase.auth.signUp({
  email: email.trim(),
  password: senha.trim(),
  options: {
    data: {
      nome,
      whatsapp,
    },
  },
});

    setCarregando(false);

    if (error) {
      alert("Erro ao criar conta: " + error.message);
      return;
    }

    alert("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-2">
          Criar conta
        </h1>

        <p className="text-center text-slate-500 mb-6">
          Cadastre-se para usar o PlanejAI.
        </p>

        <form onSubmit={criarConta} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3"
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3"
            required
          />

          <input
            type="text"
            placeholder="Telefone / WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3"
            required
          />

          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12"
              required
            />

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-xl font-bold cursor-pointer"
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}