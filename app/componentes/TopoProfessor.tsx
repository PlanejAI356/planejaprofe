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
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-2">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
            <User size={18} className="text-green-600" />
          </div>

          <input
            value={nome}
            onChange={(e) => salvarNome(e.target.value)}
            placeholder="Nome do Professor"
            className="bg-transparent outline-none text-base font-semibold text-slate-800 placeholder:text-slate-400"
          />

        </div>

        <img
          src="/logo-planejai.png"
          alt="PlanejAI"
          className="h-10 w-auto"
        />

      </div>
    </header>
  );
}