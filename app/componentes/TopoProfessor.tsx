"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function TopoProfessor() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    setNome(localStorage.getItem("nomeProfessor") || "");
  }, []);

  function salvarNome(valor: string) {
    setNome(valor);
    localStorage.setItem("nomeProfessor", valor);
  }

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-1.5">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <User size={16} className="text-green-600" />
          </div>

          <div className="leading-tight">
            <p className="text-[11px] text-slate-500">
              Professor(a)
            </p>

            <input
              value={nome}
              onChange={(e) => salvarNome(e.target.value)}
              placeholder="Digite seu nome"
              className="bg-transparent outline-none text-base font-semibold text-slate-800"
            />
          </div>

        </div>

        <h1 className="text-xl font-extrabold text-green-600">
          PlanejAI
        </h1>

      </div>
    </header>
  );
}