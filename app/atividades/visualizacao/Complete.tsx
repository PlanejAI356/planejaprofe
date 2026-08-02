"use client";

type ItemComplete = {
  id: string;
  texto: string;
  resposta: string;
};

type ExercicioComplete = {
  tipo: string;
  itens: ItemComplete[];
  palavras: string[];
};

type Props = {
  exercicio: ExercicioComplete;
};

function criarLacuna(texto: string, resposta: string) {
  if (!resposta.trim()) return texto;

  const respostaEscapada = resposta.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const regex = new RegExp(respostaEscapada, "gi");

  if (regex.test(texto)) {
    return texto.replace(regex, "________________");
  }

  return texto;
}

export default function CompletePalavras({
  exercicio,
}: Props) {
  return (
    <div className="mt-4">
      {exercicio.palavras.length > 0 && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-2 text-sm font-bold text-emerald-900">
            Banco de palavras
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

      <div className="space-y-3">
        {exercicio.itens.map((item, indice) => {
          const textoComLacuna = criarLacuna(
            item.texto,
            item.resposta
          );

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <p className="font-medium leading-7 text-slate-900">
                {indice + 1}. {textoComLacuna}
              </p>

              {!item.resposta && (
                <div className="mt-4 h-7 border-b border-slate-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}