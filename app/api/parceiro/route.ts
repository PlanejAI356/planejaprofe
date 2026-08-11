import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

function ocultarEmail(email: string) {
  const [usuario, dominio] = email.split("@");

  if (!usuario || !dominio) {
    return "Cliente";
  }

  return `${usuario.slice(0, 2)}***@${dominio}`;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Pega o token da pessoa que está logada
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { erro: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "");

    // 2. Descobre qual usuário está logado
    const {
      data: usuarioAuth,
      error: erroUsuario,
    } = await supabaseAdmin.auth.getUser(token);

    if (erroUsuario || !usuarioAuth.user) {
      console.error(
        "Erro ao identificar usuário parceiro:",
        erroUsuario
      );

      return NextResponse.json(
        { erro: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }

    const userId = usuarioAuth.user.id;

    // 3. Procura esse usuário na tabela parceiros
    const {
      data: parceiro,
      error: erroParceiro,
    } = await supabaseAdmin
      .from("parceiros")
      .select(
        "id, nome, cupom, comissao_percentual, ativo"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (erroParceiro) {
      console.error(
        "Erro ao procurar parceiro:",
        erroParceiro
      );

      return NextResponse.json(
        { erro: "Não foi possível carregar a parceria." },
        { status: 500 }
      );
    }

    // A pessoa tem conta no PlanejAI, mas não é parceira
    if (!parceiro) {
      return NextResponse.json(
        {
          erro: "Esta conta não possui uma parceria ativa.",
          naoParceiro: true,
        },
        { status: 403 }
      );
    }

    if (parceiro.ativo === false) {
      return NextResponse.json(
        {
          erro: "Esta parceria está inativa.",
          naoParceiro: true,
        },
        { status: 403 }
      );
    }

    // 4. Conta os cliques do link dessa parceira
    const {
      count: totalCliques,
      error: erroCliques,
    } = await supabaseAdmin
      .from("cliques_parceiros")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("parceiro_id", parceiro.id);

    if (erroCliques) {
      console.error(
        "Erro ao contar cliques:",
        erroCliques
      );
    }

    // 5. Busca os cadastros/indicações dessa parceira
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
        mercado_pago_id,
        created_at
        `
      )
      .eq("parceiro_id", parceiro.id)
      .order("created_at", {
        ascending: false,
      });

    if (erroIndicacoes) {
      console.error(
        "Erro ao buscar indicações:",
        erroIndicacoes
      );

      return NextResponse.json(
        { erro: "Não foi possível carregar as indicações." },
        { status: 500 }
      );
    }

    const listaIndicacoes = indicacoes || [];

    // 6. Calcula os números do painel
    const cadastros = listaIndicacoes.length;

    const indicacoesPagas = listaIndicacoes.filter(
      (item) =>
        item.status === "pago" ||
        item.status === "confirmada"
    );

    const assinaturas = indicacoesPagas.length;

    const valorGerado = indicacoesPagas.reduce(
      (total, item) =>
        total + Number(item.valor_assinatura || 0),
      0
    );

    const comissaoAcumulada = indicacoesPagas.reduce(
      (total, item) =>
        total + Number(item.valor_comissao || 0),
      0
    );

    // 7. Prepara a lista que aparecerá para a parceira
    const resultados = listaIndicacoes.map((item) => {
      const pago =
        item.status === "pago" ||
        item.status === "confirmada";

      return {
        id: item.id,

        cliente: ocultarEmail(
          item.email_cliente || ""
        ),

        created_at: item.created_at,

        status: pago ? "pago" : "cadastrado",

        valor_assinatura: pago
          ? Number(item.valor_assinatura || 0)
          : 0,

        valor_comissao: pago
          ? Number(item.valor_comissao || 0)
          : 0,
      };
    });

    // 8. Envia para a página somente os dados dessa parceira
    return NextResponse.json({
      parceiro: {
        id: parceiro.id,
        nome: parceiro.nome,
        cupom: parceiro.cupom,

        comissaoPercentual: Number(
          parceiro.comissao_percentual || 0
        ),
      },

      resumo: {
        cliques: totalCliques || 0,
        cadastros,
        assinaturas,

        valorGerado: Number(
          valorGerado.toFixed(2)
        ),

        comissaoAcumulada: Number(
          comissaoAcumulada.toFixed(2)
        ),
      },

      indicacoes: resultados,
    });
  } catch (error) {
    console.error(
      "Erro geral na área do parceiro:",
      error
    );

    return NextResponse.json(
      { erro: "Erro interno ao carregar a parceria." },
      { status: 500 }
    );
  }
}