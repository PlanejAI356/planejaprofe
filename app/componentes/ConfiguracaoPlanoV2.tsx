"use client";

import { useState } from "react";
import {
  ClipboardList,
  Baby,
  BookOpen,
  Backpack,
  GraduationCap,
  CheckCircle2,
  Users,
  Sprout,
  Calendar,
  CalendarDays,
  NotebookPen,
  ArrowLeft,
  ArrowRight,
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
  onSelecionarSerie: () => void;
};

export default function ConfiguracaoPlano({
  onVoltar,
  onSelecionarSerie,
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
  const [turmaInfantilDetalhe, setTurmaInfantilDetalhe] = useState("");
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
  const [bimestreSelecionado, setBimestreSelecionado] = useState("");
  const [mostrarAnoLetivo, setMostrarAnoLetivo] = useState(false);
  const [mostrarPeriodo, setMostrarPeriodo] = useState(false);

  const etapasEnsino = [
    "Educação Infantil",
    "Ensino Fundamental I",
    "Ensino Fundamental II",
    "Ensino Médio",
    "EJA",
  ];

  const anosFundamental1 = ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"];
  const anosFundamental2 = ["6º Ano", "7º Ano", "8º Ano", "9º Ano"];
  const turmasEducacaoInfantil = ["Creche", "Pré-escola"];
  const turmasCreche = ["Berçário", "Maternal I", "Maternal II"];
  const turmasPreEscola = ["Pré I", "Pré II"];
  const seriesEnsinoMedio = ["1ª Série", "2ª Série", "3ª Série"];

  const etapasEja = [
    "EJA - Anos Iniciais",
    "EJA - Anos Finais",
    "EJA - Ensino Médio",
  ];

  const camposExperiencia = [
    "O eu, o outro e o nós",
    "Corpo, gestos e movimentos",
    "Traços, sons, cores e formas",
    "Escuta, fala, pensamento e imaginação",
    "Espaços, tempos, quantidades, relações e transformações",
  ];

  const disciplinasFundamental1 = [
  "Língua Portuguesa",
  "Matemática",
  "Ciências",
  "História",
  "Geografia",
  "Arte",
  "Educação Física",
  "Ensino Religioso",
  "Inglês",
  "BNCC da Computação",
];

  const disciplinasFundamental2 = [
  "Língua Portuguesa",
  "Matemática",
  "Ciências",
  "História",
  "Geografia",
  "Arte",
  "Educação Física",
  "Ensino Religioso",
  "Inglês",
  "Filosofia",
  "BNCC da Computação",
];

  const disciplinasEnsinoMedio = [
    "Língua Portuguesa",
    "Literatura",
    "Redação",
    "Matemática",
    "Biologia",
    "Física",
    "Química",
    "História",
    "Geografia",
    "Filosofia",
    "Sociologia",
    "Inglês",
    "Espanhol",
    "Arte",
    "Educação Física",
    "Projeto de Vida",
  ];

  const disciplinasEjaAnosIniciais = disciplinasFundamental1;

  const disciplinasEjaAnosFinais = disciplinasFundamental2;

  const disciplinasEjaEnsinoMedio = disciplinasEnsinoMedio;

  const bimestres = [
    "1º Bimestre",
    "2º Bimestre",
    "3º Bimestre",
    "4º Bimestre",
  ];

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

  const opcoesTurma =
    etapaEnsino === "Educação Infantil"
      ? turmasEducacaoInfantil
      : etapaEnsino === "Ensino Fundamental I"
      ? anosFundamental1
      : etapaEnsino === "Ensino Fundamental II"
      ? anosFundamental2
      : etapaEnsino === "Ensino Médio"
      ? seriesEnsinoMedio
      : etapaEnsino === "EJA"
      ? etapasEja
      : [];

  const opcoesDisciplina =
    etapaEnsino === "Educação Infantil"
      ? turmaInfantilDetalhe
        ? camposExperiencia
        : []
      : etapaEnsino === "Ensino Fundamental I"
      ? disciplinasFundamental1
      : etapaEnsino === "Ensino Fundamental II"
      ? disciplinasFundamental2
      : etapaEnsino === "Ensino Médio"
      ? disciplinasEnsinoMedio
      : etapaEnsino === "EJA"
      ? turmaSelecionada === "EJA - Anos Iniciais"
        ? disciplinasEjaAnosIniciais
        : turmaSelecionada === "EJA - Anos Finais"
        ? disciplinasEjaAnosFinais
        : turmaSelecionada === "EJA - Ensino Médio"
        ? disciplinasEjaEnsinoMedio
        : []
      : [];

  const selecionado =
    "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-lg shadow-emerald-100 ring-2 ring-emerald-100";

  const normal =
    "border-slate-200 text-slate-800 shadow-sm hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5";

  const card =
    "relative rounded-2xl border px-4 py-3 font-bold transition-all duration-300";

  const podeMostrarCampoOuDisciplina =
    (etapaEnsino === "Educação Infantil" && turmaInfantilDetalhe) ||
    (etapaEnsino !== "Educação Infantil" && turmaSelecionada);

  function estiloEtapa(etapa: string) {
    if (etapaEnsino === etapa) return selecionado;

    if (etapa === "Educação Infantil") {
      return "border-orange-200 bg-orange-50/80 text-slate-800 shadow-sm hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5";
    }

    if (etapa === "Ensino Fundamental I") {
      return "border-emerald-200 bg-emerald-50/80 text-slate-800 shadow-sm hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5";
    }

    if (etapa === "Ensino Fundamental II") {
      return "border-sky-200 bg-sky-50/80 text-slate-800 shadow-sm hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5";
    }

    if (etapa === "Ensino Médio") {
      return "border-violet-200 bg-violet-50/80 text-slate-800 shadow-sm hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5";
    }

    return "border-teal-200 bg-teal-50/80 text-slate-800 shadow-sm hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5";
  }

  return (
    <main className="min-h-[calc(100vh-70px)] overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-green-100 px-3 py-3 md:px-5">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-emerald-100 bg-white p-4 shadow-[0_20px_60px_rgba(16,185,129,0.13)] md:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ClipboardList size={34} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-wide text-slate-900 md:text-3xl">
              CONFIGURAÇÃO DO PLANO
            </h1>
            <p className="text-sm text-slate-500 md:text-base">
              Escolha a etapa, turma, área ou disciplina do planejamento.
            </p>
          </div>
        </div>

        <section className="mb-4">
          <h2 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
            🎓 Etapa de Ensino
          </h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {etapasEnsino.map((etapa) => (
              <button
                key={etapa}
                type="button"
                onClick={() => {
                  setEtapaEnsino(etapa);
                  localStorage.setItem("etapaEnsino", etapa);
                  setTurmaSelecionada("");
                  setTurmaInfantilDetalhe("");
                  setDisciplinaSelecionada("");
                  localStorage.removeItem("serieSelecionada");
                  localStorage.removeItem("turmaInfantilDetalhe");
                  localStorage.removeItem("disciplinaSelecionada");
                }}
                className={`${card} min-h-[96px] px-3 py-2 text-center ${estiloEtapa(etapa)}`}
              >
                {etapaEnsino === etapa && (
                  <CheckCircle2
                    size={21}
                    className="absolute right-3 top-3 text-emerald-600"
                  />
                )}

                <div className="flex flex-col items-center gap-1.5">
                  {etapa === "Educação Infantil" && (
                    <Baby size={32} className="text-orange-500" />
                  )}
                  {etapa === "Ensino Fundamental I" && (
                    <BookOpen size={32} className="text-emerald-500" />
                  )}
                  {etapa === "Ensino Fundamental II" && (
                    <Backpack size={32} className="text-sky-500" />
                  )}
                  {etapa === "Ensino Médio" && (
                    <GraduationCap size={32} className="text-violet-500" />
                  )}
                  {etapa === "EJA" && (
                    <Users size={32} className="text-teal-500" />
                  )}

                  <span className="text-sm leading-tight md:text-base">{etapa}</span>
                  <span className="text-xs font-medium text-slate-500">
                    {etapa === "Educação Infantil"
                      ? "Creche e Pré-escola"
                      : etapa === "Ensino Fundamental I"
                      ? "1º ao 5º Ano"
                      : etapa === "Ensino Fundamental II"
                      ? "6º ao 9º Ano"
                      : etapa === "Ensino Médio"
                      ? "1ª à 3ª Série"
                      : "Jovens e Adultos"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {etapaEnsino && (
          <section className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
              <Users size={19} className="text-emerald-600" />
              {etapaEnsino === "Educação Infantil"
                ? "Segmento"
                : etapaEnsino === "EJA"
                ? "Etapa da EJA"
                : "Ano ou Série"}
            </h2>

            <div className="flex flex-wrap gap-2">
              {opcoesTurma.map((turma) => (
                <button
                  key={turma}
                  type="button"
                  onClick={() => {
                    setTurmaSelecionada(turma);
                    onSelecionarSerie();
                    localStorage.setItem("serieSelecionada", turma);
                    setTurmaInfantilDetalhe("");
                    localStorage.removeItem("turmaInfantilDetalhe");
                    setDisciplinaSelecionada("");
                  }}
                  className={`${card} min-w-[115px] py-2 ${
                    turmaSelecionada === turma ? selecionado : normal + " bg-white"
                  }`}
                >
                  {turma}
                  {turmaSelecionada === turma && (
                    <CheckCircle2
                      size={19}
                      className="absolute right-3 top-2.5 text-emerald-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {etapaEnsino === "Educação Infantil" && turmaSelecionada && (
          <section className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
              <Users size={19} className="text-emerald-600" />
              Turma
            </h2>

            <div className="flex flex-wrap gap-2">
              {(turmaSelecionada === "Creche" ? turmasCreche : turmasPreEscola).map(
                (turma) => (
                  <button
                    key={turma}
                    type="button"
                    onClick={() => {
                      setTurmaInfantilDetalhe(turma);
                      localStorage.setItem("turmaInfantilDetalhe", turma);
                      localStorage.setItem("serieSelecionada", turma);
                      setDisciplinaSelecionada("");
                      localStorage.removeItem("disciplinaSelecionada");
                    }}
                    className={`${card} min-w-[115px] py-2 ${
                      turmaInfantilDetalhe === turma
                        ? selecionado
                        : normal + " bg-white"
                    }`}
                  >
                    {turma}
                    {turmaInfantilDetalhe === turma && (
                      <CheckCircle2
                        size={19}
                        className="absolute right-3 top-2.5 text-emerald-600"
                      />
                    )}
                  </button>
                )
              )}
            </div>
          </section>
        )}

        {podeMostrarCampoOuDisciplina && (
          <section className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
              <Sprout size={19} className="text-emerald-600" />
              {etapaEnsino === "Educação Infantil"
                ? "Área de Aprendizagem / Campo de Experiência"
                : "Disciplina"}
            </h2>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {opcoesDisciplina.map((disciplina) => (
                <button
                  key={disciplina}
                  type="button"
                  onClick={() => {
                    setDisciplinaSelecionada(disciplina);
                    localStorage.setItem("disciplinaSelecionada", disciplina);
                  }}
                  className={`${card} min-h-[52px] py-2 ${
                    disciplinaSelecionada === disciplina
                      ? selecionado
                      : normal + " bg-white"
                  }`}
                >
                  {disciplina}
                  {disciplinaSelecionada === disciplina && (
                    <CheckCircle2
                      size={19}
                      className="absolute right-3 top-2.5 text-emerald-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
  <section>
    <button
      type="button"
      onClick={() => setMostrarAnoLetivo(!mostrarAnoLetivo)}
      className={`${card} flex min-h-[52px] w-full items-center justify-between border-emerald-100 bg-emerald-50/60 text-left text-slate-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-50`}
    >
      <span className="flex items-center gap-2">
        <Calendar size={19} className="text-emerald-600" />
        Ano Letivo
        <span className="text-xs font-medium text-slate-400">
          (opcional)
        </span>
      </span>

      <span className="text-sm font-semibold text-emerald-700">
        {mostrarAnoLetivo ? "Fechar" : ano || "Selecionar"}
      </span>
    </button>

    {mostrarAnoLetivo && (
      <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
        <input
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-lg font-semibold shadow-sm outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          placeholder="Ex: 2026"
        />
      </div>
    )}
  </section>

  <section>
    <button
      type="button"
      onClick={() => setMostrarPeriodo(!mostrarPeriodo)}
      className={`${card} flex min-h-[52px] w-full items-center justify-between border-amber-100 bg-amber-50/60 text-left text-slate-800 shadow-sm hover:border-amber-300 hover:bg-amber-50`}
    >
      <span className="flex items-center gap-2">
        <CalendarDays size={19} className="text-emerald-600" />
        Período
        <span className="text-xs font-medium text-slate-400">
          (opcional)
        </span>
      </span>

      <span className="text-sm font-semibold text-amber-700">
        {mostrarPeriodo
          ? "Fechar"
          : bimestreSelecionado || "Selecionar"}
      </span>
    </button>

    {mostrarPeriodo && (
      <div className="mt-2 rounded-2xl border border-amber-100 bg-amber-50/30 p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {bimestres.map((bimestre) => (
            <button
              key={bimestre}
              type="button"
              onClick={() => {
                const novoValor =
                  bimestreSelecionado === bimestre ? "" : bimestre;

                setBimestreSelecionado(novoValor);

                if (novoValor) {
                  localStorage.setItem(
                    "bimestreSelecionado",
                    novoValor
                  );
                } else {
                  localStorage.removeItem("bimestreSelecionado");
                }
              }}
              className={`${card} min-h-[48px] py-2 ${
                bimestreSelecionado === bimestre
                  ? "border-amber-500 bg-amber-50 text-amber-900 shadow-md shadow-amber-100 ring-2 ring-amber-100"
                  : "border-amber-100 bg-white text-slate-800 shadow-sm hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              {bimestre}

              {bimestreSelecionado === bimestre && (
                <CheckCircle2
                  size={18}
                  className="absolute right-2 top-2 text-amber-600"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    )}
  </section>
</div>

        <section className="mb-4">
          <h2 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
            <CalendarDays size={19} className="text-emerald-600" />
            Mês
          </h2>

          <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
            {meses.map((mes, index) => (
              <button
                key={mes}
                type="button"
                onClick={() => {
                  setMesSelecionado(index);
                  setNomeMes(mes);
                }}
                className={`${card} py-2.5 ${
                  mesSelecionado === index
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "border-emerald-100 bg-emerald-50/60 text-slate-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                {mes}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-4">
          <h2 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
            <NotebookPen size={19} className="text-emerald-600" />
            Tipo de Planejamento
          </h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setTipoPlanejamento("aula")}
              className={`${card} min-h-[82px] text-left ${
                tipoPlanejamento === "aula"
                  ? selecionado
                  : "border-emerald-100 bg-emerald-50/70 text-slate-800 shadow-sm hover:border-emerald-300 hover:shadow-md"
              }`}
            >
              <div className="pr-8">
                <div className="font-extrabold">Plano por Aula</div>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Selecione os dias do mês em que serão realizadas as aulas.
                </p>
              </div>

              <span
                className={`absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 ${
                  tipoPlanejamento === "aula"
                    ? "border-emerald-600 bg-emerald-600 ring-4 ring-emerald-100"
                    : "border-emerald-300 bg-white"
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setTipoPlanejamento("mensal")}
              className={`${card} min-h-[82px] text-left ${
                tipoPlanejamento === "mensal"
                  ? "border-sky-500 bg-sky-50 text-sky-900 shadow-lg shadow-sky-100 ring-2 ring-sky-100"
                  : "border-sky-100 bg-sky-50/70 text-slate-800 shadow-sm hover:border-sky-300 hover:shadow-md"
              }`}
            >
              <div className="pr-8">
                <div className="font-extrabold">Plano Mensal</div>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Selecione um período do mês para o planejamento.
                </p>
              </div>

              <span
                className={`absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 ${
                  tipoPlanejamento === "mensal"
                    ? "border-sky-600 bg-sky-600 ring-4 ring-sky-100"
                    : "border-sky-300 bg-white"
                }`}
              />
            </button>
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-emerald-100 pt-3">
          <button
            type="button"
            onClick={onVoltar}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 font-bold text-emerald-800 shadow-sm transition-all hover:bg-emerald-100"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <button
            type="button"
            onClick={onContinuar}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-7 py-2.5 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02]"
          >
            Continuar para o Calendário
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}