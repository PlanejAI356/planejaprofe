import { gerarPromptCacaPalavras } from "./cacaPalavras";
import { gerarPromptComplete } from "./complete";
import { gerarPromptCruzadinha } from "./cruzadinha";
import { gerarPromptDitado } from "./ditado";
import { gerarPromptLigueColunas } from "./ligueColunas";
import { gerarPromptMultiplaEscolha } from "./multiplaEscolha";
import { gerarPromptVerdadeiroFalso } from "./verdadeiroFalso";

type DadosAtividadeEspecifica = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  observacoes: string;
  quantidade: number;
  tipoEspecifico: string;
  palavras: string[];
};

export function gerarPromptAtividadeEspecifica(
  dados: DadosAtividadeEspecifica
) {
  switch (dados.tipoEspecifico) {
    case "ditado_ilustrado":
    case "escreva_nome_figuras":
      return gerarPromptDitado(dados);

    case "caca_palavras":
      return gerarPromptCacaPalavras(dados);

    case "cruzadinha":
      return gerarPromptCruzadinha(dados);

    case "complete_palavras":
    case "complete_frases":
      return gerarPromptComplete(dados);

    case "ligue_colunas":
    case "relacione":
      return gerarPromptLigueColunas(dados);

    case "multipla_escolha":
      return gerarPromptMultiplaEscolha(dados);

    case "verdadeiro_falso":
      return gerarPromptVerdadeiroFalso(dados);

    default:
      throw new Error(
        `Tipo de atividade específica não reconhecido: ${dados.tipoEspecifico}`
      );
  }
}