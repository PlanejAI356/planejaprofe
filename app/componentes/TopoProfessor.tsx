"use client";

import { useEffect, useState } from "react";
import { ClipboardList, FileText, FolderOpen, Heart, LogOut } from "lucide-react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function TopoProfessor() {
  const [nome, setNome] = useState("Professor(a)");
  const [carregando, setCarregando] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    async function carregarNome() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data: perfil } = await supabase
          .from("profiles")
          .select("nome")
          .eq("id", user.id)
          .maybeSingle();

        const nomeFinal =
          perfil?.nome?.trim() ||
          user.user_metadata?.nome?.trim() ||
          localStorage.getItem("nomeProfessor")?.trim() ||
          "Professor(a)";

        setNome(nomeFinal);
        localStorage.setItem("nomeProfessor", nomeFinal);
      } catch {
        setNome(localStorage.getItem("nomeProfessor")?.trim() || "Professor(a)");
      } finally {
        setCarregando(false);
      }
    }

    carregarNome();
  }, []);

  async function sair() {
    try {
      setSaindo(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("Não foi possível sair. Tente novamente.");
        return;
      }

      localStorage.removeItem("nomeProfessor");
      window.location.href = "/";
    } finally {
      setSaindo(false);
    }
  }

  const inicial = nome !== "Professor(a)" ? nome.charAt(0).toUpperCase() : "P";

  const botao =
    "flex shrink-0 items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-sm font-extrabold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-4";

  return (
    <header className="relative z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo-planejai-nova.png" alt="PlanejAI" className="h-12 w-12 object-contain" />
            <span className="hidden text-2xl font-black text-[#071c4d] sm:inline">
              Planej<span className="text-green-600">AI</span>
            </span>
          </Link>

          <div className="hidden h-10 w-px bg-slate-200 sm:block" />

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-50 shadow-sm">
              <span className="text-xl font-black text-[#071c4d]">{inicial}</span>
            </div>

            <div className="min-w-0">
              <p className="max-w-[260px] truncate text-lg font-black text-[#071c4d] sm:text-xl">
                {carregando ? "Carregando..." : nome}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <span>Bem-vindo(a) ao PlanejAI</span>
                <Heart size={15} className="fill-green-600 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href="/meus-planos" className={`${botao} border-green-200 text-green-700 hover:bg-green-50`}>
            <FolderOpen size={18} />
            <span className="hidden md:inline">Meus Planos</span>
            <span className="md:hidden">Planos</span>
          </Link>

          <Link href="/avaliacoes/minhas-atividades" className={`${botao} border-blue-200 text-blue-700 hover:bg-blue-50`}>
            <ClipboardList size={18} />
            <span className="hidden md:inline">Minhas Avaliações</span>
            <span className="md:hidden">Avaliações</span>
          </Link>

          <Link href="/atividades/minhas-atividades" className={`${botao} border-orange-200 text-orange-600 hover:bg-orange-50`}>
            <FileText size={18} />
            <span className="hidden md:inline">Minhas Atividades</span>
            <span className="md:hidden">Atividades</span>
          </Link>

          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className={`${botao} border-slate-200 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <LogOut size={18} />
            <span>{saindo ? "Saindo..." : "Sair"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}