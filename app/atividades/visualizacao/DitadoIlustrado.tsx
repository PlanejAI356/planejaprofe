"use client";

import { ImageIcon } from "lucide-react";

type ItemDitado = {
  id: string;
  texto: string;
  imagemNecessaria: boolean;
  imagemDescricao: string;
  imagemUrl?: string;
};

type ExercicioDitado = {
  itens: ItemDitado[];
};

type Props = {
  exercicio: ExercicioDitado;
};

function ImagemPequena({
  item,
}: {
  item: ItemDitado;
}) {
  if (item.imagemUrl) {
    return (
      <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
        <img
          src={item.imagemUrl}
          alt={item.imagemDescricao || item.texto}
          className="max-h-24 max-w-24 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50 text-blue-600">
      <div className="px-2 text-center">
        <ImageIcon className="mx-auto" size={25} />

        <p className="mt-1 text-xs font-semibold">
          Imagem pequena
        </p>
      </div>
    </div>
  );
}

export default function DitadoIlustrado({
  exercicio,
}: Props) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {exercicio.itens.map((item, indice) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex justify-center">
            <ImagemPequena item={item} />
          </div>

          <p className="mt-3 text-center text-sm font-semibold text-slate-500">
            {indice + 1}
          </p>

          <div className="mt-3 h-7 border-b border-slate-500" />
        </div>
      ))}
    </div>
  );
}