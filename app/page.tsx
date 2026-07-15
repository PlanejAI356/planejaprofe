"use client";

import { useEffect, useState } from "react";
import Inicio from "./componentes/Inicio";
import ConfiguracaoPlano from "./componentes/ConfiguracaoPlanoV2";
import Calendario from "./componentes/Calendario";
import Conteudos from "./componentes/Conteudos";
import PlanoCompleto from "./componentes/PlanoCompleto";
import Exportacao from "./componentes/Exportacao";
import TopoProfessor from "./componentes/TopoProfessor";
import { supabase } from "./lib/supabase";

type DataAula = {
  data: string;
  aulas: number;
};

export default function Home() {
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [etapa, setEtapa] = useState("inicio");

  const [ano, setAno] = useState("2026");
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [nomeMes, setNomeMes] = useState("");
  const [tipoPlanejamento, setTipoPlanejamento] = useState("");
  const [datasSelecionadas, setDatasSelecionadas] = useState<DataAula[]>([]);

  useEffect(() => {
    async function verificarLogin() {
      const { data } = await supabase.auth.getSession();
      const logado = Boolean(data.session);

      setUsuarioLogado(logado);

      if (logado) {
        localStorage.removeItem("testeGratisConcluido");
      }

      // Sempre abre na página inicial.
      setEtapa("inicio");
      setCarregandoAuth(false);
    }

    verificarLogin();
  }, []);

  function limparPlanoAnterior() {
    const chaves = [
      "temasPlano",
      "objetivosPlano",
      "recursosPlano",
      "metodologiaPlano",
      "avaliacaoPlano",
      "referenciasPlano",
      "atividadePlano",
      "temasGerados",
      "conteudosMensais",
      "serieSelecionada",
      "disciplinaSelecionada",
      "etapaEnsino",
      "tipoPlanejamento",
      "turmaInfantilDetalhe",
      "datasSelecionadas",
      "quantidadeAulas",
      "periodoSelecionado",
      "mesSelecionado",
      "nomeMes",
      "planoAtualContabilizado",
    ];

    chaves.forEach((chave) => localStorage.removeItem(chave));

    // Não apagar "referenciasSalvasProfessor",
    // pois essas referências devem permanecer para os próximos planos.

    setAno("2026");
    setDatasSelecionadas([]);
    setMesSelecionado(null);
    setNomeMes("");
    setTipoPlanejamento("");
  }

  function iniciarPlano() {
    if (
      !usuarioLogado &&
      localStorage.getItem("testeGratisConcluido") === "true"
    ) {
      window.location.href = "/cadastro";
      return;
    }

    limparPlanoAnterior();
    setEtapa("configuracao");
  }

  function abrirPlanoCompleto() {
    if (!usuarioLogado) {
      localStorage.setItem("testeGratisConcluido", "true");
    }

    setEtapa("planoCompleto");
  }

  function irParaExportacao() {
    if (!usuarioLogado) {
      alert(
        "Você concluiu seu teste do PlanejAI. Crie sua conta para exportar o plano e continuar usando."
      );

      window.location.href = "/cadastro";
      return;
    }

    setEtapa("exportacao");
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (carregandoAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-semibold text-slate-600">
          Carregando PlanejAI...
        </p>
      </main>
    );
  }

  // A página inicial aparece sempre, inclusive para usuários cadastrados.
  if (etapa === "inicio") {
    return <Inicio onComecar={iniciarPlano} />;
  }

  return (
    <main>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
        {usuarioLogado ? (
          <TopoProfessor />
        ) : (
          <div className="flex items-center gap-2">
            <img
              src="/logo-planejai.png"
              alt="PlanejAI"
              className="h-9 w-9 object-contain"
            />

            <span className="text-lg font-extrabold text-slate-900">
              Planej<span className="text-green-600">AI</span>
            </span>
          </div>
        )}

        {usuarioLogado ? (
          <button
            type="button"
            onClick={sair}
            className="shrink-0 rounded-lg border border-red-400 px-3 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-50"
          >
            Sair
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              window.location.href = "/login";
            }}
            className="shrink-0 rounded-lg border border-blue-500 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 sm:text-sm"
          >
            Já tenho conta
          </button>
        )}
      </div>

      {!usuarioLogado && (
        <div className="border-b border-green-200 bg-green-50 px-3 py-2 text-center">
          <p className="text-sm font-semibold text-green-800">
            🎁 Crie seu primeiro plano sem cadastro.
          </p>
        </div>
      )}

      {etapa === "configuracao" && (
        <ConfiguracaoPlano
          ano={ano}
          setAno={setAno}
          mesSelecionado={mesSelecionado}
          setMesSelecionado={setMesSelecionado}
          nomeMes={nomeMes}
          setNomeMes={setNomeMes}
          tipoPlanejamento={tipoPlanejamento}
          setTipoPlanejamento={setTipoPlanejamento}
          onVoltar={() => setEtapa("inicio")}
          onContinuar={() => {
            setDatasSelecionadas([]);
            setEtapa("calendario");
          }}
        />
      )}

      {etapa === "calendario" && mesSelecionado !== null && (
        <Calendario
          ano={ano}
          mesSelecionado={mesSelecionado}
          nomeMes={nomeMes}
          tipoPlanejamento={tipoPlanejamento}
          onVoltar={() => setEtapa("configuracao")}
          onContinuar={(datas: DataAula[]) => {
            setDatasSelecionadas(datas);
            setEtapa("conteudos");
          }}
        />
      )}

      {etapa === "conteudos" && (
        <Conteudos
          datasSelecionadas={datasSelecionadas}
          tipoPlanejamento={tipoPlanejamento}
          onVoltar={() => setEtapa("calendario")}
          onContinuar={abrirPlanoCompleto}
        />
      )}

      {etapa === "planoCompleto" && (
        <PlanoCompleto
          onVoltar={() => setEtapa("conteudos")}
          onExportar={irParaExportacao}
        />
      )}

      {etapa === "exportacao" && (
        <Exportacao onVoltar={() => setEtapa("planoCompleto")} />
      )}
    </main>
  );
}