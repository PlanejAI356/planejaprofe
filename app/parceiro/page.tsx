"use client";

import {
  BadgeDollarSign,
  CheckCircle2,
  Copy,
  MousePointerClick,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function ParceiroPage() {
  const [copiado, setCopiado] = useState(false);

  // POR ENQUANTO SÃO DADOS VISUAIS DE TESTE.
  // DEPOIS VAMOS BUSCAR DO SUPABASE.
  const parceiro = {
    nome: "Ayanne",
    cupom: "AYANNE",
    comissaoPercentual: 30,
    cliques: 0,
    cadastros: 0,
    assinaturas: 0,
    valorGerado: 0,
    comissaoAcumulada: 0,
  };

  const linkParceiro = `https://www.planejaioficial.com.br/?ref=${parceiro.cupom}`;

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkParceiro);

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
    }
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

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

          <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:block">
            Comissão de {parceiro.comissaoPercentual}%
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
              Acompanhe aqui os acessos pelo seu link,
              cadastros realizados, assinaturas confirmadas
              e o valor acumulado da sua comissão.
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
              {parceiro.cliques}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Pessoas que chegaram ao PlanejAI pelo seu link.
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
              {parceiro.cadastros}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Pessoas que criaram uma conta usando sua indicação.
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
              {parceiro.assinaturas}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Indicações que já tiveram pagamento confirmado.
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
              {formatarMoeda(parceiro.comissaoAcumulada)}
            </p>

            <p className="mt-2 text-xs leading-5 text-emerald-700">
              Valor acumulado pelas assinaturas confirmadas.
            </p>
          </div>
        </div>

        {/* LINK DO PARCEIRO */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Seu link de divulgação
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Compartilhe este link. Os acessos e cadastros
                feitos por ele serão associados à sua parceria.
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

              {copiado ? "Link copiado!" : "Copiar link"}
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
              Cadastros e assinaturas originados pelo seu link.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Situação</th>
                  <th className="px-6 py-4">Assinatura</th>
                  <th className="px-6 py-4">Comissão</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Users size={22} />
                    </div>

                    <p className="mt-4 font-semibold text-slate-700">
                      Nenhuma indicação registrada ainda
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Assim que alguém se cadastrar pelo seu link,
                      o resultado aparecerá aqui.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RESUMO FINANCEIRO */}
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
                {formatarMoeda(parceiro.valorGerado)}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                Comissão acumulada
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-900">
                {formatarMoeda(parceiro.comissaoAcumulada)}
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