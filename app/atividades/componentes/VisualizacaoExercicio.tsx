"use client";

import { ImageIcon } from "lucide-react";

import CacaPalavras from "../visualizacao/CacaPalavras";
import Complete from "../visualizacao/Complete";
import Cruzadinha from "../visualizacao/Cruzadinha";
import DitadoIlustrado from "../visualizacao/DitadoIlustrado";
import LigueColunas from "../visualizacao/LigueColunas";
import MultiplaEscolha from "../visualizacao/MultiplaEscolha";
import VerdadeiroFalso from "../visualizacao/VerdadeiroFalso";
import LetraTracejada from "../visualizacao/LetraTracejada";

export type ItemExercicio = {
  id: string;
  texto: string;
  resposta: string;
  respostaCorreta?: boolean | null;

  imagemNecessaria: boolean;
  imagemChave?: string;
  imagemDescricao: string;
  imagemEstilo?: string;
  imagemUrl?: string;

  colunaA: string;
  colunaB: string;

  alternativas: string[];
  verdadeiro: boolean | null;
};

export type ExercicioAtividade = {
  id: string;
  numero: number;
  tipo: string;

  habilidade?: string;
  nivel?: "facil" | "medio" | "desafio";
  layout?: string;

  titulo: string;
  comando: string;
  conteudoLivre: string;

  itens: ItemExercicio[];

  textoApoio: string;
  palavras: string[];
  pistas: string[];
  grade: string[];
  colunas: string[];

  imagemNecessaria: boolean;
  imagemChave?: string;
  imagemDescricao: string;
  imagemEstilo?: string;
  imagemUrl?: string;

  gabarito: string;
};

type Props = {
  exercicio: ExercicioAtividade;
};

function obterClasseGrade(layout?: string) {
  switch (layout) {
    case "grade_2_colunas":
    case "duas_colunas":
      return "grid-cols-2";

    case "grade_3_colunas":
    case "grade_imagens":
      return "grid-cols-2 sm:grid-cols-3";

    case "cartoes_horizontais":
      return "grid-cols-1 sm:grid-cols-2";

    case "cartoes_verticais":
      return "grid-cols-2";

    case "imagens_em_circulos":
      return "grid-cols-2 sm:grid-cols-3";

    default:
      return "grid-cols-2 sm:grid-cols-3";
  }
}

function obterClasseImagem(layout?: string) {
  if (layout === "imagens_em_circulos") {
    return "rounded-full";
  }

  return "rounded-xl";
}

function EspacoResposta({
  linhas = 1,
}: {
  linhas?: number;
}) {
  return (
    <div className="mt-3 space-y-3">
      {Array.from({ length: linhas }).map((_, indice) => (
        <div
          key={indice}
          className="h-6 border-b border-slate-500"
        />
      ))}
    </div>
  );
}

