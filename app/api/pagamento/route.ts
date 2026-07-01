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
  const { email } = await req.json();
  try {
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
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/erro`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pagamento/pendente`,
        },
      },
    });

    return NextResponse.json({
      init_point: resposta.init_point,
      sandbox_init_point: resposta.sandbox_init_point,
    });
  } catch (error: any) {
    console.log("ERRO COMPLETO:");
    console.dir(error, { depth: null });

    return NextResponse.json(
      {
        erro: error.message,
      },
      { status: 500 }
    );
  }
}