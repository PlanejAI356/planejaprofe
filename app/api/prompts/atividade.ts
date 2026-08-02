import { gerarPromptAtividadeEspecifica } from "./atividades/especifica";
import { gerarPromptFolhaAtividades } from "./atividades/folha";
import { gerarPromptRevisaoAtividades } from "./atividades/revisao";

type ModoCriacao = "folha" | "especifica" | "revisao";
type FormaConteudo = "tema" | "palavras";

type DadosAtividade = {
  modoCriacao?: ModoCriacao;
  etapaEnsino?: string;
  etapa?: string;
  serie?: string;
  disciplina?: string;
  conteudo?: string;
  trabalhadoSala?: string;
  observacoes?: string;
  quantidade?: number;
  tipoEspecifico?: string;
  formaConteudo?: FormaConteudo;
  palavras?: string[];
};

export function gerarPromptAtividade(body: DadosAtividade) {
  const modoCriacao: ModoCriacao =
    body.modoCriacao === "especifica" ||
    body.modoCriacao === "revisao"
      ? body.modoCriacao
      : "folha";

  const etapaEnsino = String(
    body.etapaEnsino || body.etapa || ""
  ).trim();

  const serie = String(body.serie || "").trim();
  const disciplina = String(body.disciplina || "").trim();
  const conteudo = String(body.conteudo || "").trim();

  const trabalhadoSala = String(
    body.trabalhadoSala || ""
  ).trim();

  const observacoes = String(
    body.observacoes || ""
  ).trim();

  const quantidadeRecebida = Number(body.quantidade || 6);

  const quantidade = Number.isFinite(quantidadeRecebida)
    ? Math.max(1, Math.min(12, quantidadeRecebida))
    : 6;

  const tipoEspecifico = String(
    body.tipoEspecifico || ""
  ).trim();

  const formaConteudo: FormaConteudo =
    body.formaConteudo === "palavras"
      ? "palavras"
      : "tema";

  const palavras = Array.isArray(body.palavras)
    ? body.palavras
        .map((palavra) => String(palavra).trim())
        .filter(Boolean)
    : [];

  if (!etapaEnsino) {
    throw new Error(
      "A etapa de ensino é obrigatória para gerar a atividade."
    );
  }

  if (!serie) {
    throw new Error(
      "A série ou turma é obrigatória para gerar a atividade."
    );
  }

  if (!disciplina) {
    throw new Error(
      "A disciplina é obrigatória para gerar a atividade."
    );
  }

  if (!conteudo) {
    throw new Error(
      "O conteúdo é obrigatório para gerar a atividade."
    );
  }

  if (modoCriacao === "especifica") {
    if (!tipoEspecifico) {
      throw new Error(
        "O tipo da atividade específica é obrigatório."
      );
    }

    return gerarPromptAtividadeEspecifica({
      etapaEnsino,
      serie,
      disciplina,
      conteudo,
      observacoes,
      quantidade,
      tipoEspecifico,
      palavras:
        formaConteudo === "palavras"
          ? palavras
          : [],
    });
  }

  if (modoCriacao === "revisao") {
    return gerarPromptRevisaoAtividades({
      etapaEnsino,
      serie,
      disciplina,
      conteudo,
      trabalhadoSala,
      observacoes,
      quantidade,
    });
  }

  return gerarPromptFolhaAtividades({
    etapaEnsino,
    serie,
    disciplina,
    conteudo,
    trabalhadoSala,
    observacoes,
    quantidade,
  });
}