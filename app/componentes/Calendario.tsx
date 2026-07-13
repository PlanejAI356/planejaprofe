"use client";

import { useState } from "react";
import BarraProgresso from "./BarraProgresso";

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

      // No plano mensal, sábado e domingo não entram no período.
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

      // Primeiro clique: define o início do período.
      // Depois de um período completo, um novo clique inicia outra seleção.
      if (datas.length === 0 || datas.length > 1) {
        setDatas([{ data, aulas: 1 }]);
        return;
      }

      // Segundo clique: define o fim e preenche apenas os dias úteis.
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

    // No plano mensal, os fins de semana mantêm suas próprias cores.
    if (tipoPlanejamento === "mensal" && diaSemana === 6) {
      return "bg-yellow-100 text-yellow-800 cursor-not-allowed";
    }

    if (tipoPlanejamento === "mensal" && diaSemana === 0) {
      return "bg-red-50 text-red-600 cursor-not-allowed";
    }

    if (selecionado) return "bg-green-600 text-white shadow-md";
    if (diaSemana === 6) return "bg-yellow-100 text-yellow-800";
    if (diaSemana === 0) return "bg-red-50 text-red-600";

    return "bg-white hover:bg-blue-50";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-[32px] shadow-xl border border-slate-100 p-3 md:p-4">
        <BarraProgresso etapaAtual="calendario" />

        <div className="text-center mb-5">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
            Calendário de {nomeMes} de {ano}
          </h1>

          <p className="mt-2 text-slate-500 text-sm">
            {tipoPlanejamento === "aula"
              ? "Clique no dia para adicionar uma aula. Use + para duplicar e - para remover."
              : "Clique primeiro na data inicial e depois na data final. Sábados e domingos não serão incluídos."}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-4">
          <section className="bg-slate-50 border border-slate-100 rounded-3xl p-4">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center font-bold text-xs text-slate-600">
              <div>SEG</div>
              <div>TER</div>
              <div>QUA</div>
              <div>QUI</div>
              <div>SEX</div>
              <div className="text-yellow-700">SÁB</div>
              <div className="text-red-700">DOM</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
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
                    className={`min-h-[58px] rounded-2xl p-2 text-center border border-slate-100 transition-all ${
                      fimDeSemanaMensal
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:scale-[1.02]"
                    } ${corDoDia(dia)}`}
                  >
                    <div className="font-extrabold">{dia}</div>

                    {tipoPlanejamento === "aula" && item && (
                      <div className="text-[11px] mt-1">
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

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-yellow-100 text-yellow-800 rounded-xl p-2 text-center font-semibold">
                Sábado
              </div>
              <div className="bg-red-50 text-red-600 rounded-xl p-2 text-center font-semibold">
                Domingo
              </div>
              <div className="bg-green-600 text-white rounded-xl p-2 text-center font-semibold">
                Selecionada
              </div>
            </div>
          </section>

          <section className="bg-slate-50 border border-slate-100 rounded-3xl p-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Datas selecionadas
                </h2>

                <p className="text-sm text-slate-500">
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
                  className="border border-red-200 text-red-600 bg-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-red-50"
                >
                  Limpar
                </button>
              )}
            </div>

            {datas.length === 0 ? (
              <div className="min-h-[260px] flex items-center justify-center text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
                <p>
                  Nenhuma data selecionada.
                  <br />
                  {tipoPlanejamento === "mensal"
                    ? "Clique na data inicial do período."
                    : "Clique em um dia no calendário."}
                </p>
              </div>
            ) : tipoPlanejamento === "mensal" ? (
              <div className="min-h-[260px] flex flex-col justify-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-green-50 p-4 text-center text-green-700">
                    <div className="text-xs font-bold uppercase">Início</div>
                    <div className="mt-1 text-lg font-extrabold">
                      {primeiraData}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-4 text-center text-blue-700">
                    <div className="text-xs font-bold uppercase">Fim</div>
                    <div className="mt-1 text-lg font-extrabold">
                      {datas.length > 1 ? ultimaData : "Selecione"}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-center text-sm text-green-800">
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
              <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3">
                {datasOrdenadas.map((item) => (
                  <div
                    key={item.data}
                    className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col gap-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="bg-green-50 text-green-700 rounded-xl px-3 py-2 text-center">
                        <div className="text-xs font-bold">
                          {obterDiaDaSemana(item.data)}
                        </div>
                        <div className="text-base font-extrabold">
                          {item.data}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removerData(item.data)}
                        className="text-red-500 font-bold cursor-pointer hover:text-red-700"
                      >
                        🗑
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">
                        {item.aulas} aula(s)
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removerAulaPorData(item.data)}
                          className="w-9 h-9 rounded-xl border border-slate-200 bg-white font-bold cursor-pointer hover:bg-slate-50"
                        >
                          -
                        </button>

                        <span className="font-extrabold w-5 text-center">
                          {item.aulas}
                        </span>

                        <button
                          type="button"
                          onClick={() => adicionarAulaPorData(item.data)}
                          className="w-9 h-9 rounded-xl border border-blue-200 bg-white text-blue-600 font-bold cursor-pointer hover:bg-blue-50"
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
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-slate-700">
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

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={onVoltar}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl w-full cursor-pointer font-bold hover:bg-slate-50"
          >
            ← Voltar para Configuração
          </button>

          <button
            type="button"
            onClick={continuar}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl w-full font-bold cursor-pointer shadow-lg hover:scale-[1.01] transition"
          >
            Continuar para os Conteúdos →
          </button>
        </div>
      </div>
    </div>
  );
}