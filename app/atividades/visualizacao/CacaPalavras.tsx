"use client";

type ExercicioCacaPalavras = {
  id: string;
  palavras: string[];
  grade: string[];
};

type Props = {
  exercicio: ExercicioCacaPalavras;
};

function separarLetras(linha: string) {
  const possuiEspacos = linha.trim().includes(" ");

  if (possuiEspacos) {
    return linha
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  return linha
    .trim()
    .split("")
    .filter(Boolean);
}

export default function CacaPalavras({
  exercicio,
}: Props) {
  return (
    <div className="mt-4">
      {exercicio.palavras.length > 0 && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-3 text-sm font-bold text-emerald-900">
            Palavras para encontrar
          </p>

          <div className="flex flex-wrap gap-2">
            {exercicio.palavras.map((palavra) => (
              <span
                key={palavra}
                className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm"
              >
                {palavra}
              </span>
            ))}
          </div>
        </div>
      )}

      {exercicio.grade.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mx-auto w-fit">
            <div className="space-y-1">
              {exercicio.grade.map((linha, linhaIndice) => {
                const letras = separarLetras(linha);

                return (
                  <div
                    key={`${exercicio.id}-linha-${linhaIndice}`}
                    className="flex gap-1"
                  >
                    {letras.map((letra, colunaIndice) => (
                      <div
                        key={`${exercicio.id}-${linhaIndice}-${colunaIndice}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-50 font-mono text-sm font-bold uppercase text-slate-900 sm:h-10 sm:w-10 sm:text-base"
                      >
                        {letra}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-center text-sm font-semibold text-amber-800">
          A grade do caça-palavras ainda não foi gerada.
        </div>
      )}
    </div>
  );
}