import { supabase } from "./supabase";

export async function buscarPerfil() {
  try {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario) {
      console.error(
        "Erro ao identificar usuário autenticado:",
        erroUsuario
      );
      return null;
    }

    if (!user) {
      return null;
    }

    const {
      data: perfil,
      error: erroPerfil,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (erroPerfil) {
      console.error(
        "Erro ao buscar perfil no Supabase:",
        erroPerfil
      );
      return null;
    }

    if (perfil) {
      return perfil;
    }

    /*
     * Se o usuário está autenticado, mas o registro em profiles
     * não existe, tenta sincronizar o perfil pelo servidor.
     *
     * A rota /api/perfil/sincronizar:
     * - valida o usuário pelo token;
     * - preserva perfis existentes;
     * - não altera Premium;
     * - cria apenas perfis realmente ausentes.
     */
    const {
      data: { session },
      error: erroSessao,
    } = await supabase.auth.getSession();

    if (
      erroSessao ||
      !session?.access_token
    ) {
      console.error(
        "Usuário autenticado sem sessão válida para sincronizar o perfil:",
        erroSessao
      );
      return null;
    }

    const respostaSincronizacao = await fetch(
      "/api/perfil/sincronizar",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const resultadoSincronizacao =
      await respostaSincronizacao
        .json()
        .catch(() => null);

    if (!respostaSincronizacao.ok) {
      console.error(
        "Não foi possível sincronizar o perfil:",
        resultadoSincronizacao
      );
      return null;
    }

    /*
     * Busca novamente depois da sincronização.
     */
    const {
      data: perfilSincronizado,
      error: erroPerfilSincronizado,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (erroPerfilSincronizado) {
      console.error(
        "Erro ao buscar perfil após sincronização:",
        erroPerfilSincronizado
      );
      return null;
    }

    return perfilSincronizado ?? null;
  } catch (error) {
    console.error(
      "Erro inesperado ao buscar perfil:",
      error
    );
    return null;
  }
}

export async function usarPlanejamentoGratis() {
  const perfil = await buscarPerfil();

  if (!perfil) {
    return {
      permitido: false,
      mensagem:
        "Não foi possível verificar sua conta neste momento. Tente novamente em alguns segundos.",
    };
  }

  /*
   * Usuário Premium tem acesso liberado.
   */
  if (perfil.plano === "premium") {
    return {
      permitido: true,
      mensagem: "Plano Premium ativo.",
    };
  }

  /*
   * Usuário gratuito entra normalmente na conta,
   * mas para criar novos planejamentos recebe
   * o convite para assinar o Premium.
   */
  return {
    permitido: false,
    mensagem:
      "Para criar novos planejamentos, assine o Plano Premium.",
  };
}