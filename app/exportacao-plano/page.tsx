"use client";

import Exportacao from "../componentes/Exportacao";

export default function ExportacaoPlanoPage() {
  return (
    <Exportacao
      onVoltar={() => {
        window.location.href = "/meus-planos";
      }}
    />
  );
}