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

    /*
     * 1. VALIDA O PARCEIRO
     */
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

    /*
     * 2. REGISTRA TODO ACESSO AO LINK
     *
     * Aqui usamos INSERT porque queremos
     * registrar cada abertura do link,
     * mesmo que seja o mesmo visitante.
     */
    const {
      error: erroAcesso,
    } = await supabaseAdmin
      .from("acessos_parceiros")
      .insert({
        parceiro_id: parceiro.id,
        cupom: parceiro.cupom,
        visitante_id: visitanteId,
      });

    if (erroAcesso) {
      console.error(
        "Erro ao registrar acesso do parceiro:",
        erroAcesso
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

    /*
     * 3. REGISTRA O VISITANTE ÚNICO
     *
     * Essa tabela continua usando UPSERT.
     * Assim o mesmo visitante conta apenas
     * uma vez para cada parceiro.
     */
    const {
      error: erroVisitante,
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

    if (erroVisitante) {
      console.error(
        "Erro ao registrar visitante único:",
        erroVisitante
      );

      /*
       * O acesso já foi registrado.
       * Então não precisamos perder
       * completamente o registro.
       */
      return NextResponse.json(
        {
          registrado: true,
          aviso:
            "Acesso registrado, mas não foi possível atualizar o visitante único.",
          parceiro: {
            nome: parceiro.nome,
            cupom: parceiro.cupom,
          },
        },
        {
          status: 200,
        }
      );
    }

    /*
     * 4. RETORNA SUCESSO
     */
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