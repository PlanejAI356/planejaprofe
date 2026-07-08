"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Sucesso() {
  const searchParams = useSearchParams();
  const [mensagem, setMensagem] = useState("Confirmando pagamento...");

  useEffect(() => {
    async function confirmarPagamento() {
      const paymentId =
        searchParams.get("payment_id") ||
        searchParams.get("collection_id");

      if (!paymentId) {
        setMensagem("Pagamento aprovado, mas não recebemos o código de confirmação.");
        return;
      }

      const resposta = await fetch("/api/pagamento/confirmar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  }, [searchParams]);

  return (
    <main style={{ padding: 40 }}>
      <h1>✅ Pagamento aprovado!</h1>
      <p>{mensagem}</p>
    </main>
  );
}