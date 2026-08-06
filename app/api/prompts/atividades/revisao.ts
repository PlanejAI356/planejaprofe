type DadosRevisaoAtividades = {
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  conteudo: string;
  trabalhadoSala?: string;
  observacoes?: string;
  quantidade?: number;
};

export function gerarPromptRevisaoAtividades(
  dados: DadosRevisaoAtividades
) {
  const quantidade = Math.max(
    1,
    Math.min(12, Number(dados.quantidade || 6))
  );

  return `
Você é especialista em criação de atividades pedagógicas.

Crie uma folha de revisão completa e adequada aos dados informados.

Etapa de ensino: ${dados.etapaEnsino}
Série ou turma: ${dados.serie}
Disciplina: ${dados.disciplina}
Conteúdo: ${dados.conteudo}
O que foi trabalhado em sala: ${
    dados.trabalhadoSala || "Não informado"
  }
Observações: ${dados.observacoes || "Não informado"}
Quantidade de exercícios: ${quantidade}

REGRAS:
- Responder somente em português do Brasil.
- Adequar rigorosamente a linguagem e a dificuldade à série.
- Criar exatamente ${quantidade} exercícios.
- Variar os tipos de exercício.
- Não transformar toda a revisão em múltipla escolha.
- Não repetir exercícios iguais.
- Organizar do mais simples para o mais complexo.
- Usar imagens somente quando forem realmente necessárias.
- Não mencionar inteligência artificial.
- Não usar emojis.
- Entregar uma atividade completa e pronta para uso.
`;
}