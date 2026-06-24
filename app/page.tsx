"use client";

import { useState } from "react";
import Inicio from "./componentes/Inicio";
import ConfiguracaoPlano from "./componentes/ConfiguracaoPlano";
import Calendario from "./componentes/Calendario";
import Conteudos from "./componentes/Conteudos";
import PlanoCompleto from "./componentes/PlanoCompleto";
import Exportacao from "./componentes/Exportacao";

type DataAula = {
  data: string;
  aulas: number;
};

export default function Home() {
  const [etapa, setEtapa] = useState("inicio");

  const [ano, setAno] = useState("2026");
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [nomeMes, setNomeMes] = useState("");
  const [tipoPlanejamento, setTipoPlanejamento] = useState("");
 const [datasSelecionadas, setDatasSelecionadas] = useState<DataAula[]>([]);

function mudarEtapa(novaEtapa: string) {
  console.log("Mudando para:", novaEtapa);
  setEtapa(novaEtapa);
}

  return (
    <main>
      {etapa === "inicio" && (
        <Inicio
          onComecar={() => {
            setTipoPlanejamento("");
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