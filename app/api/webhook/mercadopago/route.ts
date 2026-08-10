import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("=== WEBHOOK MERCADO PAGO RECEBIDO ===");
    console.log("Body:", body);

    const paymentId = body?.data?.id;

    if (!paymentId || String(paymentId) === "123456") {
      console.log("Webhook ignorado. ID inválido:", paymentId);

      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * 1. CONSULTA O PAGAMENTO NO MERCADO PAGO
     */
    const payment = new Payment(client);

    const pagamento = await payment.get({
      id: paymentId,
    });

    console.log("Pagamento:", {
      id: pagamento.id,
      status: pagamento.status,
      external_reference: pagamento.external_reference,
      payer_email: pagamento.payer?.email,
    });

    /*
     * Só continua se o pagamento estiver aprovado.
     */
    if (pagamento.status !== "approved") {
      console.log(
        "Pagamento ainda não aprovado:",
        pagamento.status
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * 2. DESCOBRE O EMAIL DO CLIENTE
     */
    const emailBruto =
      pagamento.external_reference ||
      pagamento.payer?.email;

    if (!emailBruto) {
      console.error(
        "ERRO: pagamento aprovado, mas nenhum email foi encontrado."
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    const email = String(emailBruto)
      .trim()
      .toLowerCase();

    console.log("Email do cliente:", email);

    /*
     * 3. CONFIRMA SE O PERFIL EXISTE
     */
    const {
      data: perfil,
      error: erroBuscarPerfil,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, email, plano, planos_restantes, mercado_pago_id")
      .eq("email", email)
      .maybeSingle();

    if (erroBuscarPerfil) {
      console.error(
        "ERRO ao procurar perfil:",
        erroBuscarPerfil
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    if (!perfil) {
      console.error(
        "ERRO CRÍTICO: pagamento aprovado, mas nenhum perfil foi encontrado para:",
        email
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    console.log("Perfil encontrado:", perfil.email);

    /*
     * 4. LIBERA O PREMIUM
     */
    const {
      data: perfilAtualizado,
      error: erroAtualizarPerfil,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        plano: "premium",
        planos_restantes: 999999,
        mercado_pago_id: String(paymentId),
      })
      .eq("id", perfil.id)
      .select(
        "id, email, plano, planos_restantes, mercado_pago_id"
      )
      .single();

    if (erroAtualizarPerfil) {
      console.error(
        "ERRO CRÍTICO ao liberar Premium:",
        erroAtualizarPerfil
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    if (
      !perfilAtualizado ||
      perfilAtualizado.plano !== "premium"
    ) {
      console.error(
        "ERRO CRÍTICO: atualização executada, mas Premium não foi confirmado."
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    console.log("=== PREMIUM LIBERADO COM SUCESSO ===");
    console.log({
      email: perfilAtualizado.email,
      plano: perfilAtualizado.plano,
      planos_restantes:
        perfilAtualizado.planos_restantes,
      mercado_pago_id:
        perfilAtualizado.mercado_pago_id,
    });

    /*
     * 5. PROCURA INDICAÇÃO PENDENTE
     */
    const {
      data: indicacoesPendentes,
      error: erroBuscarIndicacao,
    } = await supabaseAdmin
      .from("indicacoes")
      .select(
        "id, parceiro_id, cupom, valor_assinatura, valor_comissao"
      )
      .eq("email_cliente", email)
      .eq("status", "pendente");

    if (erroBuscarIndicacao) {
      console.error(
        "Erro ao buscar indicação:",
        erroBuscarIndicacao
      );

      /*
       * O Premium já foi liberado.
       * Uma falha na comissão não bloqueia o cliente.
       */
      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * Não utilizou cupom.
     */
    if (
      !indicacoesPendentes ||
      indicacoesPendentes.length === 0
    ) {
      console.log(
        "Pagamento aprovado sem indicação de parceiro."
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * 6. CONFIRMA A INDICAÇÃO
     */
    const idsIndicacoes = indicacoesPendentes.map(
      (indicacao) => indicacao.id
    );

    const {
      data: indicacoesConfirmadas,
      error: erroConfirmarIndicacao,
    } = await supabaseAdmin
      .from("indicacoes")
      .update({
        status: "confirmada",
        mercado_pago_id: String(paymentId),
      })
      .in("id", idsIndicacoes)
      .select();

    if (erroConfirmarIndicacao) {
      console.error(
        "Erro ao confirmar indicação:",
        erroConfirmarIndicacao
      );

      /*
       * Novamente: não retiramos o Premium
       * por causa de erro na comissão.
       */
      return NextResponse.json({
        recebido: true,
      });
    }

    console.log(
      "Indicação confirmada:",
      indicacoesConfirmadas
    );

    return NextResponse.json({
      recebido: true,
    });
  } catch (error) {
    console.error(
      "ERRO GERAL NO WEBHOOK:",
      error
    );

    return NextResponse.json({
      recebido: true,
    });
  }
}