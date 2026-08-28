"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  FileText,
  FolderOpen,
  Heart,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function TopoProfessor() {
  const [nome, setNome] = useState("");
  const [carregandoNome, setCarregandoNome] =
    useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    async function carregarNomeProfessor() {
      try {
        const {
          data: { user },
          error: erroUsuario,
        } = await supabase.auth.getUser();

        if (erroUsuario) {
          console.error(
            "Erro ao identificar professor:",
            erroUsuario
          );
        }

        if (!user) {
          setNome("");
          return;
        }

        /*
         * 1. Tenta buscar o nome salvo em profiles.
         */
        const {
          data: perfil,
          error: erroPerfil,
        } = await supabase
          .from("profiles")
          .select("nome")
          .eq("id", user.id)
          .maybeSingle();

        if (erroPerfil) {
          console.error(
            "Erro ao buscar nome no perfil:",
            erroPerfil
          );
        }

        const nomePerfil =
          typeof perfil?.nome === "string"
            ? perfil.nome.trim()
            : "";

        /*
         * 2. Se não encontrar em profiles,
         * usa o nome salvo no cadastro do Supabase Auth.
         */
        const nomeMetadata =
          typeof user.user_metadata?.nome === "string"
            ? user.user_metadata.nome.trim()
            : "";

        /*
         * 3. Último fallback: nome antigo do localStorage.
         */
        const nomeLocal =
          typeof window !== "undefined"
            ? (
                localStorage.getItem("nomeProfessor") ||
                ""
              ).trim()
            : "";

        const nomeFinal =
          nomePerfil ||
          nomeMetadata ||
          nomeLocal ||
          "Professor(a)";

        setNome(nomeFinal);

        /*
         * Mantém uma cópia local apenas como reserva.
         */
        localStorage.setItem(
          "nomeProfessor",
          nomeFinal
        );
      } catch (error) {
        console.error(
          "Erro inesperado ao carregar nome do professor:",
          error
        );

        const nomeLocal =
          localStorage.getItem("nomeProfessor") ||
          "";

        setNome(
          nomeLocal.trim() || "Professor(a)"
        );
      } finally {
        setCarregandoNome(false);
      }
    }

    carregarNomeProfessor();
  }, []);

  async function sair() {
    try {
      setSaindo(true);

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        alert(
          "Não foi possível sair. Tente novamente."
        );
        return;
      }

      localStorage.removeItem(
        "nomeProfessor"
      );

      window.location.href = "/";
    } catch (error) {
      console.error(
        "Erro ao sair:",
        error
      );

      alert(
        "Não foi possível sair. Tente novamente."
      );
    } finally {
      setSaindo(false);
    }
  }

  const inicial =
    nome &&
    nome !== "Professor(a)"
      ? nome.charAt(0).toUpperCase()
      : "P";

  return (
    <header className="relative z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        {/* LOGO + PROFESSOR */}
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
          >
            <img
              src="/logo-planejai-nova.png"
              alt="PlanejAI"
              className="h-12 w-12 object-contain"
            />

            <span className="hidden text-2xl font-black tracking-tight text-[#071c4d] sm:inline">
              Planej
              <span className="text-green-600">
                AI
              </span>
            </span>
          </Link>

          <div className="hidden h-10 w-px bg-slate-200 sm:block" />

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-50 shadow-sm">
              <span className="text-xl font-black text-[#071c4d]">
                {inicial}
              </span>
            </div>

            <div className="min-w-0">
              <p className="max-w-[260px] truncate text-lg font-black text-[#071c4d] sm:text-xl">
                {carregandoNome
                  ? "Carregando..."
                  : nome}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <span>
                  Bem-vindo(a) ao PlanejAI
                </span>

                <Heart
                  size={15}
                  className="fill-green-600 text-green-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/meus-planos"
            className="flex shrink-0 items-center gap-2 rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm font-extrabold text-green-700 shadow-sm transition hover:-translate-y-0.5 hover:border-green-400 hover:bg-green-50 hover:shadow-md sm:px-4"
          >
            <FolderOpen size={18} />
            <span className="hidden md:inline">
              Meus Planos
            </span>
            <span className="md:hidden">
              Planos
            </span>
          </Link>

          <Link
            href="/avaliacoes/minhas"
            className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-extrabold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md sm:px-4"
          >
            <ClipboardList size={18} />
            <span className="hidden md:inline">
              Minhas Avaliações
            </span>
            <span className="md:hidden">
              Avaliações
            </span>
          </Link>

          <Link
            href="/atividades/minhas"
            className="flex shrink-0 items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm font-extrabold text-orange-600 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-50 hover:shadow-md sm:px-4"
          >
            <FileText size={18} />
            <span className="hidden md:inline">
              Minhas Atividades
            </span>
            <span className="md:hidden">
              Atividades
            </span>
          </Link>

          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            <LogOut size={18} />
            <span>
              {saindo
                ? "Saindo..."
                : "Sair"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
