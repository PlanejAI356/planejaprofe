import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tipo = body.tipo || "temas";
    const tema = body.tema || "Plano de aula";
    const aulas = body.aulas || "";
    const tipoPlanejamento = body.tipoPlanejamento || "aula";
    const etapaEnsino = body.etapa || body.etapaEnsino || "";
    const serie = body.serie || "";
    const disciplina = body.disciplina || "";
    const sugestoesMetodologia = body.sugestoesMetodologia || "";
    const ehBnccComputacao = disciplina === "BNCC da Computação";
    
    const ehCreche =
      serie === "Berçário" ||
      serie === "Maternal I" ||
      serie === "Maternal II";

    let comando = "";
    if (tipo === "temas") {
      comando = `
Você é um assistente pedagógico.

Destrinche o tema geral em temas por aula, respeitando a turma informada.

Tema geral: ${tema}
Etapa: ${etapaEnsino}
Turma/Série: ${serie}
Disciplina/Campo de experiência: ${disciplina}

Datas das aulas:
${aulas}

REGRAS OBRIGATÓRIAS:

- Escreva exatamente uma aula por linha.
- Nunca deixe linhas em branco entre as aulas.
- Escreva todos os temas em LETRAS MAIÚSCULAS.
- Cada tema deve ser específico e aprofundar um aspecto diferente do conteúdo.
- Não utilizar temas genéricos como "Introdução", "Conceitos", "Revisão", exceto quando o professor solicitar.
- Organize os temas em sequência pedagógica, do mais simples ao mais complexo.
- Nunca repetir o mesmo assunto em duas aulas.
- Respeitar rigorosamente a etapa de ensino, a série e a disciplina.
- Não gerar explicações.
- Gerar apenas o título da aula.

FORMATO OBRIGATÓRIO:

AULA 01 | DATA | TEMA ESPECÍFICO
AULA 02 | DATA | TEMA ESPECÍFICO
AULA 03 | DATA | TEMA ESPECÍFICO
`;
    }

    if (tipo === "objetivos") {
  if (ehCreche && tipoPlanejamento === "mensal") {
    comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie objetivos de aprendizagem adequados para Creche.

Turma: ${serie}
Campo de experiência: ${disciplina}

Aulas:
${aulas}

REGRAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Gerar objetivos adequados para Berçário, Maternal I ou Maternal II.
- Considerar cuidado, brincadeira, interação, linguagem, movimento, exploração sensorial, autonomia e convivência.
- Não usar habilidades do Ensino Fundamental.
- Não usar códigos EF.
- Usar linguagem simples, lúdica e adequada à Creche.
- Relacionar os objetivos ao campo de experiência informado.
- Não gerar metodologia.
- Não gerar recursos.
- Não gerar avaliação.
- Não gerar referências.
- Manter exatamente a aula e a data recebida.
- Cada aula deve ficar em uma linha.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - OBJETIVOS DE APRENDIZAGEM: objetivo 1; objetivo 2; objetivo 3.
AULA 02 - DATA - OBJETIVOS DE APRENDIZAGEM: objetivo 1; objetivo 2; objetivo 3.
`;
      } else if (etapaEnsino === "Educação Infantil") {
        comando = `
Você é um assistente pedagógico especialista em Educação Infantil.

Crie objetivos de aprendizagem para as aulas abaixo, respeitando a BNCC da Educação Infantil.

Turma: ${serie}
Campo de experiência ou área de aprendizagem: ${disciplina}

Aulas:
${aulas}

REGRAS:
- Não usar habilidade BNCC do Ensino Fundamental.
- Não usar códigos EF.
- Usar somente objetivos adequados à Educação Infantil.
- Usar códigos da Educação Infantil quando possível, iniciados por EI.
- Relacionar os objetivos ao campo de experiência informado.
- Usar linguagem simples, lúdica e adequada à infância.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar referências.
- Manter exatamente a aula e a data recebida.
- Cada aula deve ficar em uma linha.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - OBJETIVOS DE APRENDIZAGEM: EI00XX00 - objetivo 1; objetivo 2; objetivo 3.
AULA 02 - DATA - OBJETIVOS DE APRENDIZAGEM: EI00XX00 - objetivo 1; objetivo 2; objetivo 3.
`;
      } else if (etapaEnsino === "Ensino Médio") {
        comando = `
Você é um assistente pedagógico especialista em Ensino Médio.

Crie habilidades e objetivos para as aulas abaixo, respeitando a área/disciplina informada.

Disciplina: ${disciplina}
Série: ${serie}

Aulas:
${aulas}

REGRAS:
- Não usar códigos EF do Ensino Fundamental.
- Quando possível, usar habilidades do Ensino Médio iniciadas por EM.
- Usar linguagem adequada ao Ensino Médio.
- Os objetivos devem ser mais aprofundados, com análise, interpretação, argumentação e aplicação.
- Gerar de 3 a 5 objetivos por aula.
- Os objetivos devem ficar na mesma linha, separados por ponto e vírgula.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar referências.
- Manter exatamente a aula e a data recebida.
- Cada aula deve ficar em uma linha.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - HABILIDADE: EM00XX00 - OBJETIVOS: objetivo 1; objetivo 2; objetivo 3.
AULA 02 - DATA - HABILIDADE: EM00XX00 - OBJETIVOS: objetivo 1; objetivo 2; objetivo 3.
`;

      } else if (tipoPlanejamento === "mensal") {
        comando = `
Você é um assistente pedagógico.

Crie habilidades BNCC e objetivos para cada conteúdo mensal informado pelo professor.

Disciplina: ${disciplina}
Série: ${serie}

Conteúdos do mês:
${aulas}

Regras:
- Não usar AULA 01, AULA 02 ou datas.
- Usar apenas uma marcação com hífen no início de cada conteúdo.
- Listar a habilidade BNCC usando apenas o código.
- Gerar de 3 a 5 objetivos para cada conteúdo.
- Os objetivos devem ficar na mesma linha, separados por ponto e vírgula.
- Respeitar a série informada.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar referências.

Formato obrigatório:
- CONTEÚDO: HABILIDADE BNCC: EF00XX00 - OBJETIVOS: objetivo 1; objetivo 2; objetivo 3.
`;
      } else {
        comando = `
Você é um assistente pedagógico.

Crie a habilidade BNCC e os objetivos para cada aula abaixo.

Disciplina: ${disciplina}
Série: ${serie}

Aulas:
${aulas}

Regras:
- Respeite a série informada.
- Use apenas o código da BNCC, sem descrição.
- Nunca coloque apenas um objetivo.
- Coloque de 3 a 5 objetivos por aula.
- Os objetivos devem ficar na mesma linha, separados por ponto e vírgula.
- Mantenha exatamente a aula e a data recebida.
- Não colocar espaçamento entre aula 01 e aula 02.
- Não invente datas.
- Não gere metodologia.
- Não gere avaliação.
- Não gere referências.

Formato obrigatório:
AULA 01 - DATA - HABILIDADE BNCC: EF00XX00 - OBJETIVOS: objetivo 1; objetivo 2; objetivo 3.
AULA 02 - DATA - HABILIDADE BNCC: EF00XX00 - OBJETIVOS: objetivo 1; objetivo 2; objetivo 3.
`;
      }
    }

    if (tipo === "recursos") {
  if (ehCreche && tipoPlanejamento === "mensal") {
    comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie recursos e materiais para cada conteúdo mensal informado.

Turma: ${serie}
Campo de experiência: ${disciplina}

Conteúdos do mês:
${aulas}

REGRAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Usar materiais simples, seguros e adequados para bebês e crianças pequenas.
- Relacionar os recursos ao conteúdo informado.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar objetivos.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Recursos e materiais: material 1; material 2; material 3.
`;
  } else if (ehCreche) {
    comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie recursos e materiais para cada aula abaixo.

Turma: ${serie}
Campo de experiência: ${disciplina}

Aulas:
${aulas}

REGRAS:
- Usar materiais simples, seguros e adequados para bebês e crianças pequenas.
- Relacionar os recursos ao tema da aula.
- Manter exatamente a aula e a data recebida.
- Cada aula deve ficar em uma linha.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar objetivos.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Recursos e materiais: material 1; material 2; material 3.
AULA 02 - DATA - TEMA DA AULA. Recursos e materiais: material 1; material 2; material 3.
`;
  } else {
    comando = `
Você é um assistente pedagógico.

Crie recursos e materiais para as aulas abaixo.

Disciplina: ${disciplina}
Série: ${serie}

Aulas:
${aulas}

REGRAS:
- Listar materiais didáticos simples e viáveis.
- Relacionar os recursos ao tema da aula.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar objetivos.
- Cada aula deve ficar em uma linha.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Recursos e materiais: recurso 1; recurso 2; recurso 3.
AULA 02 - DATA - TEMA DA AULA. Recursos e materiais: recurso 1; recurso 2; recurso 3.
`;
  }
}

if (tipo === "metodologia") {
  if (tipoPlanejamento === "mensal" && ehCreche) {
    comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie a metodologia de desenvolvimento para cada conteúdo mensal informado.

Turma: ${serie}
Campo de experiência: ${disciplina}

Sugestões do professor:
${sugestoesMetodologia}

Conteúdos do mês:
${aulas}

REGRAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Criar uma metodologia lúdica, afetiva e adequada à Creche.
- Iniciar com acolhida e perguntas simples relacionadas ao tema.
- Considerar música, brincadeiras, exploração sensorial, movimento, contação de história, manipulação de objetos e interação.
- Respeitar o tempo, o ritmo e a segurança das crianças.
- Se houver sugestões do professor, usar essas sugestões para personalizar a metodologia.
- Não propor atividades longas ou complexas.
- Não usar prova, cópia, leitura extensa ou atividade escrita formal.
- Não usar vídeos, internet, projetor ou recursos digitais, exceto se o professor solicitar.
- Nunca utilizar a expressão "o professor", "a professora" ou "o docente".
- Escrever diretamente a metodologia.
- Usar linguagem de planejamento.
- Não gerar avaliação.
- Não deixar linhas em branco entre os conteúdos.
- Usar apenas uma quebra de linha entre um conteúdo e outro.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Metodologia: desenvolvimento da vivência.
`;
  } else if (ehCreche) {
    comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie a metodologia de desenvolvimento para cada aula abaixo.

Turma: ${serie}
Campo de experiência: ${disciplina}

Sugestões do professor:
${sugestoesMetodologia}

Aulas:
${aulas}

REGRAS:
- A metodologia deve ser lúdica, afetiva e adequada à Creche.
- Iniciar com acolhida e perguntas simples relacionadas ao tema.
- Considerar roda de conversa curta, música, brincadeira, exploração sensorial, movimento, contação de história, manipulação de objetos e interação.
- Respeitar o tempo, o ritmo e a segurança das crianças.
- Se houver sugestões do professor, usar essas sugestões para personalizar a metodologia.
- Não usar linguagem de Ensino Fundamental.
- Não propor atividades longas ou complexas.
- Não usar prova, cópia, leitura extensa ou atividade escrita formal.
- Não usar vídeos, internet, projetor ou recursos digitais, exceto se o professor solicitar.
- Não usar "o professor", "a professora" ou "o docente".
- Usar linguagem de planejamento.
- Manter exatamente a aula e a data recebida.
- Cada aula deve ficar em uma linha.
- Não deixar linhas em branco entre uma aula e outra.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Metodologia: desenvolvimento da vivência.
AULA 02 - DATA - TEMA DA AULA. Metodologia: desenvolvimento da vivência.
`;
  } else if (tipoPlanejamento === "mensal") {
    comando = `
Você é um assistente pedagógico.

Crie uma metodologia para cada conteúdo mensal informado pelo professor.

Disciplina: ${disciplina}
Série: ${serie}

Sugestões do professor:
${sugestoesMetodologia}

Conteúdos do mês:
${aulas}

REGRAS OBRIGATÓRIAS:
- NÃO usar AULA 01.
- NÃO usar AULA 02.
- NÃO usar datas.
- NÃO numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Usar exatamente os conteúdos escritos pelo professor.
- Criar uma metodologia específica para cada conteúdo.
- Iniciar com perguntas introdutórias relacionadas ao tema.
- Levantar os conhecimentos prévios dos estudantes.
- Desenvolver a explicação de forma dialogada.
- Relacionar o conteúdo ao cotidiano sempre que possível.
- Sugerir uma atividade compatível com a série.
- Finalizar com uma síntese do conteúdo.
- Variar as estratégias entre os conteúdos.
- Não repetir sempre "roda de conversa", "cartaz" ou "atividade prática".
- Não descrever atividades longas que ocupem várias aulas.
- Não usar vídeos, internet, projetor ou recursos digitais, exceto se o professor solicitar.
- Não usar "o professor", "a professora" ou "o docente".
- Usar linguagem de planejamento.
- Não deixar linhas em branco entre os conteúdos.
- Usar apenas uma quebra de linha entre um conteúdo e outro.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: metodologia relacionada ao conteúdo.
`;
  } else {
    comando = `
Você é um assistente pedagógico.

Crie a metodologia para cada aula abaixo.

Disciplina: ${disciplina}
Série: ${serie}

Sugestões do professor:
${sugestoesMetodologia}

Aulas:
${aulas}

REGRAS OBRIGATÓRIAS:
- Gerar uma metodologia diferente para cada aula.
- Se o professor escreveu sugestões, utilize essas sugestões para montar a metodologia.
- Respeite ao máximo as ideias do professor.
- Caso não existam sugestões, crie uma metodologia adequada ao conteúdo.
- As sugestões devem complementar a metodologia, sem copiar literalmente o texto do professor.
- Relacionar a metodologia diretamente ao tema da aula.
- Iniciar com perguntas introdutórias relacionadas ao tema.
- Levantar os conhecimentos prévios dos estudantes.
- Desenvolver a explicação de forma dialogada.
- Relacionar o conteúdo ao cotidiano sempre que possível.
- Sugerir atividade compatível com a série.
- Finalizar com uma síntese da aula.
- Utilizar linguagem de planejamento docente.
- Não repetir sempre "roda de conversa".
- Não repetir sempre "cartaz".
- Não repetir sempre "atividade prática".
- Não descrever atividades longas que ocupem várias aulas.
- Ser objetiva, clara e viável para uma única aula.
- Não usar vídeos, internet, projetor ou recursos digitais, exceto se o professor solicitar.
- Não usar "o professor", "a professora" ou "o docente".
- Não deixar linhas em branco entre uma aula e outra.
- Utilizar apenas uma quebra de linha entre as aulas.
- Não inserir linhas vazias.
- O texto deve ser contínuo e pronto para copiar para o Word.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Metodologia da aula.
AULA 02 - DATA - TEMA DA AULA. Metodologia da aula.
AULA 03 - DATA - TEMA DA AULA. Metodologia da aula.
`;
  }
}

if (tipo === "avaliacao") {
  if (ehCreche && tipoPlanejamento === "mensal") {
    comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie uma avaliação formativa para cada conteúdo mensal informado.

Turma: ${serie}
Campo de experiência: ${disciplina}

Conteúdos do mês:
${aulas}

REGRAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- A avaliação deve ser formativa, contínua e por observação.
- Observar participação, interação, comunicação, curiosidade, exploração dos materiais, movimento, autonomia, cuidado, convivência e envolvimento.
- Relacionar a avaliação ao conteúdo informado.
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Usar linguagem simples e adequada à Educação Infantil.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Avaliação formativa por observação da participação, interação, exploração dos materiais, comunicação e envolvimento na vivência proposta.
`;
  } else if (ehCreche) {
    comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie uma avaliação formativa para cada aula abaixo.

Turma: ${serie}
Campo de experiência: ${disciplina}

Aulas:
${aulas}

REGRAS:
- A avaliação deve ser formativa, contínua e por observação.
- Não usar nota, prova, conceito ou classificação.
- Observar participação, interação, comunicação, curiosidade, exploração dos materiais, movimento, autonomia, cuidado, convivência e envolvimento.
- Relacionar a avaliação ao tema da aula.
- Usar linguagem simples e adequada ao planejamento da Educação Infantil.
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Manter exatamente a aula e a data recebida.
- Cada aula deve ficar em uma linha.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Avaliação formativa por observação da participação, interação, exploração dos materiais, comunicação e envolvimento na vivência proposta.
AULA 02 - DATA - TEMA DA AULA. Avaliação formativa por observação da participação, interação, exploração dos materiais, comunicação e envolvimento na vivência proposta.
`;
  } else if (tipoPlanejamento === "mensal") {
    comando = `
Você é um assistente pedagógico.

Crie uma avaliação para cada conteúdo mensal informado pelo professor.

Conteúdos do mês:
${aulas}

REGRAS OBRIGATÓRIAS:
- NÃO usar AULA 01.
- NÃO usar AULA 02.
- NÃO usar datas.
- NÃO numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Usar exatamente os conteúdos escritos pelo professor.
- Criar uma avaliação diferente para cada conteúdo.
- A avaliação deve estar relacionada ao conteúdo.
- Não escrever "A avaliação considerou".
- Não escrever "A avaliação focou".
- Não escrever "A avaliação destacou".
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Usar linguagem de planejamento.
- Escrever diretamente o que será observado.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Avaliação por observação da participação, atenção, envolvimento, realização das atividades e compreensão do conteúdo trabalhado.
`;
  } else {
    comando = `
Você é um assistente pedagógico.

Crie uma avaliação para cada aula abaixo.

Aulas:
${aulas}

REGRAS OBRIGATÓRIAS:
- Cada aula deve ficar em uma linha.
- Nunca juntar AULA 01 com AULA 02.
- Não escrever "A avaliação considerou".
- Não escrever "A avaliação focou".
- Não escrever "A avaliação destacou".
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Usar linguagem de planejamento.
- Cada avaliação deve ser diferente.
- Relacionar a avaliação ao tema da aula.
- Escrever diretamente o que será observado.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Avaliação por observação da participação, atenção, envolvimento, realização das atividades e compreensão do conteúdo trabalhado.
AULA 02 - DATA - TEMA DA AULA. Avaliação por observação da participação, atenção, envolvimento, realização das atividades e compreensão do conteúdo trabalhado.
`;
      }
    }

    if (tipo === "avaliacao") {
      if (ehCreche && tipoPlanejamento === "mensal") {
  comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie uma avaliação formativa para cada conteúdo mensal informado.

Turma: ${serie}
Campo de experiência: ${disciplina}

Conteúdos do mês:
${aulas}

REGRAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- A avaliação deve ser formativa, contínua e por observação.
- Não usar nota, prova, conceito ou classificação.
- Relacionar a avaliação ao conteúdo informado.
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Avaliação formativa por observação da participação, interação, exploração dos materiais, comunicação e envolvimento na vivência proposta.
`;
} else if (ehCreche) {
  
      } else if (tipoPlanejamento === "mensal") {
        comando = `
Você é um assistente pedagógico.

Crie uma avaliação para cada conteúdo mensal informado pelo professor.

Conteúdos do mês:
${aulas}

REGRAS OBRIGATÓRIAS:
- NÃO usar AULA 01.
- NÃO usar AULA 02.
- NÃO usar datas.
- NÃO numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Usar exatamente os conteúdos escritos pelo professor.
- Criar uma avaliação diferente para cada conteúdo.
- A avaliação deve estar relacionada ao conteúdo.
- Não escrever "A avaliação considerou".
- Não escrever "A avaliação focou".
- Não escrever "A avaliação destacou".
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Usar linguagem de planejamento.
- Escrever diretamente o que será observado.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Avaliação por observação da participação, atenção, envolvimento, realização das atividades e compreensão do conteúdo trabalhado.
`;
      } else {
        comando = `
Você é um assistente pedagógico.

Crie uma avaliação para cada aula abaixo.

Aulas:
${aulas}

REGRAS OBRIGATÓRIAS:
- Cada aula deve ficar em uma linha.
- Nunca juntar AULA 01 com AULA 02.
- Não escrever "A avaliação considerou".
- Não escrever "A avaliação focou".
- Não escrever "A avaliação destacou".
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Usar linguagem de planejamento.
- Cada avaliação deve ser diferente.
- Relacionar a avaliação ao tema da aula.
- Escrever diretamente o que será observado.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Avaliação por observação da participação, atenção, envolvimento, realização das atividades e compreensão do conteúdo trabalhado.
AULA 02 - DATA - TEMA DA AULA. Avaliação por observação da participação, atenção, envolvimento, realização das atividades e compreensão do conteúdo trabalhado.
`;
      }
    }

    if (tipo === "referencias") {
      comando = `
Você é um assistente pedagógico.

Crie as referências para o plano de aula.

Disciplina: ${disciplina}
Série: ${serie}

Regras:
- Não utilizar tópicos.
- Não utilizar marcadores.
- Não utilizar listas numeradas.
- Não utilizar linhas em branco.
- Não utilizar espaços extras.
- Não separar referências por aula.
- Gerar apenas as referências gerais do planejamento.
- Cada referência deve ficar em uma linha.
- Não repetir referências.

Formato obrigatório:
BRASIL. Base Nacional Comum Curricular (BNCC). Brasília: MEC, 2018.
Livro didático da disciplina.
Materiais complementares utilizados pelo professor.
`;
    }

    if (tipo === "atividade") {
      comando = `
Você é um assistente pedagógico.

Crie atividades para casa organizadas por semana, com base nas aulas abaixo.

Disciplina: ${disciplina}
Série: ${serie}

Aulas:
${aulas}

Regras:
- Não usar Aula 01, Aula 02 ou datas.
- Organizar por semana.
- Gerar uma atividade para cada semana trabalhada.
- As atividades devem respeitar a série informada.
- As atividades devem estar relacionadas aos temas trabalhados naquela semana.
- As atividades devem ser curtas e possíveis de realizar em casa.
- Não repetir o mesmo tipo de atividade em todas as semanas.
- Não gerar objetivos.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar referências.
- Não deixar linhas em branco entre as semanas.
- Cada semana deve ocupar apenas uma linha.
- Não utilizar espaçamento extra.
- Utilizar apenas uma quebra de linha entre uma semana e outra.

Formato obrigatório:
1ª SEMANA - Atividade para casa.
2ª SEMANA - Atividade para casa.
3ª SEMANA - Atividade para casa.
4ª SEMANA - Atividade para casa.
`;
    }

    const resposta = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: comando,
        },
      ],
    });

    return Response.json({
      texto: resposta.choices[0].message.content || "",
    });
  } catch (erro) {
    console.error("ERRO NA IA:", erro);

    return Response.json(
      { erro: "Erro ao gerar plano." },
      { status: 500 }
    );
  }
}