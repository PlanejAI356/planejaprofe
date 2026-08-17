import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

const VALOR_ASSINATURA = 29.9;

export async function GET() {
  return NextResponse.json({
    mensagem: "Rota de pagamento funcionando!",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const cupom =
      typeof body?.cupom === "string"
        ? body.cupom.trim().toUpperCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          erro: "Email não informado.",
        },
        {
          status: 400,
        }
      );
    }

    let parceiro:
      | {
          id: string;
          nome: string;
          cupom: string;
          comissao_percentual: number;
        }
      | null = null;

    /*
     * Se o usuário informou um cupom,
     * verificamos se ele realmente existe
     * e se está ativo.
     */
    if (cupom) {
      const { data, error } = await supabaseAdmin
        .from("parceiros")
        .select(
          "id, nome, cupom, comissao_percentual"
        )
        .eq("cupom", cupom)
        .eq("ativo", true)
        .maybeSingle();

      if (error) {
        console.error(
          "Erro ao validar cupom:",
          error
        );

        return NextResponse.json(
          {
            erro: "Não foi possível validar o cupom.",
          },
          {
            status: 500,
          }
        );
      }

      if (!data) {
        return NextResponse.json(
          {
            erro: "Cupom inválido ou inativo.",
          },
          {
            status: 400,
          }
        );
      }

      parceiro = {
        id: data.id,
        nome: data.nome,
        cupom: data.cupom,
        comissao_percentual: Number(
          data.comissao_percentual
        ),
      };
    }

    /*
     * Criamos a preferência normalmente.
     * O e-mail continua sendo o
     * external_reference para não quebrar
     * o webhook que já funciona.
     */
    const preference = new Preference(client);

    const resposta = await preference.create({
      body: {
        items: [
          {
            id: "plano-premium",
            title: "PlanejAI - Plano Premium",
            quantity: 1,
            unit_price: VALOR_ASSINATURA,
            currency_id: "BRL",
          },
        ],

        payer: {
          email,
        },

        external_reference: email,

        notification_url: "https://planejaioficial.com.br/api/webhook/mercadopago",

       back_urls: {
  success: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/sucesso`,
  failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/erro`,
  pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/pendente`,
},

auto_return: "approved",
      },
    });

    if (!resposta.init_point) {
      return NextResponse.json(
        {
          erro: "O Mercado Pago não retornou o link de pagamento.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Antes de registrar uma nova indicação,
     * removemos alguma indicação pendente
     * anterior desse mesmo usuário.
     *
     * Isso evita que uma tentativa antiga
     * seja atribuída ao parceiro errado.
     */
    const { error: erroRemoverPendentes } =
      await supabaseAdmin
        .from("indicacoes")
        .delete()
        .eq("email_cliente", email)
        .eq("status", "pendente");

    if (erroRemoverPendentes) {
      console.error(
        "Erro ao limpar indicações pendentes:",
        erroRemoverPendentes
      );

      return NextResponse.json(
        {
          erro: "Não foi possível preparar a indicação.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Se existe parceiro, registramos
     * a indicação como pendente.
     *
     * Ela só será confirmada quando
     * o webhook receber pagamento aprovado.
     */
    if (parceiro) {
      const valorComissao = Number(
        (
          (VALOR_ASSINATURA *
            parceiro.comissao_percentual) /
          100
        ).toFixed(2)
      );

      const { error: erroIndicacao } =
        await supabaseAdmin
          .from("indicacoes")
          .insert({
            parceiro_id: parceiro.id,
            email_cliente: email,
            cupom: parceiro.cupom,
            valor_assinatura: VALOR_ASSINATURA,
            valor_comissao: valorComissao,
            status: "pendente",
          });

      if (erroIndicacao) {
        console.error(
          "Erro ao registrar indicação:",
          erroIndicacao
        );

        return NextResponse.json(
          {
            erro: "Não foi possível registrar o cupom.",
          },
          {
            status: 500,
          }
        );
      }

      console.log(
        `Indicação registrada: ${email} → ${parceiro.nome} (${parceiro.cupom})`
      );
    }

    return NextResponse.json({
      init_point: resposta.init_point,
    });
  } catch (error: any) {
    console.error("ERRO PAGAMENTO:", error);

    return NextResponse.json(
      {
        erro:
          error?.message ||
          "Erro ao criar pagamento.",
      },
      {
        status: 500,
      }
    );
  }
}