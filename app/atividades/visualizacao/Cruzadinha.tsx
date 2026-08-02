"use client";

type ExercicioCruzadinha = {
  id: string;
  palavras: string[];
  pistas: string[];
  grade: string[];
};

type Props = {
  exercicio: ExercicioCruzadinha;
};

function separarCelulas(linha: string) {
  const texto = linha.trim();

  if (!texto) return [];

  if (texto.includes(" ")) {
    return texto.split(/\s+/).filter(Boolean);
  }

  return texto.split("");
}

function ehCelulaBloqueada(valor: string) {
  return (
    valor === "#" ||
    valor === "■" ||
    valor === "X" ||
    valor === "0"
  );
}

export default function Cruzadinha({
  exercicio,
}: Props) {
  return (
    <div className="mt-4">
      {exercicio.grade.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mx-auto w-fit">
            <div className="space-y-1">
              {exercicio.grade.map((linha, linhaIndice) => {
                const celulas = separarCelulas(linha);

                return (
                  <div
                    key={`${exercicio.id}-linha-${linhaIndice}`}
                    className="flex gap-1"
                  >
                    {celulas.map((celula, colunaIndice) => {
                      const bloqueada =
                        ehCelulaBloqueada(celula);

                      return (
                        <div
                          key={`${exercicio.id}-${linhaIndice}-${colunaIndice}`}
                          className={
                            bloqueada
                              ? "h-9 w-9 rounded-sm bg-slate-800 sm:h-10 sm:w-10"
                              : "flex h-9 w-9 items-center justify-center rounded-sm border border-slate-400 bg-white font-mono text-sm font-bold uppercase text-slate-900 sm:h-10 sm:w-10 sm:text-base"
                          }
                        >
                          {!bloqueada &&
                            celula !== "." &&
                            celula !== "_" &&
                            celula}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-center text-sm font-semibold text-amber-800">
          A grade da cruzadinha ainda não foi gerada.
        </div>
      )}

      {exercicio.pistas.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 font-bold text-slate-900">
            Pistas
          </p>

          <div className="space-y-2">
            {exercicio.pistas.map((pista, indice) => (
              <p
                key={`${exercicio.id}-pista-${indice}`}
                className="leading-6 text-slate-800"
              >
                <strong>{indice + 1}.</strong> {pista}
              </p>
            ))}
          </div>
        </div>
      )}

      {exercicio.palavras.length > 0 && (
        <details className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <summary className="cursor-pointer font-bold text-emerald-800">
            Ver palavras da cruzadinha
          </summary>

          <div className="mt-3 flex flex-wrap gap-2">
            {exercicio.palavras.map((palavra) => (
              <span
                key={palavra}
                className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm"
              >
                {palavra}
              </span>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}