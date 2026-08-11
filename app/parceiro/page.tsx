"use client";

import {
  BadgeDollarSign,
  CheckCircle2,
  Copy,
  Loader2,
  LogIn,
  LogOut,
  MousePointerClick,
  UserPlus,
  Users,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

type Indicacao = {
  id: string;
  cliente: string;
  created_at: string;
  status: "cadastrado" | "pago";
  valor_assinatura: number;
  valor_comissao: number;
};

type DadosParceiro = {
  parceiro: {
    id: string;
    nome: string;
    cupom: string;
    comissaoPercentual: number;
  };

  resumo: {
    cliques: number;
    cadastros: number;
    assinaturas: number;
    valorGerado: number;
    comissaoAcumulada: number;
  };

  indicacoes: Indicacao[];
};

export default function ParceiroPage() {
  const [dados, setDados] =
    useState<DadosParceiro | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [carregandoLogin, setCarregandoLogin] =
    useState(false);

  const [logado, setLogado] =
    useState(false);

  const [naoParceiro, setNaoParceiro] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [copiado, setCopiado] =
    useState(false);

  useEffect(() => {
    verificarSessao();

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!session) {
            setLogado(false);
            setDados(null);
          }
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function verificarSessao() {
    try {
      setCarregando(true);
      setErro("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLogado(false);
        setDados(null);
        return;
      }

      setLogado(true);

      await carregarDados(
        session.access_token
      );
    } catch (error) {
      console.error(
        "Erro ao verificar sessão:",
        error
      );

      setErro(
        "Não foi possível verificar sua sessão."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDados(
    token: string
  ) {
    try {
      setErro("");
      setNaoParceiro(false);

      const resposta = await fetch(
        "/api/parceiro/dados",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {
        if (resultado.naoParceiro) {
          setNaoParceiro(true);
        }

        setDados(null);

        setErro(
          resultado.erro ||
            "Não foi possível carregar sua parceria."
        );

        return;
      }

      setDados(resultado);
    } catch (error) {
      console.error(
        "Erro ao carregar dados do parceiro:",
        error
      );

      setErro(
        "Não foi possível carregar os dados da parceria."
      );

      setDados(null);
    }
  }

  async function entrar(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!email.trim()) {
      setErro("Digite seu e-mail.");
      return;
    }

    if (!senha) {
      setErro("Digite sua senha.");
      return;
    }

    try {
      setCarregandoLogin(true);
      setErro("");
      setNaoParceiro(false);

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: email
              .trim()
              .toLowerCase(),

            password: senha,
          }
        );

      if (error) {
        console.error(
          "Erro no login:",
          error
        );

        setErro(
          "E-mail ou senha incorretos."
        );

        return;
      }

      if (!data.session) {
        setErro(
          "Não foi possível iniciar sua sessão."
        );
        return;
      }

      setLogado(true);

      await carregarDados(
        data.session.access_token
      );
    } catch (error) {
      console.error(
        "Erro ao entrar:",
        error
      );

      setErro(
        "Não foi possível realizar o login."
      );
    } finally {
      setCarregandoLogin(false);
    }
  }

  async function sair() {
    try {
      await supabase.auth.signOut();

      setDados(null);
      setLogado(false);
      setNaoParceiro(false);
      setErro("");
      setSenha("");
    } catch (error) {
      console.error(
        "Erro ao sair:",
        error
      );
    }
  }

  async function copiarLink() {
    if (!dados) return;

    const link =
      `https://www.planejaioficial.com.br/?ref=${dados.parceiro.cupom}`;

    try {
      await navigator.clipboard.writeText(
        link
      );

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Erro ao copiar link:",
        error
      );
    }
  }

  function formatarMoeda(
    valor: number
  ) {
    return Number(
      valor || 0
    ).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(
    data: string
  ) {
    if (!data) return "-";

    return new Date(
      data
    ).toLocaleDateString("pt-BR");
  }

  /*
   * CARREGANDO
   */
  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-emerald-700"
            size={36}
          />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Carregando Área do Parceiro...
          </p>
        </div>
      </main>
    );
  }

  /*
   * NÃO ESTÁ LOGADO
   */
  if (!logado) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <p className="text-sm font-medium text-emerald-700">
              PlanejAI
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Área do Parceiro
            </h1>
          </div>
        </header>

        <section className="mx-auto flex max-w-7xl justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <LogIn size={26} />
            </div>

            <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
              Acesse sua parceria
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Entre com o mesmo e-mail e senha
              da sua conta no PlanejAI.
            </p>

            <form
              onSubmit={entrar}
              className="mt-7 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  E-mail
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Senha
                </label>

                <input
                  type="password"
                  value={senha}
                  onChange={(event) =>
                    setSenha(
                      event.target.value
                    )
                  }
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {erro && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregandoLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregandoLogin ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Entrar
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  /*
   * LOGADO, MAS NÃO É PARCEIRO
   */
  if (naoParceiro || !dados) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                PlanejAI
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Área do Parceiro
              </h1>
            </div>

            <button
              onClick={sair}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <Users
              className="mx-auto text-slate-400"
              size={38}
            />

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Área exclusiva para parceiros
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {erro ||
                "Esta conta não possui uma parceria ativa com o PlanejAI."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const parceiro = dados.parceiro;
  const resumo = dados.resumo;
  const indicacoes = dados.indicacoes;

  const linkParceiro =
    `https://www.planejaioficial.com.br/?ref=${parceiro.cupom}`;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* TOPO */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              PlanejAI
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Área do Parceiro
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:block">
              Comissão de{" "}
              {parceiro.comissaoPercentual}%
            </div>

            <button
              onClick={sair}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">
                Sair
              </span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        {/* BOAS-VINDAS */}
        <div className="rounded-3xl bg-emerald-700 p-6 text-white shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
              Sua parceria com o PlanejAI
            </p>

            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Olá, {parceiro.nome}! 👋
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
              Acompanhe aqui os acessos pelo seu
              link, cadastros realizados,
              assinaturas confirmadas e o valor
              acumulado da sua comissão.
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MousePointerClick size={22} />
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Total
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Cliques no link
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {resumo.cliques}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Pessoas que chegaram ao PlanejAI
              pelo seu link.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <UserPlus size={22} />
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Total
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Cadastros
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {resumo.cadastros}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Pessoas que criaram uma conta
              usando sua indicação.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Premium
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Assinaturas
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {resumo.assinaturas}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Indicações que já tiveram
              pagamento confirmado.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-700">
                <BadgeDollarSign size={23} />
              </div>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {parceiro.comissaoPercentual}%
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-emerald-800">
              Sua comissão
            </p>

            <p className="mt-1 text-3xl font-bold text-emerald-900">
              {formatarMoeda(
                resumo.comissaoAcumulada
              )}
            </p>

            <p className="mt-2 text-xs leading-5 text-emerald-700">
              Valor acumulado pelas assinaturas
              confirmadas.
            </p>
          </div>
        </div>

        {/* LINK */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Seu link de divulgação
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Compartilhe este link. Os
                acessos e cadastros feitos por
                ele serão associados à sua
                parceria.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <Users size={17} />
              Cupom: {parceiro.cupom}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="truncate text-sm text-slate-700">
                {linkParceiro}
              </p>
            </div>

            <button
              onClick={copiarLink}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <Copy size={17} />
              {copiado
                ? "Link copiado!"
                : "Copiar link"}
            </button>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h3 className="text-lg font-bold text-slate-900">
              Resultados da parceria
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Cadastros e assinaturas
              originados pelo seu link.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">
                    Cliente
                  </th>
                  <th className="px-6 py-4">
                    Data
                  </th>
                  <th className="px-6 py-4">
                    Situação
                  </th>
                  <th className="px-6 py-4">
                    Assinatura
                  </th>
                  <th className="px-6 py-4">
                    Comissão
                  </th>
                </tr>
              </thead>

              <tbody>
                {indicacoes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-14 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Users size={22} />
                      </div>

                      <p className="mt-4 font-semibold text-slate-700">
                        Nenhuma indicação
                        registrada ainda
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Assim que alguém se
                        cadastrar pelo seu link,
                        o resultado aparecerá
                        aqui.
                      </p>
                    </td>
                  </tr>
                ) : (
                  indicacoes.map(
                    (indicacao) => (
                      <tr
                        key={indicacao.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {indicacao.cliente}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatarData(
                            indicacao.created_at
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {indicacao.status ===
                          "pago" ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Pago
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              Cadastrado
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {indicacao.status ===
                          "pago"
                            ? formatarMoeda(
                                indicacao.valor_assinatura
                              )
                            : "—"}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-emerald-700">
                          {indicacao.status ===
                          "pago"
                            ? formatarMoeda(
                                indicacao.valor_comissao
                              )
                            : "—"}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESUMO */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-bold text-slate-900">
            Resumo financeiro
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Comissão da parceria
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {parceiro.comissaoPercentual}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Valor gerado em assinaturas
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatarMoeda(
                  resumo.valorGerado
                )}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                Comissão acumulada
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-900">
                {formatarMoeda(
                  resumo.comissaoAcumulada
                )}
              </p>
            </div>
          </div>
        </div>

        <p className="py-8 text-center text-xs text-slate-400">
          PlanejAI • Programa de Parcerias
        </p>
      </section>
    </main>
  );
}