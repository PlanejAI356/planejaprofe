import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // 1. Recebe o token da pessoa que acabou de fazer login
    const authorization =
      req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          erro: "Usuário não autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    const token = authorization
      .replace("Bearer ", "")
      .trim();

    if (!token) {
      return NextResponse.json(
        {
          erro: "Sessão inválida.",
        },
        {
          status: 401,
        }
      );
    }

    // 2. Confirma no Supabase quem é o usuário
    const {
      data: usuarioAuth,
      error: erroUsuario,
    } = await supabaseAdmin.auth.getUser(token);

    if (erroUsuario || !usuarioAuth.user) {
      console.error(
        "Erro ao validar usuário:",
        erroUsuario
      );

      return NextResponse.json(
        {
          erro: "Não foi possível validar sua sessão.",
        },
        {
          status: 401,
        }
      );
    }

    const usuario = usuarioAuth.user;

    // 3. Procura o perfil existente
    const {
      data: perfilExistente,
      error: erroPerfil,
    } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", usuario.id)
      .maybeSingle();

    if (erroPerfil) {
      console.error(
        "Erro ao procurar perfil:",
        erroPerfil
      );

      return NextResponse.json(
        {
          erro: "Não foi possível verificar seu perfil.",
        },
        {
          status: 500,
        }
      );
    }

    // 4. Se o perfil já existe, NÃO altera nada.
    // Isso preserva Premium, Mercado Pago,
    // planos feitos, cupom e demais informações.
    if (perfilExistente) {
      return NextResponse.json({
        sucesso: true,
        perfilCriado: false,
      });
    }

    // 5. O perfil realmente não existe.
    // Recupera os dados salvos no Auth no cadastro.
    const nome =
      typeof usuario.user_metadata?.nome === "string"
        ? usuario.user_metadata.nome.trim()
        : "";

    const whatsapp =
      typeof usuario.user_metadata?.whatsapp === "string"
        ? usuario.user_metadata.whatsapp.trim()
        : "";

    const cupomOrigem =
      typeof usuario.user_metadata?.cupom_origem ===
      "string"
        ? usuario.user_metadata.cupom_origem
            .trim()
            .toUpperCase()
        : null;

    const email =
      usuario.email?.trim().toLowerCase() || "";

    // 6. Cria SOMENTE o perfil ausente.
    const {
      data: perfilCriado,
      error: erroCriacao,
    } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: usuario.id,
        nome: nome || email.split("@")[0] || "Professor(a)",
        email,
        whatsapp: whatsapp || null,
        plano: "gratis",
        planos_feitos: 0,
        cupom_origem: cupomOrigem,
      })
      .select("*")
      .single();

    if (erroCriacao) {
      console.error(
        "Erro ao criar perfil ausente:",
        erroCriacao
      );

      return NextResponse.json(
        {
          erro: "Não foi possível concluir os dados da sua conta.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Perfil ausente recriado com sucesso:",
      perfilCriado.id
    );

    return NextResponse.json({
      sucesso: true,
      perfilCriado: true,
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao sincronizar perfil:",
      error
    );

    return NextResponse.json(
      {
        erro: "Não foi possível verificar sua conta.",
      },
      {
        status: 500,
      }
    );
  }
}