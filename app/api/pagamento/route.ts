import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function GET() {
  return NextResponse.json({
    mensagem: "Rota de pagamento funcionando!",
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { erro: "Email não informado" },
        { status: 400 }
      );
    }

    const preference = new Preference(client);

    const resposta = await preference.create({
      body: {
        items: [
          {
            id: "plano-premium",
            title: "PlanejAI - Plano Premium",
            quantity: 1,
            unit_price: 29.9,
            currency_id: "BRL",
          },
        ],
        payer: {
          email,
        },
        external_reference: email,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/erro`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/pendente`,
        },
      },
    });

    return NextResponse.json({
      init_point: resposta.init_point,
    });
  } catch (error: any) {
    console.error("ERRO PAGAMENTO:", error);

    return NextResponse.json(
      {
        erro: error?.message || "Erro ao criar pagamento",
      },
      { status: 500 }
    );
  }
}