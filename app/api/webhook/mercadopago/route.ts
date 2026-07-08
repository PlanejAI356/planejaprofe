import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Webhook recebido:", body);

    const paymentId = body?.data?.id;

    if (!paymentId || paymentId === "123456") {
      console.log("Webhook ignorado. ID inválido ou simulação:", paymentId);
      return NextResponse.json({ recebido: true });
    }

    const payment = new Payment(client);
    const pagamento = await payment.get({ id: paymentId });

    console.log("Pagamento consultado:", pagamento);

    if (pagamento.status !== "approved") {
      console.log("Pagamento ainda não aprovado:", pagamento.status);
      return NextResponse.json({ recebido: true });
    }

    const email = pagamento.external_reference || pagamento.payer?.email;

    console.log("Email para liberar Premium:", email);

    if (!email) {
      console.log("Nenhum email encontrado no pagamento.");
      return NextResponse.json({ recebido: true });
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

    console.log("Resultado Supabase:", { data, error });

    if (error) {
      console.error("Erro ao atualizar Supabase:", error);
    }

    return NextResponse.json({ recebido: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ recebido: true });
  }
}