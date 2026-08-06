type Props = {
  exercicio: {
    conteudoLivre?: string;
    titulo?: string;
    comando?: string;
  };
};

export default function LetraTracejada({
  exercicio,
}: Props) {
  const letra =
    (exercicio.conteudoLivre || "A")
      .trim()
      .charAt(0)
      .toUpperCase();

  return (
    <div className="space-y-6">

      {(exercicio.titulo || exercicio.comando) && (
        <div>
          {exercicio.titulo && (
            <h2 className="text-xl font-bold">
              {exercicio.titulo}
            </h2>
          )}

          {exercicio.comando && (
            <p className="mt-1 text-base">
              {exercicio.comando}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-center">

        <svg
          width="240"
          height="260"
          viewBox="0 0 240 260"
        >
          <text
            x="120"
            y="205"
            textAnchor="middle"
            fontFamily="Times New Roman"
            fontWeight="700"
            fontSize="220"
            fill="transparent"
            stroke="#000"
            strokeWidth="2"
            strokeDasharray="6 6"
          >
            {letra}
          </text>
        </svg>

      </div>

      <div className="grid grid-cols-4 gap-6 justify-items-center">

        {Array.from({ length: 8 }).map((_, index) => (
          <svg
            key={index}
            width="70"
            height="90"
            viewBox="0 0 70 90"
          >
            <text
              x="35"
              y="70"
              textAnchor="middle"
              fontFamily="Times New Roman"
              fontWeight="700"
              fontSize="70"
              fill="transparent"
              stroke="#000"
              strokeWidth="1.4"
              strokeDasharray="4 4"
            >
              {letra}
            </text>
          </svg>
        ))}

      </div>

      <div className="space-y-4 pt-3">

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-b border-slate-500 h-7"
          />
        ))}

      </div>

    </div>
  );
}