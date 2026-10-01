import {
  NextRequest,
  NextResponse,
} from "next/server";

import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const POR_PAGINA = 24;

function lerPlano(
  planoCompleto?: string | null
) {
  const vazio = {
    temas: "",
    objetivos: "",
    recursos: "",
    metodologia: "",
    avaliacao: "",
    referencias: "",
    atividade: "",
  };

  if (!planoCompleto) {
    return vazio;
  }

  try {
    const conteudo =
      JSON.parse(planoCompleto);

    return {
      temas: String(
        conteudo?.temas || ""
      ),
      objetivos: String(
        conteudo?.objetivos || ""
      ),
      recursos: String(
        conteudo?.recursos || ""
      ),
      metodologia: String(
        conteudo?.metodologia || ""
      ),
      avaliacao: String(
        conteudo?.avaliacao || ""
      ),
      referencias: String(
        conteudo?.referencias || ""
      ),
      atividade: String(
        conteudo?.atividade || ""
      ),
    };
  } catch {
    return {
      ...vazio,
      temas: planoCompleto,
    };
  }
}

function removerDatas(
  texto: string
) {
  return texto
    .replace(
      /(\bAULA\s*\d+\b)\s*[-–—:]\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*[-–—:]\s*/gi,
      "$1 - "
    )
    .replace(
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
      ""
    )
    .replace(
      /[ \t]{2,}/g,
      " "
    )
    .replace(
      /\s+([,.;:])/g,
      "$1"
    )
    .trim();
}

function tituloPlano(plano: {
  titulo_biblioteca?: string | null;
  plano_completo?: string | null;
  disciplina?: string | null;
}) {
  const tituloSalvo =
    plano.titulo_biblioteca?.trim();

  if (tituloSalvo) {
    return tituloSalvo;
  }

  if (!plano.plano_completo) {
    return (
      plano.disciplina?.trim() ||
      "Planejamento"
    );
  }

  const conteudo =
    lerPlano(
      plano.plano_completo
    );

  const primeiraLinha =
    conteudo.temas
      .split("\n")
      .map((linha) =>
        linha.trim()
      )
      .find(Boolean);

  if (primeiraLinha) {
    return removerDatas(
      primeiraLinha
    )
      .replace(
        /^AULA\s*\d+\s*[-–—:]?\s*/i,
        ""
      )
      .trim();
  }

  return (
    plano.disciplina?.trim() ||
    "Planejamento"
  );
}

