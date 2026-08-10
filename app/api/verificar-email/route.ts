import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          erro: "E-mail não informado.",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao verificar e-mail:",
        error
      );

      return NextResponse.json(
        {
          erro: "Não foi possível verificar o e-mail.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      existe: Boolean(data),
    });
  } catch (error) {
    console.error(
      "Erro inesperado ao verificar e-mail:",
      error
    );

    return NextResponse.json(
      {
        erro: "Não foi possível verificar o e-mail.",
      },
      {
        status: 500,
      }
    );
  }
}