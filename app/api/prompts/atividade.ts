type DadosAtividade = {
  modoCriacao?: "folha" | "especifica" | "revisao";
  etapaEnsino?: string;
  etapa?: string;
  serie?: string;
  disciplina?: string;
  conteudo?: string;
  trabalhadoSala?: string;
  observacoes?: string;
  quantidade?: number;
  tipoEspecifico?: string;
  formaConteudo?: "tema" | "palavras";
  palavras?: string[];
};

export function gerarPromptAtividade(body: DadosAtividade) {
  const modoCriacao = body.modoCriacao || "folha";
  const etapaEnsino = body.etapaEnsino || body.etapa || "";
  const serie = body.serie || "";
  const disciplina = body.disciplina || "";
  const conteudo = body.conteudo || "";
  const trabalhadoSala = body.trabalhadoSala || "";
  const observacoes = body.observacoes || "";
  const quantidade = Number(body.quantidade || 6);
  const tipoEspecifico = body.tipoEspecifico || "";
  const formaConteudo = body.formaConteudo || "tema";
  const palavras = Array.isArray(body.palavras) ? body.palavras : [];

  const ehEducacaoInfantil = etapaEnsino === "Educação Infantil";
  const ehAnosIniciais =
    etapaEnsino === "Ensino Fundamental - Anos Iniciais";
  const ehAnosFinais =
    etapaEnsino === "Ensino Fundamental - Anos Finais";
  const ehEnsinoMedio = etapaEnsino === "Ensino Médio";
  const ehEJA = etapaEnsino === "EJA";

  const regrasEtapa = ehEducacaoInfantil
    ? `
REGRAS PARA EDUCAÇÃO INFANTIL:
- Priorizar propostas lúdicas, visuais, motoras, orais e de exploração.
- Evitar excesso de escrita, leitura extensa e comandos complexos.
- Usar instruções curtas, claras e adequadas à faixa etária.
- Quando houver folha impressa, usar poucos itens, espaço amplo e imagens fáceis de reconhecer.
- Não utilizar prova, nota ou linguagem de avaliação formal.
`
    : ehAnosIniciais
      ? `
REGRAS PARA ENSINO FUNDAMENTAL - ANOS INICIAIS:
- Adequar rigorosamente a linguagem e a complexidade à série.
- Para 1º, 2º e 3º anos, priorizar alfabetização, letramento, numeramento, imagens, comandos curtos e letra de forma.
- Para 4º e 5º anos, ampliar interpretação, produção escrita, resolução de problemas, tabelas e análise de informações.
- Não infantilizar excessivamente 4º e 5º anos.
`
      : ehAnosFinais
        ? `
REGRAS PARA ENSINO FUNDAMENTAL - ANOS FINAIS:
- Utilizar linguagem adequada a adolescentes.
- Priorizar compreensão, análise, aplicação, interpretação, comparação, argumentação e resolução de problemas.
- Evitar atividades com aparência infantil, salvo quando o professor solicitar.
- Usar textos, tabelas, gráficos, esquemas, situações-problema e análise de imagens quando forem pertinentes.
`
        : ehEnsinoMedio
          ? `
REGRAS PARA ENSINO MÉDIO:
- Trabalhar com profundidade compatível com o Ensino Médio.
- Priorizar análise, interpretação, argumentação, pensamento científico, resolução de problemas e aplicação.
- Utilizar questões contextualizadas, estudos de caso, gráficos, tabelas, textos e situações reais quando forem pertinentes.
- Evitar atividades excessivamente simples ou infantis.
`
          : ehEJA
            ? `
REGRAS PARA EJA:
- Nunca infantilizar os estudantes.
- Usar linguagem clara, respeitosa e adequada ao público jovem e adulto.
- Relacionar os conteúdos ao cotidiano, trabalho, cidadania, saúde, consumo, tecnologia e participação social quando pertinente.
- Valorizar conhecimentos prévios e experiências de vida.
- Respeitar o nível equivalente da etapa informada.
`
            : "";

  const regrasDisciplina = `
REGRAS POR DISCIPLINA:
- Língua Portuguesa/Linguagem: variar leitura, escrita, consciência fonológica, ortografia, interpretação, produção e análise linguística conforme a série.
- Matemática: variar cálculo, raciocínio lógico, situações-problema, representação, sequência, comparação, tabela, gráfico e aplicação.
- Ciências/Biologia/Física/Química: variar observação, identificação, classificação, explicação, relação entre estrutura e função, análise de dados, experimentos mentais e aplicação.
- História/Geografia/Filosofia/Sociologia/Ensino Religioso: variar interpretação, comparação, linha do tempo, análise de fontes, mapas, conceitos, argumentação e relação com a realidade.
- Arte: priorizar criação, apreciação, leitura de imagens, experimentação e expressão.
- Educação Física: priorizar compreensão de práticas corporais, regras, saúde, cooperação e reflexão.
- Inglês: adequar vocabulário, leitura, escrita e compreensão ao nível da turma.
`;

  const regrasGerais = `
REGRAS GERAIS DE QUALIDADE:
- Responder apenas em português do Brasil.
- Respeitar rigorosamente etapa, série, disciplina e conteúdo.
- Não gerar atividades genéricas que poderiam servir para qualquer conteúdo.
- Cada exercício deve estar diretamente ligado ao conteúdo informado.
- Usar comandos claros, naturais e com linguagem de professor.
- Evitar repetições de formato, habilidade e comando.
- Não criar dois exercícios muito parecidos em sequência.
- Organizar do mais simples ao mais complexo.
- Equilibrar reconhecimento, compreensão, aplicação e desafio.
- Usar imagens apenas quando elas realmente ajudarem.
- Quando uma imagem for necessária, não inventar URL. Informar uma descrição objetiva da imagem no campo "imagemDescricao".
- Não usar emojis como substitutos das imagens da atividade.
- Não citar que o conteúdo foi criado por inteligência artificial.
- Não incluir gabarito dentro do enunciado.
- Não usar frases como "atividade divertida", "vamos aprender" ou linguagem excessivamente infantil, salvo quando adequado à Educação Infantil.
- Não repetir sempre a mesma sequência.
- Cada nova geração deve variar a combinação de tipos de exercícios.
`;

  const formatoJson = `
FORMATO DE RESPOSTA OBRIGATÓRIO:
Retorne somente um objeto JSON válido, sem markdown, sem crases e sem explicações antes ou depois.

{
  "titulo": "Título curto e adequado para a folha",
  "subtitulo": "Série, disciplina ou tema, quando fizer sentido",
  "modoCriacao": "${modoCriacao}",
  "exercicios": [
    {
      "titulo": "Título do exercício",
      "tipo": "identificador curto do tipo",
      "comando": "Comando claro para o aluno",
      "conteudo": "Conteúdo completo do exercício, pronto para exibir e editar",
      "itens": ["item 1", "item 2"],
      "imagemNecessaria": false,
      "imagemDescricao": "",
      "gabarito": "Resposta esperada ou orientação de correção"
    }
  ]
}

REGRAS DO JSON:
- "exercicios" deve ser uma lista.
- Cada exercício deve possuir todos os campos.
- "itens" deve ser uma lista, mesmo quando houver apenas um item.
- "imagemNecessaria" deve ser booleano.
- Quando não precisar de imagem, usar "imagemDescricao": "".
- O JSON deve ser válido e pronto para JSON.parse().
`;

  const baseProfessor = `
DADOS INFORMADOS PELO PROFESSOR:
Etapa de ensino: ${etapaEnsino}
Série ou turma: ${serie}
Disciplina: ${disciplina}
Conteúdo ou tema: ${conteudo}
O que foi trabalhado em sala: ${trabalhadoSala || "Não informado"}
Observações para a IA: ${observacoes || "Não informado"}
Quantidade solicitada: ${quantidade}
`;

  if (modoCriacao === "especifica") {
    const listaPalavras =
      palavras.length > 0 ? palavras.join(", ") : "Nenhuma palavra selecionada";

    return `
Você é um especialista em criação de atividades pedagógicas impressas.

Crie UMA atividade específica completa e de alta qualidade.

${baseProfessor}

Tipo de atividade específica: ${tipoEspecifico}
Forma de montagem: ${formaConteudo}
Palavras escolhidas pelo professor: ${listaPalavras}

${regrasEtapa}
${regrasDisciplina}
${regrasGerais}

REGRAS DA ATIVIDADE ESPECÍFICA:
- Criar exatamente um exercício principal do tipo solicitado.
- A quantidade solicitada representa a quantidade de itens, palavras, figuras, pistas, perguntas ou problemas dentro da atividade.
- Se o professor forneceu palavras próprias, usar exatamente essas palavras, corrigindo apenas espaços duplicados e capitalização quando necessário.
- Não substituir, retirar ou acrescentar palavras próprias sem necessidade.
- Se a montagem for por tema e houver palavras selecionadas, usar as palavras selecionadas.
- Se a montagem for por tema e não houver palavras selecionadas, escolher termos adequados ao tema, à série e à disciplina.
- Não repetir palavras.

REGRAS ESPECÍFICAS POR TIPO:
- Ditado ilustrado: criar uma lista de figuras reconhecíveis com espaço para escrita; cada item deve indicar a palavra-alvo e uma descrição clara da imagem.
- Escreva o nome das figuras: cada item deve ter uma imagem clara e um espaço de resposta.
- Caça-palavras: fornecer as palavras e uma grade de letras retangular coerente; garantir que todas as palavras estejam realmente na grade.
- Cruzadinha: fornecer palavras, pistas claras e uma estrutura coerente de cruzamento; evitar palavras que não cruzam.
- Ligue as colunas: criar pares inequívocos e embaralhar a coluna da direita.
- Complete palavras: inserir lacunas pedagogicamente adequadas, sem tornar a resposta ambígua.
- Interpretação de texto: criar um texto adequado à série e perguntas variadas, sem respostas copiadas mecanicamente.
- Produção de texto: oferecer situação comunicativa, orientação clara e espaço de produção.
- Problemas matemáticos: criar problemas contextualizados, possíveis e com dados suficientes.
- Sequência numérica: definir padrão coerente e sem ambiguidade.
- Verdadeiro ou falso: misturar afirmativas verdadeiras e falsas.
- Múltipla escolha: criar alternativas plausíveis e apenas uma resposta correta por item.

${formatoJson}
`;
  }

  if (modoCriacao === "revisao") {
    return `
Você é um especialista em criação de folhas de revisão escolar.

Crie uma folha de revisão variada, equilibrada e adequada à turma.

${baseProfessor}

${regrasEtapa}
${regrasDisciplina}
${regrasGerais}

REGRAS DA FOLHA DE REVISÃO:
- Criar exatamente ${quantidade} exercícios.
- Revisar todos os conteúdos informados, distribuindo-os de forma equilibrada.
- Misturar formatos adequados à disciplina e à série.
- Incluir exercícios de retomada, compreensão, aplicação e síntese.
- Não transformar a folha inteira em uma prova.
- Não repetir o mesmo tipo de exercício.
- Evitar que um único conteúdo domine toda a revisão.
- O último exercício deve funcionar como síntese ou desafio final.
- Para Matemática, incluir resolução de problemas e aplicação.
- Para Português, incluir leitura/interpretação e produção ou análise linguística.
- Para Ciências e Humanas, incluir análise, relação, explicação e aplicação.

${formatoJson}
`;
  }

  return `
Você é um especialista em criação de folhas de atividades pedagógicas impressas.

Crie uma sequência variada, equilibrada e pedagogicamente coerente.

${baseProfessor}

${regrasEtapa}
${regrasDisciplina}
${regrasGerais}

REGRAS DA FOLHA DE ATIVIDADES:
- Criar exatamente ${quantidade} exercícios diferentes.
- A sequência não pode depender de um modelo fixo.
- Escolher os tipos mais adequados ao conteúdo, à série e à disciplina.
- Não repetir o mesmo tipo de exercício na mesma folha.
- Não colocar dois exercícios muito semelhantes em sequência.
- Começar com uma atividade de entrada ou reconhecimento.
- Desenvolver compreensão e aplicação nos exercícios intermediários.
- Finalizar com desafio, produção, síntese ou aplicação.
- Variar entre exercícios visuais, escritos, orais, práticos, objetivos ou discursivos quando forem adequados.
- Não incluir caça-palavras ou cruzadinha apenas para preencher quantidade.
- Usar caça-palavras, cruzadinha, ditado ilustrado e atividades com imagem somente quando forem pedagogicamente adequados.
- Em alfabetização, variar consciência fonológica, formação de palavras, leitura, escrita e compreensão.
- Em Matemática, variar representação, cálculo, sequência, comparação, problema e raciocínio.
- Em Ciências e Humanas, variar identificação, relação, interpretação, análise e explicação.
- Cada exercício deve vir completo, pronto para ser revisado pelo professor.

${formatoJson}
`;
}