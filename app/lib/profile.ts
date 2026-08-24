import { supabase } from "./supabase";

type ResultadoPermissao = {
  permitido: boolean;
  mensagem: string;
  usaTestePromocional?: boolean;
  testesRestantes?: number;
};

type ResultadoConsumoTeste = {
  consumido: boolean;
  mensagem: string;
  testesRestantes?: number;
};

function promocaoEstaAtiva(perfil: any) {
  const agora = new Date();

  const inicio = perfil?.testes_promocionais_inicio_em
    ? new Date(perfil.testes_promocionais_inicio_em)
    : null;

  const fim = perfil?.testes_promocionais_expiram_em
    ? new Date(perfil.testes_promocionais_expiram_em)
    : null;

  if (!inicio || !fim) {
    return false;
  }

  if (
    Number.isNaN(inicio.getTime()) ||
    Number.isNaN(fim.getTime())
  ) {
    return false;
  }

  return agora >= inicio && agora <= fim;
}

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

export async function usarPlanejamentoGratis(): Promise<ResultadoPermissao> {
  const perfil = await buscarPerfil();

  if (!perfil) {
    return {
      permitido: false,
      mensagem:
        "Não foi possível verificar sua conta neste momento. Tente novamente em alguns segundos.",
    };
  }

  /*
   * Usuário Premium continua com acesso normal
   * e não consome teste promocional.
   */
  if (perfil.plano === "premium") {
    return {
      permitido: true,
      mensagem: "Plano Premium ativo.",
      usaTestePromocional: false,
    };
  }

  const testesRestantes = Math.max(
    0,
    Number(
      perfil.testes_promocionais_restantes ?? 0
    )
  );

  /*
   * Usuário gratuito com promoção ativa:
   * pode gerar enquanto houver saldo.
   */
  if (
    promocaoEstaAtiva(perfil) &&
    testesRestantes > 0
  ) {
    return {
      permitido: true,
      mensagem:
        `Você tem ${testesRestantes} teste(s) promocional(is) disponível(is).`,
      usaTestePromocional: true,
      testesRestantes,
    };
  }

  /*
   * Fora do período, sem promoção configurada
   * ou sem testes restantes, volta ao bloqueio
   * normal do Plano Premium.
   */
  return {
    permitido: false,
    mensagem:
      "Para continuar criando no PlanejAI, assine o Plano Premium.",
    usaTestePromocional: false,
    testesRestantes: 0,
  };
}

export async function consumirTestePromocional(): Promise<ResultadoConsumoTeste> {
  try {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
      return {
        consumido: false,
        mensagem:
          "Não foi possível identificar sua conta para descontar o teste promocional.",
      };
    }

    /*
     * Faz até 3 tentativas para evitar descontar
     * um valor desatualizado caso duas ações ocorram
     * quase ao mesmo tempo.
     */
    for (let tentativa = 0; tentativa < 3; tentativa += 1) {
      const {
        data: perfil,
        error: erroPerfil,
      } = await supabase
        .from("profiles")
        .select(
          "id, plano, testes_promocionais_restantes, testes_promocionais_inicio_em, testes_promocionais_expiram_em"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (erroPerfil || !perfil) {
        console.error(
          "Erro ao buscar perfil para consumir teste promocional:",
          erroPerfil
        );

        return {
          consumido: false,
          mensagem:
            "Não foi possível verificar seus testes promocionais.",
        };
      }

      /*
       * Premium nunca consome teste promocional.
       */
      if (perfil.plano === "premium") {
        return {
          consumido: false,
          mensagem: "Usuário Premium: nenhum teste promocional foi consumido.",
        };
      }

      const testesAtuais = Math.max(
        0,
        Number(
          perfil.testes_promocionais_restantes ?? 0
        )
      );

      if (
        !promocaoEstaAtiva(perfil) ||
        testesAtuais <= 0
      ) {
        return {
          consumido: false,
          mensagem:
            "Não há teste promocional ativo para descontar.",
          testesRestantes: testesAtuais,
        };
      }

      const novoSaldo = testesAtuais - 1;

      const {
        data: perfilAtualizado,
        error: erroAtualizacao,
      } = await supabase
        .from("profiles")
        .update({
          testes_promocionais_restantes:
            novoSaldo,
        })
        .eq("id", user.id)
        .eq(
          "testes_promocionais_restantes",
          testesAtuais
        )
        .select(
          "id, testes_promocionais_restantes"
        )
        .maybeSingle();

      if (erroAtualizacao) {
        console.error(
          "Erro ao consumir teste promocional:",
          erroAtualizacao
        );

        return {
          consumido: false,
          mensagem:
            "Não foi possível descontar o teste promocional.",
        };
      }

      /*
       * Se nenhuma linha foi atualizada, o saldo pode
       * ter mudado entre a leitura e a atualização.
       * Nesse caso, tenta novamente.
       */
      if (!perfilAtualizado) {
        continue;
      }

      return {
        consumido: true,
        mensagem:
          "Teste promocional utilizado com sucesso.",
        testesRestantes:
          Number(
            perfilAtualizado.testes_promocionais_restantes ??
              novoSaldo
          ),
      };
    }

    return {
      consumido: false,
      mensagem:
        "Não foi possível atualizar o saldo dos testes promocionais. Tente novamente.",
    };
  } catch (error) {
    console.error(
      "Erro inesperado ao consumir teste promocional:",
      error
    );

    return {
      consumido: false,
      mensagem:
        "Ocorreu um erro ao descontar o teste promocional.",
    };
  }
}