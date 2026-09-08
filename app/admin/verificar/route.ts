import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "biologiaevida205@gmail.com";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          autorizado: false,
          erro: "Usuário não autenticado.",
        },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "").trim();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        {
          autorizado: false,
          erro: "Sessão inválida.",
        },
        { status: 401 }
      );
    }

    const email = user.email?.trim().toLowerCase();

    if (email !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        {
          autorizado: false,
          erro: "Biblioteca em desenvolvimento.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      autorizado: true,
    });
  } catch (error) {
    console.error("Erro ao verificar acesso à biblioteca:", error);

    return NextResponse.json(
      {
        autorizado: false,
        erro: "Erro ao verificar acesso.",
      },
      { status: 500 }
    );
  }
}