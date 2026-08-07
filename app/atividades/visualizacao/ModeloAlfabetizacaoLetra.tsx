"use client";

type ItemImagem = {
  palavra: string;
  imagemUrl?: string;
};

type ItemComplete = {
  palavraCompleta: string;
  palavraIncompleta: string;
  imagemUrl?: string;
};

type Alternativa = {
  texto: string;
  correta: boolean;
};

type Props = {
  letra: string;
  imagensIniciais: ItemImagem[];
  ligar: ItemImagem[];
  completar: ItemComplete[];
  alternativas: Alternativa[];
  frases: string[];
};

function LetraPontilhada({
  letra,
  grande = false,
}: {
  letra: string;
  grande?: boolean;
}) {
  const tamanho = grande ? 180 : 72;
  const largura = grande ? 190 : 78;
  const altura = grande ? 210 : 90;

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      className={
        grande
          ? "h-[190px] w-[180px]"
          : "h-[78px] w-[70px]"
      }
      aria-label={`Letra ${letra} pontilhada`}
    >
      <text
        x={largura / 2}
        y={grande ? 165 : 67}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="600"
        fontSize={tamanho}
        fill="transparent"
        stroke="#111827"
        strokeWidth={grande ? 2.4 : 1.5}
        strokeDasharray={grande ? "7 7" : "4 4"}
        strokeLinecap="round"
      >
        {letra}
      </text>
    </svg>
  );
}

function Imagem({
  url,
  nome,
  tamanho = "normal",
}: {
  url?: string;
  nome: string;
  tamanho?: "pequena" | "normal";
}) {
  const classe =
    tamanho === "pequena"
      ? "h-16 w-16"
      : "h-20 w-20";

  if (!url) {
    return (
      <div
        className={`${classe} flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-1 text-center text-[9px] leading-3 text-slate-400`}
      >
        {nome}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={nome}
      className={`${classe} object-contain`}
    />
  );
}

export default function ModeloAlfabetizacaoLetra({
  letra,
  imagensIniciais,
  ligar,
  completar,
  alternativas,
  frases,
}: Props) {
  const letraMaiuscula =
    letra.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="modelo-alfabetizacao grid grid-cols-2 gap-3 text-slate-950">
      {/* QUESTÃO 1 */}
      <section className="quadro-atividade min-h-[330px] rounded-2xl border-2 border-slate-900 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 font-bold">
            1
          </div>

          <h2 className="text-base font-bold leading-5">
            CUBRA O PONTILHADO DA LETRA {letraMaiuscula} E DEPOIS
            ESCREVA SOZINHO NAS LINHAS.
          </h2>
        </div>

        <div className="mt-3 grid grid-cols-[180px_1fr] items-center gap-2">
          <LetraPontilhada
            letra={letraMaiuscula}
            grande
          />

          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: 6 }).map((_, indice) => (
              <LetraPontilhada
                key={indice}
                letra={letraMaiuscula}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 space-y-5">
          <div className="border-b border-slate-900" />
          <div className="border-b border-slate-900" />
        </div>
      </section>

      {/* QUESTÃO 2 */}
      <section className="quadro-atividade min-h-[330px] rounded-2xl border-2 border-slate-900 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 font-bold">
            2
          </div>

          <h2 className="text-base font-bold leading-5">
            PINTE OS DESENHOS QUE COMEÇAM COM A LETRA {letraMaiuscula}.
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          {imagensIniciais.slice(0, 6).map((item, indice) => (
            <div
              key={`${item.palavra}-${indice}`}
              className="text-center"
            >
              <Imagem
                url={item.imagemUrl}
                nome={item.palavra}
              />

              <p className="mt-2 text-sm font-bold">
                {item.palavra}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* QUESTÃO 3 */}
      <section className="quadro-atividade min-h-[310px] rounded-2xl border-2 border-slate-900 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 font-bold">
            3
          </div>

          <h2 className="text-base font-bold leading-5">
            LIGUE AS FIGURAS ÀS PALAVRAS.
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-12 gap-y-4">
          <div className="space-y-4">
            {ligar.slice(0, 3).map((item, indice) => (
              <div
                key={`imagem-${item.palavra}-${indice}`}
                className="flex items-center gap-3"
              >
                <Imagem
                  url={item.imagemUrl}
                  nome={item.palavra}
                  tamanho="pequena"
                />

                <span className="h-3 w-3 rounded-full bg-slate-900" />
              </div>
            ))}
          </div>

          <div className="space-y-7">
            {[...ligar]
              .slice(0, 3)
              .reverse()
              .map((item, indice) => (
                <div
                  key={`palavra-${item.palavra}-${indice}`}
                  className="flex items-center gap-3"
                >
                  <span className="h-3 w-3 rounded-full bg-slate-900" />

                  <div className="flex-1 rounded-xl border-2 border-slate-900 px-3 py-2 text-center font-bold">
                    {item.palavra}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* QUESTÃO 4 */}
      <section className="quadro-atividade min-h-[310px] rounded-2xl border-2 border-slate-900 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 font-bold">
            4
          </div>

          <h2 className="text-base font-bold leading-5">
            COMPLETE AS PALAVRAS COM A LETRA {letraMaiuscula}.
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {completar.slice(0, 6).map((item, indice) => (
            <div
              key={`${item.palavraCompleta}-${indice}`}
              className="rounded-xl border-2 border-slate-900 p-2 text-center"
            >
              <Imagem
                url={item.imagemUrl}
                nome={item.palavraCompleta}
                tamanho="pequena"
              />

              <p className="mt-2 text-base font-bold tracking-wide">
                {item.palavraIncompleta}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* QUESTÃO 5 */}
      <section className="quadro-atividade min-h-[270px] rounded-2xl border-2 border-slate-900 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 font-bold">
            5
          </div>

          <h2 className="text-base font-bold leading-5">
            MARQUE UM X NA ALTERNATIVA CORRETA.
          </h2>
        </div>

        <div className="mt-5 space-y-4">
          {alternativas.slice(0, 3).map((item, indice) => (
            <div key={`${item.texto}-${indice}`}>
              <p className="font-bold">
                {String.fromCharCode(65 + indice)}) {item.texto}
              </p>

              <div className="mt-2 flex gap-8 pl-4">
                <span>( ) SIM</span>
                <span>( ) NÃO</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUESTÃO 6 */}
      <section className="quadro-atividade min-h-[270px] rounded-2xl border-2 border-slate-900 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 font-bold">
            6
          </div>

          <h2 className="text-base font-bold leading-5">
            LEIA AS FRASES E CIRCULE TODAS AS LETRAS {letraMaiuscula}.
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_90px] gap-4">
          <div className="space-y-2 text-sm leading-6">
            {frases.slice(0, 6).map((frase, indice) => (
              <p key={`${frase}-${indice}`}>
                {String.fromCharCode(65 + indice)}) {frase}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <div className="flex h-24 w-20 items-center justify-center rounded-[45%] border-2 border-slate-900 text-6xl font-bold">
              {letraMaiuscula}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}