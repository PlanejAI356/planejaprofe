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
import {
  consumirTestePromocional,
  usarPlanejamentoGratis,
} from "./lib/profile";

type DataAula = {
  data: string;
  aulas: number;
};

export default function Home() {
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [contabilizandoPlano, setContabilizandoPlano] = useState(false);
  const [mostrarModalPremium, setMostrarModalPremium] = useState(false);
  const [mostrarModalRenovacao, setMostrarModalRenovacao] = useState(false);
  const [
    mostrarModalTesteConcluido,
    setMostrarModalTesteConcluido,
  ] = useState(false);

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
    const { data, error } =
      await supabase.auth.getSession();

    if (error) {
      console.error(
        "Erro ao verificar login:",
        error
      );
    }

    if (data.session) {
      setUsuarioLogado(true);

      localStorage.removeItem(
        "testeGratisConcluido"
      );

      setEtapa("painel");

      const usuario =
        data.session.user;

      const {
        data: perfil,
        error: erroPerfil,
      } = await supabase
        .from("profiles")
        .select(
          "plano, tipo_premium, premium_ate"
        )
        .eq("id", usuario.id)
        .maybeSingle();

      if (erroPerfil) {
        console.error(
          "Erro ao verificar assinatura:",
          erroPerfil
        );
      }

      if (perfil) {
        const acessoEspecial =
          perfil.tipo_premium ===
            "parceiro" ||
          perfil.tipo_premium ===
            "cortesia";

        if (
          perfil.plano === "premium" &&
          !acessoEspecial
        ) {
          let assinaturaVencida = false;

          if (!perfil.premium_ate) {
            assinaturaVencida = true;
          } else {
            const vencimento = new Date(
              perfil.premium_ate
            );

            assinaturaVencida =
              Number.isNaN(
                vencimento.getTime()
              ) ||
              vencimento <= new Date();
          }

          if (assinaturaVencida) {
            setMostrarModalRenovacao(true);
          }
        }
      }

      setCarregandoAuth(false);
      return;
    }

    setUsuarioLogado(false);

    const testeConcluido =
      localStorage.getItem(
        "testeGratisConcluido"
      ) === "true";

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
      "planoAtualTestePromocionalConsumido",
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
  localStorage.setItem("testeGratisAtivo", "true");
  setEtapa("painel");
}

  async function iniciarNovoPlanejamento() {
  const permissao =
    await usarPlanejamentoGratis();

  if (!permissao.permitido) {
    const mensagem =
      permissao.mensagem.toLowerCase();

    if (
      mensagem.includes("venceu") ||
      mensagem.includes("renov")
    ) {
      setMostrarModalRenovacao(true);
    } else {
      setMostrarModalPremium(true);
    }

    return;
  }

  limparPlanoAnterior();
  setEtapa("configuracao");
}

  async function abrirPlanoCompleto() {
    if (!usuarioLogado) {
      localStorage.setItem("testeGratisConcluido", "true");
      setEtapa("planoCompleto");
      return;
    }

    const testeJaConsumido =
      localStorage.getItem(
        "planoAtualTestePromocionalConsumido"
      ) === "true";

    if (!testeJaConsumido) {
      const resultadoTeste =
        await consumirTestePromocional();

      if (resultadoTeste.consumido) {
        localStorage.setItem(
          "planoAtualTestePromocionalConsumido",
          "true"
        );
      }
    }

    setEtapa("planoCompleto");
  }

  function irParaExportacao() {
    if (!usuarioLogado) {
      setMostrarModalTesteConcluido(true);
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
   return <Inicio />;
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
            🎁 Experimente o PlanejAI gratuitamente, sem cadastro.
          </p>
        </div>
      )}

      {etapa === "painel" && (
        <section className="relative flex min-h-[calc(100vh-70px)] items-center overflow-hidden bg-gradient-to-b from-white via-emerald-50/50 to-white px-4 py-8">
          {/* Livros decorativos */}
<div className="pointer-events-none absolute left-5 top-20 z-0 hidden lg:block xl:left-10">
  <div className="-rotate-6 text-[78px] leading-none drop-shadow-md">
    📚
  </div>

  <div className="absolute -right-5 -top-3 text-3xl">
    ✨
  </div>

  <div className="ml-14 mt-2 h-10 w-24 rounded-[50%] border-t-2 border-dashed border-green-500/70" />
</div>
          <div className="pointer-events-none absolute -left-40 top-10 h-80 w-[520px] rounded-[50%] bg-green-100/60 blur-3xl" />
          {/* Avião decorativo */}
<div className="pointer-events-none absolute right-6 top-16 z-0 hidden lg:block xl:right-12">
  <div className="relative h-40 w-52">

    <svg
      viewBox="0 0 220 160"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M8 135 C50 150 45 90 85 98 C125 106 112 145 150 132 C178 122 170 75 198 58"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="7 10"
        opacity="0.75"
      />
    </svg>

    <div className="absolute right-0 top-0 -rotate-12 text-6xl drop-shadow-sm">
      ✈️
    </div>

  </div>
</div>
          <div className="pointer-events-none absolute -right-44 top-24 h-96 w-[580px] rounded-[50%] bg-emerald-100/50 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-180px] left-[20%] h-80 w-[650px] rounded-[50%] bg-blue-50/70 blur-3xl" />
          {/* Formas decorativas inferiores */}
<div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-80 rotate-12 rounded-[45%] bg-emerald-100/60" />

<div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-80 -rotate-12 rounded-[45%] bg-green-100/60" />

<div className="pointer-events-none absolute bottom-8 left-12 hidden text-2xl lg:block">
  ⭐
</div>

<div className="pointer-events-none absolute bottom-10 right-16 hidden text-3xl lg:block">
  ✨
</div>
          <div className="relative z-10 mx-auto w-full max-w-[1220px]">
           <div className="mb-10 text-center">
              <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.18em] text-green-600">
                PlanejAI
              </p>
            <h1 className="text-3xl font-black tracking-[-0.035em] text-[#071c4d] sm:text-4xl lg:text-5xl">
                O que você deseja <span className="text-green-600">criar hoje?</span>
              </h1>
              <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-green-500" />
              <p className="mt-4 text-sm text-slate-600 sm:text-base">
                Escolha uma das ferramentas e comece a criar.
              </p>
            </div>

           <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

  {/* PLANEJAMENTO */}
  <button
    type="button"
    onClick={() => {
      if (usuarioLogado) {
        iniciarNovoPlanejamento();
      } else {
        limparPlanoAnterior();
        setEtapa("configuracao");
      }
    }}
    className="group relative flex min-h-[300px] cursor-pointer flex-col overflow-hidden rounded-[26px] border-2 border-green-400 bg-white p-6 text-left shadow-[0_14px_35px_rgba(34,197,94,0.14)] transition duration-200 hover:-translate-y-1.5 hover:border-green-500 hover:shadow-[0_20px_45px_rgba(34,197,94,0.22)]"
  >
    <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-green-100/80" />

    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl shadow-sm">
      📚
    </div>

    <h2 className="relative mt-4 text-[21px] font-black leading-tight text-[#071c4d]">
      Planejamento de Aula
    </h2>

    <p className="relative mt-2 text-sm leading-6 text-slate-600">
      Crie planos de aula completos, mensais ou organizados por aula.
    </p>

    <div className="relative mt-auto pt-5">
      <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-extrabold text-white shadow-md transition group-hover:bg-green-700 group-hover:shadow-lg">
        Criar planejamento
        <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </div>
  </button>

  {/* AVALIAÇÕES */}
  <button
    type="button"
    onClick={() => {
      window.location.href = "/avaliacoes";
    }}
    className="group relative flex min-h-[300px] cursor-pointer flex-col overflow-hidden rounded-[26px] border border-blue-200 bg-white p-6 text-left shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1.5 hover:border-blue-400 hover:shadow-xl"
  >
    <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-blue-100/70" />

    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl shadow-sm">
      📝
    </div>

    <h2 className="relative mt-4 text-[21px] font-black leading-tight text-[#071c4d]">
      Avaliações
    </h2>

    <p className="relative mt-2 text-sm leading-6 text-slate-600">
      Crie provas, simulados, avaliações diagnósticas e recuperações.
    </p>

    <div className="relative mt-auto pt-5">
      <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-extrabold text-white shadow-md transition group-hover:bg-blue-700 group-hover:shadow-lg">
        Criar avaliação
        <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </div>
  </button>

  {/* ATIVIDADES */}
  <button
    type="button"
    onClick={() => {
      window.location.href = "/atividades";
    }}
    className="group relative flex min-h-[300px] cursor-pointer flex-col overflow-hidden rounded-[26px] border border-amber-200 bg-white p-6 text-left shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1.5 hover:border-orange-400 hover:shadow-xl"
  >
    <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-amber-100/80" />

    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl shadow-sm">
      ✏️
    </div>

    <h2 className="relative mt-4 text-[21px] font-black leading-tight text-[#071c4d]">
      Atividades
    </h2>

    <p className="relative mt-2 text-sm leading-6 text-slate-600">
      Crie exercícios, revisões e atividades personalizadas.
    </p>

    <div className="relative mt-auto pt-5">
      <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 font-extrabold text-white shadow-md transition group-hover:bg-orange-600 group-hover:shadow-lg">
        Criar atividade
        <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </div>
  </button>

  {/* BIBLIOTECA */}
  <button
    type="button"
    onClick={() => {
      window.location.href = "/biblioteca";
    }}
    className="group relative flex min-h-[300px] cursor-pointer flex-col overflow-hidden rounded-[26px] border border-violet-200 bg-white p-6 text-left shadow-[0_14px_35px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1.5 hover:border-violet-400 hover:shadow-xl"
  >
    <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-violet-100/80" />

    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-3xl shadow-sm">
      📚
    </div>

    <h2 className="relative mt-4 text-[21px] font-black leading-tight text-[#071c4d]">
      Biblioteca de Materiais
    </h2>

    <p className="relative mt-2 text-sm leading-6 text-slate-600">
      Encontre planejamentos, atividades e avaliações prontas para usar.
    </p>

    <div className="relative mt-auto pt-5">
      <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 font-extrabold text-white shadow-md transition group-hover:bg-violet-700 group-hover:shadow-lg">
        Explorar biblioteca
        <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </div>
  </button>

</div>
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
  setEtapa("painel");
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

      {mostrarModalTesteConcluido && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() =>
                setMostrarModalTesteConcluido(false)
              }
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ×
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-4xl shadow-sm">
              🎉
            </div>

            <h2 className="mt-6 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
              Seu teste gratuito foi concluído!
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
              Você já conheceu como o PlanejAI cria seus materiais.
              Crie sua conta para continuar usando e liberar todos os recursos.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/cadastro";
                }}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl"
              >
                Criar minha conta
              </button>

              <button
                type="button"
                onClick={() =>
                  setMostrarModalTesteConcluido(false)
                }
                className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Agora não
              </button>
            </div>

            <p className="mt-4 text-xs font-medium text-slate-400">
              A criação da conta é gratuita.
            </p>
          </div>
        </div>
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
      {mostrarModalRenovacao && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-[2px]">
    <div className="relative w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-2xl sm:p-8">

      <button
        type="button"
        onClick={() =>
          setMostrarModalRenovacao(false)
        }
        aria-label="Fechar"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-slate-400 hover:bg-slate-100"
      >
        ×
      </button>

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-4xl">
        👑
      </div>

      <p className="mt-5 text-sm font-extrabold uppercase tracking-wider text-emerald-600">
        PlanejAI Premium
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
        Renove seu PlanejAI Premium
      </h2>

      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
        Sua assinatura chegou ao fim. Renove para continuar criando planejamentos, avaliações e atividades.
      </p>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-500">
          Renovação mensal
        </p>

        <p className="mt-1 text-3xl font-black text-emerald-600">
          R$ 29,90
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/assinatura";
          }}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg"
        >
          Renovar assinatura
        </button>

        <button
          type="button"
          onClick={() =>
            setMostrarModalRenovacao(false)
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600"
        >
          Agora não
        </button>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-400">
        Após a confirmação do pagamento, seu acesso Premium será renovado.
      </p>

    </div>
  </div>
)}
    </main>
  );
}