"use client";

import { useState } from "react";
import {
  etapasEnsino,
  turmasEducacaoInfantil,
  areasCreche,
  camposPreEscola,
  disciplinasFundamental,
  seriesEnsinoMedio,
  disciplinasEnsinoMedio,
} from "../dados/etapasEnsino";
import {
  Baby,
  BookOpen,
  Backpack,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

type ConfiguracaoPlanoProps = {
  ano: string;
  setAno: (valor: string) => void;
  mesSelecionado: number | null;
  setMesSelecionado: (valor: number) => void;
  nomeMes: string;
  setNomeMes: (valor: string) => void;
  tipoPlanejamento: string;
  setTipoPlanejamento: (valor: string) => void;
  onContinuar: () => void;
  onVoltar: () => void;
};

export default function ConfiguracaoPlano({
  onVoltar,
  ano,
  setAno,
  mesSelecionado,
  setMesSelecionado,
  setNomeMes,
  tipoPlanejamento,
  setTipoPlanejamento,
  onContinuar,
}: ConfiguracaoPlanoProps) {
  const [etapaEnsino, setEtapaEnsino] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
const anosFundamental1 = ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"];

const anosFundamental2 = ["6º Ano", "7º Ano", "8º Ano", "9º Ano"];
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const botaoBase =
    "rounded-2xl border px-4 py-4 text-left transition-all duration-200 font-semibold";

  const botaoSelecionado = "border-green-600 bg-green-600 text-white shadow-md";
  const botaoNormal =
    "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50";

  const opcoesTurma =
    etapaEnsino === "Educação Infantil"
      ? turmasEducacaoInfantil
      : etapaEnsino === "Ensino Fundamental I"
      ? anosFundamental1
      : etapaEnsino === "Ensino Fundamental II"
      ? anosFundamental2
      : etapaEnsino === "Ensino Médio"
      ? seriesEnsinoMedio
      : [];

  const opcoesDisciplina =
    etapaEnsino === "Educação Infantil"
      ? turmaSelecionada === "Creche"
        ? areasCreche
        : turmaSelecionada === "Pré-escola I" ||
          turmaSelecionada === "Pré-escola II"
        ? camposPreEscola
        : []
      : etapaEnsino === "Ensino Fundamental I" ||
        etapaEnsino === "Ensino Fundamental II"
      ? disciplinasFundamental
      : etapaEnsino === "Ensino Médio"
      ? disciplinasEnsinoMedio
      : [];

  const podeContinuar =
    etapaEnsino &&
    turmaSelecionada &&
    disciplinaSelecionada &&
    ano &&
    mesSelecionado !== null &&
    tipoPlanejamento;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
            
          </h1>

          <p className="text-slate-500 mb-6">
            Escolha a etapa, turma, área ou disciplina para gerar o planejamento.
          </p>

          <section className="mb-6">
            <h2 className="font-bold text-slate-800 mb-3">
              🎓 Etapa de Ensino
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {etapasEnsino.map((etapa) => (
                <button
                  key={etapa}
                  type="button"
                  onClick={() => {
                    setEtapaEnsino(etapa);
                    setTurmaSelecionada("");
                    setDisciplinaSelecionada("");
                  }}
                  className={`${botaoBase} ${
                    etapaEnsino === etapa ? botaoSelecionado : botaoNormal
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">

  {etapa === "Educação Infantil" && (
    <Baby size={50} className="text-orange-400" />
  )}

  {etapa === "Ensino Fundamental I" && (
    <BookOpen size={50} className="text-green-500" />
  )}

  {etapa === "Ensino Fundamental II" && (
    <Backpack size={50} className="text-blue-500" />
  )}

  {etapa === "Ensino Médio" && (
    <GraduationCap size={50} className="text-violet-500" />
  )}

  <span className="text-lg font-bold">
    {etapa}
  </span>

  <span className="text-sm text-slate-500">
    {etapa === "Educação Infantil"
      ? "Creche e Pré-escola"
      : etapa === "Ensino Fundamental I"
      ? "1º ao 5º Ano"
      : etapa === "Ensino Fundamental II"
      ? "6º ao 9º Ano"
      : "1ª à 3ª Série"}
  </span>

</div>
                </button>
              ))}
            </div>
          </section>

          {etapaEnsino && (
            <section className="mb-6">
              <h2 className="font-bold text-slate-800 mb-3">
                {etapaEnsino === "Educação Infantil"
                  ? "👶 Turma da Educação Infantil"
                  : "📚 Ano ou Série"}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {opcoesTurma.map((turma) => (
                  <button
                    key={turma}
                    type="button"
                    onClick={() => {
                      setTurmaSelecionada(turma);
                      setDisciplinaSelecionada("");
                    }}
                    className={`${botaoBase} ${
                      turmaSelecionada === turma
                        ? botaoSelecionado
                        : botaoNormal
                    }`}
                  >
                    {turma}
                  </button>
                ))}
              </div>
            </section>
          )}

          {turmaSelecionada && (
            <section className="mb-6">
              <h2 className="font-bold text-slate-800 mb-3">
                {etapaEnsino === "Educação Infantil"
                  ? "🌱 Área de Aprendizagem / Campo de Experiência"
                  : "📘 Disciplina"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {opcoesDisciplina.map((disciplina) => (
                  <button
                    key={disciplina}
                    type="button"
                    onClick={() => setDisciplinaSelecionada(disciplina)}
                    className={`${botaoBase} ${
                      disciplinaSelecionada === disciplina
                        ? botaoSelecionado
                        : botaoNormal
                    }`}
                  >
                    {disciplina}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="mb-6">
            <h2 className="font-bold text-slate-800 mb-3">📅 Ano Letivo</h2>

            <input
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-green-500"
              placeholder="Ex: 2026"
            />
          </section>

          <section className="mb-6">
            <h2 className="font-bold text-slate-800 mb-3">🗓️ Mês</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {meses.map((mes, index) => (
                <button
                  key={mes}
                  type="button"
                  onClick={() => {
                    setMesSelecionado(index);
                    setNomeMes(mes);
                  }}
                  className={`${botaoBase} ${
                    mesSelecionado === index ? botaoSelecionado : botaoNormal
                  }`}
                >
                  {mes}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="font-bold text-slate-800 mb-3">
              📝 Tipo de Planejamento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoPlanejamento("aula")}
                className={`${botaoBase} ${
                  tipoPlanejamento === "aula"
                    ? botaoSelecionado
                    : botaoNormal
                }`}
              >
                Plano por Aula
              </button>

              <button
                type="button"
                onClick={() => setTipoPlanejamento("mensal")}
                className={`${botaoBase} ${
                  tipoPlanejamento === "mensal"
                    ? botaoSelecionado
                    : botaoNormal
                }`}
              >
                Plano Mensal
              </button>
            </div>
          </section>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={onVoltar}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-100"
            >
              Voltar
            </button>

            <button
              type="button"
              onClick={onContinuar}
              disabled={!podeContinuar}
              className={`rounded-2xl px-5 py-3 font-bold ${
                podeContinuar
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}