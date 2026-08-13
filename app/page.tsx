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
import { usarPlanejamentoGratis } from "./lib/profile";

type DataAula = {
  data: string;
  aulas: number;
};

export default function Home() {
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [contabilizandoPlano, setContabilizandoPlano] = useState(false);
  const [mostrarModalPremium, setMostrarModalPremium] = useState(false);

  const [etapa, setEtapa] = useState("inicio");

  const [ano, setAno] = useState("2026");
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [nomeMes, setNomeMes] = useState("");
  const [tipoPlanejamento, setTipoPlanejamento] = useState("");
  const [datasSelecionadas, setDatasSelecionadas] = useState<DataAula[]>([]);

  useEffect(() => {
    async function registrarIndicacaoParceiro() {
      const params = new URLSearchParams(
        window.location.search
      );

      const refRecebida =
        params.get("ref")?.trim().toUpperCase() || "";

      if (!refRecebida) {
        return;
      }

      localStorage.setItem(
        "parceiro_ref",
        refRecebida
      );

      let visitanteId =
        localStorage.getItem(
          "parceiro_visitante_id"
        );

      if (!visitanteId) {
        visitanteId = crypto.randomUUID();

        localStorage.setItem(
          "parceiro_visitante_id",
          visitanteId
        );
      }

      try {
        const resposta = await fetch(
          "/api/parcerias/clique",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              cupom: refRecebida,
              visitanteId,
            }),
          }
        );

        if (!resposta.ok) {
          const resultado =
            await resposta.json().catch(
              () => null
            );

          console.error(
            "Não foi possível registrar a indicação:",
            resultado
          );
        }
      } catch (error) {
        console.error(
          "Erro ao registrar indicação de parceiro:",
          error
        );
      }
    }

    registrarIndicacaoParceiro();
  }, []);

  useEffect(() => {
    async function verificarLogin() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao verificar login:", error);
      }

      if (data.session) {
        setUsuarioLogado(true);

        localStorage.removeItem("testeGratisConcluido");

        // O professor entra primeiro no novo painel.
        setEtapa("painel");

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

    setAno("2026");
    setDatasSelecionadas([]);
    setMesSelecionado(null);
    setNomeMes("");
    setTipoPlanejamento("");
  }

  function limparConteudoPlanoAnterior() {
    const chavesConteudo = [
      "temasPlano",
      "objetivosPlano",
      "recursosPlano",
      "metodologiaPlano",
      "avaliacaoPlano",
      "referenciasPlano",
      "atividadePlano",
      "temasGerados",
      "conteudosMensais",
    ];

    chavesConteudo.forEach((chave) => {
      localStorage.removeItem(chave);
    });
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

    const { data: perfilAtualizado, error: erroAtualizacao } = await supabase
      .from("profiles")
      .update({
        planos_feitos: quantidadeAtual + 1,
      })
      .eq("id", user.id)
      .select("id,planos_feitos")
      .maybeSingle();

    if (erroAtualizacao) {
      console.error("Erro ao contabilizar plano:", erroAtualizacao);
      throw erroAtualizacao;
    }

    if (!perfilAtualizado) {
      throw new Error(
        "O perfil do usuário não foi encontrado para contabilizar o plano."
      );
    }

    console.log("Plano contabilizado com sucesso.");
  }

  async function clicarEmSerie() {
    if (contabilizandoPlano) {
      return;
    }

    setContabilizandoPlano(true);

    try {
      limparConteudoPlanoAnterior();

      if (usuarioLogado) {
        await contabilizarPlano();
      }
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

  async function iniciarNovoPlanejamento() {
    const permissao = await usarPlanejamentoGratis();

    if (!permissao.permitido) {
      setMostrarModalPremium(true);
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
    <main className="min-h-screen bg-slate-50">
      {usuarioLogado ? (
        <TopoProfessor />
      ) : (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
          {/* LOGO / NOME */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900">
              Planej<span className="text-green-600">AI</span>
            </span>
          </div>

          {/* BOTÕES EXCLUSIVOS DO TESTE GRÁTIS */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/assinatura";
              }}
              className="shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:scale-[1.02] sm:px-4 sm:text-sm"
            >
              ⭐ Assinar Premium
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/login";
              }}
              className="shrink-0 rounded-lg border border-blue-500 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 sm:px-4 sm:text-sm"
            >
              Já tenho conta
            </button>
          </div>
        </div>
      )}

      {!usuarioLogado && (
        <div className="border-b border-green-200 bg-green-50 px-3 py-2 text-center">
          <p className="text-sm font-semibold text-green-800">
            🎁 Crie seu primeiro plano sem cadastro.
          </p>
        </div>
      )}

      {etapa === "painel" && usuarioLogado && (
        <section className="mx-auto flex min-h-[calc(100vh-70px)] max-w-6xl flex-col justify-center px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              O que você deseja criar hoje?
            </h1>

            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Escolha uma das ferramentas do PlanejAI.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <button
              type="button"
              onClick={iniciarNovoPlanejamento}
              className="group cursor-pointer rounded-2xl border border-green-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-400 hover:shadow-lg"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                📚
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">
                Planejamento de Aula
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Crie planos de aula completos, mensais ou organizados por aula.
              </p>

              <div className="mt-5 font-bold text-green-700">
                Criar planejamento →
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/avaliacoes";
              }}className="group cursor-pointer rounded-2xl border border-blue-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg"
              
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                📝
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">
                Avaliações
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Crie provas, simulados, avaliações diagnósticas e recuperações.
              </p>

              <div className="mt-5 font-bold text-blue-700">
                Criar avaliação →
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/atividades";
              }}
              className="group cursor-pointer rounded-2xl border border-amber-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                📄
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">
                Atividades
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Crie exercícios, revisões e atividades personalizadas.
              </p>

              <div className="mt-5 font-bold text-amber-700">
                Criar atividade →
              </div>
            </button>
          </div>
        </section>
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
          onSelecionarSerie={clicarEmSerie}
          onVoltar={() => {
            if (usuarioLogado) {
              setEtapa("painel");
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

      {mostrarModalPremium && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setMostrarModalPremium(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ×
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-4xl shadow-sm">
              👑
            </div>

            <h2 className="mt-6 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
              Para criar novos planejamentos,
              <span className="block text-emerald-600">
                assine o Plano Premium.
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
              Tenha acesso completo ao PlanejAI e continue criando
              planejamentos, avaliações e atividades com mais praticidade.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/assinatura";
                }}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl"
              >
                Quero ser Premium
              </button>

              <button
                type="button"
                onClick={() => setMostrarModalPremium(false)}
                className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Agora não
              </button>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-400">
              Você pode assinar quando quiser.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}