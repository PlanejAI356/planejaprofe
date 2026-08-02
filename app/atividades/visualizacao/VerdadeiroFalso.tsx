"use client";

type ItemVerdadeiroFalso = {
  id: string;
  texto: string;
  verdadeiro: boolean | null;
};

type ExercicioVerdadeiroFalso = {
  itens: ItemVerdadeiroFalso[];
};

type Props = {
  exercicio: ExercicioVerdadeiroFalso;
};

export default function VerdadeiroFalso({
  exercicio,
}: Props) {
  return (
    <div className="mt-4 space-y-3">
      {exercicio.itens.map((item, indice) => (
        <div
          key={item.id}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <p className="leading-7 text-slate-900">
            <span className="mr-2 font-semibold">
              {indice + 1}.
            </span>

            <span className="mr-3 inline-block font-bold">
              ( &nbsp;&nbsp;&nbsp;&nbsp; )
            </span>

            {item.texto}
          </p>
        </div>
      ))}

      {exercicio.itens.length === 0 && (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-center text-sm font-semibold text-amber-800">
          As afirmativas ainda não foram geradas.
        </div>
      )}
    </div>
  );
}