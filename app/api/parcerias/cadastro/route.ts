import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type CorpoCadastroParceiro = {
  cupom?: string;
  emailCliente?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CorpoCadastroParceiro;

    const cupom =
      body.cupom?.trim().toUpperCase() || "";

    const emailCliente =
      body.emailCliente?.trim().toLowerCase() || "";

    if (!cupom || !emailCliente) {
      return NextResponse.json(
        {
          erro:
            "Cupom e e-mail do cliente são obrigatórios.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: parceiro,
      error: erroParceiro,
    } = await supabaseAdmin
      .from("parceiros")
      .select(
        "id, nome, cupom, comissao_percentual, ativo"
      )
      .eq("cupom", cupom)
      .eq("ativo", true)
      .maybeSingle();

    if (erroParceiro) {
      console.error(
        "Erro ao buscar parceiro:",
        erroParceiro
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível validar o parceiro.",
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
            "Código de parceiro inválido ou inativo.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: indicacaoExistente,
      error: erroBuscaIndicacao,
    } = await supabaseAdmin
      .from("indicacoes")
      .select("id, status")
      .eq("parceiro_id", parceiro.id)
      .eq("email_cliente", emailCliente)
      .maybeSingle();

    if (erroBuscaIndicacao) {
      console.error(
        "Erro ao verificar indicação existente:",
        erroBuscaIndicacao
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível verificar a indicação.",
        },
        {
          status: 500,
        }
      );
    }

    if (indicacaoExistente) {
      return NextResponse.json({
        registrado: true,
        jaExistia: true,
      });
    }

    const valorAssinatura = 29.9;

    const percentualComissao =
      Number(parceiro.comissao_percentual || 0);

    const valorComissao = Number(
      (
        valorAssinatura *
        (percentualComissao / 100)
      ).toFixed(2)
    );

    const {
      error: erroIndicacao,
    } = await supabaseAdmin
      .from("indicacoes")
      .insert({
        parceiro_id: parceiro.id,
        email_cliente: emailCliente,
        cupom: parceiro.cupom,
        valor_assinatura: valorAssinatura,
        valor_comissao: valorComissao,
        status: "cadastrado",
      });

    if (erroIndicacao) {
      console.error(
        "Erro ao registrar indicação:",
        erroIndicacao
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível registrar a indicação.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      registrado: true,
      parceiro: {
        nome: parceiro.nome,
        cupom: parceiro.cupom,
        comissaoPercentual:
          parceiro.comissao_percentual,
        valorComissao,
      },
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao registrar cadastro indicado:",
      error
    );

    return NextResponse.json(
      {
        erro:
          "Erro inesperado ao registrar a indicação.",
      },
      {
        status: 500,
      }
    );
  }
}