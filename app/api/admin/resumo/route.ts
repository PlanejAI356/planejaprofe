import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

function normalizarCupom(valor: unknown) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/gi, "")
    .trim()
    .toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    /*
     * 1. RECEBE O TOKEN DA PESSOA LOGADA
     */
    const authorization =
      req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
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
     * 2. DESCOBRE QUEM ESTÁ LOGADO
     */
    const {
      data: usuarioAuth,
      error: erroUsuario,
    } = await supabaseAdmin.auth.getUser(
      token
    );

    if (
      erroUsuario ||
      !usuarioAuth.user
    ) {
      return NextResponse.json(
        {
          erro: "Sessão inválida.",
        },
        {
          status: 401,
        }
      );
    }

    const emailUsuario =
      usuarioAuth.user.email
        ?.trim()
        .toLowerCase();

    /*
     * 3. CONFERE SE É A ADMINISTRADORA
     */
    const emailAdmin =
      process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();

    if (!emailAdmin) {
      console.error(
        "ADMIN_EMAIL não configurado."
      );

      return NextResponse.json(
        {
          erro:
            "Painel administrativo não configurado.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !emailUsuario ||
      emailUsuario !== emailAdmin
    ) {
      return NextResponse.json(
        {
          erro: "Acesso não autorizado.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 4. BUSCA OS PERFIS
     *
     * cupom_origem identifica
     * de qual parceiro veio o cadastro.
     */
    const {
      data: perfis,
      error: erroPerfis,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, nome, email, whatsapp, plano, planos_restantes, mercado_pago_id, cupom_origem"
      )
      .order("email", {
        ascending: true,
      });

    if (erroPerfis) {
      console.error(
        "Erro ao buscar usuários:",
        erroPerfis
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível carregar os usuários.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 5. BUSCA OS PARCEIROS
     */
    const {
      data: parceiros,
      error: erroParceiros,
    } = await supabaseAdmin
      .from("parceiros")
      .select(
        "id, nome, cupom, comissao_percentual, ativo"
      )
      .order("nome", {
        ascending: true,
      });

    if (erroParceiros) {
      console.error(
        "Erro ao buscar parceiros:",
        erroParceiros
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível carregar os parceiros.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 6. BUSCA AS INDICAÇÕES
     *
     * Usadas principalmente para
     * pagamentos e comissões.
     */
    const {
      data: indicacoes,
      error: erroIndicacoes,
    } = await supabaseAdmin
      .from("indicacoes")
      .select(
        "id, parceiro_id, cupom, email_cliente, status, valor_assinatura, valor_comissao, mercado_pago_id"
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
     * 7. BUSCA OS VISITANTES ÚNICOS
     *
     * cliques_parceiros mantém
     * apenas um registro por
     * visitante/parceiro.
     */
    const {
      data: cliquesParceiros,
      error: erroCliques,
    } = await supabaseAdmin
      .from("cliques_parceiros")
      .select(
        "id, parceiro_id, cupom"
      );

    if (erroCliques) {
      console.error(
        "Erro ao buscar visitantes dos parceiros:",
        erroCliques
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível carregar os visitantes dos parceiros.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 8. BUSCA TODOS OS ACESSOS
     *
     * acessos_parceiros registra
     * cada abertura do link,
     * inclusive acessos repetidos.
     */
    const {
      data: acessosParceiros,
      error: erroAcessos,
    } = await supabaseAdmin
      .from("acessos_parceiros")
      .select(
        "id, parceiro_id, cupom"
      );

    if (erroAcessos) {
      console.error(
        "Erro ao buscar acessos dos parceiros:",
        erroAcessos
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível carregar os acessos dos parceiros.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 9. MONTA OS NÚMEROS GERAIS
     */
    const totalUsuarios =
      perfis?.length || 0;

    const totalPremium =
      perfis?.filter(
        (perfil) =>
          perfil.plano === "premium"
      ).length || 0;

    const totalGratuitos =
      totalUsuarios - totalPremium;

    const parceirosAtivos =
      parceiros?.filter(
        (parceiro) =>
          parceiro.ativo === true
      ).length || 0;

    const pagamentosParceiros =
      indicacoes?.filter(
        (indicacao) =>
          indicacao.status === "pago"
      ).length || 0;

    /*
     * 10. MONTA OS INDICADORES
     * DE CADA PARCEIRO
     */
    const parceirosComIndicadores =
      (parceiros || []).map(
        (parceiro) => {
          const cupomParceiro =
            normalizarCupom(
              parceiro.cupom
            );

          /*
           * CADASTROS
           *
           * Junta cadastros novos
           * de profiles.cupom_origem
           * com registros antigos
           * da tabela indicacoes.
           *
           * O Set evita duplicar o
           * mesmo email.
           */
          const emailsCadastros =
            new Set<string>();

          (perfis || []).forEach(
            (perfil) => {
              if (
                normalizarCupom(
                  perfil.cupom_origem
                ) === cupomParceiro
              ) {
                const email =
                  String(
                    perfil.email || ""
                  )
                    .trim()
                    .toLowerCase();

                if (email) {
                  emailsCadastros.add(
                    email
                  );
                }
              }
            }
          );

          (indicacoes || []).forEach(
            (indicacao) => {
              const pertenceAoParceiro =
                indicacao.parceiro_id ===
                  parceiro.id ||
                normalizarCupom(
                  indicacao.cupom
                ) === cupomParceiro;

              if (!pertenceAoParceiro) {
                return;
              }

              const email =
                String(
                  indicacao.email_cliente ||
                    ""
                )
                  .trim()
                  .toLowerCase();

              if (email) {
                emailsCadastros.add(
                  email
                );
              }
            }
          );

          const totalCadastros =
            emailsCadastros.size;

          /*
           * ACESSOS TOTAIS
           *
           * Conta toda abertura
           * do link.
           */
          const totalAcessos =
            (
              acessosParceiros || []
            ).filter(
              (acesso) =>
                acesso.parceiro_id ===
                  parceiro.id ||
                normalizarCupom(
                  acesso.cupom
                ) === cupomParceiro
            ).length;

          /*
           * VISITANTES ÚNICOS
           *
           * Conta cada navegador/
           * visitante apenas uma vez.
           */
          const totalVisitantes =
            (
              cliquesParceiros || []
            ).filter(
              (clique) =>
                clique.parceiro_id ===
                  parceiro.id ||
                normalizarCupom(
                  clique.cupom
                ) === cupomParceiro
            ).length;

          /*
           * INDICAÇÕES DO PARCEIRO
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
           * SOMENTE PAGAMENTOS
           * CONFIRMADOS
           */
          const pagamentos =
            indicacoesParceiro.filter(
              (indicacao) =>
                indicacao.status ===
                "pago"
            );

          const totalPagamentos =
            pagamentos.length;

          /*
           * COMISSÃO TOTAL
           */
          const comissaoTotal =
            pagamentos.reduce(
              (
                total,
                indicacao
              ) =>
                total +
                Number(
                  indicacao.valor_comissao ||
                    0
                ),
              0
            );

          /*
           * VALOR TOTAL DAS VENDAS
           */
          const valorVendas =
            pagamentos.reduce(
              (
                total,
                indicacao
              ) =>
                total +
                Number(
                  indicacao.valor_assinatura ||
                    0
                ),
              0
            );

          /*
           * CONVERSÃO
           *
           * Pagamentos / Cadastros
           */
          const conversao =
            totalCadastros > 0
              ? Number(
                  (
                    (totalPagamentos /
                      totalCadastros) *
                    100
                  ).toFixed(1)
                )
              : 0;

          return {
            ...parceiro,

            totalAcessos,
            totalVisitantes,
            totalCadastros,
            totalPagamentos,

            valorVendas: Number(
              valorVendas.toFixed(2)
            ),

            comissaoTotal: Number(
              comissaoTotal.toFixed(2)
            ),

            conversao,
          };
        }
      );

    /*
     * 11. DEVOLVE OS DADOS
     * PARA O PAINEL
     */
    return NextResponse.json({
      resumo: {
        totalUsuarios,
        totalPremium,
        totalGratuitos,
        parceirosAtivos,
        pagamentosParceiros,
      },

      usuarios:
        perfis || [],

      parceiros:
        parceirosComIndicadores,

      indicacoes:
        indicacoes || [],
    });
  } catch (error) {
    console.error(
      "Erro inesperado no painel administrativo:",
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