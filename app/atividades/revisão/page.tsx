"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ModoCriacao = "folha" | "especifica" | "revisao";
type FormaConteudo = "tema" | "palavras";

type ConfiguracaoAtividade = {
  modoCriacao: ModoCriacao;
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  trabalhadoSala: string;
  observacoes: string;
  quantidade: number;
  tipoEspecifico?: string;
  formaConteudo?: FormaConteudo;
  palavras?: string[];
};

type Exercicio = {
  id: number;
  titulo: string;
  conteudo: string;
};

function nomeModo(modo: ModoCriacao) {
  if (modo === "especifica") return "Atividade específica";
  if (modo === "revisao") return "Folha de revisão";
  return "Folha de atividades";
}

function criarExerciciosExemplo(
  configuracao: ConfiguracaoAtividade
): Exercicio[] {
  const quantidade = Math.max(1, configuracao.quantidade || 6);
  const palavras = configuracao.palavras || [];

  if (configuracao.modoCriacao === "especifica") {
    const tipo = configuracao.tipoEspecifico || "Atividade específica";

    const listaPalavras =
      palavras.length > 0
        ? palavras.join(", ")
        : `palavras relacionadas ao tema “${configuracao.conteudo}”`;

    return [
      {
        id: 1,
        titulo: tipo,
        conteudo:
          `Esta será uma atividade do tipo “${tipo}”.\n\n` +
          `Tema: ${configuracao.conteudo}\n` +
          `Itens que serão utilizados: ${listaPalavras}\n` +
          `Quantidade solicitada: ${quantidade}\n\n` +
          "Na próxima etapa, a inteligência artificial montará a atividade completa e pronta para revisão.",
      },
    ];
  }

  const modelosFolha = [
    {
      titulo: "Observe e responda",
      conteudo:
        `Observe as informações ou imagens relacionadas ao tema “${configuracao.conteudo}” e responda às questões propostas.`,
    },
    {
      titulo: "Complete",
      conteudo:
        `Complete corretamente as frases, palavras ou conceitos sobre “${configuracao.conteudo}”.`,
    },
    {
      titulo: "Relacione",
      conteudo:
        `Relacione os elementos das duas colunas de acordo com o conteúdo “${configuracao.conteudo}”.`,
    },
    {
      titulo: "Verdadeiro ou falso",
      conteudo:
        `Analise as afirmativas sobre “${configuracao.conteudo}” e marque V para verdadeiro ou F para falso.`,
    },
    {
      titulo: "Desafio",
      conteudo:
        `Resolva o desafio final relacionado ao tema “${configuracao.conteudo}”.`,
    },
    {
      titulo: "Interpretação",
      conteudo:
        `Leia o texto curto sobre “${configuracao.conteudo}” e responda às perguntas.`,
    },
    {
      titulo: "Aplicação prática",
      conteudo:
        `Utilize o que aprendeu sobre “${configuracao.conteudo}” para resolver uma situação do cotidiano.`,
    },
    {
      titulo: "Organize as informações",
      conteudo:
        `Organize as informações do conteúdo “${configuracao.conteudo}” em uma sequência, tabela ou esquema.`,
    },
    {
      titulo: "Questão objetiva",
      conteudo:
        `Marque a alternativa correta sobre “${configuracao.conteudo}”.`,
    },
    {
      titulo: "Produção",
      conteudo:
        `Produza uma resposta, frase, explicação ou registro relacionado a “${configuracao.conteudo}”.`,
    },
  ];

  const modelosRevisao = [
    {
      titulo: "Retomando os conceitos",
      conteudo:
        `Complete as informações principais dos conteúdos: ${configuracao.conteudo}.`,
    },
    {
      titulo: "Relacione",
      conteudo:
        `Associe cada conceito à sua explicação correta considerando os conteúdos: ${configuracao.conteudo}.`,
    },
    {
      titulo: "Verdadeiro ou falso",
      conteudo:
        `Analise as afirmativas sobre ${configuracao.conteudo} e marque V ou F.`,
    },
    {
      titulo: "Questões objetivas",
      conteudo:
        `Marque as alternativas corretas sobre os conteúdos revisados: ${configuracao.conteudo}.`,
    },
    {
      titulo: "Questão discursiva",
      conteudo:
        `Explique com suas palavras um dos principais conceitos estudados em ${configuracao.conteudo}.`,
    },
    {
      titulo: "Desafio de revisão",
      conteudo:
        `Resolva uma situação que reúna diferentes conhecimentos sobre ${configuracao.conteudo}.`,
    },
    {
      titulo: "Complete o esquema",
      conteudo:
        `Complete o esquema com as informações mais importantes sobre ${configuracao.conteudo}.`,
    },
    {
      titulo: "Observe e responda",
      conteudo:
        `Observe a imagem, tabela ou situação e responda com base em ${configuracao.conteudo}.`,
    },
    {
      titulo: "Caça aos erros",
      conteudo:
        `Encontre e corrija os erros nas afirmações relacionadas a ${configuracao.conteudo}.`,
    },
    {
      titulo: "Síntese final",
      conteudo:
        `Registre o que você aprendeu sobre ${configuracao.conteudo}.`,
    },
  ];

  const base =
    configuracao.modoCriacao === "revisao"
      ? modelosRevisao
      : modelosFolha;

  return Array.from({ length: quantidade }, (_, indice) => {
    const modelo = base[indice % base.length];

    return {
      id: indice + 1,
      titulo: modelo.titulo,
      conteudo: modelo.conteudo,
    };
  });
}