export async function GET(
  req: NextRequest
) {
  try {
    const { searchParams } =
      new URL(req.url);

    const tipo =
      searchParams
        .get("tipo")
        ?.trim();

    const id =
      searchParams
        .get("id")
        ?.trim();

    const paginaRecebida =
      Number(
        searchParams.get(
          "pagina"
        ) || "1"
      );

    const pagina =
      Number.isFinite(
        paginaRecebida
      ) &&
      paginaRecebida > 0
        ? Math.floor(
            paginaRecebida
          )
        : 1;

    const inicio =
      (pagina - 1) *
      POR_PAGINA;

    /*
     * O range do Supabase é inclusivo.
     * Portanto buscamos 25 registros:
     * 24 serão enviados para a página
     * e o 25º informa se existe
     * uma próxima página.
     */
    const fim =
      inicio + POR_PAGINA;

    /*
     * =====================================
     * ABRIR UMA ATIVIDADE
     * =====================================
     */
    if (
      tipo === "atividade" &&
      id
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "atividades"
          )
          .select(
            `
            id,
            titulo,
            etapa_ensino,
            serie,
            disciplina,
            tipo_atividade,
            imagem,
            created_at,
            publicar_biblioteca
            `
          )
          .eq(
            "id",
            id
          )
          .eq(
            "publicar_biblioteca",
            true
          )
          .single();

      if (
        error ||
        !data
      ) {
        console.error(
          "Erro ao abrir atividade:",
          error
        );

        return NextResponse.json(
          {
            erro:
              "Atividade não encontrada.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        material: data,
      });
    }

    /*
     * =====================================
     * ABRIR UMA AVALIAÇÃO
     * =====================================
     */
    if (
      tipo === "avaliacao" &&
      id
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "avaliacoes"
          )
          .select(
            `
            id,
            titulo,
            etapa_ensino,
            serie,
            disciplina,
            conteudos,
            avaliacao_completa,
            created_at,
            publicar_biblioteca
            `
          )
          .eq(
            "id",
            id
          )
          .eq(
            "publicar_biblioteca",
            true
          )
          .single();

      if (
        error ||
        !data
      ) {
        console.error(
          "Erro ao abrir avaliação:",
          error
        );

        return NextResponse.json(
          {
            erro:
              "Avaliação não encontrada.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        material: data,
      });
    }

    /*
     * =====================================
     * ABRIR UM PLANEJAMENTO
     * =====================================
     */
    if (
      tipo === "plano" &&
      id
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "planos"
          )
          .select(
            `
            id,
            titulo_biblioteca,
            etapa_ensino,
            serie,
            disciplina,
            tipo_planejamento,
            plano_completo,
            created_at,
            publicar_biblioteca
            `
          )
          .eq(
            "id",
            id
          )
          .eq(
            "publicar_biblioteca",
            true
          )
          .single();

      if (
        error ||
        !data
      ) {
        console.error(
          "Erro ao abrir planejamento:",
          error
        );

        return NextResponse.json(
          {
            erro:
              "Planejamento não encontrado.",
          },
          {
            status: 404,
          }
        );
      }

      const conteudo =
        lerPlano(
          data.plano_completo
        );

      return NextResponse.json({
        material: {
          ...data,

          titulo:
            tituloPlano(
              data
            ),

          conteudo: {
            temas:
              removerDatas(
                conteudo.temas
              ),

            objetivos:
              removerDatas(
                conteudo.objetivos
              ),

            recursos:
              removerDatas(
                conteudo.recursos
              ),

            metodologia:
              removerDatas(
                conteudo.metodologia
              ),

            avaliacao:
              removerDatas(
                conteudo.avaliacao
              ),

            referencias:
              removerDatas(
                conteudo.referencias
              ),

            atividade:
              removerDatas(
                conteudo.atividade
              ),
          },
        },
      });
    }

    /*
     * =====================================
     * LISTAGEM DE AVALIAÇÕES
     *
     * Só é executada quando a pessoa
     * clica em Avaliações.
     *
     * Não carregamos avaliacao_completa
     * aqui.
     * =====================================
     */
    if (
      tipo === "avaliacoes"
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "avaliacoes"
          )
          .select(
            `
            id,
            titulo,
            etapa_ensino,
            serie,
            disciplina,
            created_at
            `
          )
          .eq(
            "publicar_biblioteca",
            true
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(500);

      if (error) {
        console.error(
          "Erro ao carregar avaliações:",
          error
        );

        return NextResponse.json(
          {
            erro:
              "Não foi possível carregar as avaliações.",
          },
          {
            status: 500,
          }
        );
      }

      const avaliacoes =
        (data || []).map(
          (item) => ({
            id: item.id,

            tipo:
              "Avaliação" as const,

            titulo:
              item.titulo?.trim() ||
              "Avaliação",

            etapa:
              item.etapa_ensino?.trim() ||
              "Não informado",

            serie:
              item.serie?.trim() ||
              "Não informado",

            disciplina:
              item.disciplina?.trim() ||
              "Não informado",

            subtitulo:
              "Avaliação pronta para aplicar",

            imagem: null,

            criadoEm:
              item.created_at ||
              null,
          })
        );

      return NextResponse.json({
        materiais:
          avaliacoes,
      });
    }

    /*
     * =====================================
     * LISTAGEM DE PLANEJAMENTOS
     *
     * Só é executada quando a pessoa
     * clica em Planejamentos.
     *
     * Não carregamos plano_completo.
     * =====================================
     */
    if (
      tipo === "planos"
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "planos"
          )
          .select(
            `
            id,
            titulo_biblioteca,
            etapa_ensino,
            serie,
            disciplina,
            tipo_planejamento,
            created_at
            `
          )
          .eq(
            "publicar_biblioteca",
            true
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(500);

      if (error) {
        console.error(
          "Erro ao carregar planejamentos:",
          error
        );

        return NextResponse.json(
          {
            erro:
              "Não foi possível carregar os planejamentos.",
          },
          {
            status: 500,
          }
        );
      }

      const planos =
        (data || []).map(
          (item) => ({
            id: item.id,

            tipo:
              "Planejamento" as const,

            titulo:
              item
                .titulo_biblioteca
                ?.trim() ||
              item.disciplina?.trim() ||
              "Planejamento",

            etapa:
              item.etapa_ensino?.trim() ||
              "Não informado",

            serie:
              item.serie?.trim() ||
              "Não informado",

            disciplina:
              item.disciplina?.trim() ||
              "Não informado",

            subtitulo:
              item
                .tipo_planejamento
                ?.trim() ||
              "Plano de aula",

            imagem: null,

            criadoEm:
              item.created_at ||
              null,
          })
        );

      return NextResponse.json({
        materiais:
          planos,
      });
    }

    /*
     * =====================================
     * BIBLIOTECA INICIAL
     *
     * Carrega APENAS atividades.
     *
     * Não busca avaliações.
     * Não busca planejamentos.
     * =====================================
     */
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "atividades"
        )
        .select(
          `
          id,
          titulo,
          etapa_ensino,
          serie,
          disciplina,
          tipo_atividade,
          imagem,
          created_at
          `
        )
        .eq(
          "publicar_biblioteca",
          true
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .range(
          inicio,
          fim
        );

    if (error) {
      console.error(
        "Erro ao carregar atividades:",
        error
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível carregar a Biblioteca.",
        },
        {
          status: 500,
        }
      );
    }

    const lista =
      data || [];

    const temMaisAtividades =
      lista.length >
      POR_PAGINA;

    const atividades =
      lista
        .slice(
          0,
          POR_PAGINA
        )
        .map(
          (item) => ({
            id: item.id,

            tipo:
              "Atividade" as const,

            titulo:
              item.titulo?.trim() ||
              item.tipo_atividade?.trim() ||
              "Atividade",

            etapa:
              item.etapa_ensino?.trim() ||
              "Não informado",

            serie:
              item.serie?.trim() ||
              "Não informado",

            disciplina:
              item.disciplina?.trim() ||
              "Não informado",

            subtitulo:
              item.tipo_atividade?.trim() ||
              "Atividade pedagógica",

            imagem:
              item.imagem ||
              null,

            criadoEm:
              item.created_at ||
              null,
          })
        );

    return NextResponse.json({
      materiais:
        atividades,

      pagina,

      porPagina:
        POR_PAGINA,

      temMaisAtividades,
    });
  } catch (error) {
    console.error(
      "Erro inesperado na Biblioteca pública:",
      error
    );

    return NextResponse.json(
      {
        erro:
          "Erro interno do servidor.",
      },
      {
        status: 500,
      }
    );
  }
}