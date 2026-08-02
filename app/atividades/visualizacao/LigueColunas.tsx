"use client";

type ItemLigue = {
  id: string;
  texto: string;
  colunaA: string;
  colunaB: string;
};

type ExercicioLigue = {
  itens: ItemLigue[];
};

type Props = {
  exercicio: ExercicioLigue;
};

export default function LigueColunas({
  exercicio,
}: Props) {
  return (
    <div className="mt-4 grid gap-5 md:grid-cols-2">
      <div className="space-y-3">
        <p className="text-center text-sm font-bold text-slate-700">
          COLUNA A
        </p>

        {exercicio.itens.map((item, indice) => (
          <div
            key={`${item.id}-a`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            {indice + 1}. {item.colunaA || item.texto}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm font-bold text-slate-700">
          COLUNA B
        </p>

        {exercicio.itens.map((item, indice) => (
          <div
            key={`${item.id}-b`}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            {String.fromCharCode(65 + indice)}. {item.colunaB}
          </div>
        ))}
      </div>
    </div>
  );
}