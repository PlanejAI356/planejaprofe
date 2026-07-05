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
  const [etapa, setEtapa] = useState("inicio");

  const [ano, setAno] = useState("2026");
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [nomeMes, setNomeMes] = useState("");
  const [tipoPlanejamento, setTipoPlanejamento] = useState("");
  const [datasSelecionadas, setDatasSelecionadas] = useState<DataAula[]>([]);

  useEffect(() => {
    async function verificarLogin() {
      await supabase.auth.getSession();
      setCarregandoAuth(false);
    }

    verificarLogin();
  }, []);

  function mudarEtapa(novaEtapa: string) {
    console.log("Mudando para:", novaEtapa);
    setEtapa(novaEtapa);
  }

  function limparPlanoSalvo() {
    localStorage.removeItem("temasPlano");
    localStorage.removeItem("objetivosPlano");
    localStorage.removeItem("metodologiaPlano");
    localStorage.removeItem("avaliacaoPlano");
    localStorage.removeItem("referenciasPlano");
    localStorage.removeItem("atividadePlano");
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (carregandoAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-semibold">Carregando PlanejAI...</p>
      </main>
    );
  }

  return (
    <main>
     {etapa !== "inicio" && (
  <div className="flex justify-between items-center px-6 py-2 bg-white border-b border-slate-200">
    <TopoProfessor />

    <button
      onClick={sair}
      className="border border-red-400 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-semibold"
    >
      Sair
    </button>
  </div>
)}
      {etapa === "inicio" && (
        <Inicio
          onComecar={() => {
            limparPlanoSalvo();
            setTipoPlanejamento("");
            setDatasSelecionadas([]);
            setMesSelecionado(null);
            setNomeMes("");
            setEtapa("configuracao");
          }}
        />
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
          onContinuar={() => setEtapa("calendario")}
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
          onContinuar={() => setEtapa("planoCompleto")}
        />
      )}

      {etapa === "planoCompleto" && (
        <PlanoCompleto
          onVoltar={() => mudarEtapa("conteudos")}
          onExportar={() => mudarEtapa("exportacao")}
        />
      )}

      {etapa === "exportacao" && (
        <Exportacao onVoltar={() => mudarEtapa("planoCompleto")} />
      )}
    </main>
  );
}