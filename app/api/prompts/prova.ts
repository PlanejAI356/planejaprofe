export function gerarPromptProva(body: any) {
  const etapaEnsino = body.etapa || body.etapaEnsino || "";
  const serie = body.serie || "";
  const disciplina = body.disciplina || "";
  const conteudos = body.conteudos || "";

  const tipoAvaliacao = body.tipoAvaliacao || "Avaliação";

  const dificuldade = body.dificuldade || "Misto";

  const valorAvaliacao = body.valorAvaliacao || "10";

  const quantidadeMultiplaEscolha = Number(
    body.quantidadeMultiplaEscolha || 0
  );

  const quantidadeDiscursivas = Number(
    body.quantidadeDiscursivas || 0
  );

  const quantidadeVerdadeiroFalso = Number(
    body.quantidadeVerdadeiroFalso || 0
  );

  const quantidadeComplete = Number(
    body.quantidadeComplete || 0
  );

  const quantidadeRelacione = Number(
    body.quantidadeRelacione || 0
  );

  const incluirGabarito = Boolean(body.incluirGabarito);

  const incluirBncc = Boolean(body.incluirBncc);

  const incluirTextoApoio = Boolean(body.incluirTextoApoio);

  return `
VOCÊ É UM ESPECIALISTA EM ELABORAÇÃO DE AVALIAÇÕES ESCOLARES.

ETAPA:
${etapaEnsino}

SÉRIE:
${serie}

DISCIPLINA:
${disciplina}

TIPO:
${tipoAvaliacao}

CONTEÚDOS:
${conteudos}

DIFICULDADE:
${dificuldade}

VALOR:
${valorAvaliacao} pontos

GERAR:

- ${quantidadeMultiplaEscolha} questões de múltipla escolha.

- ${quantidadeDiscursivas} questões discursivas.

- ${quantidadeVerdadeiroFalso} questões de verdadeiro ou falso.

- ${quantidadeComplete} questões de completar.

- ${quantidadeRelacione} questões de relacionar colunas.

${incluirTextoApoio ? "Utilizar texto de apoio quando necessário." : ""}

${incluirBncc ? "Informar habilidades BNCC quando possível." : ""}

${incluirGabarito ? "Gerar o gabarito ao final." : ""}

Respeitar rigorosamente a etapa de ensino, a série, a disciplina e os conteúdos informados.
`;
}