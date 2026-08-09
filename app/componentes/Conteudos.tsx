"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { usarPlanejamentoGratis } from "../lib/profile";

type DataAula = {
  data: string;
  aulas: number;
};

type ConteudosProps = {
  datasSelecionadas: DataAula[];
  tipoPlanejamento: string;
  onContinuar: () => void;
  onVoltar: () => void;
};

export default function Conteudos({
  datasSelecionadas,
  tipoPlanejamento,
  onContinuar,
  onVoltar,
}: ConteudosProps) {
  const [modo, setModo] = useState("");
  const [tema, setTema] = useState("");
  const [resultadoIA, setResultadoIA] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarModalPremium, setMostrarModalPremium] = useState(false);
  const [mensagemPremium, setMensagemPremium] = useState("");

  const aulas = Array.isArray(datasSelecionadas)
    ? datasSelecionadas.flatMap((item) =>
        Array.from({ length: item.aulas }, () => item.data)
      )
    : [];

  const textoAulas = aulas
    .map(
      (data, index) =>
        `AULA ${String(index + 1).padStart(2, "0")} - ${data} - `
    )
    .join("\n");

  function mostrarBloqueioPremium(mensagem: string) {
    setMensagemPremium(mensagem);
    setMostrarModalPremium(true);
  }

 async function verificarPermissao() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sem login = teste grátis da página inicial.
  // Não existe perfil ainda, então não devemos consultar planos_restantes.
  if (!user) {
    return true;
  }

  // Usuário logado: verifica se é Premium ou se ainda possui
  // algum planejamento gratuito disponível.
  const permissao = await usarPlanejamentoGratis();

  if (!permissao.permitido) {
    mostrarBloqueioPremium(permissao.mensagem);
    return false;
  }

  return true;
}

  async function gerarPlanoIA() {
    if (!tema.trim()) {
      alert("Digite o tema geral antes de gerar com IA.");
      return;
    }

    setCarregando(true);

    const permitido = await verificarPermissao();

    if (!permitido) {
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "temas",
          tema: tema.trim(),
          aulas: textoAulas,
          tipoPlanejamento: "aula",
          etapa:
            localStorage.getItem("etapaEnsino") || "Ensino Fundamental",
          serie: localStorage.getItem("serieSelecionada") || "6º ano",
          disciplina:
            localStorage.getItem("disciplinaSelecionada") || "Ciências",
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados?.erro || "Não foi possível gerar os temas.");
      }

      const textoGerado = dados?.texto?.trim();

      if (!textoGerado) {
        throw new Error("A IA não retornou os temas das aulas.");
      }

      setResultadoIA(textoGerado);
      localStorage.setItem("temasPlano", textoGerado);
    } catch (erro) {
      console.error(erro);

      alert(
        erro instanceof Error
          ? erro.message
          : "Ocorreu um erro ao gerar os temas."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function gerarConteudosMensaisIA() {
    if (!tema.trim()) {
      alert(
        "Digite um ou mais temas no campo Tema geral antes de gerar os conteúdos."
      );
      return;
    }

    setCarregando(true);

    const permitido = await verificarPermissao();

    if (!permitido) {
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "conteudos_mensais",
          tema: tema.trim(),
          tipoPlanejamento: "mensal",
          etapa:
            localStorage.getItem("etapaEnsino") || "Ensino Fundamental",
          serie: localStorage.getItem("serieSelecionada") || "6º ano",
          disciplina:
            localStorage.getItem("disciplinaSelecionada") || "Ciências",
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados?.erro || "Não foi possível gerar os conteúdos do mês."
        );
      }

      const textoGerado = dados?.texto?.trim();

      if (!textoGerado) {
        throw new Error("A IA não retornou os conteúdos do mês.");
      }

      setResultadoIA(textoGerado);

      localStorage.setItem("temasPlano", textoGerado);
      localStorage.setItem("conteudosMensais", textoGerado);
    } catch (erro) {
      console.error(erro);

      alert(
        erro instanceof Error
          ? erro.message
          : "Ocorreu um erro ao gerar os conteúdos mensais."
      );
    } finally {
      setCarregando(false);
    }
  }

  function continuar() {
    if (tipoPlanejamento === "mensal") {
      if (!resultadoIA.trim()) {
        alert(
          "Digite ou gere os conteúdos do mês antes de continuar."
        );
        return;
      }

      localStorage.setItem("temasPlano", resultadoIA);
      localStorage.setItem("conteudosMensais", resultadoIA);
      localStorage.setItem("tipoPlanejamento", "mensal");

      onContinuar();
      return;
    }

    const textoParaSalvar = resultadoIA || textoAulas;

    if (!textoParaSalvar.trim()) {
      alert("Informe ou gere os temas das aulas antes de continuar.");
      return;
    }

    localStorage.setItem("temasPlano", textoParaSalvar);
    localStorage.setItem("tipoPlanejamento", "aula");

    onContinuar();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      {mostrarModalPremium && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
              🚀
            </div>

            <h2 className="mb-3 text-2xl font-extrabold text-slate-900">
              Limite do Plano Gratuito
            </h2>

            <p className="mb-5 text-slate-600">
              {mensagemPremium ||
  "Seu teste gratuito já foi utilizado. Assine o Plano Premium para continuar."}
            </p>

            <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-700">
              <p className="mb-2 font-bold">
                O Plano Premium inclui:
              </p>

              <p>✅ Planejamentos com IA</p>
              <p>✅ Planos completos e editáveis</p>
              <p>✅ Mais praticidade para sua rotina</p>
              <p>✅ Exportação do planejamento</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMostrarModalPremium(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/assinatura";
                }}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-green-600 px-4 py-3 font-bold text-white shadow-lg transition hover:scale-[1.02]"
              >
                Assinar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl rounded-[32px] border border-emerald-100 bg-white p-5 shadow-[0_20px_50px_rgba(16,185,129,0.12)] md:p-6">
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
            Conteúdos das aulas
          </h1>

          <p className="mt-1 text-sm text-slate-500 md:text-base">
            Informe um tema geral ou deixe a IA organizar os conteúdos das aulas.
          </p>
        </div>

        <label className="mb-2 block text-lg font-bold text-slate-800">
          Tema geral
        </label>

        <input
          type="text"
          placeholder={
            tipoPlanejamento === "mensal"
              ? "Ex.: Água, preservação ambiental e tratamento da água"
              : "Ex.: Água"
          }
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="mb-5 w-full rounded-2xl border border-slate-200 px-5 py-4 text-lg shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />

        {tipoPlanejamento === "aula" && (
          <>
            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setModo("ia");
                  gerarPlanoIA();
                }}
                disabled={carregando}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-green-600 p-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando
                  ? "Gerando..."
                  : "✨ Destrinchar com IA"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setModo("manual");
                  setResultadoIA(textoAulas);
                }}
                className="cursor-pointer rounded-xl border border-emerald-100 bg-white p-3 font-semibold text-slate-700 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md"
              >
                ✍️ Informar os temas das aulas
              </button>
            </div>

            {modo && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
                <h2 className="mb-3 font-bold text-slate-800">
                  Conteúdos das aulas
                </h2>

                <textarea
                  value={resultadoIA || textoAulas}
                  onChange={(e) => {
                    setResultadoIA(e.target.value);
                    localStorage.setItem(
                      "temasPlano",
                      e.target.value
                    );
                  }}
                  placeholder="AULA 01 - 06/07/2026 - Tema da aula"
                  className="min-h-[260px] w-full resize-none rounded-2xl border border-slate-200 p-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            )}
          </>
        )}

        {tipoPlanejamento === "mensal" && (
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-bold text-slate-800">
                  Conteúdos do mês
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Digite um ou mais temas acima e peça sugestões à IA.
                </p>
              </div>

              <button
                type="button"
                onClick={gerarConteudosMensaisIA}
                disabled={carregando}
                className="shrink-0 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-green-600 px-5 py-3 font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando
                  ? "Gerando conteúdos..."
                  : "✨ Gerar conteúdos com IA"}
              </button>
            </div>

            <textarea
              value={resultadoIA}
              onChange={(e) => {
                setResultadoIA(e.target.value);

                localStorage.setItem(
                  "temasPlano",
                  e.target.value
                );

                localStorage.setItem(
                  "conteudosMensais",
                  e.target.value
                );
              }}
              placeholder="Os conteúdos sugeridos pela IA aparecerão aqui. Você poderá editar o texto antes de continuar."
              className="min-h-[260px] w-full resize-none rounded-2xl border border-slate-200 p-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={onVoltar}
            className="w-full cursor-pointer rounded-xl border border-emerald-100 bg-white p-3 font-semibold text-slate-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50"
          >
            Voltar para o Calendário
          </button>

          <button
            type="button"
            onClick={continuar}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-green-600 p-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.01]"
          >
            Continuar para o Plano Completo
          </button>
        </div>
      </div>
    </div>
  );
}