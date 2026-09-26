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

/*
 * Acrescenta 1 mês mantendo corretamente
 * datas como dia 28, 29, 30 e 31.
 */
function adicionarUmMes(
  dataBase: Date
) {
  const novaData = new Date(dataBase);

  const diaOriginal =
    novaData.getUTCDate();

  novaData.setUTCDate(1);

  novaData.setUTCMonth(
    novaData.getUTCMonth() + 1
  );

  const ultimoDiaDoNovoMes =
    new Date(
      Date.UTC(
        novaData.getUTCFullYear(),
        novaData.getUTCMonth() + 1,
        0
      )
    ).getUTCDate();

  novaData.setUTCDate(
    Math.min(
      diaOriginal,
      ultimoDiaDoNovoMes
    )
  );

  return novaData;
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
     * e a simulação padrão 123456.
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
    const payment =
      new Payment(client);

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
     * Somente pagamento aprovado
     * pode ativar ou renovar Premium.
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
     * 2. DESCOBRE O EMAIL
     */
    const emailBruto =
      pagamento.external_reference ||
      pagamento.payer?.email;

    if (!emailBruto) {
      return respostaErroCritico(
        `Pagamento ${paymentId} foi aprovado, mas nenhum email foi encontrado.`
      );
    }

    const email =
      String(emailBruto)
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
        "id, email, plano, planos_restantes, mercado_pago_id, premium_ate, tipo_premium"
      )
      .eq("email", email)
      .maybeSingle();

    if (erroBuscarPerfil) {
      console.error(
        "Erro ao procurar perfil:",
        erroBuscarPerfil
      );

      return respostaErroCritico(
        `Pagamento ${paymentId} aprovado, mas houve erro ao procurar o perfil de ${email}.`
      );
    }

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
     * 4. VERIFICA SE O PAGAMENTO
     * JÁ FOI APLICADO AO PERFIL
     *
     * Isso evita acrescentar outro mês
     * caso o Mercado Pago envie o mesmo
     * webhook novamente.
     */
    const pagamentoJaAplicadoNoPerfil =
      Boolean(perfil.mercado_pago_id) &&
      String(perfil.mercado_pago_id) ===
        String(paymentId);

    if (pagamentoJaAplicadoNoPerfil) {
      console.log(
        "Pagamento já processado no perfil. Validade não será duplicada."
      );
    }

    /*
     * 5. ATIVA OU RENOVA O PREMIUM
     *
     * Só entra aqui se este pagamento
     * ainda não tiver sido aplicado.
     */
    if (!pagamentoJaAplicadoNoPerfil) {
      const agora = new Date();

      let dataBase = agora;

      /*
       * Se o Premium ainda estiver válido,
       * acrescenta 1 mês ao vencimento atual.
       *
       * Se estiver vencido ou sem vencimento,
       * começa 1 mês a partir de agora.
       */
      if (perfil.premium_ate) {
        const vencimentoAtual =
          new Date(perfil.premium_ate);

        if (
          !Number.isNaN(
            vencimentoAtual.getTime()
          ) &&
          vencimentoAtual > agora
        ) {
          dataBase =
            vencimentoAtual;
        }
      }

      const novoVencimento =
        adicionarUmMes(dataBase);

      /*
       * Parceiro e cortesia continuam
       * com a classificação que já possuem.
       *
       * Usuário comum que realizou pagamento
       * fica marcado como "pagamento".
       */
      const tipoPremium =
        perfil.tipo_premium === "parceiro" ||
        perfil.tipo_premium === "cortesia"
          ? perfil.tipo_premium
          : "pagamento";

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

          premium_ate:
            novoVencimento.toISOString(),

          tipo_premium:
            tipoPremium,
        })
        .eq("id", perfil.id)
        .select(
          "id, email, plano, planos_restantes, mercado_pago_id, premium_ate, tipo_premium"
        )
        .single();

      if (erroAtualizarPerfil) {
        console.error(
          "Erro ao ativar/renovar Premium:",
          erroAtualizarPerfil
        );

        return respostaErroCritico(
          `Pagamento ${paymentId} aprovado, mas não foi possível ativar/renovar o Premium para ${email}.`
        );
      }

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
        "=== PREMIUM ATIVADO/RENOVADO COM SUCESSO ==="
      );

      console.log({
        email:
          perfilAtualizado.email,

        plano:
          perfilAtualizado.plano,

        planos_restantes:
          perfilAtualizado.planos_restantes,

        mercado_pago_id:
          perfilAtualizado.mercado_pago_id,

        premium_ate:
          perfilAtualizado.premium_ate,

        tipo_premium:
          perfilAtualizado.tipo_premium,
      });
    }

    /*
     * A PARTIR DAQUI:
     *
     * O Premium já foi ativado/renovado
     * ou este pagamento já havia sido
     * aplicado anteriormente.
     *
     * Mesmo assim continuamos para verificar
     * a comissão do parceiro.
     */

    /*
     * 6. VERIFICA SE O PAGAMENTO
     * JÁ FOI REGISTRADO EM INDICAÇÕES
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

      return respostaSucesso();
    }

    if (pagamentoJaRegistrado) {
      console.log(
        "Pagamento já registrado em uma indicação. Comissão não será duplicada."
      );

      return respostaSucesso();
    }

    /*
     * 7. PROCURA INDICAÇÃO
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
     * 8. CALCULA A COMISSÃO
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
     * 9. MARCA A INDICAÇÃO
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

    return respostaErroCritico(
      "Erro inesperado ao processar o webhook do Mercado Pago."
    );
  }
}