"use client";

import { useEffect, useState } from "react";

export default function TopoProfessor() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    setNome(localStorage.getItem("nomeProfessor") || "");
  }, []);

  function salvarNome(valor: string) {
    setNome(valor);
    localStorage.setItem("nomeProfessor", valor);
  }

  const inicial = nome.trim()
    ? nome.trim().charAt(0).toUpperCase()
    : "P";

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-2">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-lg font-bold text-black">
              {inicial}
            </span>
          </div>

          <input
            value={nome}
            onChange={(e) => salvarNome(e.target.value)}
            placeholder="Nome do Professor"
            className="bg-transparent outline-none text-base font-semibold text-slate-800 placeholder:text-slate-400"
          />

        </div>

      </div>
    </header>
  );
}