type BarraProgressoProps = {
  etapaAtual:
    | "configuracao"
    | "calendario"
    | "conteudos"
    | "planoCompleto"
    | "exportacao";
};

export default function BarraProgresso({ etapaAtual }: BarraProgressoProps) {
  const etapas = [
    { id: "configuracao", nome: "Configuração", icone: "⚙️" },
    { id: "calendario", nome: "Calendário", icone: "📅" },
    { id: "conteudos", nome: "Conteúdos", icone: "📚" },
    { id: "planoCompleto", nome: "Plano", icone: "📝" },
    { id: "exportacao", nome: "Exportação", icone: "📤" },
  ];

  const etapaIndex = etapas.findIndex((etapa) => etapa.id === etapaAtual);

  return (
    <div className="mb-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
      <p className="text-xs font-bold text-blue-700 mb-2">
        Etapa {etapaIndex + 1} de {etapas.length}
      </p>

      <div className="flex items-center">
        {etapas.map((etapa, index) => {
          const concluida = index < etapaIndex;
          const atual = index === etapaIndex;

          return (
            <div key={etapa.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold ${
                    concluida
                      ? "bg-green-600 text-white"
                      : atual
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-400 border border-slate-200"
                  }`}
                >
                  {concluida ? "✓" : etapa.icone}
                </div>

                <span className="hidden md:block text-[11px] mt-1 font-semibold text-slate-600">
                  {etapa.nome}
                </span>
              </div>

              {index < etapas.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full ${
                    index < etapaIndex ? "bg-green-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}