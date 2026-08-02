"use client";

import { ImageIcon } from "lucide-react";

import CacaPalavras from "../visualizacao/CacaPalavras";
import Complete from "../visualizacao/Complete";
import Cruzadinha from "../visualizacao/Cruzadinha";
import DitadoIlustrado from "../visualizacao/DitadoIlustrado";
import LigueColunas from "../visualizacao/LigueColunas";
import MultiplaEscolha from "../visualizacao/MultiplaEscolha";
import VerdadeiroFalso from "../visualizacao/VerdadeiroFalso";

export type ItemExercicio = {
  id: string;
  texto: string;
  resposta: string;
  imagemNecessaria: boolean;
  imagemDescricao: string;
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
  imagemDescricao: string;
  imagemUrl?: string;
  gabarito: string;
};

type Props = {
  exercicio: ExercicioAtividade;
};

function ItensComImagem({
  exercicio,
}: Props) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {exercicio.itens.map((item, indice) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          {item.imagemUrl ? (
            <div className="flex justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-white p-2">
                <img
                  src={item.imagemUrl}
                  alt={item.imagemDescricao || item.texto}
                  className="max-h-24 max-w-24 object-contain"
                />
              </div>
            </div>
          ) : item.imagemNecessaria ? (
            <div className="flex justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50 text-blue-600">
                <div className="px-2 text-center">
                  <ImageIcon className="mx-auto" size={25} />

                  <p className="mt-1 text-xs font-semibold">
                    Imagem pequena
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <p className="mt-3 font-medium text-slate-900">
            {indice + 1}. {item.texto}
          </p>

          {(item.resposta || item.imagemNecessaria) && (
            <div className="mt-4 h-7 border-b border-slate-500" />
          )}
        </div>
      ))}
    </div>
  );
}

function ItensPadrao({
  exercicio,
}: Props) {
  return (
    <div className="mt-4 space-y-3">
      {exercicio.itens.map((item, indice) => (
        <div
          key={item.id}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
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
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    (
                    {String.fromCharCode(
                      65 + alternativaIndice
                    )}
                    ) {alternativa}
                  </div>
                )
              )}
            </div>
          )}

          {item.resposta && (
            <div className="mt-4 h-7 border-b border-slate-500" />
          )}
        </div>
      ))}
    </div>
  );
}

function ConteudoPorTipo({
  exercicio,
}: Props) {
  switch (exercicio.tipo) {
    case "ditado_ilustrado":
    case "escreva_nome_figuras":
      return <DitadoIlustrado exercicio={exercicio} />;

    case "circule_figuras":
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
      return <Complete exercicio={exercicio} />
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
    <div className="pt-4">
      {exercicio.comando && (
        <p className="font-semibold leading-7 text-slate-900">
          {exercicio.comando}
        </p>
      )}

      {exercicio.textoApoio && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 leading-7 text-slate-800">
          {exercicio.textoApoio}
        </div>
      )}

      {exercicio.conteudoLivre && (
        <div className="mt-4 whitespace-pre-wrap leading-7 text-slate-800">
          {exercicio.conteudoLivre}
        </div>
      )}

      <ConteudoPorTipo exercicio={exercicio} />

      {exercicio.imagemNecessaria && (
        <div className="mt-4 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600">
              {exercicio.imagemUrl ? (
                <img
                  src={exercicio.imagemUrl}
                  alt={
                    exercicio.imagemDescricao ||
                    "Imagem do exercício"
                  }
                  className="max-h-16 max-w-16 object-contain"
                />
              ) : (
                <ImageIcon size={27} />
              )}
            </div>

            <div>
              <p className="font-bold text-slate-900">
                Imagem pequena do exercício
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {exercicio.imagemDescricao ||
                  "A descrição da imagem ainda não foi informada."}
              </p>
            </div>
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