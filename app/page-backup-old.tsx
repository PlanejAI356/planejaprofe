"use client";

import { useState } from "react";

type Mes = {
  nome: string;
  numero: number;
};

type DataSelecionada = {
  data: string;
  aulas: number;
};

export default function Home() {
  const [etapa, setEtapa] = useState("");
  const [serie, setSerie] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [ano, setAno] = useState("2026");
  const [mesSelecionado, setMesSelecionado] = useState<Mes | null>(null);
  const [datas, setDatas] = useState<DataSelecionada[]>([]);
  const [tipoPlanejamento, setTipoPlanejamento] = useState("aula");
  const [temaGeral, setTemaGeral] = useState("");
  const [mostrarAulas, setMostrarAulas] = useState(false);
  const [temasAulas, setTemasAulas] = useState<string[]>([]);
const [abaPlano, setAbaPlano] = useState("tema");
const [editandoTemas, setEditandoTemas] = useState(false);
const [copiado, setCopiado] = useState(false);

  const meses: Mes[] = [
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

  const disciplinas = [
    { nome: "Língua Portuguesa", cor: "bg-blue-600" },
    { nome: "Matemática", cor: "bg-green-600" },
    { nome: "Ciências", cor: "bg-purple-600" },
    { nome: "Geografia", cor: "bg-orange-500" },
    { nome: "Ensino Religioso", cor: "bg-indigo-600" },
    { nome: "História", cor: "bg-red-600" },
    { nome: "Educação Física", cor: "bg-teal-600" },
    { nome: "Língua Inglesa", cor: "bg-cyan-600" },
    { nome: "Arte", cor: "bg-pink-600" },
  ];

  const feriados2026 = [
    "01/01/2026",
    "17/02/2026",
    "03/04/2026",
    "21/04/2026",
    "01/05/2026",
    "07/09/2026",
    "12/10/2026",
    "02/11/2026",
    "15/11/2026",
    "25/12/2026",
  ];
function gerarListaDeAulas() {
  const aulas: string[] = [];

  datas.forEach((item) => {
    for (let i = 0; i < item.aulas; i++) {
      aulas.push(item.data);
    }
  });

  return aulas;
}
  function quantidadeDiasDoMes() {
    if (!mesSelecionado) return 0;
    return new Date(Number(ano), mesSelecionado.numero, 0).getDate();
  }

  function espacosAntesDoPrimeiroDia() {
    if (!mesSelecionado) return 0;

    const primeiroDia = new Date(
      Number(ano),
      mesSelecionado.numero - 1,
      1
    ).getDay();

    return primeiroDia === 0 ? 6 : primeiroDia - 1;
  }

  function formatarData(dia: number) {
    if (!mesSelecionado) return "";

    const diaFormatado = dia.toString().padStart(2, "0");
    const mesFormatado = mesSelecionado.numero.toString().padStart(2, "0");

    return `${diaFormatado}/${mesFormatado}/${ano}`;
  }

  function selecionarData(dia: number) {
    const data = formatarData(dia);

    const dataJaExiste = datas.find((item) => item.data === data);

    if (dataJaExiste) {
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

  function corDoDia(dia: number) {
    if (!mesSelecionado) return "bg-slate-200";

    const data = formatarData(dia);
    const selecionado = datas.some((item) => item.data === data);

    const dataAtual = new Date(Number(ano), mesSelecionado.numero - 1, dia);
    const diaSemana = dataAtual.getDay();

    let cor = "bg-slate-200";

    if (diaSemana === 6) cor = "bg-yellow-200";
    if (diaSemana === 0) cor = "bg-red-100 text-red-700";
    if (feriados2026.includes(data)) cor = "bg-red-500 text-white";
    if (selecionado) cor = "bg-green-600 text-white";

    return cor;
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-center mb-4">📚 PlanejAI</h1>

        {etapa === "" ? (
          <div className="text-center">
            <p className="text-lg mb-4">Olá, professor(a)! 👋</p>
            <p className="mb-6">Vamos criar seu plano de aula?</p>

            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
              onClick={() => setEtapa("escolher")}
            >
              COMEÇAR
            </button>
          </div>
 ) : etapa === "planejamento" ? (
  <div>
    <h2 className="text-2xl font-bold mb-4">Planejamento</h2>

    <p><strong>Série:</strong> {serie}</p>
    <p><strong>Disciplina:</strong> {disciplina}</p>
    <p><strong>Ano:</strong> {ano}</p>

    <div className="mt-4 bg-slate-100 p-3 rounded">
      <p className="font-semibold">Aulas selecionadas:</p>

      {datas.map((item) => (
        <p key={item.data}>
          {item.data} — {item.aulas} aula(s)
        </p>
      ))}
    </div>
    <div className="mt-4">
  <p className="font-semibold mb-2">Tipo de planejamento:</p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <button
      className={`p-4 rounded-xl font-semibold border ${
        tipoPlanejamento === "aula"
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-800"
      }`}
     onClick={() => {
  setTipoPlanejamento("aula");
  setEtapa("conteudos-aula");
}}
    >
      📚 Planejamento por Aula
    </button>

    <button
      className={`p-4 rounded-xl font-semibold border ${
        tipoPlanejamento === "mensal"
          ? "bg-green-600 text-white"
          : "bg-slate-100 text-slate-800"
      }`}
      onClick={() => {
  setTipoPlanejamento("mensal");
  setEtapa("conteudos-mensal");
}}
    >
      📅 Planejamento Mensal
    </button>
  </div>
 
</div>
</div>

) : etapa === "conteudos-aula" ? (

<div>
  <h2 className="text-2xl font-bold mb-4">
    Planejamento por Aula
  </h2>

  <p className="mb-3 font-semibold">
    Tema Geral:
  </p>

  <input
    type="text"
    value={temaGeral}
    onChange={(e) => setTemaGeral(e.target.value)}
    placeholder="Ex: Ciclo da Água"
    className="w-full border p-3 rounded-xl mb-4"
  />

 <button
  className="bg-purple-600 text-white p-3 rounded-xl w-full mb-4 font-semibold"
>
  ✨ Destrinchar com IA
</button>

<button
  className="bg-slate-600 text-white p-3 rounded-xl w-full mb-4 font-semibold"
  onClick={() => setMostrarAulas(true)}
>
  ✍️ Informar os temas das aulas
</button>
<p className="text-sm text-slate-600 mb-4">
  Digite apenas os temas de cada aula. O plano completo será gerado na próxima etapa.
</p>
 <div className="space-y-2">
  {gerarListaDeAulas().map((data, index) => (
    <div
      key={`${data}-${index}`}
      className="flex items-center gap-3 Plano Completobg-slate-100 p-3 rounded-xl"
    >
      <span className="font-semibold min-w-[220px]">
        AULA {String(index + 1).padStart(2, "0")} - {data}
      </span>

    <input
  type="text"
  placeholder="Tema da aula"
  value={temasAulas[index] || ""}
  onChange={(e) => {
    const novosTemas = [...temasAulas];
    novosTemas[index] = e.target.value;
    setTemasAulas(novosTemas);
  }}
  className="flex-1 border p-2 rounded"
/>
    </div>
  ))}
</div>
<button
  className="bg-green-600 text-white p-3 rounded-xl w-full mt-4 font-semibold"
  onClick={() => setEtapa("plano-completo")}
>
  ➡️ Continuar para o Plano Completo
</button>
</div>

  ) : etapa === "conteudos-mensal" ? (
  <div>
    <h2 className="text-2xl font-bold mb-4">
      Planejamento Mensal
    </h2>

    <label className="font-semibold">
      Tema Geral:
    </label>

    <input
      type="text"
      value={temaGeral}
      onChange={(e) => setTemaGeral(e.target.value)}
      placeholder="Ex: Água"
      className="w-full border p-3 rounded-xl mt-2 mb-4"
    />

    <button className="bg-purple-600 text-white p-3 rounded-xl w-full mb-4 font-semibold">
      ✨ Sugerir conteúdos com IA
    </button>

    <label className="font-semibold">
      Conteúdos do mês:
    </label>

    <textarea
      placeholder="Digite ou edite os conteúdos do mês..."
      className="w-full border p-3 rounded-xl mt-2"
      rows={8}
    />

    <button
      className="bg-green-600 text-white p-3 rounded-xl w-full mt-4 font-semibold"
    >
      <button
  className="bg-green-600 text-white p-3 rounded-xl w-full mt-4 font-semibold"
  onClick={() => setEtapa("plano-completo")}
>
  <button
  className="bg-green-600 text-white p-3 rounded-xl w-full mt-4 font-semibold"
  onClick={() => setEtapa("plano-completo")}
>
  ➡️ Continuar para o Plano Completo
</button>
</button>
    </button>
  </div>
  ) : etapa === "plano-completo" ? (
  <div>
    <h2 className="text-2xl font-bold mb-4">
      Plano Completo
    </h2>

    <div className="flex gap-2 mb-4">
      <button className="bg-blue-600 text-white p-3 rounded-xl font-semibold">
        Tema
      </button>

      <button className="bg-slate-100 text-slate-800 p-3 rounded-xl font-semibold">
        Objetivo e Habilidade
      </button>

      <button className="bg-slate-100 text-slate-800 p-3 rounded-xl font-semibold">
        Metodologia
      </button>
    </div>

    <h3 className="text-xl font-bold mb-3">
      Temas das Aulas
    </h3>

    {gerarListaDeAulas().map((data, index) => (
      <div
        key={`${data}-${index}`}
        className="bg-slate-100 p-4 rounded-xl mb-3"
      >
        <p className="font-semibold">
  AULA {String(index + 1).padStart(2, "0")} DATA: {data} -{" "}
  {temasAulas[index] || "Tema não informado"}
</p>
      </div>
    ))}
  </div>
) : (
 
  <div>
            <h2 className="text-xl font-semibold mb-4">
              Para qual etapa de ensino?
            </h2>

            <div className="flex flex-col gap-3 mb-4">
              <button
                className="bg-green-600 text-white p-3 rounded-xl"
                onClick={() => {
                  setEtapa("fund1");
                  setSerie("");
                  setDisciplina("");
                  setMesSelecionado(null);
                  setDatas([]);
                }}
              >
                Ensino Fundamental I
              </button>

              <button
                className="bg-blue-600 text-white p-3 rounded-xl"
                onClick={() => {
                  setEtapa("fund2");
                  setSerie("");
                  setDisciplina("");
                  setMesSelecionado(null);
                  setDatas([]);
                }}
              >
                Ensino Fundamental II
              </button>
            </div>

            {etapa === "fund1" && (
              <div className="flex flex-col gap-2 mb-4">
                <h3 className="font-semibold">Escolha a série:</h3>

                {["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"].map(
                  (anoEscolar) => (
                    <button
                      key={anoEscolar}
                      className="bg-slate-200 p-2 rounded"
                      onClick={() => {
                        setSerie(anoEscolar);
                        setDisciplina("");
                        setMesSelecionado(null);
                        setDatas([]);
                      }}
                    >
                      {anoEscolar}
                    </button>
                  )
                )}
              </div>
            )}

            {etapa === "fund2" && (
              <div className="flex flex-col gap-2 mb-4">
                <h3 className="font-semibold">Escolha a série:</h3>

                {["6º Ano", "7º Ano", "8º Ano", "9º Ano"].map(
                  (anoEscolar) => (
                    <button
                      key={anoEscolar}
                      className="bg-slate-200 p-2 rounded"
                      onClick={() => {
                        setSerie(anoEscolar);
                        setDisciplina("");
                        setMesSelecionado(null);
                        setDatas([]);
                      }}
                    >
                      {anoEscolar}
                    </button>
                  )
                )}
              </div>
            )}

            {serie !== "" && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Série: {serie}</h3>
                <p className="font-semibold mb-2">Escolha a disciplina:</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {disciplinas.map((materia) => (
                    <button
                      key={materia.nome}
                      className={`${materia.cor} text-white p-4 rounded-xl font-semibold shadow`}
                      onClick={() => {
                        setDisciplina(materia.nome);
                        setMesSelecionado(null);
                        setDatas([]);
                      }}
                    >
                      {materia.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {disciplina !== "" && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">
                  Disciplina escolhida: {disciplina}
                </h3>

                <h3 className="font-semibold mb-2">Escolha o ano:</h3>

                <select
                  value={ano}
                  onChange={(e) => {
                    setAno(e.target.value);
                    setMesSelecionado(null);
                    setDatas([]);
                  }}
                  className="border p-3 rounded-xl w-full mb-4"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>

                <p className="font-semibold mb-2">Escolha o mês das aulas:</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {meses.map((mes) => (
                    <button
                      key={mes.nome}
                      className={`p-3 rounded-xl font-semibold shadow ${
                        mesSelecionado?.nome === mes.nome
                          ? "bg-blue-700 text-white"
                          : "bg-blue-100 text-blue-900"
                      }`}
                      onClick={() => {
                        setMesSelecionado(mes);
                        setDatas([]);
                      }}
                    >
                      {mes.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mesSelecionado && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">
                  Calendário de {mesSelecionado.nome} de {ano}
                </h3>

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
                  {Array.from({ length: espacosAntesDoPrimeiroDia() }).map(
                    (_, index) => (
                      <div key={`empty-${index}`}></div>
                    )
                  )}

                  {Array.from(
                    { length: quantidadeDiasDoMes() },
                    (_, i) => i + 1
                  ).map((dia) => {
                    const itemData = datas.find(
                      (item) => item.data === formatarData(dia)
                    );

                    return (
                      <button
                        key={dia}
                        className={`p-2 rounded ${corDoDia(dia)}`}
                        onClick={() => selecionarData(dia)}
                      >
                        <div className="flex flex-col items-center">
                          <span>{dia}</span>

                          {itemData && (
                            <div className="text-xs font-bold">
                              <div>{itemData.aulas} aula(s)</div>

                              <div className="flex gap-1 justify-center mt-1">
                                <span
                                  className="bg-white text-black px-2 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removerAula(dia);
                                  }}
                                >
                                  -
                                </span>

                                <span
                                  className="bg-white text-black px-2 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selecionarData(dia);
                                  }}
                                >
                                  +
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 text-sm">
                  <p>🟨 Sábado</p>
                  <p>🟥 Domingo ou feriado nacional</p>
                  <p>🟩 Data selecionada</p>
                </div>

                {datas.length > 0 && (
                  <div className="mt-4 bg-slate-100 p-3 rounded">
                    <p className="font-semibold">Datas selecionadas:</p>

                    {datas.map((item) => (
                      <p key={item.data}>
                        {item.data} — {item.aulas} aula(s)
                      </p>
                    ))}
                  </div>
                )}

                {datas.length > 0 && (
                  <div className="mt-4">
                    <button
  className="bg-purple-600 text-white p-3 rounded-xl w-full"
 onClick={() => setEtapa("planejamento")}
>
  Continuar para o planejamento
</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}