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

    if (!paymentId || String(paymentId) === "123456") {
      console.log(
        "Webhook ignorado. ID inválido ou simulação:",
        paymentId
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * Consulta o pagamento diretamente
     * no Mercado Pago.
     */
    const payment = new Payment(client);

    const pagamento = await payment.get({
      id: paymentId,
    });

    console.log(
      "Pagamento consultado:",
      pagamento
    );

    /*
     * Só liberamos Premium e comissão
     * quando o pagamento estiver aprovado.
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
     * O e-mail continua vindo primeiro
     * do external_reference.
     */
    const emailBruto =
      pagamento.external_reference ||
      pagamento.payer?.email;

    if (!emailBruto) {
      console.log(
        "Nenhum email encontrado no pagamento."
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    const email = String(emailBruto)
      .trim()
      .toLowerCase();

    console.log(
      "Email para liberar Premium:",
      email
    );

    /*
     * 1. LIBERA O PREMIUM
     */
    const {
      data: perfilAtualizado,
      error: erroPerfil,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        plano: "premium",
        planos_restantes: 999999,
        mercado_pago_id: String(paymentId),
      })
      .eq("email", email)
      .select();

    console.log(
      "Resultado Supabase profiles:",
      {
        data: perfilAtualizado,
        error: erroPerfil,
      }
    );

    if (erroPerfil) {
      console.error(
        "Erro ao atualizar perfil:",
        erroPerfil
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * 2. PROCURA UMA INDICAÇÃO PENDENTE
     *
     * Se a pessoa utilizou um cupom antes
     * de abrir o Mercado Pago, existe uma
     * linha pendente em indicacoes.
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
        "Erro ao buscar indicação pendente:",
        erroBuscarIndicacao
      );

      return NextResponse.json({
        recebido: true,
      });
    }

    /*
     * Se não usou cupom, não há nada
     * para confirmar.
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
     * 3. CONFIRMA A INDICAÇÃO
     *
     * Atualizamos somente as indicações
     * ainda pendentes daquele cliente.
     */
    const idsIndicacoes =
      indicacoesPendentes.map(
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

      return NextResponse.json({
        recebido: true,
      });
    }

    console.log(
      "Indicação confirmada com sucesso:",
      indicacoesConfirmadas
    );

    return NextResponse.json({
      recebido: true,
    });
  } catch (error) {
    console.error(
      "Erro no webhook:",
      error
    );

    /*
     * Mantemos resposta 200 para evitar
     * falhas repetidas do webhook enquanto
     * analisamos qualquer erro pelos logs.
     */
    return NextResponse.json({
      recebido: true,
    });
  }
}