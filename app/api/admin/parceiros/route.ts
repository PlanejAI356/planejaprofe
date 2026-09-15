import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type CorpoParceiro = {
  usuarioId?: string;
  cupom?: string;
  comissaoPercentual?: number;
};

function normalizarCupom(valor: unknown) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/gi, "")
    .trim()
    .toUpperCase();
}

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

    const body = (await req.json()) as CorpoParceiro;

    const usuarioId = String(body.usuarioId || "").trim();
    const cupom = normalizarCupom(body.cupom);
    const comissaoPercentual = Number(
      body.comissaoPercentual ?? 30
    );

    if (!usuarioId) {
      return NextResponse.json(
        { erro: "Usuário não informado." },
        { status: 400 }
      );
    }

    if (!cupom) {
      return NextResponse.json(
        { erro: "Informe o cupom do parceiro." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(comissaoPercentual) ||
      comissaoPercentual < 0 ||
      comissaoPercentual > 100
    ) {
      return NextResponse.json(
        { erro: "A comissão deve estar entre 0% e 100%." },
        { status: 400 }
      );
    }

    const {
      data: perfil,
      error: erroPerfil,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, nome, email")
      .eq("id", usuarioId)
      .maybeSingle();

    if (erroPerfil) {
      console.error("Erro ao buscar usuário:", erroPerfil);

      return NextResponse.json(
        { erro: "Não foi possível localizar o usuário." },
        { status: 500 }
      );
    }

    if (!perfil) {
      return NextResponse.json(
        { erro: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const {
      data: parceiroExistente,
      error: erroParceiroExistente,
    } = await supabaseAdmin
      .from("parceiros")
      .select("id, cupom")
      .eq("user_id", usuarioId)
      .maybeSingle();

    if (erroParceiroExistente) {
      console.error(
        "Erro ao verificar parceiro:",
        erroParceiroExistente
      );

      return NextResponse.json(
        { erro: "Não foi possível verificar a parceria." },
        { status: 500 }
      );
    }

    if (parceiroExistente) {
      return NextResponse.json(
        { erro: "Este usuário já está cadastrado como parceiro." },
        { status: 409 }
      );
    }

    const {
      data: cupomExistente,
      error: erroCupom,
    } = await supabaseAdmin
      .from("parceiros")
      .select("id")
      .eq("cupom", cupom)
      .maybeSingle();

    if (erroCupom) {
      console.error("Erro ao verificar cupom:", erroCupom);

      return NextResponse.json(
        { erro: "Não foi possível verificar o cupom." },
        { status: 500 }
      );
    }

    if (cupomExistente) {
      return NextResponse.json(
        { erro: "Este cupom já pertence a outro parceiro." },
        { status: 409 }
      );
    }

    const nome =
      perfil.nome?.trim() ||
      perfil.email?.split("@")[0] ||
      "Parceiro";

    const {
      data: parceiro,
      error: erroCriacao,
    } = await supabaseAdmin
      .from("parceiros")
      .insert({
        user_id: usuarioId,
        nome,
        cupom,
        comissao_percentual: comissaoPercentual,
        ativo: true,
      })
      .select(
        "id, user_id, nome, cupom, comissao_percentual, ativo"
      )
      .single();

    if (erroCriacao) {
      console.error("Erro ao criar parceiro:", erroCriacao);

      return NextResponse.json(
        { erro: "Não foi possível criar o parceiro." },
        { status: 500 }
      );
    }

    const link =
      `https://www.planejaioficial.com.br/?ref=${encodeURIComponent(
        cupom
      )}`;

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: "Parceiro criado com sucesso!",
        parceiro,
        link,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erro ao criar parceiro pelo Admin:",
      error
    );

    return NextResponse.json(
      { erro: "Erro interno ao criar o parceiro." },
      { status: 500 }
    );
  }
}