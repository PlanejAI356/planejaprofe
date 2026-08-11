import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

function ocultarEmail(email: string) {
  const [usuario, dominio] = email.split("@");

  if (!usuario || !dominio) {
    return "Cliente";
  }

  return `${usuario.slice(0, 2)}***@${dominio}`;
}

export async function GET(request: Request) {
  try {
    /*
     * 1. VERIFICA O TOKEN
     */
    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          erro: "Usuário não autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    const token = authorization.replace(
      "Bearer ",
      ""
    );

    /*
     * 2. IDENTIFICA O USUÁRIO LOGADO
     */
    const {
      data: usuarioAuth,
      error: erroUsuario,
    } = await supabaseAdmin.auth.getUser(token);

    if (
      erroUsuario ||
      !usuarioAuth.user
    ) {
      console.error(
        "Erro ao identificar usuário:",
        erroUsuario
      );

      return NextResponse.json(
        {
          erro: "Sessão inválida ou expirada.",
        },
        {
          status: 401,
        }
      );
    }

    const userId =
      usuarioAuth.user.id;

    console.log(
      "Usuário da área do parceiro:",
      userId
    );

    /*
     * 3. PROCURA O PARCEIRO
     */
    const {
      data: parceiro,
      error: erroParceiro,
    } = await supabaseAdmin
      .from("parceiros")
      .select(
        "id, nome, cupom, comissao_percentual, ativo, user_id"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (erroParceiro) {
      console.error(
        "Erro ao buscar parceiro:",
        erroParceiro
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível consultar a parceria.",
        },
        {
          status: 500,
        }
      );
    }

    if (!parceiro) {
      return NextResponse.json(
        {
          erro:
            "Esta conta não está cadastrada como parceira.",
          naoParceiro: true,
        },
        {
          status: 403,
        }
      );
    }

    if (!parceiro.ativo) {
      return NextResponse.json(
        {
          erro:
            "Esta parceria está inativa.",
          naoParceiro: true,
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 4. CONTA OS CLIQUES
     *
     * Se houver erro aqui,
     * o painel continua funcionando.
     */
    let totalCliques = 0;

    const {
      count,
      error: erroCliques,
    } = await supabaseAdmin
      .from("cliques_parceiros")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "parceiro_id",
        parceiro.id
      );

    if (erroCliques) {
      console.error(
        "Erro ao contar cliques:",
        erroCliques
      );
    } else {
      totalCliques =
        count || 0;
    }

    /*
     * 5. BUSCA AS INDICAÇÕES
     *
     * Se a tabela estiver vazia,
     * retorna uma lista vazia normalmente.
     */
    let listaIndicacoes: any[] = [];

    const {
      data: indicacoes,
      error: erroIndicacoes,
    } = await supabaseAdmin
      .from("indicacoes")
      .select(
        `
        id,
        email_cliente,
        status,
        valor_assinatura,
        valor_comissao,
        created_at
        `
      )
      .eq(
        "parceiro_id",
        parceiro.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (erroIndicacoes) {
      console.error(
        "Erro ao buscar indicações:",
        erroIndicacoes
      );

      /*
       * NÃO derruba o painel.
       */
      listaIndicacoes = [];
    } else {
      listaIndicacoes =
        indicacoes || [];
    }

    /*
     * 6. CALCULA OS RESULTADOS
     */
    const cadastros =
      listaIndicacoes.length;

    const indicacoesPagas =
      listaIndicacoes.filter(
        (item) =>
          item.status === "pago" ||
          item.status === "confirmada"
      );

    const assinaturas =
      indicacoesPagas.length;

    const valorGerado =
      indicacoesPagas.reduce(
        (total, item) =>
          total +
          Number(
            item.valor_assinatura ||
              0
          ),
        0
      );

    const comissaoAcumulada =
      indicacoesPagas.reduce(
        (total, item) =>
          total +
          Number(
            item.valor_comissao ||
              0
          ),
        0
      );

    /*
     * 7. MONTA A LISTA
     */
    const resultados =
      listaIndicacoes.map(
        (item) => {
          const pago =
            item.status ===
              "pago" ||
            item.status ===
              "confirmada";

          return {
            id: item.id,

            cliente:
              ocultarEmail(
                item.email_cliente ||
                  ""
              ),

            created_at:
              item.created_at,

            status: pago
              ? "pago"
              : "cadastrado",

            valor_assinatura:
              pago
                ? Number(
                    item.valor_assinatura ||
                      0
                  )
                : 0,

            valor_comissao:
              pago
                ? Number(
                    item.valor_comissao ||
                      0
                  )
                : 0,
          };
        }
      );

    /*
     * 8. RETORNA O PAINEL
     */
    return NextResponse.json(
      {
        parceiro: {
          id: parceiro.id,
          nome: parceiro.nome,
          cupom:
            parceiro.cupom,

          comissaoPercentual:
            Number(
              parceiro.comissao_percentual ||
                0
            ),
        },

        resumo: {
          cliques:
            totalCliques,

          cadastros,

          assinaturas,

          valorGerado:
            Number(
              valorGerado.toFixed(
                2
              )
            ),

          comissaoAcumulada:
            Number(
              comissaoAcumulada.toFixed(
                2
              )
            ),
        },

        indicacoes:
          resultados,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Erro geral em /api/parceiro/dados:",
      error
    );

    return NextResponse.json(
      {
        erro:
          "Erro interno ao carregar a área do parceiro.",
      },
      {
        status: 500,
      }
    );
  }
}