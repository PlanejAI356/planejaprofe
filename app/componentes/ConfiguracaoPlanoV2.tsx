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
  const [mostrarMaisDisciplinas, setMostrarMaisDisciplinas] = useState(false);

const ehCreche =
  turmaSelecionada === "Creche" &&
  (turmaInfantilDetalhe === "Berçário" ||
    turmaInfantilDetalhe === "Maternal I" ||
    turmaInfantilDetalhe === "Maternal II");
    
  const etapasEnsino = [
    "Educação Infantil",
    "Ensino Fundamental I",
    "Ensino Fundamental II",
    "Ensino Médio",
  ];

  const anosFundamental1 = ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"];
  const anosFundamental2 = ["6º Ano", "7º Ano", "8º Ano", "9º Ano"];

  const turmasEducacaoInfantil = ["Creche", "Pré-escola"];
  const turmasCreche = ["Berçário", "Maternal I", "Maternal II"];
  const turmasPreEscola = ["Pré I", "Pré II"];

  const seriesEnsinoMedio = ["1ª Série", "2ª Série", "3ª Série"];

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
  ];

  const maisDisciplinasFundamental1 = [
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
  ];

  const maisDisciplinasFundamental2 = [
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
      : [];

  const maisDisciplinas =
    etapaEnsino === "Ensino Fundamental I"
      ? maisDisciplinasFundamental1
      : etapaEnsino === "Ensino Fundamental II"
      ? maisDisciplinasFundamental2
      : [];

  const selecionado =
  "border-green-500 bg-green-50 text-green-800 shadow-lg ring-2 ring-green-100";

const normal =
  "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-green-400 hover:shadow-md hover:-translate-y-1";

const card =
  "relative rounded-2xl border px-4 py-3 font-bold transition-all duration-300";

  const podeMostrarCampoOuDisciplina =
    (etapaEnsino === "Educação Infantil" && turmaInfantilDetalhe) ||
    (etapaEnsino !== "Educação Infantil" && turmaSelecionada);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 px-4 py-4">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
        <div className="mb-5 flex items-center gap-3">
          <ClipboardList className="text-green-600" size={34} />
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide text-slate-900">
  CONFIGURAÇÃO DO PLANO
</h1>
            <p className="text-slate-500">
              Escolha a etapa, turma, área ou disciplina do planejamento.
            </p>
          </div>
        </div>

        <section className="mb-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
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
                  setTurmaInfantilDetalhe("");
                  setDisciplinaSelecionada("");
                  setMostrarMaisDisciplinas(false);
                }}
                className={`${card} h-32 text-center ${
                  etapaEnsino === etapa ? selecionado : normal
                }`}
              >
                {etapaEnsino === etapa && (
                  <CheckCircle2
                    size={24}
                    className="absolute right-4 top-4 text-green-600"
                  />
                )}

                <div className="flex flex-col items-center gap-2">
                  {etapa === "Educação Infantil" && (
                    <Baby size={42} className="text-orange-400" />
                  )}
                  {etapa === "Ensino Fundamental I" && (
                    <BookOpen size={42} className="text-green-500" />
                  )}
                  {etapa === "Ensino Fundamental II" && (
                    <Backpack size={42} className="text-sky-500" />
                  )}
                  {etapa === "Ensino Médio" && (
                    <GraduationCap size={42} className="text-violet-500" />
                  )}

                  <span>{etapa}</span>
                  <span className="text-sm font-medium text-slate-500">
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
          <section className="mb-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
              <Users size={20} className="text-green-600" />
              {etapaEnsino === "Educação Infantil" ? "Segmento" : "Ano ou Série"}
            </h2>

            <div className="flex flex-wrap gap-3">
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
  setMostrarMaisDisciplinas(false);
}} 
                  className={`${card} min-w-[120px] ${
                    turmaSelecionada === turma ? selecionado : normal
                  }`}
                >
                  {turma}

                  {turmaSelecionada === turma && (
                    <CheckCircle2
                      size={22}
                      className="absolute right-4 top-3 text-green-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {etapaEnsino === "Educação Infantil" && turmaSelecionada && (
          <section className="mb-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
              <Users size={20} className="text-green-600" />
              Turma
            </h2>

            <div className="flex flex-wrap gap-3">
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
                    className={`${card} min-w-[120px] ${
                      turmaInfantilDetalhe === turma ? selecionado : normal
                    }`}
                  >
                    {turma}

                    {turmaInfantilDetalhe === turma && (
                      <CheckCircle2
                        size={22}
                        className="absolute right-4 top-3 text-green-600"
                      />
                    )}
                  </button>
                )
              )}
            </div>
          </section>
        )}

        {podeMostrarCampoOuDisciplina && (
          <section className="mb-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
              <Sprout size={20} className="text-green-600" />
              {etapaEnsino === "Educação Infantil"
                ? "Área de Aprendizagem / Campo de Experiência"
                : "Disciplina"}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {opcoesDisciplina.map((disciplina) => (
                <button
                  key={disciplina}
                  type="button"
                  onClick={() => setDisciplinaSelecionada(disciplina)}
                  className={`${card} min-h-[58px] ${
                    disciplinaSelecionada === disciplina ? selecionado : normal
                  }`}
                >
                  {disciplina}

                  {disciplinaSelecionada === disciplina && (
                    <CheckCircle2
                      size={22}
                      className="absolute right-4 top-3 text-green-600"
                    />
                  )}
                </button>
              ))}

              {(etapaEnsino === "Ensino Fundamental I" ||
                etapaEnsino === "Ensino Fundamental II") && (
                <button
                  type="button"
                  onClick={() =>
                    setMostrarMaisDisciplinas(!mostrarMaisDisciplinas)
                  }
                  className={`${card} min-h-[58px] border-dashed ${normal}`}
                >
                  + Mais disciplinas
                </button>
              )}

              {mostrarMaisDisciplinas &&
                maisDisciplinas.map((disciplina) => (
                  <button
                    key={disciplina}
                    type="button"
                   onClick={() => {
  setDisciplinaSelecionada(disciplina);
  localStorage.setItem("disciplinaSelecionada", disciplina);
}}
                    className={`${card} min-h-[58px] ${
                      disciplinaSelecionada === disciplina
                        ? selecionado
                        : normal
                    }`}
                  >
                    {disciplina}

                    {disciplinaSelecionada === disciplina && (
                      <CheckCircle2
                        size={22}
                        className="absolute right-4 top-3 text-green-600"
                      />
                    )}
                  </button>
                ))}
            </div>
          </section>
        )}

        <div className="mb-5 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
              <Calendar size={20} className="text-green-600" />
              Ano Letivo
            </h2>

            <input
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg font-semibold shadow-sm outline-none transition-all duration-300 focus:border-green-500 focus:ring-4 focus:ring-green-100"
              placeholder="Ex: 2026"
            />
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
              <CalendarDays size={20} className="text-green-600" />
              Mês
            </h2>

            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {meses.map((mes, index) => (
                <button
                  key={mes}
                  type="button"
                  onClick={() => {
                    setMesSelecionado(index);
                    setNomeMes(mes);
                  }}
                  className={`${card} py-3 ${
                    mesSelecionado === index ? selecionado : normal
                  }`}
                >
                  {mes}

                  {mesSelecionado === index && (
                    <CheckCircle2
                      size={20}
                      className="absolute right-3 top-3 text-green-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="mb-5">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
            <NotebookPen size={20} className="text-green-600" />
            Tipo de Planejamento
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTipoPlanejamento("aula")}
              className={`${card} ${
                tipoPlanejamento === "aula" ? selecionado : normal
              }`}
            >
              Plano por Aula
              <p className="text-sm font-medium text-slate-500">
                Planejamento detalhado para cada aula
              </p>

              {tipoPlanejamento === "aula" && (
                <CheckCircle2
                  size={22}
                  className="absolute right-4 top-4 text-green-600"
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setTipoPlanejamento("mensal")}
              className={`${card} ${
                tipoPlanejamento === "mensal" ? selecionado : normal
              }`}
            >
              Plano Mensal
              <p className="text-sm font-medium text-slate-500">
                Planejamento geral do mês
              </p>

              {tipoPlanejamento === "mensal" && (
                <CheckCircle2
                  size={22}
                  className="absolute right-4 top-4 text-green-600"
                />
              )}
            </button>
          </div>
        </section>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onVoltar}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <button
            type="button"
            onClick={onContinuar}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-7 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105"
          >
            Continuar
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
