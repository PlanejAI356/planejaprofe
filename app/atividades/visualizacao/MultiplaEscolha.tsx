"use client";

type ItemMultiplaEscolha = {
  id: string;
  texto: string;
  alternativas: string[];
};

type ExercicioMultiplaEscolha = {
  itens: ItemMultiplaEscolha[];
};

type Props = {
  exercicio: ExercicioMultiplaEscolha;
};

export default function MultiplaEscolha({
  exercicio,
}: Props) {
  return (
    <div className="mt-4 space-y-4">
      {exercicio.itens.map((item, indice) => (
        <div
          key={item.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <p className="font-semibold leading-7 text-slate-900">
            {indice + 1}. {item.texto}
          </p>

          {item.alternativas.length > 0 ? (
            <div className="mt-3 space-y-2">
              {item.alternativas.map(
                (alternativa, alternativaIndice) => (
                  <div
                    key={`${item.id}-${alternativaIndice}`}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800"
                  >
                    (
                    {String.fromCharCode(
                      65 + alternativaIndice
                    )}
                    ) {alternativa}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              As alternativas ainda não foram geradas.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}