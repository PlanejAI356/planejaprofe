import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

async function validarAdmin(req: NextRequest) {
  const authorization =
    req.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      ok: false,
      resposta: NextResponse.json(
        { erro: "Usuário não autenticado." },
        { status: 401 }
      ),
    };
  }

  const token = authorization.replace(
    "Bearer ",
    ""
  );

  const {
    data: usuarioAuth,
    error: erroUsuario,
  } = await supabaseAdmin.auth.getUser(token);

  if (erroUsuario || !usuarioAuth.user) {
    return {
      ok: false,
      resposta: NextResponse.json(
        { erro: "Sessão inválida." },
        { status: 401 }
      ),
    };
  }

  const emailUsuario =
    usuarioAuth.user.email
      ?.trim()
      .toLowerCase();

  const emailAdmin =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  if (!emailAdmin) {
    console.error(
      "ADMIN_EMAIL não configurado."
    );

    return {
      ok: false,
      resposta: NextResponse.json(
        {
          erro:
            "Painel administrativo não configurado.",
        },
        { status: 500 }
      ),
    };
  }

  if (
    !emailUsuario ||
    emailUsuario !== emailAdmin
  ) {
    return {
      ok: false,
      resposta: NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 403 }
      ),
    };
  }

  return { ok: true as const };
}

export async function GET(
  req: NextRequest
) {
  try {
    const validacao =
      await validarAdmin(req);

    if (!validacao.ok) {
      return validacao.resposta;
    }

    const { searchParams } =
      new URL(req.url);

    const atividadeId =
      searchParams.get("id")?.trim();

    if (atividadeId) {
      const {
        data: atividade,
        error: erroAtividade,
      } = await supabaseAdmin
        .from("atividades")
        .select(
          `
          id,
          titulo,
          etapa_ensino,
          serie,
          disciplina,
          pedido,
          tipo_atividade,
          quantidade_questoes,
          imagem,
          created_at,
          publicar_biblioteca
          `
        )
        .eq("id", atividadeId)
        .single();

      if (erroAtividade || !atividade) {
        console.error(
          "Erro ao buscar atividade:",
          erroAtividade
        );

        return NextResponse.json(
          {
            erro:
              "Não foi possível abrir a atividade.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        atividade,
      });
    }

    const {
      data: atividades,
      error: erroAtividades,
    } = await supabaseAdmin
      .from("atividades")
      .select(
        `
        id,
        titulo,
        etapa_ensino,
        serie,
        disciplina,
        pedido,
        tipo_atividade,
        quantidade_questoes,
        created_at,
        publicar_biblioteca
        `
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(500);

    if (erroAtividades) {
      console.error(
        "Erro ao buscar atividades para a biblioteca:",
        erroAtividades
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível carregar as atividades.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      atividades: atividades || [],
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao carregar biblioteca no admin:",
      error
    );

    return NextResponse.json(
      {
        erro: "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const validacao =
      await validarAdmin(req);

    if (!validacao.ok) {
      return validacao.resposta;
    }

    const body = await req.json();

    const atividadeId =
      String(
        body?.atividadeId || ""
      ).trim();

    const publicar =
      body?.publicar === true;

    if (!atividadeId) {
      return NextResponse.json(
        {
          erro:
            "Atividade não informada.",
        },
        { status: 400 }
      );
    }

    const {
      data: atividadeAtualizada,
      error: erroAtualizacao,
    } = await supabaseAdmin
      .from("atividades")
      .update({
        publicar_biblioteca:
          publicar,
      })
      .eq("id", atividadeId)
      .select(
        `
        id,
        titulo,
        etapa_ensino,
        serie,
        disciplina,
        pedido,
        tipo_atividade,
        quantidade_questoes,
        created_at,
        publicar_biblioteca
        `
      )
      .single();

    if (erroAtualizacao) {
      console.error(
        "Erro ao alterar publicação da atividade:",
        erroAtualizacao
      );

      return NextResponse.json(
        {
          erro:
            "Não foi possível alterar a publicação da atividade.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      atividade:
        atividadeAtualizada,
      mensagem: publicar
        ? "Atividade publicada na biblioteca."
        : "Atividade retirada da biblioteca.",
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao alterar biblioteca:",
      error
    );

    return NextResponse.json(
      {
        erro: "Erro interno do servidor.",
      },
      { status: 500 }
    );
  }
}
