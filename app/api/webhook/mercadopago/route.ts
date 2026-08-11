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
      transaction_amount: pagamento.transaction_amount,
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
      .select(
        "id, email, plano, planos_restantes, mercado_pago_id"
      )
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
     * 5. PROCURA SE O PAGAMENTO JÁ FOI
     * REGISTRADO EM ALGUMA INDICAÇÃO
     *
     * Isso evita comissão duplicada caso
     * o Mercado Pago envie o webhook novamente.
     */
    const {
      data: pagamentoJaRegistrado,
      error: erroPagamentoRegistrado,
    } = await supabaseAdmin
      .from("indicacoes")
      .select("id, mercado_pago_id, status")
      .eq(
        "mercado_pago_id",
        String(paymentId)
      )
      .maybeSingle();

    if (erroPagamentoRegistrado) {
      console.error(
        "Erro ao verificar pagamento já registrado:",
        erroPagamentoRegistrado
      );
    }

    if (pagamentoJaRegistrado) {
      console.log(
        "Pagamento já registrado em uma indicação. Comissão não será duplicada."
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * 6. PROCURA INDICAÇÃO DO CLIENTE
     *
     * Aceitamos tanto "cadastrado"
     * quanto "pendente" para não perder
     * registros antigos.
     */
    const {
      data: indicacoes,
      error: erroBuscarIndicacao,
    } = await supabaseAdmin
      .from("indicacoes")
      .select(
        "id, parceiro_id, cupom, email_cliente, status"
      )
      .eq("email_cliente", email)
      .in("status", [
        "cadastrado",
        "pendente",
      ])
      .limit(1);

    if (erroBuscarIndicacao) {
      console.error(
        "Erro ao buscar indicação:",
        erroBuscarIndicacao
      );

      /*
       * O Premium já foi liberado.
       * Erro na comissão não bloqueia
       * o acesso do cliente.
       */
      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * Cliente não veio de parceiro.
     */
    if (
      !indicacoes ||
      indicacoes.length === 0
    ) {
      console.log(
        "Pagamento aprovado sem indicação de parceiro."
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    const indicacao = indicacoes[0];

    console.log(
      "Indicação encontrada:",
      indicacao
    );

    /*
     * 7. CALCULA A COMISSÃO
     *
     * Comissão = 30% do valor efetivamente pago.
     */
    const valorAssinatura = Number(
      pagamento.transaction_amount || 0
    );

    if (valorAssinatura <= 0) {
      console.error(
        "Não foi possível identificar o valor da assinatura."
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    const percentualComissao = 0.3;

    const valorComissao = Number(
      (
        valorAssinatura *
        percentualComissao
      ).toFixed(2)
    );

    console.log("Valores da indicação:", {
      valorAssinatura,
      percentualComissao,
      valorComissao,
    });

    /*
     * 8. TRANSFORMA O CADASTRO EM PAGAMENTO
     */
    const {
      data: indicacaoAtualizada,
      error: erroAtualizarIndicacao,
    } = await supabaseAdmin
      .from("indicacoes")
      .update({
        status: "pago",
        valor_assinatura: valorAssinatura,
        valor_comissao: valorComissao,
        mercado_pago_id: String(paymentId),
      })
      .eq("id", indicacao.id)
      .select(
        "id, parceiro_id, cupom, email_cliente, status, valor_assinatura, valor_comissao, mercado_pago_id"
      )
      .single();

    if (erroAtualizarIndicacao) {
      console.error(
        "ERRO ao registrar comissão:",
        erroAtualizarIndicacao
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    console.log(
      "=== INDICAÇÃO PAGA COM SUCESSO ==="
    );

    console.log({
      parceiro_id:
        indicacaoAtualizada.parceiro_id,
      cupom:
        indicacaoAtualizada.cupom,
      cliente:
        indicacaoAtualizada.email_cliente,
      status:
        indicacaoAtualizada.status,
      valor_assinatura:
        indicacaoAtualizada.valor_assinatura,
      valor_comissao:
        indicacaoAtualizada.valor_comissao,
      mercado_pago_id:
        indicacaoAtualizada.mercado_pago_id,
    });

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