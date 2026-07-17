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
  const [contabilizandoPlano, setContabilizandoPlano] = useState(false);

  const [etapa, setEtapa] = useState("inicio");

  const [ano, setAno] = useState("2026");
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [nomeMes, setNomeMes] = useState("");
  const [tipoPlanejamento, setTipoPlanejamento] = useState("");
  const [datasSelecionadas, setDatasSelecionadas] = useState<DataAula[]>([]);

  useEffect(() => {
    async function verificarLogin() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao verificar login:", error);
      }

      if (data.session) {
        setUsuarioLogado(true);
        localStorage.removeItem("testeGratisConcluido");

        // Ao entrar na conta, abre a seleção/configuração do plano.
        // Aqui não contabiliza plano.
        setEtapa("configuracao");
        setCarregandoAuth(false);
        return;
      }

      setUsuarioLogado(false);

      const testeConcluido =
        localStorage.getItem("testeGratisConcluido") === "true";

      if (testeConcluido) {
        window.location.replace("/cadastro");
        return;
      }

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

    chaves.forEach((chave) => {
      localStorage.removeItem(chave);
    });

    // Não apaga login, nome do professor ou referências salvas.
    setAno("2026");
    setDatasSelecionadas([]);
    setMesSelecionado(null);
    setNomeMes("");
    setTipoPlanejamento("");
  }

  async function contabilizarPlano() {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) {
    console.error("Erro ao identificar usuário:", erroUsuario);
    throw erroUsuario;
  }

  if (!user) {
    console.error("Nenhum usuário logado.");
    return;
  }

  const { data: perfil, error: erroBusca } = await supabase
    .from("profiles")
    .select("planos_feitos")
    .eq("id", user.id)
    .single();

  if (erroBusca) {
    console.error("Erro ao buscar quantidade de planos:", erroBusca);
    throw erroBusca;
  }

  const quantidadeAtual = Number(perfil?.planos_feitos ?? 0);

  const { error: erroAtualizacao } = await supabase
    .from("profiles")
    .update({
      planos_feitos: quantidadeAtual + 1,
    })
    .eq("id", user.id);

  if (erroAtualizacao) {
    console.error("Erro ao contabilizar plano:", erroAtualizacao);
    throw erroAtualizacao;
  }

  console.log("Plano contabilizado com sucesso.");
}
  async function clicarEmSerie() {
    if (contabilizandoPlano) {
      return;
    }

    setContabilizandoPlano(true);

    try {
      // Professores logados terão o plano contabilizado.
      if (usuarioLogado) {
        await contabilizarPlano();
      }

      // Depois de contabilizar, limpa o planejamento anterior.
      limparPlanoAnterior();

      // Volta para a etapa de escolha/configuração da série.
      setEtapa("configuracao");
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível contabilizar o plano. Verifique a conexão e tente novamente."
      );
    } finally {
      setContabilizandoPlano(false);
    }
  }

  function iniciarTesteGratis() {
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

    // A exportação não contabiliza.
    // A contabilização acontece ao clicar em Série.
    setEtapa("exportacao");
  }

  async function sair() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error);
      alert("Não foi possível sair da conta. Tente novamente.");
      return;
    }

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

  if (etapa === "inicio" && !usuarioLogado) {
    return <Inicio onComecar={iniciarTesteGratis} />;
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
          onVoltar={() => {
            if (usuarioLogado) {
              clicarEmSerie();
            } else {
              setEtapa("inicio");
            }
          }}
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
          onVoltar={clicarEmSerie}
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