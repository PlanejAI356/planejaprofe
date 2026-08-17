import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

async function validarAdmin(req: NextRequest) {
  const authorization = req.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      autorizado: false,
      resposta: NextResponse.json(
        { erro: "Usuário não autenticado." },
        { status: 401 }
      ),
    };
  }

  const token = authorization.replace("Bearer ", "");

  const {
    data: usuarioAuth,
    error: erroUsuario,
  } = await supabaseAdmin.auth.getUser(token);

  if (erroUsuario || !usuarioAuth.user) {
    return {
      autorizado: false,
      resposta: NextResponse.json(
        { erro: "Sessão inválida." },
        { status: 401 }
      ),
    };
  }

  const emailUsuario =
    usuarioAuth.user.email?.trim().toLowerCase();

  const emailAdmin =
    process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    !emailAdmin ||
    !emailUsuario ||
    emailUsuario !== emailAdmin
  ) {
    return {
      autorizado: false,
      resposta: NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 403 }
      ),
    };
  }

  return {
    autorizado: true,
    resposta: null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const validacao = await validarAdmin(req);

    if (!validacao.autorizado) {
      return validacao.resposta!;
    }

    const body = await req.json();

    const usuarioId =
      typeof body?.usuarioId === "string"
        ? body.usuarioId.trim()
        : "";

    const plano =
      body?.plano === "premium"
        ? "premium"
        : body?.plano === "gratuito"
          ? "gratuito"
          : "";

    if (!usuarioId || !plano) {
      return NextResponse.json(
        { erro: "Dados inválidos." },
        { status: 400 }
      );
    }

    const atualizacao =
      plano === "premium"
        ? {
            plano: "premium",
            planos_restantes: 999999,
          }
        : {
            plano: "gratuito",
            planos_restantes: 0,
          };

    const {
      data: perfilAtualizado,
      error: erroAtualizar,
    } = await supabaseAdmin
      .from("profiles")
      .update(atualizacao)
      .eq("id", usuarioId)
      .select(
        "id, nome, email, plano, planos_restantes, mercado_pago_id"
      )
      .single();

    if (erroAtualizar) {
      console.error(
        "Erro ao alterar plano do usuário:",
        erroAtualizar
      );

      return NextResponse.json(
        {
          erro: "Não foi possível alterar o plano do usuário.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      usuario: perfilAtualizado,
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao alterar plano:",
      error
    );

    return NextResponse.json(
      { erro: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}