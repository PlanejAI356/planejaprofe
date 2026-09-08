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
  const quantidade = exercicio.itens.length;

  const colunas =
    quantidade >= 16
      ? "grid-cols-4"
      : quantidade >= 9
      ? "grid-cols-3"
      : quantidade >= 5
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2";

  return (
    <div className={`mt-4 grid gap-4 ${colunas}`}>
      {exercicio.itens.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-3"
        >
          <ImagemPequena item={item} />

          <div
            className="mt-3 h-11 w-full rounded-md border-2 border-slate-500 bg-white"
            aria-label="Espaço para escrever o nome da imagem"
          />
        </div>
      ))}
    </div>
  );
}