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

const VALOR_BIBLIOTECA = 9.99;

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

function respostaErro(mensagem: string) {
  console.error(
    "ERRO WEBHOOK BIBLIOTECA:",
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
      "=== WEBHOOK BIBLIOTECA RECEBIDO ==="
    );

    const paymentId = body?.data?.id;

    if (
      !paymentId ||
      String(paymentId) === "123456"
    ) {
      return respostaSucesso();
    }

    /*
     * Consulta o pagamento diretamente
     * no Mercado Pago.
     */
    const payment = new Payment(client);

    let pagamento;

    try {
      pagamento = await payment.get({
        id: paymentId,
      });
    } catch (error) {
      console.error(
        "Erro ao consultar pagamento da Biblioteca:",
        error
      );

      return respostaErro(
        "Não foi possível consultar o pagamento."
      );
    }

    /*
     * Somente pagamentos aprovados.
     */
    if (
      pagamento.status !== "approved"
    ) {
      console.log(
        "Pagamento da Biblioteca ainda não aprovado:",
        pagamento.status
      );

      return respostaSucesso();
    }

    /*
     * Confere se o valor é realmente
     * o da Biblioteca.
     */
    const valorPago = Number(
      pagamento.transaction_amount || 0
    );

    if (
      Math.abs(
        valorPago - VALOR_BIBLIOTECA
      ) > 0.01
    ) {
      console.error(
        "Valor diferente do acesso à Biblioteca:",
        valorPago
      );

      return respostaSucesso();
    }

    /*
     * Descobre o e-mail do comprador.
     */
    const emailBruto =
      pagamento.external_reference ||
      pagamento.payer?.email;

    if (!emailBruto) {
      return respostaErro(
        `Pagamento ${paymentId} aprovado, mas nenhum e-mail foi encontrado.`
      );
    }

    const email = String(emailBruto)
      .trim()
      .toLowerCase();

    /*
     * Procura o perfil.
     */
    const {
      data: perfil,
      error: erroBuscarPerfil,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, biblioteca_ate, mercado_pago_biblioteca_id"
      )
      .eq("email", email)
      .maybeSingle();

    if (erroBuscarPerfil) {
      console.error(
        "Erro ao procurar perfil:",
        erroBuscarPerfil
      );

      return respostaErro(
        `Não foi possível localizar o perfil de ${email}.`
      );
    }

    if (!perfil) {
      return respostaErro(
        `Nenhum perfil encontrado para ${email}.`
      );
    }

    /*
     * Impede que o mesmo pagamento
     * seja aplicado duas vezes.
     */
    if (
      perfil.mercado_pago_biblioteca_id &&
      String(
        perfil.mercado_pago_biblioteca_id
      ) === String(paymentId)
    ) {
      console.log(
        "Pagamento da Biblioteca já processado."
      );

      return respostaSucesso();
    }

    /*
     * Se a pessoa ainda possui acesso
     * válido, acrescentamos mais 30 dias
     * ao vencimento atual.
     *
     * Caso contrário, contamos 30 dias
     * a partir de agora.
     */
    const agora = new Date();

    let dataBase = agora;

    if (perfil.biblioteca_ate) {
      const vencimentoAtual = new Date(
        perfil.biblioteca_ate
      );

      if (
        !Number.isNaN(
          vencimentoAtual.getTime()
        ) &&
        vencimentoAtual > agora
      ) {
        dataBase = vencimentoAtual;
      }
    }

    const novoVencimento = new Date(
      dataBase.getTime() +
        30 * 24 * 60 * 60 * 1000
    );

    /*
     * Libera somente a Biblioteca.
     * Nenhum campo Premium é alterado.
     */
    const {
      data: perfilAtualizado,
      error: erroAtualizar,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        biblioteca_ate:
          novoVencimento.toISOString(),

        mercado_pago_biblioteca_id:
          String(paymentId),
      })
      .eq("id", perfil.id)
      .select(
        "id, email, biblioteca_ate, mercado_pago_biblioteca_id"
      )
      .single();

    if (erroAtualizar) {
      console.error(
        "Erro ao liberar Biblioteca:",
        erroAtualizar
      );

      return respostaErro(
        `Pagamento aprovado, mas não foi possível liberar a Biblioteca para ${email}.`
      );
    }

    console.log(
      "=== BIBLIOTECA LIBERADA COM SUCESSO ==="
    );

    console.log({
      email:
        perfilAtualizado.email,
      biblioteca_ate:
        perfilAtualizado.biblioteca_ate,
      pagamento:
        perfilAtualizado.mercado_pago_biblioteca_id,
    });

    return respostaSucesso();
  } catch (error) {
    console.error(
      "ERRO GERAL WEBHOOK BIBLIOTECA:",
      error
    );

    return respostaErro(
      "Erro inesperado ao processar o pagamento da Biblioteca."
    );
  }
}