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
    const tipoPlanejamentoRecebido = String(
  body.tipoPlanejamento || "aula"
)
  .trim()
  .toLowerCase();

const tipoPlanejamento =
  tipoPlanejamentoRecebido === "mensal" ||
  tipoPlanejamentoRecebido === "mês" ||
  tipoPlanejamentoRecebido === "mes" ||
  tipoPlanejamentoRecebido === "por mês" ||
  tipoPlanejamentoRecebido === "por mes"
    ? "mensal"
    : "aula";
    const etapaEnsino = body.etapa || body.etapaEnsino || "";
    const serie = body.serie || "";
    const disciplina = body.disciplina || "";
    const estiloAula =
      body.estiloAula || body.sugestoesMetodologia || "";

    const ehBnccComputacao =
      disciplina.trim().toLowerCase() === "bncc da computação";

    const regrasBnccComputacao = ehBnccComputacao
      ? `
REGRAS ESPECÍFICAS PARA BNCC DA COMPUTAÇÃO:
- Analisar primeiro o conteúdo ou tema informado pelo professor.
- Não escolher as habilidades apenas com base na série ou no nome da disciplina.
- Selecionar as habilidades da BNCC que tenham relação direta com o conteúdo, a série e o nível de complexidade.
- Priorizar as habilidades específicas da Computação quando elas forem adequadas ao conteúdo.
- Não limitar a seleção somente a códigos que contenham CO.
- Quando o conteúdo for interdisciplinar, também poderão ser utilizadas habilidades de outras áreas ou componentes da BNCC, desde que tenham relação real com o conteúdo trabalhado.
- Relacionar o conteúdo, quando pertinente, aos eixos Pensamento Computacional, Mundo Digital e Cultura Digital.
- Utilizar uma habilidade quando ela for suficiente.
- Utilizar duas ou, excepcionalmente, três habilidades somente quando o conteúdo realmente envolver aprendizagens diferentes.
- Não acrescentar habilidades apenas para preencher o plano.
- Nunca inventar códigos de habilidades.
- Não utilizar habilidades sem relação direta com o conteúdo informado.
- Quando houver mais de uma habilidade, separar os códigos por vírgula.
`
      : "";

    const ehCreche =
      serie === "Berçário" ||
      serie === "Maternal I" ||
      serie === "Maternal II";

    const ehEJA = etapaEnsino === "EJA";

    const regrasEJA = ehEJA
      ? `
REGRAS ESPECÍFICAS PARA A EDUCAÇÃO DE JOVENS E ADULTOS (EJA):
- Respeitar rigorosamente o perfil dos estudantes da Educação de Jovens e Adultos.
- Nunca utilizar linguagem infantilizada.
- Nunca tratar os estudantes como crianças.
- Nunca propor músicas infantis, desenhos para colorir ou atividades próprias da Educação Infantil, exceto quando o professor solicitar explicitamente.
- Valorizar os conhecimentos prévios e as experiências de vida dos estudantes.
- Relacionar os conteúdos, quando pertinente, ao cotidiano, trabalho, cidadania, saúde, família, tecnologia, meio ambiente e participação social.
- Desenvolver autonomia, pensamento crítico, interpretação, argumentação e resolução de problemas.
- Organizar os conteúdos do mais simples para o mais complexo.
- Utilizar linguagem clara, respeitosa e adequada ao público jovem e adulto.
- Nunca simplificar excessivamente o conteúdo apenas por se tratar de EJA.
`
      : "";

    const regrasEtapaEJA = ehEJA
      ? serie === "EJA - Anos Iniciais"
        ? `
REGRAS ESPECÍFICAS PARA EJA - ANOS INICIAIS:
- Priorizar alfabetização e letramento quando forem pertinentes ao conteúdo.
- Relacionar leitura, escrita e matemática a situações reais do cotidiano.
- Utilizar exemplos relacionados a compras, documentos, horários, trabalho, saúde, transporte e organização da vida.
- Respeitar os diferentes ritmos de aprendizagem sem infantilizar os estudantes.
`
        : serie === "EJA - Anos Finais"
          ? `
REGRAS ESPECÍFICAS PARA EJA - ANOS FINAIS:
- Trabalhar conteúdos equivalentes ao Ensino Fundamental Anos Finais.
- Relacionar teoria e prática.
- Contextualizar os conteúdos com situações reais.
- Desenvolver interpretação, argumentação, resolução de problemas e pensamento crítico.
- Evitar atividades excessivamente simples ou infantilizadas.
`
          : serie === "EJA - Ensino Médio"
            ? `
REGRAS ESPECÍFICAS PARA EJA - ENSINO MÉDIO:
- Trabalhar conteúdos com profundidade compatível com o Ensino Médio.
- Desenvolver análise, interpretação, argumentação e pensamento científico.
- Relacionar os conteúdos ao mundo do trabalho, cidadania, tecnologia, atualidades e continuidade dos estudos.
- Evitar simplificação excessiva e linguagem infantilizada.
`
            : ""
      : "";

    let comando = "";

    if (tipo === "temas") {
      comando = `
Você é um assistente pedagógico.

Destrinche o tema geral em temas por aula, respeitando a turma informada.

Tema geral: ${tema}
Etapa: ${etapaEnsino}
Turma/Série: ${serie}
Disciplina/Campo de experiência: ${disciplina}

${regrasEJA}
${regrasEtapaEJA}

Datas das aulas:
${aulas}

REGRAS OBRIGATÓRIAS:
- Escreva exatamente uma aula por linha.
- Nunca deixe linhas em branco entre as aulas.
- Escreva todos os temas em LETRAS MAIÚSCULAS.
- Cada tema deve ser específico e aprofundar um aspecto diferente do conteúdo.
- Não utilizar temas genéricos como "Introdução", "Conceitos" ou "Revisão", exceto quando o professor solicitar.
- Organizar os temas em sequência pedagógica, do mais simples ao mais complexo.
- Nunca repetir o mesmo assunto em duas aulas.
- Respeitar rigorosamente a etapa de ensino, a série e a disciplina.
- Não gerar explicações.
- Gerar apenas o título de cada aula.

FORMATO OBRIGATÓRIO:
AULA 01 | DATA | TEMA ESPECÍFICO
AULA 02 | DATA | TEMA ESPECÍFICO
AULA 03 | DATA | TEMA ESPECÍFICO
`;
    }

    if (tipo === "conteudos_mensais") {
      comando = `
Você é um especialista em elaboração de planejamentos escolares.

Crie apenas os conteúdos de um planejamento mensal.

Tema(s) informado(s):
${tema}

Etapa:
${etapaEnsino}

Série:
${serie}

Disciplina:
${disciplina}

${regrasEJA}
${regrasEtapaEJA}

REGRAS OBRIGATÓRIAS:
- Responder somente em português do Brasil.
- Utilizar exatamente os temas informados pelo professor como base.
- Gerar somente de 4 a 5 conteúdos.
- Gerar conteúdos adequados à etapa, série e disciplina informadas.
- Cada conteúdo deve ser amplo o suficiente para ser desenvolvido em várias aulas.
- Organizar os conteúdos do mais simples para o mais complexo.
- Gerar conteúdos curtos e objetivos.
- Escrever cada conteúdo iniciando com letra maiúscula.
- Não repetir conteúdos semelhantes.
- Escrever apenas um conteúdo por linha.
- Não escrever Aula 01.
- Não escrever datas.
- Não gerar objetivos, habilidades, metodologia, avaliação ou referências.
- Não escrever introdução ou explicações.
- Não usar marcadores, numeração ou símbolos.
- Retornar somente a lista dos conteúdos.

EXEMPLO:
Conceito e função dos verbos
Verbos de ação e de estado
Tempos verbais
Conjugação verbal
Verbos regulares e irregulares
`;
    }

    if (tipo === "objetivos") {
      if (ehCreche && tipoPlanejamento === "mensal") {
        comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie objetivos de aprendizagem adequados para Creche.

Turma: ${serie}
Campo de experiência: ${disciplina}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS OBRIGATÓRIAS:
- Respeitar rigorosamente a turma e o campo de experiência.
- Usar códigos da Educação Infantil quando possível, iniciados por EI.
- Gerar de 3 a 5 objetivos por conteúdo.
- Todos os objetivos devem ficar na mesma linha.
- Separar os objetivos por ponto e vírgula.
- Cada objetivo deve começar com verbo no infinitivo.
- Não gerar metodologia, avaliação ou referências.
- Não deixar linhas em branco.

FORMATO OBRIGATÓRIO:
- CONTEÚDO: OBJETIVOS DE APRENDIZAGEM: EI00XX00 - Identificar...; Explorar...; Desenvolver...
`;
      } else if (etapaEnsino === "Educação Infantil") {
        comando = `
Você é um assistente pedagógico especialista em Educação Infantil.

Crie objetivos de aprendizagem para as aulas abaixo.

Turma: ${serie}
Campo de experiência ou área de aprendizagem: ${disciplina}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS:
- Não usar habilidades BNCC do Ensino Fundamental.
- Não usar códigos EF.
- Usar códigos da Educação Infantil quando possível, iniciados por EI.
- Relacionar os objetivos ao campo de experiência informado.
- Usar linguagem simples, lúdica e adequada à infância.
- Não gerar metodologia, avaliação ou referências.
- Manter exatamente a aula e a data recebidas.
- Cada aula deve ficar em uma linha.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - OBJETIVOS DE APRENDIZAGEM: EI00XX00 - objetivo 1; objetivo 2; objetivo 3.
`;
      } else if (
        etapaEnsino === "Ensino Médio" ||
        (etapaEnsino === "EJA" &&
          serie === "EJA - Ensino Médio")
      ) {
        comando = `
Você é um assistente pedagógico especialista em Ensino Médio.

Crie habilidades e objetivos para as aulas abaixo.

Disciplina: ${disciplina}
Série: ${serie}

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS:
- Não usar códigos EF do Ensino Fundamental.
- Quando possível, usar habilidades do Ensino Médio iniciadas por EM.
- Usar linguagem adequada ao Ensino Médio.
- Gerar objetivos aprofundados, envolvendo análise, interpretação, argumentação e aplicação.
- Gerar de 3 a 5 objetivos por aula.
- Manter os objetivos na mesma linha, separados por ponto e vírgula.
- Não gerar metodologia, avaliação ou referências.
- Manter exatamente a aula e a data recebidas.
- Cada aula deve ficar em uma linha.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - HABILIDADE: EM00XX00 - OBJETIVOS: objetivo 1; objetivo 2; objetivo 3.
`;
      } else if (tipoPlanejamento === "mensal") {
        comando = `
Você é um assistente pedagógico.

Crie habilidades BNCC e objetivos para cada conteúdo mensal.

Disciplina: ${disciplina}
Série: ${serie}

${regrasBnccComputacao}
${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Conteúdos do mês:
${aulas}

REGRAS:
- Não usar AULA 01, AULA 02 ou datas.
- Usar apenas uma marcação com hífen no início.
- Listar a habilidade BNCC usando apenas o código.
- Gerar de 3 a 5 objetivos para cada conteúdo.
- Manter os objetivos na mesma linha, separados por ponto e vírgula.
- Respeitar rigorosamente a série informada.
- Não gerar metodologia, avaliação ou referências.

FORMATO OBRIGATÓRIO:
- CONTEÚDO: HABILIDADE BNCC: EF00XX00 - OBJETIVOS: objetivo 1; objetivo 2; objetivo 3.
`;
      } else {
        comando = `
Você é um assistente pedagógico.

Crie a habilidade BNCC e os objetivos para cada aula.

Disciplina: ${disciplina}
Série: ${serie}

${regrasBnccComputacao}
${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS:
- Respeitar a série informada.
- Usar apenas o código ou os códigos da BNCC, sem descrição.
- Colocar de 3 a 5 objetivos por aula.
- Manter os objetivos na mesma linha, separados por ponto e vírgula.
- Manter exatamente a aula e a data recebidas.
- Não inventar datas.
- Não gerar metodologia, avaliação ou referências.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - HABILIDADE BNCC: EF00XX00 - OBJETIVOS: objetivo 1; objetivo 2; objetivo 3.
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

Meu estilo de aula:
${estiloAula}

Conteúdos do mês:
${aulas}

REGRAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Usar materiais simples, seguros e adequados para crianças pequenas.
- Relacionar os recursos ao conteúdo.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar objetivos.
- Não deixar linhas em branco entre os conteúdos.
- Cada conteúdo deve ficar em uma única linha.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Recursos e materiais: material 1; material 2; material 3.
`;
      } else if (ehCreche) {
        comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie recursos e materiais para cada aula.

Turma: ${serie}
Campo de experiência: ${disciplina}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS:
- Usar materiais simples, seguros e adequados para crianças pequenas.
- Relacionar os recursos ao tema.
- Manter exatamente a aula e a data recebidas.
- Cada aula deve ficar em uma linha.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar objetivos.
- Não deixar linhas em branco entre as aulas.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Recursos e materiais: material 1; material 2; material 3.
`;
      } else if (tipoPlanejamento === "mensal") {
        comando = `
Você é um assistente pedagógico.

Crie recursos e materiais para cada conteúdo mensal informado.

Disciplina: ${disciplina}
Série: ${serie}

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Conteúdos do mês:
${aulas}

REGRAS OBRIGATÓRIAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar exatamente os conteúdos recebidos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Relacionar os recursos diretamente ao conteúdo.
- Utilizar materiais simples, acessíveis e viáveis.
- Priorizar livro didático, quadro, caderno, textos, imagens, materiais concretos e experimentos simples.
- Respeitar os recursos informados em "Meu estilo de aula".
- Para EJA, usar recursos adequados ao público jovem e adulto.
- Para EJA, evitar materiais infantilizados.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar objetivos.
- Não deixar linhas em branco entre os conteúdos.
- Cada conteúdo deve ficar em uma única linha.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Recursos e materiais: recurso 1; recurso 2; recurso 3.
`;
      } else {
        comando = `
Você é um assistente pedagógico.

Crie recursos e materiais para as aulas abaixo.

Disciplina: ${disciplina}
Série: ${serie}

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS:
- Listar materiais didáticos simples e viáveis.
- Relacionar os recursos ao tema da aula.
- Priorizar recursos informados em "Meu estilo de aula".
- Priorizar livro didático, quadro, caderno, textos, imagens, materiais concretos e experimentos simples.
- Para EJA, usar materiais adequados ao público jovem e adulto.
- Para EJA, evitar materiais com aparência infantilizada.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar objetivos.
- Cada aula deve ficar em uma linha.
- Não deixar linhas em branco entre as aulas.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Recursos e materiais: recurso 1; recurso 2; recurso 3.
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

Meu estilo de aula:
${estiloAula}

Conteúdos do mês:
${aulas}

REGRAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Criar uma metodologia lúdica, afetiva e adequada à Creche.
- Se o professor informar "Meu estilo de aula", seguir rigorosamente esse estilo.
- Nunca substituir o estilo informado por outro.
- Adaptar apenas o conteúdo ao estilo do professor.
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

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS:
- A metodologia deve ser lúdica, afetiva e adequada à Creche.
- Se o professor informar "Meu estilo de aula", seguir rigorosamente esse estilo.
- Nunca substituir o estilo informado por outro.
- Adaptar apenas o conteúdo ao estilo do professor.
- Não usar linguagem de Ensino Fundamental.
- Não propor atividades longas ou complexas.
- Não usar prova, cópia, leitura extensa ou atividade escrita formal.
- Não usar vídeos, internet, projetor ou recursos digitais, exceto se o professor solicitar.
- Não usar "o professor", "a professora" ou "o docente".
- Usar linguagem de planejamento.
- Manter exatamente a aula e a data recebidas.
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

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Conteúdos do mês:
${aulas}

REGRAS OBRIGATÓRIAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Usar exatamente os conteúdos escritos pelo professor.
- Criar uma metodologia específica para cada conteúdo.
- Se o professor informar "Meu estilo de aula", seguir rigorosamente esse estilo.
- Nunca substituir o estilo informado por outro.
- Adaptar apenas o conteúdo ao estilo do professor.
- Gerar metodologias diversificadas ao longo do planejamento.
- Variar as estratégias de ensino entre os conteúdos.
- Não repetir a mesma sequência metodológica em conteúdos consecutivos.
- Não descrever atividades longas que ocupem várias aulas.
- Não usar vídeos, internet, projetor ou recursos digitais, exceto se o professor solicitar.
- Não usar "o professor", "a professora" ou "o docente".
- Usar linguagem de planejamento.
- Não deixar linhas em branco entre os conteúdos.
- Usar apenas uma quebra de linha entre um conteúdo e outro.
- Para EJA, priorizar diálogo, problematização, troca de experiências e análise de situações reais.
- Para EJA, relacionar o conteúdo ao cotidiano, cidadania, mundo do trabalho, saúde, tecnologia e participação social quando for pertinente.
- Para EJA, valorizar os conhecimentos prévios e a trajetória de vida dos estudantes.
- Para EJA, evitar qualquer metodologia infantilizada.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: metodologia relacionada ao conteúdo.
`;
      } else {
        comando = `
Você é um assistente pedagógico.

Crie a metodologia para cada aula abaixo.

Disciplina: ${disciplina}
Série: ${serie}

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS OBRIGATÓRIAS:
- Gerar uma metodologia única para cada aula.
- Evitar repetir a estrutura ou o texto utilizado nas demais aulas.
- A metodologia deve ser curta, objetiva e pronta para ser utilizada.
- Cada metodologia deve ter aproximadamente de 4 a 6 linhas.
- Escrever toda a metodologia em um único parágrafo.
- Se o professor informar "Meu estilo de aula", seguir rigorosamente esse estilo.
- Nunca substituir o estilo informado por outro.
- Adaptar apenas o conteúdo da aula ao estilo informado.
- Se o professor não informar um estilo, utilizar uma metodologia simples e objetiva.
- Relacionar a metodologia diretamente ao tema da aula.
- Não repetir o tema dentro da metodologia.
- Não utilizar frases excessivamente longas.
- Não utilizar recursos tecnológicos, vídeos, projetor, laboratório ou materiais especiais, exceto quando o professor solicitar.
- Utilizar apenas recursos comuns da sala de aula.
- Não usar "o professor", "a professora" ou "o docente".
- Não deixar linhas em branco entre as aulas.
- Utilizar apenas uma quebra de linha entre uma aula e outra.
- Gerar metodologias diversificadas ao longo do planejamento.
- Variar as estratégias de ensino entre as aulas.
- Não repetir a mesma sequência metodológica em aulas consecutivas.
- Mesmo seguindo o estilo informado pelo professor, evitar repetir a mesma sequência de ações em todas as aulas.
- Cada metodologia deve estar diretamente relacionada ao objetivo e ao conteúdo da aula.
- Para EJA, priorizar diálogo, problematização, estudo de casos, interpretação, troca de experiências e resolução de situações reais.
- Para EJA, valorizar a autonomia, os conhecimentos prévios e a experiência de vida dos estudantes.
- Para EJA, relacionar o conteúdo à vida cotidiana e ao mundo do trabalho quando for pertinente.
- Para EJA, nunca utilizar metodologias infantilizadas.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA. Metodologia.
AULA 02 - DATA. Metodologia.
AULA 03 - DATA. Metodologia.
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

Meu estilo de aula:
${estiloAula}

Conteúdos do mês:
${aulas}

REGRAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- A avaliação deve ser formativa, contínua e por observação.
- Usar linguagem natural de planejamento.
- Não repetir o nome do conteúdo dentro da avaliação.
- Observar participação, interação, comunicação, curiosidade, exploração dos materiais, movimento, autonomia, cuidado, convivência e envolvimento.
- Se o professor informar "Meu estilo de aula", respeitar esse estilo também na avaliação.
- Não repetir exatamente o mesmo texto em todos os conteúdos.
- Variar os aspectos observados.
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Avaliação formativa por observação da participação, interação, comunicação e envolvimento nas vivências propostas.
`;
      } else if (ehCreche) {
        comando = `
Você é um assistente pedagógico especializado em Educação Infantil - Creche.

Crie uma avaliação formativa para cada aula abaixo.

Turma: ${serie}
Campo de experiência: ${disciplina}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS:
- A avaliação deve ser formativa, contínua e por observação.
- Não usar nota, prova, conceito ou classificação.
- Usar linguagem natural de planejamento.
- Não repetir o tema da aula dentro da avaliação.
- Observar participação, interação, comunicação, curiosidade, exploração dos materiais, movimento, autonomia, cuidado, convivência e envolvimento.
- Se o professor informar "Meu estilo de aula", respeitar esse estilo também na avaliação.
- Não repetir exatamente o mesmo texto em todas as aulas.
- Variar os aspectos observados.
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Manter exatamente a aula e a data recebidas.
- Cada aula deve ficar em uma linha.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Avaliação formativa por observação da participação, interação, comunicação e envolvimento nas vivências propostas.
AULA 02 - DATA - TEMA DA AULA. Avaliação formativa por observação da participação, interação, comunicação e envolvimento nas vivências propostas.
`;
      } else if (tipoPlanejamento === "mensal") {
        comando = `
Você é um assistente pedagógico.

Crie uma avaliação para cada conteúdo mensal informado pelo professor.

Disciplina: ${disciplina}
Série: ${serie}

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Conteúdos do mês:
${aulas}

REGRAS OBRIGATÓRIAS:
- Não usar AULA 01.
- Não usar AULA 02.
- Não usar datas.
- Não numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Usar exatamente os conteúdos escritos pelo professor.
- A avaliação é a observação realizada durante as aulas.
- Usar linguagem natural, simples e pedagógica.
- Não repetir o nome do conteúdo dentro da avaliação.
- Não escrever "A avaliação considerou".
- Não escrever "A avaliação focou".
- Não escrever "A avaliação destacou".
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Observar participação, atenção, envolvimento, realização das atividades, oralidade, interação e compreensão.
- Se o professor informar "Meu estilo de aula", respeitar esse estilo também na avaliação.
- Não repetir exatamente o mesmo texto em todos os conteúdos.
- Variar os aspectos observados.
- Cada avaliação deve ser curta e ficar em uma única linha.
- Para EJA, observar também autonomia, argumentação, resolução de problemas e aplicação prática dos conhecimentos.
- Para EJA, valorizar a relação entre o conteúdo, as experiências de vida e as situações reais do cotidiano.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: Avaliação por observação da participação, envolvimento, realização das atividades e compreensão demonstrada em sala.
`;
      } else {
        comando = `
Você é um assistente pedagógico.

Crie uma avaliação para cada aula abaixo.

Disciplina: ${disciplina}
Série: ${serie}

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS OBRIGATÓRIAS:
- Cada aula deve ficar em uma linha.
- Nunca juntar AULA 01 com AULA 02.
- A avaliação é a observação realizada durante a aula.
- Usar linguagem natural, simples e pedagógica.
- Não repetir o conteúdo ou o tema dentro da avaliação.
- Não escrever "A avaliação considerou".
- Não escrever "A avaliação focou".
- Não escrever "A avaliação destacou".
- Não escrever no passado.
- Não criar perguntas.
- Não criar atividades.
- Observar participação, atenção, envolvimento, realização das atividades, oralidade, interação e compreensão.
- Se o professor informar "Meu estilo de aula", respeitar esse estilo também na avaliação.
- Não repetir exatamente o mesmo texto em todas as aulas.
- Variar os aspectos observados.
- Cada avaliação deve ser curta e ficar em uma única linha.
- Escrever diretamente o que será observado.
- Para EJA, observar também autonomia, argumentação, resolução de problemas e aplicação prática dos conhecimentos.
- Para EJA, valorizar a capacidade de relacionar o conteúdo às experiências de vida e a situações reais.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA. Avaliação por observação da participação, atenção, envolvimento e realização das atividades propostas em sala.
AULA 02 - DATA. Avaliação por observação da interação, compreensão e participação durante o desenvolvimento da aula.
`;
      }
    }

    if (tipo === "referencias") {
      comando = `
Você é um assistente pedagógico.

Crie as referências para o plano de aula.

Disciplina: ${disciplina}
Série: ${serie}

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

REGRAS:
- Não utilizar tópicos.
- Não utilizar marcadores.
- Não utilizar listas numeradas.
- Não utilizar linhas em branco.
- Não utilizar espaços extras.
- Não separar referências por aula.
- Gerar apenas as referências gerais do planejamento.
- Cada referência deve ficar em uma linha.
- Não repetir referências.
- Se o professor informar livro, apostila, material próprio ou referência específica em "Meu estilo de aula", incluir essas referências.
- Utilizar preferencialmente o livro informado pelo professor.
- Caso nenhum livro seja informado, utilizar apenas "Livro didático da disciplina".
- Não inventar nome de livro específico.
- Manter obrigatoriamente a referência da BNCC.
- Para EJA, não inventar materiais específicos de EJA caso o professor não os tenha informado.

FORMATO OBRIGATÓRIO:
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

${regrasEJA}
${regrasEtapaEJA}

Meu estilo de aula:
${estiloAula}

Aulas:
${aulas}

REGRAS:
- Gerar obrigatoriamente 4 semanas.
- Sempre usar o formato 1ª SEMANA, 2ª SEMANA, 3ª SEMANA e 4ª SEMANA.
- Não usar Aula 01, Aula 02 ou datas.
- Organizar por semana.
- Se houver poucas aulas, distribuir os temas entre as quatro semanas sem repetir atividades iguais.
- As atividades devem respeitar a série informada.
- As atividades devem estar relacionadas aos temas trabalhados.
- As atividades devem ser curtas e possíveis de realizar em casa.
- Variar os tipos de atividade entre as quatro semanas.
- Evitar repetir exercícios do mesmo formato.
- Distribuir os conteúdos de forma equilibrada.
- Se o professor informar que não passa atividade todos os dias ou não passa atividade para casa, respeitar isso.
- Não gerar objetivos.
- Não gerar metodologia.
- Não gerar avaliação.
- Não gerar referências.
- Não deixar linhas em branco entre as semanas.
- Cada semana deve ocupar apenas uma linha.
- Não utilizar espaçamento extra.
- Utilizar apenas uma quebra de linha entre uma semana e outra.
- Não usar celular.
- Não usar aplicativo.
- Não usar internet.
- Não usar computador.
- Não pedir pesquisa online.
- Usar apenas caderno, lápis, livro didático ou observação simples em casa.
- Usar atividades possíveis para estudantes com poucos recursos.
- Para EJA, propor atividades significativas para jovens e adultos.
- Para EJA, relacionar as atividades a situações reais, como leitura de documentos, interpretação de textos, cálculos cotidianos, trabalho, saúde, cidadania, consumo, ambiente e comunidade.
- Para EJA, evitar tarefas infantilizadas.
- Para EJA, respeitar a rotina de trabalho, família e responsabilidades dos estudantes.
- Nunca escrever duas semanas na mesma linha.

FORMATO OBRIGATÓRIO:
1ª SEMANA - Atividade curta no caderno.
2ª SEMANA - Atividade curta no caderno.
3ª SEMANA - Atividade curta no caderno.
4ª SEMANA - Atividade curta no caderno.
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

    let texto = resposta.choices[0].message.content || "";

    if (tipo === "objetivos") {
      texto = texto.replace(
        /(OBJETIVOS:\s*)(.*)/gi,
        (_, inicio, objetivos) => {
          const corrigidos = objetivos
            .split(";")
            .map((obj: string) => {
              obj = obj.trim();

              if (!obj) return "";

              return obj.charAt(0).toUpperCase() + obj.slice(1);
            })
            .join("; ");

          return inicio + corrigidos;
        }
      );
    }

    return Response.json({
      texto,
    });
  } catch (erro) {
    console.error("ERRO NA IA:", erro);

    return Response.json(
      {
        erro: "Erro ao gerar plano.",
      },
      {
        status: 500,
      }
    );
  }
}