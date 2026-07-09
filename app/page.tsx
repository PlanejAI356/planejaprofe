"use client";

import { useEffect, useState } from "react";
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
  const [etapa, setEtapa] = useState("configuracao");

  const [ano, setAno] = useState("2026");
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [nomeMes, setNomeMes] = useState("");
  const [tipoPlanejamento, setTipoPlanejamento] = useState("");
  const [datasSelecionadas, setDatasSelecionadas] = useState<DataAula[]>([]);

  useEffect(() => {
    async function verificarLogin() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.replace("/login");
        return;
      }

      setCarregandoAuth(false);
    }

    verificarLogin();
  }, []);

  function limparPlanoAnterior() {
  localStorage.removeItem("temasPlano");
  localStorage.removeItem("objetivosPlano");
  localStorage.removeItem("recursosPlano");
  localStorage.removeItem("metodologiaPlano");
  localStorage.removeItem("avaliacaoPlano");
  localStorage.removeItem("referenciasPlano");
  localStorage.removeItem("atividadePlano");

  setDatasSelecionadas([]);
}

function mudarEtapa(novaEtapa: string) {
  if (novaEtapa === "configuracao") {
    limparPlanoAnterior();
  }

  setEtapa(novaEtapa);
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
      <div className="flex justify-between items-center px-6 py-2 bg-white border-b border-slate-200">
        <TopoProfessor />

        <button
          onClick={sair}
          className="border border-red-400 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-semibold"
        >
          Sair
        </button>
      </div>

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
          onVoltar={() => mudarEtapa("configuracao")}
          onContinuar={() => mudarEtapa("calendario")}
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
          onVoltar={() => setEtapa("planoCompleto")}
          onExportar={() => mudarEtapa("exportacao")}
        />
      )}

      {etapa === "exportacao" && (
        <Exportacao onVoltar={() => mudarEtapa("planoCompleto")} />
      )}
    </main>
  );
}