export default function RevisaoAtividadePage() {
  const router = useRouter();

  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividade | null>(null);

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("configuracaoAtividade");

    if (!dadosSalvos) {
      router.push("/atividades");
      return;
    }

    try {
      const dados = JSON.parse(dadosSalvos) as ConfiguracaoAtividade;
      setConfiguracao(dados);
      setExercicios(criarExerciciosExemplo(dados));
    } catch {
      router.push("/atividades");
    }
  }, [router]);

  const resumoPalavras = useMemo(() => {
    if (!configuracao?.palavras?.length) return "";

    return configuracao.palavras.join(", ");
  }, [configuracao]);

  function excluirExercicio(id: number) {
    setExercicios((listaAtual) =>
      listaAtual
        .filter((exercicio) => exercicio.id !== id)
        .map((exercicio, indice) => ({
          ...exercicio,
          id: indice + 1,
        }))
    );
  }

  function editarExercicio(id: number) {
    setExercicios((listaAtual) =>
      listaAtual.map((exercicio) => {
        if (exercicio.id !== id) return exercicio;

        const novoTitulo = window.prompt(
          "Edite o título do exercício:",
          exercicio.titulo
        );

        if (novoTitulo === null) return exercicio;

        const novoConteudo = window.prompt(
          "Edite o conteúdo do exercício:",
          exercicio.conteudo
        );

        if (novoConteudo === null) return exercicio;

        return {
          ...exercicio,
          titulo: novoTitulo.trim() || exercicio.titulo,
          conteudo: novoConteudo.trim() || exercicio.conteudo,
        };
      })
    );
  }

  function refazerExercicio(id: number) {
    setExercicios((listaAtual) =>
      listaAtual.map((exercicio) =>
        exercicio.id === id
          ? {
              ...exercicio,
              conteudo:
                "Novo exercício de exemplo criado para substituir o anterior. A geração definitiva será feita pela inteligência artificial.",
            }
          : exercicio
      )
    );
  }

  function adicionarExercicio() {
    setExercicios((listaAtual) => [
      ...listaAtual,
      {
        id: listaAtual.length + 1,
        titulo: "Novo exercício",
        conteudo:
          "Este exercício será configurado e gerado pela inteligência artificial posteriormente.",
      },
    ]);
  }

  if (!configuracao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 font-semibold text-emerald-700">
          <Sparkles className="animate-pulse" />
          Carregando atividade...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Revisão da atividade
            </h1>

            <p className="text-sm text-slate-700">
              {configuracao.serie} • {configuracao.disciplina} •{" "}
              {configuracao.conteudo}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/atividades")}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            <ArrowLeft size={19} />
            Voltar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                {nomeModo(configuracao.modoCriacao)}
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Revise o material antes de montar a folha final
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Você poderá editar, refazer, excluir ou acrescentar novos
                exercícios.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700">
              <p>
                <strong>Quantidade:</strong> {configuracao.quantidade}
              </p>

              {configuracao.tipoEspecifico && (
                <p className="mt-1">
                  <strong>Tipo:</strong> {configuracao.tipoEspecifico}
                </p>
              )}
            </div>
          </div>

          {resumoPalavras && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-white px-4 py-3">
              <p className="text-sm font-bold text-slate-950">
                Palavras escolhidas
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {resumoPalavras}
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-4">
          {exercicios.map((exercicio) => (
            <article
              key={exercicio.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 text-slate-400">
                  <GripVertical size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">
                        {configuracao.modoCriacao === "especifica"
                          ? "ATIVIDADE"
                          : `EXERCÍCIO ${exercicio.id}`}
                      </p>

                      <h3 className="text-lg font-bold text-slate-950">
                        {exercicio.titulo}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editarExercicio(exercicio.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil size={16} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => refazerExercicio(exercicio.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <RefreshCw size={16} />
                        Refazer
                      </button>

                      <button
                        type="button"
                        onClick={() => excluirExercicio(exercicio.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap pt-4 leading-7 text-slate-800">
                    {exercicio.conteudo}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {exercicios.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-bold text-slate-950">
              Nenhum exercício na atividade.
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Clique em “Adicionar exercício” para continuar.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={adicionarExercicio}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-6 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            <Plus size={20} />
            Adicionar exercício
          </button>

          <button
            type="button"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-white transition hover:bg-emerald-700"
          >
            <Sparkles size={20} />
            Montar folha final
          </button>
        </div>
      </section>
    </main>
  );
}