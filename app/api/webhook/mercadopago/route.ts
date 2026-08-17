import { NextResponse } from "next/server";
import {
  MercadoPagoConfig,
  Payment,
} from "mercadopago";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const client = new MercadoPagoConfig({
  accessToken:
    process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

function respostaSucesso() {
  return NextResponse.json(
    {
      recebido: true,
    },
    {
      status: 200,
    }
  );
}

function respostaErroCritico(
  mensagem: string
) {
  console.error(
    "ERRO CRÍTICO NO WEBHOOK:",
    mensagem
  );

  return NextResponse.json(
    {
      recebido: false,
      erro: mensagem,
    },
    {
      status: 500,
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
      "=== WEBHOOK MERCADO PAGO RECEBIDO ==="
    );
    console.log("Body:", body);

    const paymentId = body?.data?.id;

    /*
     * Ignora notificações sem ID válido
     * e também a simulação padrão 123456.
     */
    if (
      !paymentId ||
      String(paymentId) === "123456"
    ) {
      console.log(
        "Webhook ignorado. ID inválido:",
        paymentId
      );

      return respostaSucesso();
    }

    /*
     * 1. CONSULTA O PAGAMENTO
     * DIRETAMENTE NO MERCADO PAGO
     */
    const payment = new Payment(client);

    let pagamento;

    try {
      pagamento = await payment.get({
        id: paymentId,
      });
    } catch (error) {
      console.error(
        "Erro ao consultar pagamento no Mercado Pago:",
        error
      );

      return respostaErroCritico(
        "Não foi possível consultar o pagamento no Mercado Pago."
      );
    }

    console.log("Pagamento:", {
      id: pagamento.id,
      status: pagamento.status,
      external_reference:
        pagamento.external_reference,
      payer_email:
        pagamento.payer?.email,
      transaction_amount:
        pagamento.transaction_amount,
    });

    /*
     * Se ainda não foi aprovado,
     * não existe Premium para liberar.
     *
     * Neste caso a notificação foi
     * processada corretamente.
     */
    if (
      pagamento.status !== "approved"
    ) {
      console.log(
        "Pagamento ainda não aprovado:",
        pagamento.status
      );

      return respostaSucesso();
    }

    /*
     * 2. DESCOBRE O EMAIL DO CLIENTE
     */
    const emailBruto =
      pagamento.external_reference ||
      pagamento.payer?.email;

    /*
     * PAGAMENTO APROVADO SEM EMAIL:
     *
     * Aqui NÃO respondemos sucesso.
     * O cliente pagou e ainda não
     * conseguimos identificar a conta.
     */
    if (!emailBruto) {
      return respostaErroCritico(
        `Pagamento ${paymentId} foi aprovado, mas nenhum email foi encontrado.`
      );
    }

    const email = String(emailBruto)
      .trim()
      .toLowerCase();

    console.log(
      "Email do cliente:",
      email
    );

    /*
     * 3. PROCURA O PERFIL
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

    /*
     * PAGAMENTO APROVADO,
     * MAS HOUVE ERRO NO SUPABASE.
     *
     * Responde 500 para permitir
     * uma nova tentativa do webhook.
     */
    if (erroBuscarPerfil) {
      console.error(
        "Erro ao procurar perfil:",
        erroBuscarPerfil
      );

      return respostaErroCritico(
        `Pagamento ${paymentId} aprovado, mas houve erro ao procurar o perfil de ${email}.`
      );
    }

    /*
     * PAGAMENTO APROVADO,
     * MAS PERFIL NÃO ENCONTRADO.
     *
     * Também não podemos confirmar
     * o webhook como concluído.
     */
    if (!perfil) {
      return respostaErroCritico(
        `Pagamento ${paymentId} aprovado, mas nenhum perfil foi encontrado para ${email}.`
      );
    }

    console.log(
      "Perfil encontrado:",
      perfil.email
    );

    /*
     * 4. GARANTE O PREMIUM
     *
     * Mesmo que o Mercado Pago envie
     * o webhook novamente, atualizar
     * o perfil para Premium outra vez
     * não causa problema.
     */
    const {
      data: perfilAtualizado,
      error: erroAtualizarPerfil,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        plano: "premium",
        planos_restantes: 999999,
        mercado_pago_id:
          String(paymentId),
      })
      .eq("id", perfil.id)
      .select(
        "id, email, plano, planos_restantes, mercado_pago_id"
      )
      .single();

    /*
     * PAGAMENTO APROVADO,
     * MAS O PREMIUM NÃO FOI LIBERADO.
     *
     * Este é justamente o caso que
     * queremos impedir de ficar perdido.
     */
    if (erroAtualizarPerfil) {
      console.error(
        "Erro ao liberar Premium:",
        erroAtualizarPerfil
      );

      return respostaErroCritico(
        `Pagamento ${paymentId} aprovado, mas não foi possível liberar o Premium para ${email}.`
      );
    }

    /*
     * Confirma que o banco realmente
     * devolveu o perfil como Premium.
     */
    if (
      !perfilAtualizado ||
      perfilAtualizado.plano !==
        "premium"
    ) {
      return respostaErroCritico(
        `Pagamento ${paymentId} aprovado, mas o perfil de ${email} não foi confirmado como Premium.`
      );
    }

    console.log(
      "=== PREMIUM LIBERADO COM SUCESSO ==="
    );

    console.log({
      email: perfilAtualizado.email,
      plano: perfilAtualizado.plano,
      planos_restantes:
        perfilAtualizado.planos_restantes,
      mercado_pago_id:
        perfilAtualizado.mercado_pago_id,
    });

    /*
     * A PARTIR DAQUI O CLIENTE
     * JÁ ESTÁ PREMIUM.
     *
     * Problemas relacionados a parceiro
     * ou comissão NÃO devem tirar o
     * acesso do cliente.
     */

    /*
     * 5. VERIFICA SE ESTE PAGAMENTO
     * JÁ FOI REGISTRADO EM INDICAÇÕES
     *
     * Isso evita comissão duplicada
     * se o webhook for recebido novamente.
     */
    const {
      data: pagamentoJaRegistrado,
      error: erroPagamentoRegistrado,
    } = await supabaseAdmin
      .from("indicacoes")
      .select(
        "id, mercado_pago_id, status"
      )
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

      /*
       * Premium já foi liberado.
       * Não bloqueamos o cliente
       * por problema de comissão.
       */
      return respostaSucesso();
    }

    if (pagamentoJaRegistrado) {
      console.log(
        "Pagamento já registrado em uma indicação. Comissão não será duplicada."
      );

      return respostaSucesso();
    }

    /*
     * 6. PROCURA UMA INDICAÇÃO
     * ASSOCIADA AO CLIENTE
     */
    const {
      data: indicacoes,
      error: erroBuscarIndicacao,
    } = await supabaseAdmin
      .from("indicacoes")
      .select(
        "id, parceiro_id, cupom, email_cliente, status"
      )
      .eq(
        "email_cliente",
        email
      )
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
       * Premium já está ativo.
       * Erro de parceiro não bloqueia
       * o acesso do cliente.
       */
      return respostaSucesso();
    }

    /*
     * CLIENTE SEM PARCEIRO
     */
    if (
      !indicacoes ||
      indicacoes.length === 0
    ) {
      console.log(
        "Pagamento aprovado sem indicação de parceiro."
      );

      return respostaSucesso();
    }

    const indicacao =
      indicacoes[0];

    console.log(
      "Indicação encontrada:",
      indicacao
    );

    /*
     * 7. CALCULA A COMISSÃO
     */
    const valorAssinatura =
      Number(
        pagamento.transaction_amount ||
          0
      );

    if (valorAssinatura <= 0) {
      console.error(
        "Não foi possível identificar o valor da assinatura."
      );

      /*
       * Premium já está liberado.
       */
      return respostaSucesso();
    }

    const percentualComissao =
      0.3;

    const valorComissao =
      Number(
        (
          valorAssinatura *
          percentualComissao
        ).toFixed(2)
      );

    console.log(
      "Valores da indicação:",
      {
        valorAssinatura,
        percentualComissao,
        valorComissao,
      }
    );

    /*
     * 8. MARCA A INDICAÇÃO
     * COMO PAGA
     */
    const {
      data: indicacaoAtualizada,
      error:
        erroAtualizarIndicacao,
    } = await supabaseAdmin
      .from("indicacoes")
      .update({
        status: "pago",
        valor_assinatura:
          valorAssinatura,
        valor_comissao:
          valorComissao,
        mercado_pago_id:
          String(paymentId),
      })
      .eq(
        "id",
        indicacao.id
      )
      .select(
        "id, parceiro_id, cupom, email_cliente, status, valor_assinatura, valor_comissao, mercado_pago_id"
      )
      .single();

    if (erroAtualizarIndicacao) {
      console.error(
        "Erro ao registrar comissão:",
        erroAtualizarIndicacao
      );

      /*
       * Cliente já está Premium.
       * Não tiramos o acesso dele
       * por problema na comissão.
       */
      return respostaSucesso();
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

    return respostaSucesso();
  } catch (error) {
    console.error(
      "ERRO GERAL NO WEBHOOK:",
      error
    );

    /*
     * Como não sabemos se um pagamento
     * aprovado deixou de ser processado,
     * não confirmamos o webhook como
     * recebido com sucesso.
     */
    return respostaErroCritico(
      "Erro inesperado ao processar o webhook do Mercado Pago."
    );
  }
}