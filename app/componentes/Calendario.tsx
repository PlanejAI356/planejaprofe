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
    return new Date(Number(ano), mesSelecionado + 1, 0).getDate();
  }

  function espacosAntesDoPrimeiroDia() {
    const primeiroDia = new Date(Number(ano), mesSelecionado, 1).getDay();
    return primeiroDia === 0 ? 6 : primeiroDia - 1;
  }

  function formatarData(dia: number) {
    const diaFormatado = String(dia).padStart(2, "0");
    const mesFormatado = String(mesSelecionado + 1).padStart(2, "0");
    return `${diaFormatado}/${mesFormatado}/${ano}`;
  }

  function converterParaDate(data: string) {
    const [dia, mes, anoData] = data.split("/").map(Number);
    return new Date(anoData, mes - 1, dia);
  }

  function obterDiaDaSemana(data: string) {
    const nomes = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
    return nomes[converterParaDate(data).getDay()];
  }

  function ehFimDeSemana(dia: number) {
    const diaSemana = new Date(Number(ano), mesSelecionado, dia).getDay();
    return diaSemana === 0 || diaSemana === 6;
  }

  function ordenarDatas(lista: DataAula[]) {
    return [...lista].sort(
      (a, b) =>
        converterParaDate(a.data).getTime() -
        converterParaDate(b.data).getTime()
    );
  }

  function criarPeriodoMensal(dataInicial: string, dataFinal: string) {
    const inicioOriginal = converterParaDate(dataInicial);
    const fimOriginal = converterParaDate(dataFinal);

    const inicio =
      inicioOriginal.getTime() <= fimOriginal.getTime()
        ? inicioOriginal
        : fimOriginal;

    const fim =
      inicioOriginal.getTime() <= fimOriginal.getTime()
        ? fimOriginal
        : inicioOriginal;

    const periodo: DataAula[] = [];
    const dataAtual = new Date(inicio);

    while (dataAtual.getTime() <= fim.getTime()) {
      const diaSemana = dataAtual.getDay();

      if (diaSemana !== 0 && diaSemana !== 6) {
        const dia = String(dataAtual.getDate()).padStart(2, "0");
        const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
        const anoAtual = dataAtual.getFullYear();

        periodo.push({
          data: `${dia}/${mes}/${anoAtual}`,
          aulas: 1,
        });
      }

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return periodo;
  }

  function selecionarData(dia: number) {
    const data = formatarData(dia);
    const existe = datas.find((item) => item.data === data);

    if (tipoPlanejamento === "mensal") {
      if (ehFimDeSemana(dia)) {
        return;
      }

      if (datas.length === 0 || datas.length > 1) {
        setDatas([{ data, aulas: 1 }]);
        return;
      }

      const dataInicial = datas[0].data;
      setDatas(criarPeriodoMensal(dataInicial, data));
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

  function removerData(data: string) {
    setDatas(datas.filter((item) => item.data !== data));
  }

  function adicionarAulaPorData(data: string) {
    setDatas(
      datas.map((item) =>
        item.data === data ? { ...item, aulas: item.aulas + 1 } : item
      )
    );
  }

  function removerAulaPorData(data: string) {
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
    const dataAtual = new Date(Number(ano), mesSelecionado, dia);
    const diaSemana = dataAtual.getDay();
    const selecionado = dadosDoDia(dia);

    if (tipoPlanejamento === "mensal" && diaSemana === 6) {
      return "bg-amber-100 text-amber-800 cursor-not-allowed";
    }

    if (tipoPlanejamento === "mensal" && diaSemana === 0) {
      return "bg-red-50 text-red-600 cursor-not-allowed";
    }

    if (selecionado) {
      return "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200";
    }

    if (diaSemana === 6) return "bg-amber-100 text-amber-800";
    if (diaSemana === 0) return "bg-red-50 text-red-600";

    return "bg-white hover:bg-emerald-50 hover:border-emerald-200";
  }

  function continuar() {
    if (datas.length === 0) {
      alert(
        tipoPlanejamento === "mensal"
          ? "Selecione a data inicial e a data final do período."
          : "Selecione pelo menos uma data de aula."
      );
      return;
    }

    if (tipoPlanejamento === "mensal" && datas.length === 1) {
      alert("Agora selecione a data final do período mensal.");
      return;
    }

    onContinuar(ordenarDatas(datas));
  }

  const datasOrdenadas = ordenarDatas(datas);
  const totalAulas = datas.reduce((soma, item) => soma + item.aulas, 0);
  const primeiraData = datasOrdenadas[0]?.data || "";
  const ultimaData = datasOrdenadas[datasOrdenadas.length - 1]?.data || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 p-3 md:p-5">
      <div className="max-w-7xl mx-auto rounded-[30px] border border-emerald-200 bg-white p-3 md:p-4 shadow-2xl shadow-emerald-200/60">

        <div className="mb-3 mt-3 text-center">
          <h1 className="text-xl font-extrabold text-slate-900 md:text-2xl">
            Calendário de {nomeMes} de {ano}
          </h1>

          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            {tipoPlanejamento === "aula"
              ? "Clique no dia para adicionar uma aula. Use + para duplicar e - para remover."
              : "Clique primeiro na data inicial e depois na data final. Sábados e domingos não serão incluídos."}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.35fr_0.85fr]">
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 shadow-sm">
            <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-600 md:text-xs">
              <div>SEG</div>
              <div>TER</div>
              <div>QUA</div>
              <div>QUI</div>
              <div>SEX</div>
              <div className="text-amber-700">SÁB</div>
              <div className="text-red-700">DOM</div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: espacosAntesDoPrimeiroDia() }).map(
                (_, index) => (
                  <div key={`empty-${index}`} />
                )
              )}

              {Array.from(
                { length: quantidadeDiasDoMes() },
                (_, index) => index + 1
              ).map((dia) => {
                const item = dadosDoDia(dia);
                const fimDeSemanaMensal =
                  tipoPlanejamento === "mensal" && ehFimDeSemana(dia);

                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => selecionarData(dia)}
                    disabled={fimDeSemanaMensal}
                    className={`min-h-[52px] rounded-xl border border-slate-100 p-1 text-center transition-all ${
                      fimDeSemanaMensal
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:-translate-y-0.5"
                    } ${corDoDia(dia)}`}
                  >
                    <div className="text-xl font-black text-slate-900 md:text-2xl">
  {dia}
</div>

                    {tipoPlanejamento === "aula" && item && (
                      <div className="mt-0.5 text-[10px] leading-tight">
                        <div className="font-semibold">
                          {item.aulas} aula(s)
                        </div>

                        <div className="mt-0.5 flex justify-center gap-1">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removerAula(dia);
                            }}
                            className="cursor-pointer rounded bg-white px-1.5 py-0.5 font-bold text-slate-800 shadow-sm"
                          >
                            -
                          </span>

                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              selecionarData(dia);
                            }}
                            className="cursor-pointer rounded bg-white px-1.5 py-0.5 font-bold text-emerald-700 shadow-sm"
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

            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg bg-amber-100 p-1.5 text-center font-semibold text-amber-800">
                Sábado
              </div>

              <div className="rounded-lg bg-red-50 p-1.5 text-center font-semibold text-red-600">
                Domingo
              </div>

              <div className="rounded-lg bg-emerald-600 p-1.5 text-center font-semibold text-white">
                Selecionada
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Datas selecionadas
                </h2>

                <p className="text-xs text-slate-500">
                  {tipoPlanejamento === "mensal"
                    ? datas.length > 1
                      ? `${primeiraData} à ${ultimaData}`
                      : datas.length === 1
                      ? `Início: ${primeiraData}. Selecione a data final.`
                      : "Nenhum período selecionado"
                    : `${datas.length} dia(s) • ${totalAulas} aula(s)`}
                </p>
              </div>

              {datas.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDatas([])}
                  className="cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Limpar
                </button>
              )}
            </div>

            {datas.length === 0 ? (
              <div className="flex min-h-[210px] items-center justify-center rounded-xl border border-dashed border-emerald-200 bg-white text-center text-sm text-slate-400">
                <p>
                  Nenhuma data selecionada.
                  <br />
                  {tipoPlanejamento === "mensal"
                    ? "Clique na data inicial do período."
                    : "Clique em um dia no calendário."}
                </p>
              </div>
            ) : tipoPlanejamento === "mensal" ? (
              <div className="flex min-h-[210px] flex-col justify-center gap-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-emerald-50 p-3 text-center text-emerald-700">
                    <div className="text-[10px] font-bold uppercase">
                      Início
                    </div>
                    <div className="mt-1 text-base font-extrabold">
                      {primeiraData}
                    </div>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-center text-blue-700">
                    <div className="text-[10px] font-bold uppercase">Fim</div>
                    <div className="mt-1 text-base font-extrabold">
                      {datas.length > 1 ? ultimaData : "Selecione"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-center text-xs text-emerald-800">
                  {datas.length > 1 ? (
                    <>
                      <strong>{datas.length} dias úteis selecionados.</strong>
                      <br />
                      Sábados e domingos não fazem parte do período.
                    </>
                  ) : (
                    <strong>Agora clique na data final do período.</strong>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                {datasOrdenadas.map((item) => (
                  <div
                    key={item.data}
                    className="rounded-xl border border-emerald-100 bg-white p-2 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-[92px] rounded-lg bg-emerald-50 px-2 py-1 text-center text-emerald-700">
                        <div className="text-[10px] font-bold">
                          {obterDiaDaSemana(item.data)}
                        </div>
                        <div className="text-sm font-extrabold">
                          {item.data}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removerData(item.data)}
                        className="cursor-pointer text-sm font-bold text-red-500 hover:text-red-700"
                        aria-label={`Remover ${item.data}`}
                      >
                        🗑
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        {item.aulas} aula(s)
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => removerAulaPorData(item.data)}
                          className="h-7 w-7 cursor-pointer rounded-lg border border-slate-200 bg-white text-sm font-bold hover:bg-slate-50"
                        >
                          -
                        </button>

                        <span className="w-4 text-center text-sm font-extrabold">
                          {item.aulas}
                        </span>

                        <button
                          type="button"
                          onClick={() => adicionarAulaPorData(item.data)}
                          className="h-7 w-7 cursor-pointer rounded-lg border border-emerald-200 bg-white text-sm font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {datas.length > 0 && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-xs text-slate-700">
                {tipoPlanejamento === "mensal" ? (
                  <p>
                    <strong>Período:</strong> {primeiraData}
                    {datas.length > 1 ? ` à ${ultimaData}` : ""}
                  </p>
                ) : (
                  <p>
                    <strong>Resumo:</strong> {datas.length} dia(s) selecionado(s)
                    e {totalAulas} aula(s) no total.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <button
            type="button"
            onClick={onVoltar}
            className="w-full cursor-pointer rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 font-bold text-emerald-800 hover:bg-emerald-100"
          >
            ← Voltar para Configuração
          </button>

          <button
            type="button"
            onClick={continuar}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-emerald-200 transition hover:scale-[1.01]"
          >
            Continuar para os Conteúdos →
          </button>
        </div>
      </div>
    </div>
  );
}