import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type CorpoCliqueParceiro = {
  cupom?: string;
  visitanteId?: string;
};

export async function POST(req: Request) {
  try {
    const body =
      (await req.json()) as CorpoCliqueParceiro;

    const cupom =
      body.cupom?.trim().toUpperCase() || "";

    const visitanteId =
      body.visitanteId?.trim() || "";

    if (!cupom || !visitanteId) {
      return NextResponse.json(
        {
          erro:
            "Cupom e identificador do visitante são obrigatórios.",
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
      error: erroClique,
    } = await supabaseAdmin
      .from("cliques_parceiros")
      .upsert(
        {
          parceiro_id: parceiro.id,
          cupom: parceiro.cupom,
          visitante_id: visitanteId,
        },
        {
          onConflict:
            "parceiro_id,visitante_id",
          ignoreDuplicates: true,
        }
      );

    if (erroClique) {
      console.error(
        "Erro ao registrar clique do parceiro:",
        erroClique
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível registrar o acesso.",
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
      },
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao registrar clique de parceiro:",
      error
    );

    return NextResponse.json(
      {
        erro:
          "Erro inesperado ao registrar o acesso.",
      },
      {
        status: 500,
      }
    );
  }
}