import {
  NextRequest,
  NextResponse,
} from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

async function validarAdmin(req: NextRequest) {
  const authorization = req.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      ok: false,
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
      ok: false,
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

  if (!emailAdmin) {
    console.error("ADMIN_EMAIL não configurado.");

    return {
      ok: false,
      resposta: NextResponse.json(
        { erro: "Painel administrativo não configurado." },
        { status: 500 }
      ),
    };
  }

  if (!emailUsuario || emailUsuario !== emailAdmin) {
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

export async function GET(req: NextRequest) {
  try {
    const validacao = await validarAdmin(req);

    if (!validacao.ok) {
      return validacao.resposta;
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo")?.trim();
    const itemId = searchParams.get("id")?.trim();

    if (tipo === "avaliacoes") {
      if (itemId) {
        const {
          data: avaliacao,
          error: erroAvaliacao,
        } = await supabaseAdmin
          .from("avaliacoes")
          .select(
            `
            id,
            titulo,
            etapa_ensino,
            serie,
            disciplina,
            conteudos,
            avaliacao_completa,
            status,
            created_at,
            publicar_biblioteca,
            publicado_em,
            descartada_biblioteca
            `
          )
          .eq("id", itemId)
          .single();

        if (erroAvaliacao || !avaliacao) {
          console.error(
            "Erro ao buscar avaliação:",
            erroAvaliacao
          );

          return NextResponse.json(
            { erro: "Não foi possível abrir a avaliação." },
            { status: 404 }
          );
        }

        return NextResponse.json({ avaliacao });
      }

      const {
        data: avaliacoes,
        error: erroAvaliacoes,
      } = await supabaseAdmin
        .from("avaliacoes")
        .select(
          `
          id,
          titulo,
          etapa_ensino,
          serie,
          disciplina,
          conteudos,
          status,
          created_at,
          publicar_biblioteca,
          publicado_em,
          descartada_biblioteca
          `
        )
        .eq("descartada_biblioteca", false)
        .order("created_at", { ascending: false })
        .limit(500);

      if (erroAvaliacoes) {
        console.error(
          "Erro ao buscar avaliações para a biblioteca:",
          erroAvaliacoes
        );

        return NextResponse.json(
          { erro: "Não foi possível carregar as avaliações." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        avaliacoes: avaliacoes || [],
      });
    }

    if (itemId) {
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
          publicar_biblioteca,
          descartada_biblioteca
          `
        )
        .eq("id", itemId)
        .single();

      if (erroAtividade || !atividade) {
        console.error(
          "Erro ao buscar atividade:",
          erroAtividade
        );

        return NextResponse.json(
          { erro: "Não foi possível abrir a atividade." },
          { status: 404 }
        );
      }

      return NextResponse.json({ atividade });
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
        publicar_biblioteca,
        descartada_biblioteca
        `
      )
      .eq("descartada_biblioteca", false)
      .order("created_at", { ascending: false })
      .limit(500);

    if (erroAtividades) {
      console.error(
        "Erro ao buscar atividades para a biblioteca:",
        erroAtividades
      );

      return NextResponse.json(
        { erro: "Não foi possível carregar as atividades." },
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
      { erro: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const validacao = await validarAdmin(req);

    if (!validacao.ok) {
      return validacao.resposta;
    }

    const body = await req.json();
    const tipo = String(body?.tipo || "atividade").trim();

    if (tipo === "avaliacao") {
      const avaliacaoId = String(
        body?.avaliacaoId || ""
      ).trim();

      const acao = String(body?.acao || "").trim();

      if (!avaliacaoId) {
        return NextResponse.json(
          { erro: "Avaliação não informada." },
          { status: 400 }
        );
      }

      if (acao === "editar_titulo") {
        const novoTitulo = String(
          body?.titulo || ""
        ).trim();

        if (!novoTitulo) {
          return NextResponse.json(
            { erro: "Informe um título para a avaliação." },
            { status: 400 }
          );
        }

        if (novoTitulo.length > 150) {
          return NextResponse.json(
            { erro: "O título deve ter no máximo 150 caracteres." },
            { status: 400 }
          );
        }

        const {
          data: avaliacaoAtualizada,
          error: erroAtualizacao,
        } = await supabaseAdmin
          .from("avaliacoes")
          .update({ titulo: novoTitulo })
          .eq("id", avaliacaoId)
          .select(
            `
            id,
            titulo,
            etapa_ensino,
            serie,
            disciplina,
            conteudos,
            status,
            created_at,
            publicar_biblioteca,
            publicado_em,
            descartada_biblioteca
            `
          )
          .single();

        if (erroAtualizacao) {
          console.error(
            "Erro ao editar título da avaliação:",
            erroAtualizacao
          );

          return NextResponse.json(
            { erro: "Não foi possível editar o título da avaliação." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          sucesso: true,
          avaliacao: avaliacaoAtualizada,
          mensagem: "Título atualizado com sucesso.",
        });
      }

      if (acao === "descartar") {
        const {
          data: avaliacaoAtualizada,
          error: erroAtualizacao,
        } = await supabaseAdmin
          .from("avaliacoes")
          .update({
            descartada_biblioteca: true,
            publicar_biblioteca: false,
            publicado_em: null,
          })
          .eq("id", avaliacaoId)
          .select(
            `
            id,
            titulo,
            etapa_ensino,
            serie,
            disciplina,
            conteudos,
            status,
            created_at,
            publicar_biblioteca,
            publicado_em,
            descartada_biblioteca
            `
          )
          .single();

        if (erroAtualizacao) {
          console.error(
            "Erro ao descartar avaliação da curadoria:",
            erroAtualizacao
          );

          return NextResponse.json(
            { erro: "Não foi possível descartar a avaliação da Biblioteca." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          sucesso: true,
          avaliacao: avaliacaoAtualizada,
          mensagem: "Avaliação retirada da fila de revisão.",
        });
      }

      const publicar = body?.publicar === true;

      const {
        data: avaliacaoAtualizada,
        error: erroAtualizacao,
      } = await supabaseAdmin
        .from("avaliacoes")
        .update({
          publicar_biblioteca: publicar,
          descartada_biblioteca: false,
          publicado_em: publicar
            ? new Date().toISOString()
            : null,
        })
        .eq("id", avaliacaoId)
        .select(
          `
          id,
          titulo,
          etapa_ensino,
          serie,
          disciplina,
          conteudos,
          status,
          created_at,
          publicar_biblioteca,
          publicado_em,
          descartada_biblioteca
          `
        )
        .single();

      if (erroAtualizacao) {
        console.error(
          "Erro ao alterar publicação da avaliação:",
          erroAtualizacao
        );

        return NextResponse.json(
          { erro: "Não foi possível alterar a publicação da avaliação." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sucesso: true,
        avaliacao: avaliacaoAtualizada,
        mensagem: publicar
          ? "Avaliação publicada na biblioteca."
          : "Avaliação retirada da biblioteca.",
      });
    }

    const atividadeId = String(
      body?.atividadeId || ""
    ).trim();

    const acao = String(body?.acao || "").trim();

    if (!atividadeId) {
      return NextResponse.json(
        { erro: "Atividade não informada." },
        { status: 400 }
      );
    }

    if (acao === "editar_titulo") {
      const novoTitulo = String(
        body?.titulo || ""
      ).trim();

      if (!novoTitulo) {
        return NextResponse.json(
          { erro: "Informe um título para a atividade." },
          { status: 400 }
        );
      }

      if (novoTitulo.length > 150) {
        return NextResponse.json(
          { erro: "O título deve ter no máximo 150 caracteres." },
          { status: 400 }
        );
      }

      const {
        data: atividadeAtualizada,
        error: erroAtualizacao,
      } = await supabaseAdmin
        .from("atividades")
        .update({ titulo: novoTitulo })
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
          publicar_biblioteca,
          descartada_biblioteca
          `
        )
        .single();

      if (erroAtualizacao) {
        console.error(
          "Erro ao editar título da atividade:",
          erroAtualizacao
        );

        return NextResponse.json(
          { erro: "Não foi possível editar o título da atividade." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sucesso: true,
        atividade: atividadeAtualizada,
        mensagem: "Título atualizado com sucesso.",
      });
    }

    if (acao === "descartar") {
      const {
        data: atividadeAtualizada,
        error: erroAtualizacao,
      } = await supabaseAdmin
        .from("atividades")
        .update({
          descartada_biblioteca: true,
          publicar_biblioteca: false,
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
          publicar_biblioteca,
          descartada_biblioteca
          `
        )
        .single();

      if (erroAtualizacao) {
        console.error(
          "Erro ao descartar atividade da curadoria:",
          erroAtualizacao
        );

        return NextResponse.json(
          { erro: "Não foi possível descartar a atividade da Biblioteca." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        sucesso: true,
        atividade: atividadeAtualizada,
        mensagem: "Atividade retirada da fila de revisão.",
      });
    }

    const publicar = body?.publicar === true;

    const {
      data: atividadeAtualizada,
      error: erroAtualizacao,
    } = await supabaseAdmin
      .from("atividades")
      .update({
        publicar_biblioteca: publicar,
        descartada_biblioteca: false,
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
        publicar_biblioteca,
        descartada_biblioteca
        `
      )
      .single();

    if (erroAtualizacao) {
      console.error(
        "Erro ao alterar publicação da atividade:",
        erroAtualizacao
      );

      return NextResponse.json(
        { erro: "Não foi possível alterar a publicação da atividade." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      atividade: atividadeAtualizada,
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
      { erro: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
