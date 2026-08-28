"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Gift,
  LockKeyhole,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function obterParceiroRef() {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      localStorage
        .getItem("parceiro_ref")
        ?.trim()
        .toUpperCase() || ""
    );
  }

  async function registrarIndicacaoCadastro(
    emailCliente: string,
    parceiroRef: string
  ) {
    if (!parceiroRef) {
      return;
    }

    try {
      const resposta = await fetch("/api/parcerias/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cupom: parceiroRef,
          emailCliente,
        }),
      });

      const resultado = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        console.error(
          "Não foi possível registrar a indicação do cadastro:",
          resultado
        );
        return;
      }

      console.log("Indicação registrada:", resultado);
    } catch (error) {
      console.error(
        "Erro ao registrar indicação do cadastro:",
        error
      );
    }
  }

  async function salvarCupomNoPerfil(
    userId: string,
    parceiroRef: string
  ) {
    if (!userId || !parceiroRef) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          cupom_origem: parceiroRef,
        })
        .eq("id", userId)
        .is("cupom_origem", null);

      if (error) {
        console.error(
          "Não foi possível salvar o cupom de origem no perfil:",
          error
        );
      }
    } catch (error) {
      console.error(
        "Erro ao salvar o cupom de origem no perfil:",
        error
      );
    }
  }

  async function liberarTestesIniciais(userId: string) {
    if (!userId) {
      return;
    }

    try {
      for (let tentativa = 1; tentativa <= 3; tentativa++) {
        const { data, error } = await supabase
          .from("profiles")
          .update({
            plano: "gratuito",
            planos_restantes: 3,
          })
          .eq("id", userId)
          .select("id, plano, planos_restantes")
          .maybeSingle();

        if (!error && data) {
          console.log(
            "3 testes gratuitos liberados:",
            data
          );
          return;
        }

        if (error) {
          console.error(
            `Tentativa ${tentativa} ao liberar testes:`,
            error
          );
        }

        if (tentativa < 3) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );
        }
      }

      console.error(
        "A conta foi criada, mas não foi possível confirmar a liberação dos 3 testes gratuitos."
      );
    } catch (error) {
      console.error(
        "Erro inesperado ao liberar os 3 testes gratuitos:",
        error
      );
    }
  }

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();

    if (carregando) {
      return;
    }

    setCarregando(true);

    try {
      const nomeNormalizado = nome.trim();
      const emailNormalizado = email.trim().toLowerCase();
      const whatsappNormalizado = whatsapp.trim();
      const senhaNormalizada = senha.trim();
      const parceiroRef = obterParceiroRef();

      if (!nomeNormalizado) {
        alert("Informe seu nome.");
        return;
      }

      if (!emailNormalizado) {
        alert("Informe seu e-mail.");
        return;
      }

      if (!whatsappNormalizado) {
        alert("Informe seu telefone ou WhatsApp.");
        return;
      }

      if (!senhaNormalizada) {
        alert("Informe uma senha.");
        return;
      }

      const respostaVerificacao = await fetch(
        "/api/verificar-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailNormalizado,
          }),
        }
      );

      const dadosVerificacao =
        await respostaVerificacao.json().catch(() => null);

      if (!respostaVerificacao.ok) {
        alert(
          dadosVerificacao?.erro ||
            "Não foi possível verificar o e-mail."
        );
        return;
      }

      if (dadosVerificacao?.existe) {
        alert(
          "Este e-mail já está cadastrado. Entre na sua conta ou recupere sua senha."
        );

        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailNormalizado,
        password: senhaNormalizada,
        options: {
          data: {
            nome: nomeNormalizado,
            whatsapp: whatsappNormalizado,
            ...(parceiroRef
              ? {
                  cupom_origem: parceiroRef,
                }
              : {}),
          },
        },
      });

      if (error) {
        console.error("Erro no cadastro:", error);

        const mensagemErro = error.message.toLowerCase();

        if (
          mensagemErro.includes("already registered") ||
          mensagemErro.includes("already exists") ||
          mensagemErro.includes("user already")
        ) {
          alert(
            "Este e-mail já está cadastrado. Entre na sua conta ou recupere sua senha."
          );

          window.location.href = "/login";
          return;
        }

        alert("Erro ao criar conta: " + error.message);
        return;
      }

      if (!data.user?.id) {
        console.error(
          "Cadastro retornou sem identificador de usuário."
        );

        alert(
          "A conta foi criada, mas não foi possível concluir todas as informações do cadastro."
        );

        window.location.href = "/login";
        return;
      }

      console.log("Cadastro criado:", data.user.id);

      await liberarTestesIniciais(data.user.id);

      if (parceiroRef) {
        await salvarCupomNoPerfil(
          data.user.id,
          parceiroRef
        );

        await registrarIndicacaoCadastro(
          emailNormalizado,
          parceiroRef
        );
      }

      alert(
        "Cadastro realizado com sucesso! Você ganhou 3 testes gratuitos. Agora faça login para acessar o PlanejAI."
      );

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Erro inesperado ao criar conta:",
        error
      );

      alert(
        "Não foi possível criar a conta. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfefc]">
      {/* FUNDO */}
      <div className="pointer-events-none absolute -left-52 top-28 h-[480px] w-[620px] rounded-[50%] bg-green-100/55 blur-3xl" />
      <div className="pointer-events-none absolute -right-56 top-24 h-[520px] w-[680px] rounded-[50%] bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 left-[-120px] h-[420px] w-[720px] rounded-[50%] bg-green-100/50 blur-3xl" />

      {/* PONTOS */}
      <div className="pointer-events-none absolute left-7 top-[36%] hidden grid-cols-3 gap-3 opacity-35 lg:grid">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={`ponto-esquerda-${index}`}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        ))}
      </div>

      <div className="pointer-events-none absolute right-10 top-[18%] hidden grid-cols-3 gap-3 opacity-30 lg:grid">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={`ponto-direita-${index}`}
            className="h-1.5 w-1.5 rounded-full bg-green-500"
          />
        ))}
      </div>

      <span className="pointer-events-none absolute left-[11%] top-[46%] hidden text-3xl text-green-500 lg:block">
        ✦
      </span>

      <span className="pointer-events-none absolute right-[12%] top-[39%] hidden text-3xl text-blue-500 lg:block">
        ✦
      </span>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        {/* CABEÇALHO */}
        <header className="flex shrink-0 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="flex cursor-pointer items-center gap-3"
          >
            <img
              src="/logo-planejai-nova.png"
              alt="PlanejAI"
              className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            />

            <span className="text-3xl font-black tracking-tight text-[#071c4d] sm:text-4xl">
              Planej<span className="text-green-600">AI</span>
            </span>
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 shadow-sm md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-800">
                Seus dados estão seguros
              </p>

              <p className="text-xs text-slate-500">
                Privacidade e segurança em primeiro lugar.
              </p>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <section className="relative flex flex-1 items-center justify-center py-5">
          <div className="relative w-full max-w-6xl">
            {/* CARDS LATERAIS */}
            <div className="absolute -left-2 top-20 z-20 hidden rotate-[-5deg] rounded-[28px] border border-green-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
                📚
              </div>

              <p className="font-extrabold text-green-700">
                Planejamentos
              </p>
            </div>

            <div className="absolute left-0 bottom-28 z-20 hidden rotate-[3deg] rounded-[28px] border border-blue-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl">
                📝
              </div>

              <p className="font-extrabold text-blue-700">
                Avaliações
              </p>
            </div>

            <div className="absolute -right-1 top-48 z-20 hidden rotate-[5deg] rounded-[28px] border border-orange-100 bg-white/95 px-6 py-5 text-center shadow-xl lg:block">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-4xl">
                ✏️
              </div>

              <p className="font-extrabold text-orange-600">
                Atividades
              </p>
            </div>

            {/* BLOCO CENTRAL */}
            <div className="mx-auto w-full max-w-2xl">
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
                  <Gift size={30} strokeWidth={2.3} />
                </div>

                <h1 className="text-4xl font-black tracking-[-0.04em] text-[#071c4d] sm:text-5xl md:text-6xl">
                  Crie sua{" "}
                  <span className="text-green-600">
                    conta
                  </span>
                </h1>

                <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-green-500" />

                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Cadastre-se e ganhe{" "}
                  <strong className="font-extrabold text-green-600">
                    3 testes gratuitos
                  </strong>{" "}
                  para conhecer o PlanejAI.
                </p>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-7">
                <form
                  onSubmit={criarConta}
                  className="space-y-4"
                >
                  {/* NOME */}
                  <div className="relative">
                    <User
                      size={21}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                    />

                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={nome}
                      onChange={(e) =>
                        setNome(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    />
                  </div>

                  {/* E-MAIL */}
                  <div className="relative">
                    <Mail
                      size={21}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                    />

                    <input
                      type="email"
                      placeholder="E-mail"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    />
                  </div>

                  {/* WHATSAPP */}
                  <div className="relative">
                    <Phone
                      size={21}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                    />

                    <input
                      type="text"
                      placeholder="Telefone / WhatsApp"
                      value={whatsapp}
                      onChange={(e) =>
                        setWhatsapp(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    />
                  </div>

                  {/* SENHA */}
                  <div className="relative">
                    <LockKeyhole
                      size={21}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
                    />

                    <input
                      type={
                        mostrarSenha
                          ? "text"
                          : "password"
                      }
                      placeholder="Senha"
                      value={senha}
                      onChange={(e) =>
                        setSenha(e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-base outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarSenha(!mostrarSenha)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-slate-700"
                      aria-label={
                        mostrarSenha
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                    >
                      {mostrarSenha ? (
                        <EyeOff size={21} />
                      ) : (
                        <Eye size={21} />
                      )}
                    </button>
                  </div>

                  {/* BOTÃO */}
                  <button
                    type="submit"
                    disabled={carregando}
                    className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UserPlus size={23} />

                    {carregando
                      ? "Criando conta..."
                      : "Criar conta"}
                  </button>
                </form>

                {/* 3 TESTES */}
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/70 px-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-green-500 text-green-600">
                    ✓
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    Ao se cadastrar, você ganha{" "}
                    <strong className="font-extrabold text-green-600">
                      3 testes gratuitos
                    </strong>{" "}
                    para conhecer o PlanejAI.
                  </p>
                </div>

                {/* LOGIN */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <p className="text-sm text-slate-600">
                    Já possui uma conta?
                  </p>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="mx-auto mt-4 flex cursor-pointer items-center gap-2 font-extrabold text-blue-600 transition hover:text-green-600"
                >
                  <LogIn size={19} />
                  Entrar
                </button>
              </div>
            </div>

            {/* LINHAS DECORATIVAS */}
            <div className="pointer-events-none absolute left-20 top-52 hidden h-36 w-32 rounded-full border-b-2 border-l-2 border-dashed border-green-300 lg:block" />

            <div className="pointer-events-none absolute bottom-24 right-20 hidden h-36 w-32 rounded-full border-b-2 border-r-2 border-dashed border-green-300 lg:block" />
          </div>
        </section>
      </div>
    </main>
  );
}
