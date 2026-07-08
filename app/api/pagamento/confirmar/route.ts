import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({
        ok: false,
        erro: "paymentId não informado",
      });
    }

    const payment = new Payment(client);
    const pagamento = await payment.get({ id: paymentId });

    console.log("Pagamento encontrado:", pagamento);

    if (pagamento.status !== "approved") {
      return NextResponse.json({
        ok: false,
        erro: "Pagamento não aprovado",
      });
    }

    const email =
      pagamento.external_reference || pagamento.payer?.email;

    if (!email) {
      return NextResponse.json({
        ok: false,
        erro: "Email não encontrado",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        plano: "premium",
        planos_restantes: 999999,
        mercado_pago_id: String(paymentId),
      })
      .eq("email", email)
      .select();

    if (error) {
      console.error(error);
      return NextResponse.json({
        ok: false,
        erro: error.message,
      });
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      ok: false,
      erro: error.message,
    });
  }
}