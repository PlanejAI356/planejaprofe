import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const PRECO_PREMIUM = 29.9;

function normalizarCupom(valor: unknown) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/gi, "")
    .trim()
    .toUpperCase();
}

function normalizarEmail(valor: unknown) {
  return String(valor || "")
    .trim()
    .toLowerCase();
}

function ocultarEmail(email: string) {
  const [usuario, dominio] =
    email.split("@");

  if (!usuario || !dominio) {
    return "Cliente";
  }

  return `${usuario.slice(
    0,
    2
  )}***@${dominio}`;
}

export async function GET(
  request: Request
) {
  try {
    /*
     * 1. VERIFICA O TOKEN
     */
    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return NextResponse.json(
        {
          erro:
            "Usuário não autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authorization.replace(
        "Bearer ",
        ""
      );

    /*
     * 2. IDENTIFICA O USUÁRIO
     */
    const {
      data: usuarioAuth,
      error: erroUsuario,
    } =
      await supabaseAdmin.auth.getUser(
        token
      );

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
          erro:
            "Sessão inválida ou expirada.",
        },
        {
          status: 401,
        }
      );
    }

    const userId =
      usuarioAuth.user.id;

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
      .eq(
        "user_id",
        userId
      )
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

    const cupomParceiro =
      normalizarCupom(
        parceiro.cupom
      );

    /*
     * 4. BUSCA PERFIS
     */
    const {
      data: perfis,
      error: erroPerfis,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, nome, email, plano, mercado_pago_id, cupom_origem"
      );

    if (erroPerfis) {
      console.error(
        "Erro ao buscar perfis:",
        erroPerfis
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível carregar os usuários da parceria.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 5. BUSCA INDICAÇÕES
     */
    const {
      data: indicacoes,
      error: erroIndicacoes,
    } = await supabaseAdmin
      .from("indicacoes")
      .select(
        "id, parceiro_id, cupom, email_cliente, status, valor_assinatura, valor_comissao, mercado_pago_id, created_at"
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

      return NextResponse.json(
        {
          erro:
            "Não foi possível carregar as indicações.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 6. FILTRA INDICAÇÕES
     * DO PARCEIRO
     */
    const indicacoesParceiro =
      (indicacoes || []).filter(
        (indicacao) =>
          indicacao.parceiro_id ===
            parceiro.id ||
          normalizarCupom(
            indicacao.cupom
          ) === cupomParceiro
      );

    /*
     * 7. ACESSOS TOTAIS
     */
    let totalAcessos = 0;

    const {
      count: countAcessos,
      error: erroAcessos,
    } = await supabaseAdmin
      .from("acessos_parceiros")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq(
        "parceiro_id",
        parceiro.id
      );

    if (erroAcessos) {
      console.warn(
        "Erro ao contar acessos:",
        erroAcessos
      );
    } else {
      totalAcessos =
        countAcessos || 0;
    }

    /*
     * 8. VISITANTES ÚNICOS
     */
    let totalVisitantes = 0;

    const {
      count: countVisitantes,
      error: erroVisitantes,
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

    if (erroVisitantes) {
      console.warn(
        "Erro ao contar visitantes:",
        erroVisitantes
      );
    } else {
      totalVisitantes =
        countVisitantes || 0;
    }

    /*
     * 9. CADASTROS
     *
     * profiles.cupom_origem
     * + indicações antigas
     * sem duplicar email
     */
    const emailsCadastros =
      new Set<string>();

    (perfis || []).forEach(
      (perfil) => {
        if (
          normalizarCupom(
            perfil.cupom_origem
          ) !== cupomParceiro
        ) {
          return;
        }

        const email =
          normalizarEmail(
            perfil.email
          );

        if (email) {
          emailsCadastros.add(
            email
          );
        }
      }
    );

    indicacoesParceiro.forEach(
      (indicacao) => {
        const email =
          normalizarEmail(
            indicacao.email_cliente
          );

        if (email) {
          emailsCadastros.add(
            email
          );
        }
      }
    );

    const cadastros =
      emailsCadastros.size;

    /*
     * 10. MAPA DE INDICAÇÕES
     * POR EMAIL
     */
    const indicacoesPorEmail =
      new Map<
        string,
        typeof indicacoesParceiro
      >();

    indicacoesParceiro.forEach(
      (indicacao) => {
        const email =
          normalizarEmail(
            indicacao.email_cliente
          );

        if (!email) return;

        const lista =
          indicacoesPorEmail.get(
            email
          ) || [];

        lista.push(indicacao);

        indicacoesPorEmail.set(
          email,
          lista
        );
      }
    );

    /*
     * 11. PREMIUM / PAGAMENTOS
     */
    const clientesPagos =
      new Map<
        string,
        {
          email: string;
          created_at:
            string | null;
          valor_assinatura:
            number;
          valor_comissao:
            number;
        }
      >();

    (perfis || []).forEach(
      (perfil) => {
        const email =
          normalizarEmail(
            perfil.email
          );

        if (!email) {
          return;
        }

        const premium =
          String(
            perfil.plano || ""
          ).toLowerCase() ===
          "premium";

        if (!premium) {
          return;
        }

        const indicacoesEmail =
          indicacoesPorEmail.get(
            email
          ) || [];

        const pertencePeloPerfil =
          normalizarCupom(
            perfil.cupom_origem
          ) === cupomParceiro;

        const pertencePelaIndicacao =
          indicacoesEmail.length >
          0;

        if (
          !pertencePeloPerfil &&
          !pertencePelaIndicacao
        ) {
          return;
        }

        const indicacaoPaga =
          indicacoesEmail.find(
            (indicacao) =>
              String(
                indicacao.status ||
                  ""
              ).toLowerCase() ===
              "pago" ||
              String(
                indicacao.status ||
                  ""
              ).toLowerCase() ===
              "confirmada"
          );

        const possuiMercadoPago =
          Boolean(
            String(
              perfil.mercado_pago_id ||
                ""
            ).trim()
          );

        if (
          !indicacaoPaga &&
          !possuiMercadoPago
        ) {
          return;
        }

        const percentual =
          Number(
            parceiro.comissao_percentual ||
              0
          );

        const valorAssinatura =
          indicacaoPaga
            ? Number(
                indicacaoPaga.valor_assinatura ||
                  PRECO_PREMIUM
              )
            : PRECO_PREMIUM;

        const valorComissao =
          indicacaoPaga &&
          Number(
            indicacaoPaga.valor_comissao ||
              0
          ) > 0
            ? Number(
                indicacaoPaga.valor_comissao
              )
            : Number(
                (
                  valorAssinatura *
                  (percentual / 100)
                ).toFixed(2)
              );

        clientesPagos.set(
          email,
          {
            email,
            created_at:
              indicacaoPaga?.created_at ||
              null,
            valor_assinatura:
              valorAssinatura,
            valor_comissao:
              valorComissao,
          }
        );
      }
    );

    /*
     * 12. COMPLEMENTA PAGAMENTOS
     * ANTIGOS
     */
    indicacoesParceiro.forEach(
      (indicacao) => {
        const status =
          String(
            indicacao.status || ""
          ).toLowerCase();

        if (
          status !== "pago" &&
          status !== "confirmada"
        ) {
          return;
        }

        const email =
          normalizarEmail(
            indicacao.email_cliente
          );

        if (
          !email ||
          clientesPagos.has(
            email
          )
        ) {
          return;
        }

        const perfil =
          (perfis || []).find(
            (item) =>
              normalizarEmail(
                item.email
              ) === email
          );

        if (!perfil) {
          return;
        }

        if (
          String(
            perfil.plano || ""
          ).toLowerCase() !==
          "premium"
        ) {
          return;
        }

        const percentual =
          Number(
            parceiro.comissao_percentual ||
              0
          );

        const valorAssinatura =
          Number(
            indicacao.valor_assinatura ||
              PRECO_PREMIUM
          );

        const valorComissao =
          Number(
            indicacao.valor_comissao ||
              0
          ) > 0
            ? Number(
                indicacao.valor_comissao
              )
            : Number(
                (
                  valorAssinatura *
                  (percentual / 100)
                ).toFixed(2)
              );

        clientesPagos.set(
          email,
          {
            email,
            created_at:
              indicacao.created_at ||
              null,
            valor_assinatura:
              valorAssinatura,
            valor_comissao:
              valorComissao,
          }
        );
      }
    );

    const pagamentos =
      Array.from(
        clientesPagos.values()
      );

    const assinaturas =
      pagamentos.length;

    const valorGerado =
      pagamentos.reduce(
        (
          total,
          pagamento
        ) =>
          total +
          pagamento.valor_assinatura,
        0
      );

    const comissaoAcumulada =
      pagamentos.reduce(
        (
          total,
          pagamento
        ) =>
          total +
          pagamento.valor_comissao,
        0
      );

    const conversao =
      cadastros > 0
        ? Number(
            (
              (assinaturas /
                cadastros) *
              100
            ).toFixed(1)
          )
        : 0;

    /*
     * 13. LISTA DE RESULTADOS
     *
     * Mostra todos os cadastros
     * atribuídos ao parceiro.
     */
    const resultados =
      Array.from(
        emailsCadastros
      ).map(
        (email) => {
          const pagamento =
            clientesPagos.get(
              email
            );

          const indicacao =
            indicacoesPorEmail.get(
              email
            )?.[0];

          return {
            id:
              indicacao?.id ||
              email,

            cliente:
              ocultarEmail(
                email
              ),

            created_at:
              indicacao?.created_at ||
              pagamento?.created_at ||
              null,

            status: pagamento
              ? "pago"
              : "cadastrado",

            valor_assinatura:
              pagamento
                ? pagamento.valor_assinatura
                : 0,

            valor_comissao:
              pagamento
                ? pagamento.valor_comissao
                : 0,
          };
        }
      );

    /*
     * 14. RETORNA O PAINEL
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
          acessos:
            totalAcessos,

          visitantes:
            totalVisitantes,

          /*
           * Mantemos cliques por
           * compatibilidade temporária
           * com a página antiga.
           */
          cliques:
            totalVisitantes,

          cadastros,

          assinaturas,

          conversao,

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