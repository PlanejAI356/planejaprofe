import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  try {
    /*
     * 1. RECEBE O TOKEN
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
     * 2. IDENTIFICA O USUÁRIO LOGADO
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
     * 3. CONFERE ADMIN
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
     * 4. BUSCA PERFIS
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
     * 5. BUSCA PARCEIROS
     *
     * IMPORTANTE:
     * user_id liga o parceiro ao cadastro
     * correspondente na tabela profiles.
     */
    const {
      data: parceiros,
      error: erroParceiros,
    } = await supabaseAdmin
      .from("parceiros")
      .select(
        "id, user_id, nome, cupom, comissao_percentual, ativo"
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
     * 6. IDENTIFICA QUEM É PARCEIRO
     */
    const idsParceiros = new Set(
      (parceiros || [])
        .map((parceiro) =>
          String(
            parceiro.user_id || ""
          ).trim()
        )
        .filter(Boolean)
    );

    /*
     * Perfis que são parceiros deixam de ser
     * considerados usuários/clientes.
     */
    const usuariosClientes =
      (perfis || []).filter(
        (perfil) =>
          !idsParceiros.has(
            String(perfil.id)
          )
      );

    /*
     * 7. BUSCA INDICAÇÕES
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
     * 8. BUSCA VISITANTES ÚNICOS
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
     * 9. BUSCA TODOS OS ACESSOS
     *
     * Se houver algum problema,
     * o painel continua funcionando.
     */
    let acessosParceiros: {
      id: string;
      parceiro_id: string | null;
      cupom: string | null;
    }[] = [];

    const {
      data: acessos,
      error: erroAcessos,
    } = await supabaseAdmin
      .from("acessos_parceiros")
      .select(
        "id, parceiro_id, cupom"
      );

    if (erroAcessos) {
      console.warn(
        "Não foi possível carregar acessos_parceiros.",
        erroAcessos
      );

      acessosParceiros = [];
    } else {
      acessosParceiros =
        acessos || [];
    }

    /*
     * 10. NÚMEROS GERAIS
     *
     * Aqui entram SOMENTE clientes.
     * Parceiros ficam fora de:
     * - total de usuários
     * - Premium
     * - gratuitos
     * - conversão geral
     */
    const totalUsuarios =
      usuariosClientes.length;

    const totalPremium =
      usuariosClientes.filter(
        (perfil) =>
          String(
            perfil.plano || ""
          ).toLowerCase() ===
          "premium"
      ).length;

    const totalGratuitos =
      usuariosClientes.filter(
        (perfil) =>
          String(
            perfil.plano || ""
          ).toLowerCase() !==
          "premium"
      ).length;

    const parceirosAtivos =
      (parceiros || []).filter(
        (parceiro) =>
          parceiro.ativo === true
      ).length;

    /*
     * 11. INDICADORES DE CADA PARCEIRO
     */
    const parceirosComIndicadores =
      (parceiros || []).map(
        (parceiro) => {
          const cupomParceiro =
            normalizarCupom(
              parceiro.cupom
            );

          /*
           * INDICAÇÕES DESTE PARCEIRO
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
           * MAPA DAS INDICAÇÕES POR E-MAIL
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

              if (!email) {
                return;
              }

              const listaAtual =
                indicacoesPorEmail.get(
                  email
                ) || [];

              listaAtual.push(
                indicacao
              );

              indicacoesPorEmail.set(
                email,
                listaAtual
              );
            }
          );

          /*
           * CADASTROS DO PARCEIRO
           *
           * IMPORTANTE:
           * usa somente usuários/clientes.
           * A própria conta do parceiro não
           * pode contar como cadastro.
           */
          const emailsCadastros =
            new Set<string>();

          usuariosClientes.forEach(
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

              if (!email) {
                return;
              }

              /*
               * Só conta se existir como cliente,
               * evitando considerar a própria
               * conta de um parceiro.
               */
              const existeComoCliente =
                usuariosClientes.some(
                  (perfil) =>
                    normalizarEmail(
                      perfil.email
                    ) === email
                );

              if (existeComoCliente) {
                emailsCadastros.add(
                  email
                );
              }
            }
          );

          const totalCadastros =
            emailsCadastros.size;

          /*
           * VISITANTES ÚNICOS
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
           * ACESSOS
           */
          const acessosDoParceiro =
            acessosParceiros.filter(
              (acesso) =>
                acesso.parceiro_id ===
                  parceiro.id ||
                normalizarCupom(
                  acesso.cupom
                ) === cupomParceiro
            );

          const totalAcessos =
            acessosParceiros.length > 0
              ? acessosDoParceiro.length
              : totalVisitantes;

          /*
           * PAGAMENTOS / PREMIUM DO PARCEIRO
           *
           * Um cliente conta uma única vez.
           *
           * O perfil precisa:
           * - não ser parceiro;
           * - estar Premium;
           * - pertencer ao parceiro;
           * - ter Mercado Pago ID OU
           *   uma indicação paga.
           */
          const clientesPagos =
            new Map<
              string,
              {
                email: string;
                valorAssinatura: number;
                valorComissao: number;
              }
            >();

          usuariosClientes.forEach(
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
                    "pago"
                );

              const possuiMercadoPago =
                Boolean(
                  String(
                    perfil.mercado_pago_id ||
                      ""
                  ).trim()
                );

              /*
               * Evita contar Premium
               * liberado manualmente como venda.
               */
              if (
                !indicacaoPaga &&
                !possuiMercadoPago
              ) {
                return;
              }

              const percentualComissao =
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
                        (percentualComissao /
                          100)
                      ).toFixed(2)
                    );

              clientesPagos.set(
                email,
                {
                  email,
                  valorAssinatura,
                  valorComissao,
                }
              );
            }
          );

          /*
           * INDICAÇÕES PAGAS ANTIGAS
           */
          indicacoesParceiro.forEach(
            (indicacao) => {
              const status =
                String(
                  indicacao.status || ""
                ).toLowerCase();

              if (status !== "pago") {
                return;
              }

              const email =
                normalizarEmail(
                  indicacao.email_cliente
                );

              if (!email) {
                return;
              }

              if (
                clientesPagos.has(
                  email
                )
              ) {
                return;
              }

              /*
               * Procura somente entre clientes.
               * Parceiro não entra como cliente
               * Premium.
               */
              const perfil =
                usuariosClientes.find(
                  (item) =>
                    normalizarEmail(
                      item.email
                    ) === email
                );

              if (!perfil) {
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

              const percentualComissao =
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
                        (percentualComissao /
                          100)
                      ).toFixed(2)
                    );

              clientesPagos.set(
                email,
                {
                  email,
                  valorAssinatura,
                  valorComissao,
                }
              );
            }
          );

          const pagamentos =
            Array.from(
              clientesPagos.values()
            );

          const totalPagamentos =
            pagamentos.length;

          /*
           * VALOR DE VENDAS
           */
          const valorVendas =
            pagamentos.reduce(
              (
                total,
                pagamento
              ) =>
                total +
                pagamento.valorAssinatura,
              0
            );

          /*
           * COMISSÃO TOTAL
           */
          const comissaoTotal =
            pagamentos.reduce(
              (
                total,
                pagamento
              ) =>
                total +
                pagamento.valorComissao,
              0
            );

          /*
           * CONVERSÃO DO PARCEIRO
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
     * 12. PAGAMENTOS GERAIS DE PARCEIROS
     */
    const pagamentosParceiros =
      parceirosComIndicadores.reduce(
        (
          total,
          parceiro
        ) =>
          total +
          Number(
            parceiro.totalPagamentos ||
              0
          ),
        0
      );

    /*
     * 13. RETORNA O PAINEL
     *
     * usuarios recebe SOMENTE clientes.
     * Contas dos parceiros ficam exclusivamente
     * na área de parceiros.
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
        usuariosClientes,

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