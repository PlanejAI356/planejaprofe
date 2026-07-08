"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function SucessoCliente() {
  const [mensagem, setMensagem] = useState("Verificando pagamento...");

  async function verificarPremium() {
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;

    if (!email) {
      setMensagem("Você precisa estar logado para confirmar o pagamento.");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("plano, planos_restantes")
      .eq("email", email)
      .single();

    if (error) {
      setMensagem("Ainda estamos verificando seu pagamento...");
      return;
    }

    if (data?.plano === "premium") {
      setMensagem("Pagamento confirmado! Redirecionando para o PlanejAI...");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

      return;
    }

    setMensagem("Aguardando confirmação do pagamento...");
  }

  useEffect(() => {
    verificarPremium();

    const intervalo = setInterval(() => {
      verificarPremium();
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>✅ Pagamento aprovado!</h1>
      <p>{mensagem}</p>

      <button
        onClick={verificarPremium}
        style={{
          marginTop: 20,
          padding: "12px 20px",
          borderRadius: 10,
          border: "none",
          background: "#16a34a",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Verificar novamente
      </button>
    </main>
  );
}