function ImagemDoItem({
  item,
  layout,
}: {
  item: ItemExercicio;
  layout?: string;
}) {
  const classeImagem = obterClasseImagem(layout);

  return (
    <div className="flex justify-center">
      <div
        className={`flex h-28 w-28 items-center justify-center border border-slate-300 bg-white p-2 ${classeImagem}`}
      >
        {item.imagemUrl ? (
          <img
            src={item.imagemUrl}
            alt={
              item.imagemDescricao ||
              item.imagemChave ||
              item.texto ||
              "Imagem da atividade"
            }
            className="max-h-24 max-w-24 object-contain"
          />
        ) : (
          <div className="px-2 text-center text-slate-400">
            <ImageIcon className="mx-auto" size={26} />

            <p className="mt-1 text-[10px] font-semibold">
              {item.imagemChave || "Imagem"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ItensComImagem({
  exercicio,
}: Props) {
  const classeGrade = obterClasseGrade(exercicio.layout);

  const ehAtividadeDeEscrita =
    exercicio.tipo === "ditado_ilustrado" ||
    exercicio.tipo === "escreva_nome_figuras";

  return (
    <div className={`mt-5 grid gap-5 ${classeGrade}`}>
      {exercicio.itens.map((item, indice) => (
        <div
          key={item.id || `item-${indice}`}
          className="break-inside-avoid text-center"
        >
          {item.imagemNecessaria && (
            <ImagemDoItem
              item={item}
              layout={exercicio.layout}
            />
          )}

          {item.texto && !ehAtividadeDeEscrita && (
            <p className="mt-2 text-sm font-medium leading-6 text-slate-900">
              {item.texto}
            </p>
          )}

          {ehAtividadeDeEscrita && (
            <EspacoResposta linhas={1} />
          )}
        </div>
      ))}
    </div>
  );
}

function ItensPadrao({
  exercicio,
}: Props) {
  const usarDuasColunas =
    exercicio.layout === "duas_colunas" ||
    exercicio.layout === "pagina_dividida" ||
    exercicio.layout === "cartoes_horizontais";

  return (
    <div
      className={`mt-4 grid gap-5 ${
        usarDuasColunas
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1"
      }`}
    >
      {exercicio.itens.map((item, indice) => (
        <div
          key={item.id || `item-${indice}`}
          className="break-inside-avoid"
        >
          <p className="font-medium leading-7 text-slate-900">
            {indice + 1}. {item.texto}
          </p>

          {item.alternativas.length > 0 && (
            <div className="mt-3 space-y-2">
              {item.alternativas.map(
                (alternativa, alternativaIndice) => (
                  <div
                    key={`${item.id}-${alternativaIndice}`}
                    className="flex items-start gap-2"
                  >
                    <span className="font-semibold">
                      (
                      {String.fromCharCode(
                        65 + alternativaIndice
                      )}
                      )
                    </span>

                    <span>{alternativa}</span>
                  </div>
                )
              )}
            </div>
          )}

          {item.resposta && (
            <EspacoResposta
              linhas={
                exercicio.tipo === "discursiva" ||
                exercicio.tipo === "observe_responda"
                  ? 3
                  : 1
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Classificacao({
  exercicio,
}: Props) {
  const colunas =
    exercicio.colunas.length > 0
      ? exercicio.colunas
      : ["Grupo 1", "Grupo 2"];

  return (
    <div className="mt-5 overflow-hidden border border-slate-500">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${colunas.length}, minmax(0, 1fr))`,
        }}
      >
        {colunas.map((coluna, indice) => (
          <div
            key={`${coluna}-${indice}`}
            className="border-b border-r border-slate-500 bg-slate-100 px-3 py-2 text-center font-bold last:border-r-0"
          >
            {coluna}
          </div>
        ))}
      </div>

      <div
        className="grid min-h-40"
        style={{
          gridTemplateColumns: `repeat(${colunas.length}, minmax(0, 1fr))`,
        }}
      >
        {colunas.map((coluna, indice) => (
          <div
            key={`espaco-${coluna}-${indice}`}
            className="border-r border-slate-500 p-3 last:border-r-0"
          />
        ))}
      </div>
    </div>
  );
}

function Sequencia({
  exercicio,
}: Props) {
  return (
    <div className="mt-5 space-y-5">
      {exercicio.itens.map((item, indice) => (
        <div
          key={item.id || `sequencia-${indice}`}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="font-bold">
            {indice + 1}.
          </span>

          <span className="font-medium">
            {item.texto}
          </span>

          <div className="min-w-32 flex-1 border-b border-slate-600" />
        </div>
      ))}
    </div>
  );
}

function ProducaoTexto({
  exercicio,
}: Props) {
  return (
    <div className="mt-5">
      {exercicio.conteudoLivre && (
        <p className="mb-4 whitespace-pre-wrap leading-7 text-slate-800">
          {exercicio.conteudoLivre}
        </p>
      )}

      <EspacoResposta linhas={10} />
    </div>
  );
}

function ConteudoPorTipo({
  exercicio,
}: Props) {
  switch (exercicio.tipo) {
    case "letra_tracejada":
case "tracejado":
  return (
    <LetraTracejada exercicio={exercicio} />
  );
    case "ditado_ilustrado":
    case "escreva_nome_figuras":
      return <DitadoIlustrado exercicio={exercicio} />;

    case "circule_figuras":
    case "pinte_figuras":
    case "marque_figuras":
    case "encontre_intruso":
      return <ItensComImagem exercicio={exercicio} />;

    case "ligue_colunas":
    case "relacione":
      return <LigueColunas exercicio={exercicio} />;

    case "multipla_escolha":
      return <MultiplaEscolha exercicio={exercicio} />;

    case "verdadeiro_falso":
      return <VerdadeiroFalso exercicio={exercicio} />;

    case "caca_palavras":
      return <CacaPalavras exercicio={exercicio} />;

    case "cruzadinha":
      return <Cruzadinha exercicio={exercicio} />;

    case "complete_palavras":
    case "complete_frases":
      return <Complete exercicio={exercicio} />;

    case "classificacao":
    case "tabela":
      return <Classificacao exercicio={exercicio} />;

    case "sequencia_numerica":
    case "ordene_palavras":
    case "ordem_alfabetica":
    case "organize_etapas":
      return <Sequencia exercicio={exercicio} />;

    case "producao_texto":
      return <ProducaoTexto exercicio={exercicio} />;

    default:
      return exercicio.itens.length > 0 ? (
        <ItensPadrao exercicio={exercicio} />
      ) : null;
  }
}

export default function VisualizacaoExercicio({
  exercicio,
}: Props) {
  return (
    <div className="pt-2">
      {exercicio.comando && (
        <p className="font-semibold leading-7 text-slate-900">
          {exercicio.comando}
        </p>
      )}

      {exercicio.textoApoio && (
        <div className="mt-4 border border-slate-400 bg-slate-50 p-4 text-justify leading-7 text-slate-800">
          {exercicio.textoApoio}
        </div>
      )}

      {exercicio.conteudoLivre &&
        exercicio.tipo !== "producao_texto" && (
          <div className="mt-4 whitespace-pre-wrap leading-7 text-slate-800">
            {exercicio.conteudoLivre}
          </div>
        )}

      <ConteudoPorTipo exercicio={exercicio} />

      {exercicio.imagemNecessaria && (
        <div className="mt-5 flex justify-center">
          <div className="flex min-h-40 w-full max-w-md items-center justify-center border border-dashed border-slate-400 bg-slate-50 p-4">
            {exercicio.imagemUrl ? (
              <img
                src={exercicio.imagemUrl}
                alt={
                  exercicio.imagemDescricao ||
                  exercicio.imagemChave ||
                  "Imagem do exercício"
                }
                className="max-h-52 max-w-full object-contain"
              />
            ) : (
              <div className="text-center text-slate-400">
                <ImageIcon className="mx-auto" size={30} />

                <p className="mt-2 text-xs font-semibold">
                  {exercicio.imagemChave ||
                    "Imagem do exercício"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {exercicio.gabarito && (
        <details className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <summary className="cursor-pointer font-bold text-emerald-800">
            Ver gabarito
          </summary>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {exercicio.gabarito}
          </p>
        </details>
      )}
    </div>
  );
}