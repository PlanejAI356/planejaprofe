"use client";

import { useState } from "react";

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
  const [serieSelecionada, setSerieSelecionada] = useState("");
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");

  const seriesFund1 = ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"];
  const seriesFund2 = ["6º Ano", "7º Ano", "8º Ano", "9º Ano"];

  const disciplinas = [
    "Português",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Arte",
    "Educação Física",
    "Ensino Religioso",
    "Inglês",
    "Filosofia",
    "Computação",
    "Projeto de Vida",
    "Empreendedorismo",
    "Robótica",
    "Tecnologia",
  ];

  const meses = [
    { nome: "Janeiro", numero: 1 },
    { nome: "Fevereiro", numero: 2 },
    { nome: "Março", numero: 3 },
    { nome: "Abril", numero: 4 },
    { nome: "Maio", numero: 5 },
    { nome: "Junho", numero: 6 },
    { nome: "Julho", numero: 7 },
    { nome: "Agosto", numero: 8 },
    { nome: "Setembro", numero: 9 },
    { nome: "Outubro", numero: 10 },
    { nome: "Novembro", numero: 11 },
    { nome: "Dezembro", numero: 12 },
  ];

  const series =
    etapaEnsino === "fund1"
      ? seriesFund1
      : etapaEnsino === "fund2"
      ? seriesFund2
      : [];

  function continuar() {
  if (
    !etapaEnsino ||
    !serieSelecionada ||
    !disciplinaSelecionada ||
    !tipoPlanejamento ||
    !mesSelecionado
  ) {
    alert("Preencha etapa, série, disciplina, tipo de planejamento e mês antes de continuar.");
    return;
  }

  localStorage.setItem("serieSelecionada", serieSelecionada);
  localStorage.setItem("disciplinaSelecionada", disciplinaSelecionada);
  localStorage.setItem("tipoPlanejamento", tipoPlanejamento);
  localStorage.setItem(
    "etapaEnsino",
    etapaEnsino === "fund1" ? "Fundamental I" : "Fundamental II"
  );

  localStorage.removeItem("temasPlano");
  localStorage.removeItem("objetivosPlano");
  localStorage.removeItem("metodologiaPlano");
  localStorage.removeItem("avaliacaoPlano");
  localStorage.removeItem("referenciasPlano");
  localStorage.removeItem("atividadePlano");

  onContinuar();
}

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Configuração do Plano</h1>

      <h2 className="font-bold mb-2">Etapa de Ensino</h2>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => {
            setEtapaEnsino("fund1");
            setSerieSelecionada("");
          }}
          className={`px-4 py-2 rounded-xl cursor-pointer ${
            etapaEnsino === "fund1"
              ? "bg-blue-600 text-white"
              : "bg-slate-200"
          }`}
        >
          Fundamental I
        </button>

        <button
          onClick={() => {
            setEtapaEnsino("fund2");
            setSerieSelecionada("");
          }}
          className={`px-4 py-2 rounded-xl cursor-pointer ${
            etapaEnsino === "fund2"
              ? "bg-blue-600 text-white"
              : "bg-slate-200"
          }`}
        >
          Fundamental II
        </button>
      </div>

      {etapaEnsino && (
        <>
          <h2 className="font-bold mb-2">Série</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {series.map((serie) => (
              <button
                key={serie}
                onClick={() => setSerieSelecionada(serie)}
                className={`p-2 rounded cursor-pointer ${
                  serieSelecionada === serie
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100"
                }`}
              >
                {serie}
              </button>
            ))}
          </div>
        </>
      )}

      <h2 className="font-bold mb-2">Disciplina</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
        {disciplinas.map((disciplina) => (
          <button
            key={disciplina}
            onClick={() => setDisciplinaSelecionada(disciplina)}
            className={`p-2 rounded cursor-pointer ${
              disciplinaSelecionada === disciplina
                ? "bg-blue-600 text-white"
                : "bg-slate-100"
            }`}
          >
            {disciplina}
          </button>
        ))}
      </div>

      <h2 className="font-bold mb-2">Tipo de Planejamento</h2>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTipoPlanejamento("aula")}
          className={`px-4 py-2 rounded-xl cursor-pointer ${
            tipoPlanejamento === "aula"
              ? "bg-blue-600 text-white"
              : "bg-slate-200"
          }`}
        >
          Planejamento por Aula
        </button>

        <button
          onClick={() => setTipoPlanejamento("mensal")}
          className={`px-4 py-2 rounded-xl cursor-pointer ${
            tipoPlanejamento === "mensal"
              ? "bg-blue-600 text-white"
              : "bg-slate-200"
          }`}
        >
          Planejamento Mensal
        </button>
      </div>

      <h2 className="font-bold mb-2">Ano</h2>

      <input
        type="number"
        value={ano}
        onChange={(e) => setAno(e.target.value)}
        className="border p-2 rounded mb-6 w-full"
      />

      <h2 className="font-bold mb-2">Mês</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {meses.map((mes) => (
          <button
            key={mes.numero}
            onClick={() => {
              setMesSelecionado(mes.numero);
              setNomeMes(mes.nome);
            }}
            className={`p-2 rounded cursor-pointer ${
              mesSelecionado === mes.numero
                ? "bg-blue-600 text-white"
                : "bg-slate-100"
            }`}
          >
            {mes.nome}
          </button>
        ))}
      </div>
<button
  onClick={onVoltar}
  className="bg-slate-300 text-black px-6 py-3 rounded-xl w-full cursor-pointer mb-3"
>
  Voltar
</button>
      <button
        onClick={continuar}
        className="bg-purple-600 text-white px-6 py-3 rounded-xl w-full cursor-pointer"
      >
        Continuar para o Calendário
      </button>
    </div>
  );
}