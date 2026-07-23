"use client";

import { useEffect, useState } from "react";
import { Heart, LogOut, FolderOpen } from "lucide-react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function TopoProfessor() {
  const [nome, setNome] = useState("");
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    setNome(localStorage.getItem("nomeProfessor") || "");
  }, []);

  function salvarNome(valor: string) {
    setNome(valor);
    localStorage.setItem("nomeProfessor", valor);
  }

  async function sair() {
    try {
      setSaindo(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("Não foi possível sair. Tente novamente.");
        return;
      }

      localStorage.removeItem("nomeProfessor");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Não foi possível sair. Tente novamente.");
    } finally {
      setSaindo(false);
    }
  }

  const inicial = nome.trim()
    ? nome.trim().charAt(0).toUpperCase()
    : "P";

  return (
    <header className="relative overflow-hidden border-b border-emerald-200 bg-gradient-to-r from-green-100 via-emerald-200 to-emerald-600 shadow-sm">
      <div className="pointer-events-none absolute -left-12 -top-20 h-44 w-44 rounded-full bg-white/30 blur-2xl" />
      <div className="pointer-events-none absolute right-32 top-[-70px] h-48 w-48 rounded-full bg-green-300/40 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[-75px] right-[-35px] h-48 w-48 rounded-full bg-emerald-800/20 blur-2xl" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-white/85 shadow-md backdrop-blur-sm">
            <span className="text-xl font-extrabold text-slate-900">
              {inicial}
            </span>
          </div>

          <div className="min-w-0">
            <input
              value={nome}
              onChange={(e) => salvarNome(e.target.value)}
              placeholder="Nome do Professor"
              aria-label="Nome do professor"
              className="w-full max-w-[250px] truncate bg-transparent text-lg font-extrabold text-slate-900 outline-none placeholder:text-slate-600/70 md:text-xl"
            />

            <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <span>Bem-vinda ao PlanejAI</span>

              <Heart
                size={15}
                className="fill-emerald-600 text-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <Link
            href="/meus-planos"
            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-4 py-2.5 font-bold text-emerald-700 shadow-md transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
          >
            <FolderOpen size={19} />
            <span>Meus Planos</span>
          </Link>

          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/80 bg-white/90 px-4 py-2.5 font-bold text-emerald-700 shadow-md transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={19} />
            <span>{saindo ? "Saindo..." : "Sair"}</span>
          </button>

        </div>
      </div>
    </header>
  );
}