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
      return NextResponse.json({ recebido: true });
    }

    const payment = new Payment(client);
    const pagamento = await payment.get({ id: paymentId });

    console.log("Pagamento consultado:", pagamento);

    if (pagamento.status === "approved") {
      const email = pagamento.external_reference;

      if (email) {
        const { data, error } = await supabaseAdmin
          .from("profiles")
          .update({
            plano: "premium",
            planos_restantes: 999999,
          })
          .eq("email", email)
          .select();

        console.log("Resultado Supabase:", { data, error });

        if (error) {
          console.error("Erro ao atualizar Supabase:", error);
        }
      }
    }

    return NextResponse.json({ recebido: true });
  } catch (error) {
    console.error("Erro no webhook:", error);

    return NextResponse.json({ recebido: true });
  }
}