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

    let comando = "";

   if (tipo === "temas") {
  comando = `
Você é um assistente pedagógico.

Destrinche o tema geral em temas por aula, respeitando a série informada.

Tema geral: ${tema}
Disciplina: ${body.disciplina || ""}
Série: ${body.serie || ""}

Datas das aulas:
${aulas}

Regras:
- Gere somente os temas das aulas.
- Respeite a série informada.
- Não avance conteúdos além do nível da turma.
- Organize os temas do mais simples para o mais complexo.
- Mantenha exatamente as datas recebidas.
- Não gere objetivos.
- Não gere habilidades.
- Não gere metodologia.
- Não gere avaliação.
- Use exatamente o formato:
AULA 01 - DATA - TEMA DA AULA
AULA 02 - DATA - TEMA DA AULA
`;
}

    if (tipo === "objetivos") {
  if (tipoPlanejamento === "mensal") {
    comando = `
Você é um assistente pedagógico.

Crie habilidades BNCC e objetivos para cada conteúdo mensal informado pelo professor.

Disciplina: ${body.disciplina || ""}
Série: ${body.serie || ""}

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

Disciplina: ${body.disciplina || ""}
Série: ${body.serie || ""}

Aulas:
${aulas}

Regras:
- Respeite a série informada.
- Use apenas o código da BNCC, sem descrição.
- Nunca coloque apenas um objetivo.
- Coloque de 3 a 5 objetivos por aula.
- Os objetivos devem ficar na mesma linha, separados por ponto e vírgula.
- Mantenha exatamente a aula e a data recebida.
- Não colocar espaçamento entre aula 01 e aula 02
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

    if (tipo === "metodologia") {
  if (tipoPlanejamento === "mensal") {
    comando = `
Você é um assistente pedagógico.

Crie uma metodologia para cada conteúdo mensal informado pelo professor.

Disciplina: ${body.disciplina || ""}
Série: ${body.serie || ""}

Conteúdos do mês:
${aulas}

REGRAS OBRIGATÓRIAS:
- NÃO usar AULA 01.
- NÃO usar AULA 02.
- NÃO usar datas.
- NÃO numerar os conteúdos.
- Usar somente uma marcação com hífen no início de cada conteúdo.
- Usar exatamente os conteúdos escritos pelo professor.
- Criar uma metodologia para cada conteúdo.
- A metodologia deve ser objetiva, viável e relacionada ao conteúdo.
- Variar as estratégias entre os conteúdos.
- Não repetir sempre "roda de conversa", "cartaz" ou "atividade prática".
- Não descrever atividades longas que ocupem várias aulas.
- Não usar "o professor", "a professora" ou "o docente".
- Usar linguagem de planejamento.

FORMATO OBRIGATÓRIO:
- Nome do conteúdo: metodologia relacionada ao conteúdo.
`;
  } else {
    comando = `
Você é um assistente pedagógico.

Crie a metodologia para cada aula abaixo.

Disciplina: ${body.disciplina || ""}
Série: ${body.serie || ""}

Aulas:
${aulas}

REGRAS OBRIGATÓRIAS:
- Gerar uma metodologia diferente para cada aula.
- Relacionar a metodologia diretamente ao tema da aula.
- Utilizar linguagem de planejamento docente.
- Não repetir sempre "roda de conversa".
- Não repetir sempre "cartaz".
- Não repetir sempre "atividade prática".
- Não descrever atividades longas que ocupem várias aulas.
- Ser objetiva, clara e viável para uma única aula.
- Não usar "o professor", "a professora" ou "o docente".
- Não colocar espaçamento entre AULA 01 e AULA 02.

FORMATO OBRIGATÓRIO:
AULA 01 - DATA - TEMA DA AULA. Metodologia da aula.
AULA 02 - DATA - TEMA DA AULA. Metodologia da aula.
`;
  }
}

if (tipo === "avaliacao") {
  if (tipoPlanejamento === "mensal") {
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

Disciplina: ${body.disciplina || ""}
Série: ${body.serie || ""}

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

Disciplina: ${body.disciplina || ""}
Série: ${body.serie || ""}

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
4ª SEMANA - Atividade para casa..
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