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

  if (perfil.plano === "premium") {
    return {
      permitido: true,
      mensagem: "Plano premium ativo.",
    };
  }

  if (perfil.planos_restantes <= 0) {
    return {
      permitido: false,
      mensagem:
        "Você utilizou seus 3 planejamentos gratuitos. Assine o Plano Premium para continuar.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      planos_restantes: perfil.planos_restantes - 1,
    })
    .eq("id", perfil.id);

  if (error) {
    return {
      permitido: false,
      mensagem: "Erro ao atualizar seus planejamentos gratuitos.",
    };
  }

  return {
    permitido: true,
    mensagem: "Planejamento liberado.",
  };
}