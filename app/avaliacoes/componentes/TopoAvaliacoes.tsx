"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type TopoAvaliacoesProps = {
  destinoVoltar?: string;
  textoVoltar?: string;
};

export default function TopoAvaliacoes({
  destinoVoltar = "/",
  textoVoltar = "Voltar",
}: TopoAvaliacoesProps) {
  const router = useRouter();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-3">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => router.push(destinoVoltar)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-green-50 hover:text-green-800"
          >
            <ArrowLeft size={18} />
            {textoVoltar}
          </button>
        </div>

        <div className="text-center">
          <span className="text-xl font-extrabold text-slate-900">
            Planej<span className="text-green-600">AI</span>
          </span>
        </div>

        <div />
      </div>
    </header>
  );
}