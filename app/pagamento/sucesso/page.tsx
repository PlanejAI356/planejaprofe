import { Suspense } from "react";
import SucessoCliente from "./SucessoCliente";

export default function Sucesso() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 40 }}>
          Confirmando pagamento...
        </main>
      }
    >
      <SucessoCliente />
    </Suspense>
  );
}