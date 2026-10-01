import { NextResponse } from "next/server";
import {
  MercadoPagoConfig,
  Preference,
} from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

const VALOR_BIBLIOTECA = 9.99;

export async function GET() {
  return NextResponse.json({
    mensagem:
      "Rota de pagamento da Biblioteca funcionando!",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
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

    const preference =
      new Preference(client);

    const resposta =
      await preference.create({
        body: {
          items: [
            {
              id: "biblioteca-30-dias",
              title:
                "PlanejAI - Biblioteca 30 dias",
              quantity: 1,
              unit_price:
                VALOR_BIBLIOTECA,
              currency_id: "BRL",
            },
          ],

          payer: {
            email,
          },

          external_reference: email,

          notification_url:
            "https://planejaioficial.com.br/api/webhook/mercadopago-biblioteca",

          back_urls: {
            success:
              `${process.env.NEXT_PUBLIC_SITE_URL}/biblioteca?campanha=dia-das-criancas&pagamento=sucesso`,
            failure:
              `${process.env.NEXT_PUBLIC_SITE_URL}/assinatura?pagamento=biblioteca-erro`,
            pending:
              `${process.env.NEXT_PUBLIC_SITE_URL}/assinatura?pagamento=biblioteca-pendente`,
          },

          auto_return: "approved",
        },
      });

    if (!resposta.init_point) {
      return NextResponse.json(
        {
          erro:
            "O Mercado Pago não retornou o link de pagamento.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      init_point:
        resposta.init_point,
    });
  } catch (error: any) {
    console.error(
      "ERRO PAGAMENTO BIBLIOTECA:",
      error
    );

    return NextResponse.json(
      {
        erro:
          error?.message ||
          "Erro ao criar pagamento da Biblioteca.",
      },
      {
        status: 500,
      }
    );
  }
}