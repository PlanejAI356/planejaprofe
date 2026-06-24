"use client";

import { useState } from "react";

type DataAula = {
  data: string;
  aulas: number;
};

type CalendarioProps = {
  ano: string;
  mesSelecionado: number;
  nomeMes: string;
  tipoPlanejamento: string;
  onContinuar: (datas: DataAula[]) => void;
  onVoltar: () => void;
};

export default function Calendario({
  ano,
  mesSelecionado,
  nomeMes,
  tipoPlanejamento,
  onContinuar,
  onVoltar,
}: CalendarioProps) {
  const [datas, setDatas] = useState<DataAula[]>([]);

  function quantidadeDiasDoMes() {
    return new Date(Number(ano), mesSelecionado, 0).getDate();
  }

  function espacosAntesDoPrimeiroDia() {
    const primeiroDia = new Date(Number(ano), mesSelecionado - 1, 1).getDay();
    return primeiroDia === 0 ? 6 : primeiroDia - 1;
  }

  function formatarData(dia: number) {
    const diaFormatado = String(dia).padStart(2, "0");
    const mesFormatado = String(mesSelecionado).padStart(2, "0");

    return `${diaFormatado}/${mesFormatado}/${ano}`;
  }

 function selecionarData(dia: number) {
  const data = formatarData(dia);
  const existe = datas.find((item) => item.data === data);

  if (tipoPlanejamento === "mensal") {
    if (existe) {
      setDatas(datas.filter((item) => item.data !== data));
    } else {
      setDatas([...datas, { data, aulas: 1 }]);
    }
    return;
  }

  if (existe) {
    setDatas(
      datas.map((item) =>
        item.data === data ? { ...item, aulas: item.aulas + 1 } : item
      )
    );
  } else {
    setDatas([...datas, { data, aulas: 1 }]);
  }
}

  function removerAula(dia: number) {
    const data = formatarData(dia);

    setDatas(
      datas
        .map((item) =>
          item.data === data ? { ...item, aulas: item.aulas - 1 } : item
        )
        .filter((item) => item.aulas > 0)
    );
  }

  function dadosDoDia(dia: number) {
    return datas.find((item) => item.data === formatarData(dia));
  }

  function corDoDia(dia: number) {
    const dataAtual = new Date(Number(ano), mesSelecionado - 1, dia);
    const diaSemana = dataAtual.getDay();
    const selecionado = dadosDoDia(dia);

    if (selecionado) return "bg-green-600 text-white";
    if (diaSemana === 6) return "bg-yellow-200";
    if (diaSemana === 0) return "bg-red-100 text-red-700";

    return "bg-slate-100";
  }

  function continuar() {
    if (datas.length === 0) {
      alert("Selecione pelo menos uma data de aula.");
      return;
    }

    onContinuar(datas);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">
        Calendário de {nomeMes} de {ano}
      </h1>

      <p className="mb-6 text-slate-600">
  {tipoPlanejamento === "aula"
    ? "Clique no dia para adicionar uma aula. Use + para duplicar e - para remover."
    : "Selecione os dias que fazem parte do período do planejamento mensal."}
</p>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center font-bold text-sm">
        <div>SEG</div>
        <div>TER</div>
        <div>QUA</div>
        <div>QUI</div>
        <div>SEX</div>
        <div className="text-yellow-700">SÁB</div>
        <div className="text-red-700">DOM</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: espacosAntesDoPrimeiroDia() }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from(
          { length: quantidadeDiasDoMes() },
          (_, index) => index + 1
        ).map((dia) => {
          const item = dadosDoDia(dia);

          return (
            <button
              key={dia}
              onClick={() => selecionarData(dia)}
              className={`min-h-[70px] rounded-xl p-2 text-center cursor-pointer ${corDoDia(
                dia
              )}`}
            >
              <div className="font-semibold">{dia}</div>

             {tipoPlanejamento === "aula" && item && (
                <div className="text-xs mt-1">
                  <div>{item.aulas} aula(s)</div>

                  <div className="flex justify-center gap-1 mt-1">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removerAula(dia);
                      }}
                      className="bg-white text-black px-2 rounded cursor-pointer"
                    >
                      -
                    </span>

                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        selecionarData(dia);
                      }}
                      className="bg-white text-black px-2 rounded cursor-pointer"
                    >
                      +
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm">
        <p>🟨 Sábado</p>
        <p>🟥 Domingo</p>
        <p>🟩 Data selecionada</p>
      </div>

      {datas.length > 0 && (
  <div className="mt-6 bg-slate-100 p-4 rounded-xl">
    {tipoPlanejamento === "mensal" ? (
      <>
        <h2 className="font-bold mb-2">Período selecionado:</h2>

        <p>
          {datas
            .map((item) => item.data)
            .sort()[0]}
          {" à "}
          {datas
            .map((item) => item.data)
            .sort()
            .at(-1)}
        </p>
      </>
    ) : (
      <>
        <h2 className="font-bold mb-2">Datas selecionadas:</h2>

        {datas.map((item) => (
          <p key={item.data}>
            {item.data} — {item.aulas} aula(s)
          </p>
        ))}
      </>
    )}
  </div>
)}

      <div className="grid md:grid-cols-2 gap-3 mt-6">
        <button
          onClick={onVoltar}
          className="bg-slate-300 text-black px-6 py-3 rounded-xl w-full cursor-pointer"
        >
          Voltar para Configuração
        </button>

        <button
          onClick={continuar}
          className="bg-green-600 text-white px-6 py-3 rounded-xl w-full font-semibold cursor-pointer"
        >
          Continuar para os Conteúdos
        </button>
      </div>
    </div>
  );
}