import { supabase } from "./supabase";

export async function buscarPerfil() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;

  return data;
}

export async function usarPlanejamentoGratis() {
  const perfil = await buscarPerfil();

  if (!perfil) {
    return {
      permitido: false,
      mensagem: "Perfil não encontrado.",
    };
  }

  // Usuário Premium tem acesso liberado
  if (perfil.plano === "premium") {
    return {
      permitido: true,
      mensagem: "Plano Premium ativo.",
    };
  }

  // Usuário cadastrado no plano grátis não possui
  // novos planejamentos gratuitos.
  return {
    permitido: false,
    mensagem:
      "Para criar novos planejamentos, assine o Plano Premium.",
  };
}