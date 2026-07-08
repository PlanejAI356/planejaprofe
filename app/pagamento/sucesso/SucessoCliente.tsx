"use client";

import { useEffect, useState } from "react";

export default function SucessoCliente() {
  const [mensagem, setMensagem] = useState("Confirmando pagamento...");

  useEffect(() => {
    async function confirmarPagamento() {
      const params = new URLSearchParams(window.location.search);

      const paymentId =
        params.get("payment_id") ||
        params.get("collection_id");

      if (!paymentId) {
        setMensagem("Pagamento aprovado, mas não recebemos o código de confirmação.");
        return;
      }

      const resposta = await fetch("/api/pagamento/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      const dados = await resposta.json();

      if (dados.ok) {
        setMensagem("Pagamento confirmado! Seu Plano Premium foi liberado.");
      } else {
        setMensagem("Pagamento recebido, mas ainda não conseguimos liberar automaticamente.");
      }
    }

    confirmarPagamento();
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>✅ Pagamento aprovado!</h1>
      <p>{mensagem}</p>
    </main>
  );
}