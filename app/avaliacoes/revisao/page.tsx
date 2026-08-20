"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ImagePlus,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

import TopoAvaliacoes from "../componentes/TopoAvaliacoes";
import { supabase } from "../../lib/supabase";

type TipoQuestao =
  | "multipla_escolha"
  | "discursiva"
  | "verdadeiro_falso"
  | "complete"
  | "relacione";

type Questao = {
  id: string;
  numero: number;
  tipo: TipoQuestao;
  enunciado: string;
  alternativas: string[];
  afirmativas: string[];
  bancoPalavras: string[];
  frasesComplete: string[];
  colunaA: string[];
  colunaB: string[];
  linhasResposta: number;
  imagemNecessaria: boolean;
  descricaoImagem: string;
  imagemUrl?: string;
};

type AvaliacaoJson = {
  titulo: string;
  etapaEnsino: string;
  serie: string;
  disciplina: string;
  tipoAvaliacao: string;
  valorTotal: string;

  habilidadesBncc: string[];

  textoApoio: string;

  questoes: Questao[];
};

function nomeTipo(tipo: TipoQuestao) {
  const nomes: Record<TipoQuestao, string> = {
    multipla_escolha: "Múltipla escolha",
    discursiva: "Discursiva",
    verdadeiro_falso: "Verdadeiro ou falso",
    complete: "Complete",
    relacione: "Relacione as colunas",
  };

  return nomes[tipo];
}

const LINHA_LACUNA = "____________________";

function montarTextoEditorQuestao(
  questao: Questao
) {
  if (questao.tipo === "multipla_escolha") {
    const alternativas =
      questao.alternativas.map(
        (alternativa, indice) =>
          `${String.fromCharCode(
            65 + indice
          )}) ${alternativa}`
      );

    return [
      questao.enunciado,
      "",
      ...alternativas,
    ].join("\n");
  }

  if (questao.tipo === "verdadeiro_falso") {
    const afirmativas =
      questao.afirmativas.map(
        (afirmativa) =>
          `(     ) ${afirmativa}`
      );

    return [
      questao.enunciado,
      "",
      ...afirmativas,
    ].join("\n");
  }

  if (questao.tipo === "complete") {
    const banco =
      questao.bancoPalavras.length > 0
        ? `Banco de palavras: ${questao.bancoPalavras.join(
            " – "
          )}`
        : "Banco de palavras:";

    const frases =
      questao.frasesComplete.map((frase) =>
        frase.replace(
          /\{\{LACUNA\}\}/g,
          LINHA_LACUNA
        )
      );

    return [
      questao.enunciado,
      "",
      banco,
      "",
      ...frases,
    ].join("\n");
  }

  return questao.enunciado;
}

function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function montarHtmlQuestao(
  questao: Questao,
  numero: number
) {
  const imagem = questao.imagemUrl
    ? `
      <div style="text-align:center;margin:16px 0;break-inside:avoid;">
        <img
          src="${questao.imagemUrl}"
          alt="${escaparHtml(questao.descricaoImagem || "Imagem da questão")}"
          style="display:block;max-width:100%;width:420px;height:auto;margin:0 auto;border:1px solid #cbd5e1;border-radius:8px;"
        />
      </div>
    `
    : "";

  if (questao.tipo === "multipla_escolha") {
    const letras = ["A", "B", "C", "D"];

    return `
      <div style="break-inside:avoid;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
        ${imagem}
        ${questao.alternativas
          .map(
            (alternativa, indice) =>
              `<p style="margin:2px 0;">${letras[indice] || ""}) ${escaparHtml(alternativa)}</p>`
          )
          .join("")}
      </div>
    `;
  }

  if (questao.tipo === "discursiva") {
    const quantidadeLinhas = Math.max(
      1,
      Math.min(6, Number(questao.linhasResposta || 3))
    );

    const linhas = Array.from(
      { length: quantidadeLinhas },
      () =>
        `<div style="height:28px;border-bottom:1px solid #475569;width:100%;"></div>`
    ).join("");

    return `
      <div style="break-inside:avoid;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
        ${imagem}
        <div style="width:100%;">${linhas}</div>
      </div>
    `;
  }

  if (questao.tipo === "verdadeiro_falso") {
    return `
      <div style="break-inside:avoid;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
        ${imagem}
        ${questao.afirmativas
          .map(
            (afirmativa) =>
              `<p style="margin:5px 0;">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ) ${escaparHtml(afirmativa)}</p>`
          )
          .join("")}
      </div>
    `;
  }

  if (questao.tipo === "complete") {
    const banco = questao.bancoPalavras.length
      ? `
        <div style="margin:8px 0;padding:8px;border:1px solid #cbd5e1;border-radius:6px;">
          <strong>Banco de palavras:</strong>
          ${questao.bancoPalavras.map(escaparHtml).join(" – ")}
        </div>
      `
      : "";

    return `
      <div style="break-inside:avoid;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
        ${imagem}
        ${banco}
        ${questao.frasesComplete
          .map((frase) =>
            `<p style="margin:6px 0;">${escaparHtml(frase).replace(/\{\{LACUNA\}\}/g, "____________________")}</p>`
          )
          .join("")}
      </div>
    `;
  }

  return `
    <div style="break-inside:avoid;margin-bottom:20px;">
      <p style="margin:0 0 8px;"><strong>${numero})</strong> ${escaparHtml(questao.enunciado)}</p>
      ${imagem}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:10px;">
        <div>
          <strong>COLUNA A</strong>
          ${questao.colunaA
            .map(
              (item, indice) =>
                `<p style="margin:5px 0;">${indice + 1}. ${escaparHtml(item)}</p>`
            )
            .join("")}
        </div>
        <div>
          <strong>COLUNA B</strong>
          ${questao.colunaB
            .map(
              (item, indice) =>
                `<p style="margin:5px 0;">${String.fromCharCode(65 + indice)}. ${escaparHtml(item)}</p>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

export default function RevisaoAvaliacaoPage() {
  const router = useRouter();

  const [avaliacao, setAvaliacao] =
    useState<AvaliacaoJson | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [sugestaoAberta, setSugestaoAberta] =
    useState<string | null>(null);

  const [sugestoes, setSugestoes] =
    useState<Record<string, string>>({});

  const [aplicandoSugestao, setAplicandoSugestao] =
    useState<string | null>(null);

  const [questaoRefazendo, setQuestaoRefazendo] =
    useState<string | null>(null);

  const [imagemGerando, setImagemGerando] =
    useState<string | null>(null);

  const [erro, setErro] = useState("");

  const [salvando, setSalvando] =
    useState(false);

  const [
    sugestaoAvaliacaoAberta,
    setSugestaoAvaliacaoAberta,
  ] = useState(false);

  const [
    sugestaoAvaliacao,
    setSugestaoAvaliacao,
  ] = useState("");

  const [
    acaoAvaliacao,
    setAcaoAvaliacao,
  ] = useState<
    "corrigir" | "sugestao" | "refazer" | null
  >(null);

  useEffect(() => {
    const avaliacaoSalva =
      localStorage.getItem("avaliacaoJson");

    if (avaliacaoSalva) {
      try {
        const dados = JSON.parse(
          avaliacaoSalva
        ) as AvaliacaoJson;

        dados.questoes = dados.questoes.map(
          (questao, indice) => ({
            ...questao,
            id:
              questao.id ||
              `questao-${Date.now()}-${indice}`,
            numero: indice + 1,
            alternativas:
              questao.alternativas || [],
            afirmativas:
              questao.afirmativas || [],
            bancoPalavras:
              questao.bancoPalavras || [],
            frasesComplete:
              questao.frasesComplete || [],
            colunaA: questao.colunaA || [],
            colunaB: questao.colunaB || [],
          })
        );

        setAvaliacao(dados);
      } catch {
        setErro(
          "Não foi possível abrir as questões geradas."
        );
      }
    }

    setCarregando(false);
  }, []);

  useEffect(() => {
  if (!avaliacao || imagemGerando) return;

  const proximaQuestao =
    avaliacao.questoes.find(
      (questao) =>
        questao.imagemNecessaria &&
        questao.descricaoImagem?.trim() &&
        !questao.imagemUrl
    );

  if (proximaQuestao) {
    void gerarImagemQuestao(proximaQuestao);
  }
}, [avaliacao, imagemGerando]);

  function salvarAvaliacao(
    novaAvaliacao: AvaliacaoJson
  ) {
    const questoesNumeradas =
      novaAvaliacao.questoes.map(
        (questao, indice) => ({
          ...questao,
          numero: indice + 1,
        })
      );

    const avaliacaoAtualizada = {
      ...novaAvaliacao,
      questoes: questoesNumeradas,
    };

    setAvaliacao(avaliacaoAtualizada);

    try {
      localStorage.setItem(
        "avaliacaoJson",
        JSON.stringify(avaliacaoAtualizada)
      );
    } catch {
      setErro(
        "As alterações foram feitas, mas o navegador não conseguiu salvá-las."
      );
    }
  }

  function atualizarQuestao(
    id: string,
    alteracoes: Partial<Questao>
  ) {
    if (!avaliacao) return;

    salvarAvaliacao({
      ...avaliacao,
      questoes: avaliacao.questoes.map(
        (questao) =>
          questao.id === id
            ? { ...questao, ...alteracoes }
            : questao
      ),
    });
  }
      function atualizarTextoEditor(
    questao: Questao,
    texto: string
  ) {
    const linhas = texto.split("\n");

    if (
      questao.tipo ===
      "multipla_escolha"
    ) {
      const inicioAlternativas =
        linhas.findIndex((linha) =>
          /^[A-Da-d]\s*[\)\.\-:]\s*/.test(
            linha.trim()
          )
        );

      if (inicioAlternativas === -1) {
        atualizarQuestao(questao.id, {
          enunciado: texto,
        });
        return;
      }

      const enunciado = linhas
        .slice(0, inicioAlternativas)
        .join("\n")
        .trim();

      const alternativas = linhas
        .slice(inicioAlternativas)
        .filter(
          (linha) => linha.trim() !== ""
        )
        .map((linha) =>
          linha
            .replace(
              /^[A-Da-d]\s*[\)\.\-:]\s*/,
              ""
            )
            .trim()
        );

      atualizarQuestao(questao.id, {
        enunciado,
        alternativas,
      });

      return;
    }

    if (
      questao.tipo ===
      "verdadeiro_falso"
    ) {
      const inicioAfirmativas =
        linhas.findIndex((linha) =>
          /^\(\s*\)/.test(linha.trim())
        );

      if (inicioAfirmativas === -1) {
        atualizarQuestao(questao.id, {
          enunciado: texto,
        });
        return;
      }

      const enunciado = linhas
        .slice(0, inicioAfirmativas)
        .join("\n")
        .trim();

      const afirmativas = linhas
        .slice(inicioAfirmativas)
        .filter(
          (linha) => linha.trim() !== ""
        )
        .map((linha) =>
          linha
            .replace(/^\(\s*\)\s*/, "")
            .trim()
        );

      atualizarQuestao(questao.id, {
        enunciado,
        afirmativas,
      });

      return;
    }

    if (questao.tipo === "complete") {
      const indiceBanco =
        linhas.findIndex((linha) =>
          /^banco de palavras\s*:/i.test(
            linha.trim()
          )
        );

      if (indiceBanco === -1) {
        atualizarQuestao(questao.id, {
          enunciado: texto,
        });
        return;
      }

      const enunciado = linhas
        .slice(0, indiceBanco)
        .join("\n")
        .trim();

      const textoBanco =
        linhas[indiceBanco]
          .replace(
            /^banco de palavras\s*:/i,
            ""
          )
          .trim();

      const bancoPalavras = textoBanco
        .split(/[–—;,|]/)
        .map((item) => item.trim())
        .filter(Boolean);

      const frasesComplete = linhas
        .slice(indiceBanco + 1)
        .filter(
          (linha) => linha.trim() !== ""
        )
        .map((linha) =>
          linha.replace(
            /_{3,}/g,
            "{{LACUNA}}"
          )
        );

      atualizarQuestao(questao.id, {
        enunciado,
        bancoPalavras,
        frasesComplete,
      });

      return;
    }

    atualizarQuestao(questao.id, {
      enunciado: texto,
    });
  }

  function atualizarItemArray(
    id: string,
    campo:
      | "alternativas"
      | "afirmativas"
      | "bancoPalavras"
      | "frasesComplete"
      | "colunaA"
      | "colunaB",
    indice: number,
    valor: string
  ) {
    const questao = avaliacao?.questoes.find(
      (item) => item.id === id
    );

    if (!questao) return;

    const novoArray = [...questao[campo]];
    novoArray[indice] = valor;

    atualizarQuestao(id, {
      [campo]: novoArray,
    });
  }

  function excluirQuestao(id: string) {
    if (!avaliacao) return;

    salvarAvaliacao({
      ...avaliacao,
      questoes: avaliacao.questoes.filter(
        (questao) => questao.id !== id
      ),
    });
  }

  async function refazerQuestao(
    questao: Questao
  ) {
    if (!avaliacao) return;

    setErro("");
    setQuestaoRefazendo(questao.id);

    const configuracaoSalva =
      localStorage.getItem(
        "configuracaoAvaliacao"
      );

    const configuracao = configuracaoSalva
      ? JSON.parse(configuracaoSalva)
      : {};

    const quantidades = {
      quantidadeMultiplaEscolha:
        questao.tipo === "multipla_escolha"
          ? 1
          : 0,
      quantidadeDiscursivas:
        questao.tipo === "discursiva" ? 1 : 0,
      quantidadeVerdadeiroFalso:
        questao.tipo === "verdadeiro_falso"
          ? 1
          : 0,
      quantidadeComplete:
        questao.tipo === "complete" ? 1 : 0,
      quantidadeRelacione:
        questao.tipo === "relacione" ? 1 : 0,
    };

    try {
      const resposta = await fetch(
        "/api/gerar-plano",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tipo: "prova_json",
            ...configuracao,
            ...quantidades,
            totalQuestoes: 1,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível refazer a questão."
        );
      }

      const novaQuestao =
        dados.avaliacao?.questoes?.[0];

      if (!novaQuestao) {
        throw new Error(
          "A nova questão não foi retornada."
        );
      }

      atualizarQuestao(questao.id, {
        ...novaQuestao,
        id: questao.id,
        numero: questao.numero,
        imagemUrl: undefined,
      });

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível refazer a questão."
      );
    } finally {
      setQuestaoRefazendo(null);
    }
  }

  async function aplicarSugestao(
    questao: Questao
  ) {
    if (!avaliacao) return;

    const sugestao =
      sugestoes[questao.id]?.trim() || "";

    if (!sugestao) {
      setErro(
        "Escreva o que deseja mudar nesta questão."
      );
      return;
    }

    setErro("");
    setAplicandoSugestao(questao.id);

    const configuracaoSalva =
      localStorage.getItem(
        "configuracaoAvaliacao"
      );

    const configuracao = configuracaoSalva
      ? JSON.parse(configuracaoSalva)
      : {};

    const quantidades = {
      quantidadeMultiplaEscolha:
        questao.tipo === "multipla_escolha"
          ? 1
          : 0,
      quantidadeDiscursivas:
        questao.tipo === "discursiva" ? 1 : 0,
      quantidadeVerdadeiroFalso:
        questao.tipo === "verdadeiro_falso"
          ? 1
          : 0,
      quantidadeComplete:
        questao.tipo === "complete" ? 1 : 0,
      quantidadeRelacione:
        questao.tipo === "relacione" ? 1 : 0,
    };

    try {
      const resposta = await fetch(
        "/api/gerar-plano",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tipo: "prova_json",
            ...configuracao,
            ...quantidades,
            totalQuestoes: 1,
            sugestaoProfessor: sugestao,
            questaoAtual: questao,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível aplicar a sugestão."
        );
      }

      const novaQuestao =
        dados.avaliacao?.questoes?.[0];

      if (!novaQuestao) {
        throw new Error(
          "A questão alterada não foi retornada."
        );
      }

      atualizarQuestao(questao.id, {
        ...novaQuestao,
        id: questao.id,
        numero: questao.numero,
        imagemUrl: questao.imagemUrl,
      });

      setSugestoes((estadoAtual) => ({
        ...estadoAtual,
        [questao.id]: "",
      }));

      setSugestaoAberta(null);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível aplicar a sugestão."
      );
    } finally {
      setAplicandoSugestao(null);
    }
  }

  async function gerarImagemQuestao(
    questao: Questao
  ) {
    if (!questao.descricaoImagem.trim()) {
      setErro(
        "Esta questão não possui uma descrição de imagem."
      );
      return;
    }

    setErro("");
    setImagemGerando(questao.id);

    try {
      const resposta = await fetch(
        "/api/gerar-imagem-avaliacao",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            descricao:
              questao.descricaoImagem,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível gerar a imagem."
        );
      }

      atualizarQuestao(questao.id, {
        imagemUrl: dados.imagem,
        imagemNecessaria: true,
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a imagem."
      );
    } finally {
      setImagemGerando(null);
    }
  }

  function contarTiposQuestoes() {
    if (!avaliacao) {
      return {
        quantidadeMultiplaEscolha: 0,
        quantidadeDiscursivas: 0,
        quantidadeVerdadeiroFalso: 0,
        quantidadeComplete: 0,
        quantidadeRelacione: 0,
      };
    }

    return {
      quantidadeMultiplaEscolha:
        avaliacao.questoes.filter(
          (questao) =>
            questao.tipo === "multipla_escolha"
        ).length,

      quantidadeDiscursivas:
        avaliacao.questoes.filter(
          (questao) =>
            questao.tipo === "discursiva"
        ).length,

      quantidadeVerdadeiroFalso:
        avaliacao.questoes.filter(
          (questao) =>
            questao.tipo === "verdadeiro_falso"
        ).length,

      quantidadeComplete:
        avaliacao.questoes.filter(
          (questao) =>
            questao.tipo === "complete"
        ).length,

      quantidadeRelacione:
        avaliacao.questoes.filter(
          (questao) =>
            questao.tipo === "relacione"
        ).length,
    };
  }

  async function executarAcaoAvaliacao(
    acao: "corrigir" | "sugestao" | "refazer",
    instrucao: string
  ) {
    if (!avaliacao || acaoAvaliacao) return;

    const textoInstrucao = instrucao.trim();

    if (!textoInstrucao) {
      setErro(
        "Escreva o que deseja mudar na avaliação."
      );
      return;
    }

    setErro("");
    setAcaoAvaliacao(acao);

    const configuracaoSalva =
      localStorage.getItem(
        "configuracaoAvaliacao"
      );

    const configuracao = configuracaoSalva
      ? JSON.parse(configuracaoSalva)
      : {};

    const quantidades =
      contarTiposQuestoes();

    try {
      const resposta = await fetch(
        "/api/gerar-plano",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tipo: "prova_json",
            ...configuracao,
            ...quantidades,
            totalQuestoes:
              avaliacao.questoes.length,
            sugestaoProfessor:
              textoInstrucao,
            avaliacaoAtual:
              avaliacao,
          }),
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro ||
            "Não foi possível atualizar a avaliação."
        );
      }

      const novaAvaliacao =
        dados.avaliacao as
          | AvaliacaoJson
          | undefined;

      if (
        !novaAvaliacao ||
        !Array.isArray(
          novaAvaliacao.questoes
        )
      ) {
        throw new Error(
          "A inteligência artificial não retornou a avaliação atualizada."
        );
      }

      const questoesNormalizadas =
        novaAvaliacao.questoes.map(
          (questao, indice) => ({
            ...questao,
            id:
              questao.id ||
              `questao-${Date.now()}-${indice}`,
            numero: indice + 1,
            alternativas:
              questao.alternativas || [],
            afirmativas:
              questao.afirmativas || [],
            bancoPalavras:
              questao.bancoPalavras || [],
            frasesComplete:
              questao.frasesComplete || [],
            colunaA:
              questao.colunaA || [],
            colunaB:
              questao.colunaB || [],
          })
        );

      salvarAvaliacao({
        ...avaliacao,
        ...novaAvaliacao,
        titulo:
          novaAvaliacao.titulo ||
          avaliacao.titulo,
        questoes:
          questoesNormalizadas,
      });

      if (acao === "sugestao") {
        setSugestaoAvaliacao("");
        setSugestaoAvaliacaoAberta(
          false
        );
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a avaliação."
      );
    } finally {
      setAcaoAvaliacao(null);
    }
  }

  async function montarAvaliacao() {
    if (!avaliacao || salvando) return;

    if (avaliacao.questoes.length === 0) {
      setErro(
        "A avaliação precisa ter pelo menos uma questão."
      );
      return;
    }

    setErro("");
    setSalvando(true);

    try {
      const habilidadesHtml =
        avaliacao.habilidadesBncc?.length > 0
          ? `
            <div style="margin-bottom:18px;">
              <p style="margin:0 0 6px;font-weight:700;">
                HABILIDADES DA BNCC
              </p>

              <p style="margin:0;line-height:1.6;">
                ${avaliacao.habilidadesBncc
                  .map((habilidade) =>
                    escaparHtml(habilidade)
                  )
                  .join("; ")}
              </p>
            </div>
          `
          : "";

      const textoApoioHtml =
        avaliacao.textoApoio?.trim()
          ? `
            <div style="margin-bottom:20px;">
              <p style="margin:0 0 6px;font-weight:700;">
                TEXTO DE APOIO
              </p>

              <p style="margin:0;line-height:1.7;text-align:justify;white-space:pre-line;">
                ${escaparHtml(
                  avaliacao.textoApoio
                )}
              </p>
            </div>
          `
          : "";

      const html = `
        <div style="text-align:center;font-size:18px;font-weight:700;margin-bottom:24px;">
          ${escaparHtml(avaliacao.titulo)}
        </div>

        ${habilidadesHtml}

        ${textoApoioHtml}

        ${avaliacao.questoes
          .map((questao, indice) =>
            montarHtmlQuestao(
              questao,
              indice + 1
            )
          )
          .join("")}
      `;

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario) {
        throw new Error(
          "Não foi possível identificar o professor conectado."
        );
      }

      if (!user) {
        throw new Error(
          "Entre na sua conta para salvar a avaliação."
        );
      }

      const configuracaoSalva =
        localStorage.getItem(
          "configuracaoAvaliacao"
        );

      let configuracao: Record<
        string,
        unknown
      > = {};

      if (configuracaoSalva) {
        try {
          configuracao = JSON.parse(
            configuracaoSalva
          );
        } catch {
          configuracao = {};
        }
      }

      const {
        data: avaliacaoSalva,
        error: erroSalvar,
      } = await supabase
        .from("avaliacoes")
        .insert({
          usuario_id: user.id,
          titulo:
            avaliacao.titulo ||
            `Avaliação de ${avaliacao.disciplina}`,
          etapa_ensino:
            avaliacao.etapaEnsino,
          serie: avaliacao.serie,
          disciplina:
            avaliacao.disciplina,
          conteudos:
            typeof configuracao.conteudos ===
            "string"
              ? configuracao.conteudos
              : "",
          avaliacao_completa: html,
          configuracao: {
            ...configuracao,
            avaliacaoJson: avaliacao,
          },
          status: "finalizada",
        })
        .select("id")
        .single();

      if (erroSalvar) {
        console.error(
          "Erro ao salvar avaliação:",
          erroSalvar
        );

        throw new Error(
          "A avaliação foi montada, mas não foi possível salvá-la."
        );
      }

      localStorage.setItem(
        "provaGeradaEditada",
        html
      );

      localStorage.setItem(
        "provaGerada",
        avaliacao.titulo
      );

      localStorage.setItem(
        "avaliacaoId",
        avaliacaoSalva.id
      );

      router.push(
        `/avaliacoes/resultado?id=${avaliacaoSalva.id}`
      );
    } catch (error) {
      console.error(
        "Erro ao montar avaliação:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível montar e salvar a avaliação."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopoAvaliacoes
          destinoVoltar="/avaliacoes"
          textoVoltar="Voltar às avaliações"
        />

        <div className="flex min-h-[500px] items-center justify-center gap-2 text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Carregando questões...
        </div>
      </main>
    );
  }

  if (!avaliacao) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopoAvaliacoes
          destinoVoltar="/avaliacoes"
          textoVoltar="Voltar às avaliações"
        />

        <div className="mx-auto flex min-h-[500px] max-w-4xl flex-col items-center justify-center px-4 text-center">
          <FileText
            size={42}
            className="mb-3 text-slate-300"
          />

          <p className="font-bold text-slate-700">
            Nenhuma avaliação foi encontrada.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/avaliacoes")
            }
            className="mt-4 cursor-pointer rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white"
          >
            Gerar avaliação
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopoAvaliacoes
        destinoVoltar="/avaliacoes"
        textoVoltar="Voltar às avaliações"
      />

      <section className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-5 rounded-2xl border-2 border-green-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-green-700">
            Revisão da avaliação
          </p>

          <h1 className="mt-1 text-xl font-extrabold text-slate-900">
            {avaliacao.titulo}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {avaliacao.serie} •{" "}
            {avaliacao.disciplina} •{" "}
            {avaliacao.questoes.length} questões
          </p>
        </div>

        {erro && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {erro}
          </div>
        )}

        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 p-4">
            <button
              type="button"
              onClick={() =>
                executarAcaoAvaliacao(
                  "corrigir",
                  "Corrija somente erros de ortografia, gramática, clareza, coerência, numeração e formatação desta avaliação. Preserve os conteúdos, os tipos de questão, a quantidade de questões, as imagens e o nível de dificuldade. Não troque questões corretas sem necessidade."
                )
              }
              disabled={acaoAvaliacao !== null}
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-green-300 bg-white px-4 py-2.5 text-sm font-extrabold text-green-800 transition hover:border-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {acaoAvaliacao === "corrigir" ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Sparkles size={17} />
              )}
              Corrigir avaliação
            </button>

            <button
              type="button"
              onClick={() =>
                setSugestaoAvaliacaoAberta(
                  (aberta) => !aberta
                )
              }
              disabled={acaoAvaliacao !== null}
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-emerald-300 bg-white px-4 py-2.5 text-sm font-extrabold text-emerald-800 transition hover:border-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MessageSquareText size={17} />
              Minhas sugestões
            </button>

            <button
              type="button"
              onClick={() =>
                executarAcaoAvaliacao(
                  "refazer",
                  "Refaça toda a avaliação mantendo a mesma etapa de ensino, série, disciplina, conteúdos, quantidade total e distribuição dos tipos de questão. Crie questões novas, claras e adequadas ao nível solicitado."
                )
              }
              disabled={acaoAvaliacao !== null}
              className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-blue-300 bg-white px-4 py-2.5 text-sm font-extrabold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {acaoAvaliacao === "refazer" ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={17} />
              )}
              Refazer avaliação
            </button>
          </div>

          {sugestaoAvaliacaoAberta && (
            <div className="border-t border-slate-200 bg-green-50/50 p-4">
              <label className="mb-2 block text-sm font-extrabold text-slate-900">
                O que você deseja mudar na avaliação?
              </label>

              <textarea
                value={sugestaoAvaliacao}
                onChange={(event) =>
                  setSugestaoAvaliacao(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Exemplo: deixe a avaliação mais fácil; troque duas questões por situações do cotidiano; melhore os enunciados; use linguagem mais simples; aumente o espaço das discursivas."
                className="w-full resize-y rounded-xl border-2 border-green-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-200"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    executarAcaoAvaliacao(
                      "sugestao",
                      sugestaoAvaliacao
                    )
                  }
                  disabled={
                    acaoAvaliacao !== null ||
                    !sugestaoAvaliacao.trim()
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {acaoAvaliacao === "sugestao" ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Sparkles size={17} />
                  )}
                  Aplicar sugestão
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSugestaoAvaliacaoAberta(
                      false
                    )
                  }
                  className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[850px] border border-slate-300 bg-white px-6 py-8 shadow-md sm:px-10 sm:py-10">
          <div className="mb-8 text-center">
            <input
              value={avaliacao.titulo}
              onChange={(event) =>
                salvarAvaliacao({
                  ...avaliacao,
                  titulo:
                    event.target.value,
                })
              }
              className="w-full bg-transparent text-center text-xl font-extrabold text-slate-950 outline-none"
            />
          </div>

          {avaliacao.habilidadesBncc?.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-extrabold text-slate-900">
                HABILIDADES DA BNCC
              </p>

              <p className="text-sm leading-6 text-slate-800">
                {avaliacao.habilidadesBncc.join(
                  "; "
                )}
              </p>
            </div>
          )}

          {avaliacao.textoApoio?.trim() && (
            <div className="mb-8">
              <p className="mb-2 text-sm font-extrabold text-slate-900">
                TEXTO DE APOIO
              </p>

              <textarea
                value={avaliacao.textoApoio}
                onChange={(event) =>
                  salvarAvaliacao({
                    ...avaliacao,
                    textoApoio:
                      event.target.value,
                  })
                }
                rows={Math.max(
                  5,
                  avaliacao.textoApoio
                    .split("\n").length + 2
                )}
                className="w-full resize-y border-0 bg-transparent p-0 font-serif text-[16px] leading-7 text-slate-900 outline-none"
              />
            </div>
          )}

          <div className="space-y-8">
            {avaliacao.questoes.map(
              (questao, indice) => (
                <section
                  key={questao.id}
                  className="relative"
                >
                  <button
                    type="button"
                    title="Excluir questão"
                    onClick={() =>
                      excluirQuestao(
                        questao.id
                      )
                    }
                    className="absolute right-0 top-0 cursor-pointer rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="pr-8">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Questão {indice + 1} •{" "}
                      {nomeTipo(
                        questao.tipo
                      )}
                    </p>

                    {(questao.tipo ===
                      "multipla_escolha" ||
                      questao.tipo ===
                        "verdadeiro_falso" ||
                      questao.tipo ===
                        "complete") && (
                      <textarea
                        value={montarTextoEditorQuestao(
                          questao
                        )}
                        onChange={(event) =>
                          atualizarTextoEditor(
                            questao,
                            event.target.value
                          )
                        }
                        rows={Math.max(
                          6,
                          questao.tipo ===
                            "multipla_escolha"
                            ? questao.alternativas
                                .length + 4
                            : questao.tipo ===
                                "verdadeiro_falso"
                              ? questao
                                  .afirmativas
                                  .length + 4
                              : questao
                                  .frasesComplete
                                  .length + 6
                        )}
                        className="w-full resize-y border border-transparent bg-transparent px-1 py-1 font-serif text-[16px] leading-8 text-slate-950 outline-none transition hover:border-slate-200 focus:border-green-300"
                      />
                    )}

                    {questao.tipo ===
                      "discursiva" && (
                      <>
                        <textarea
                          value={
                            questao.enunciado
                          }
                          onChange={(event) =>
                            atualizarQuestao(
                              questao.id,
                              {
                                enunciado:
                                  event.target
                                    .value,
                              }
                            )
                          }
                          rows={3}
                          className="w-full resize-y border border-transparent bg-transparent px-1 py-1 font-serif text-[16px] leading-8 text-slate-950 outline-none transition hover:border-slate-200 focus:border-green-300"
                        />

                        <div className="mt-2 space-y-4">
                          {Array.from({
                            length: Math.max(
                              1,
                              Math.min(
                                6,
                                Number(
                                  questao.linhasResposta ||
                                    3
                                )
                              )
                            ),
                          }).map((_, linha) => (
                            <div
                              key={linha}
                              className="h-7 border-b border-slate-500"
                            />
                          ))}
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <span>
                            Linhas para resposta:
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={
                              questao.linhasResposta
                            }
                            onChange={(
                              event
                            ) =>
                              atualizarQuestao(
                                questao.id,
                                {
                                  linhasResposta:
                                    Number(
                                      event.target
                                        .value
                                    ),
                                }
                              )
                            }
                            className="w-16 rounded border border-slate-200 px-2 py-1 outline-none focus:border-green-500"
                          />
                        </div>
                      </>
                    )}

                    {questao.tipo ===
                      "relacione" && (
                      <>
                        <textarea
                          value={
                            questao.enunciado
                          }
                          onChange={(event) =>
                            atualizarQuestao(
                              questao.id,
                              {
                                enunciado:
                                  event.target
                                    .value,
                              }
                            )
                          }
                          rows={3}
                          className="mb-3 w-full resize-y border border-transparent bg-transparent px-1 py-1 font-serif text-[16px] leading-8 text-slate-950 outline-none transition hover:border-slate-200 focus:border-green-300"
                        />

                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <p className="mb-2 text-center text-sm font-extrabold text-slate-800">
                              COLUNA A
                            </p>
                            <textarea
                              value={questao.colunaA
                                .map(
                                  (
                                    item,
                                    itemIndice
                                  ) =>
                                    `${itemIndice + 1}. ${item}`
                                )
                                .join("\n")}
                              onChange={(
                                event
                              ) => {
                                const colunaA =
                                  event.target.value
                                    .split("\n")
                                    .map(
                                      (
                                        linha
                                      ) =>
                                        linha.replace(
                                          /^\s*\d+\s*[\.\)\-:]\s*/,
                                          ""
                                        )
                                    );

                                atualizarQuestao(
                                  questao.id,
                                  { colunaA }
                                );
                              }}
                              rows={Math.max(
                                6,
                                questao.colunaA
                                  .length + 1
                              )}
                              className="w-full resize-y border border-slate-200 bg-transparent px-3 py-3 font-serif text-[16px] leading-8 text-slate-950 outline-none focus:border-green-400"
                            />
                          </div>

                          <div>
                            <p className="mb-2 text-center text-sm font-extrabold text-slate-800">
                              COLUNA B
                            </p>
                            <textarea
                              value={questao.colunaB
                                .map(
                                  (
                                    item,
                                    itemIndice
                                  ) =>
                                    `${String.fromCharCode(
                                      65 +
                                        itemIndice
                                    )}. ${item}`
                                )
                                .join("\n")}
                              onChange={(
                                event
                              ) => {
                                const colunaB =
                                  event.target.value
                                    .split("\n")
                                    .map(
                                      (
                                        linha
                                      ) =>
                                        linha.replace(
                                          /^\s*[A-Za-z]\s*[\.\)\-:]\s*/,
                                          ""
                                        )
                                    );

                                atualizarQuestao(
                                  questao.id,
                                  { colunaB }
                                );
                              }}
                              rows={Math.max(
                                6,
                                questao.colunaB
                                  .length + 1
                              )}
                              className="w-full resize-y border border-slate-200 bg-transparent px-3 py-3 font-serif text-[16px] leading-8 text-slate-950 outline-none focus:border-green-400"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {questao.imagemUrl && (
                      <div className="mt-4">
                        <img
                          src={
                            questao.imagemUrl
                          }
                          alt={
                            questao.descricaoImagem ||
                            "Imagem da questão"
                          }
                          className="mx-auto max-h-[340px] max-w-full object-contain"
                        />
                      </div>
                    )}

                    {(questao.imagemNecessaria ||
                      questao.descricaoImagem ||
                      questao.imagemUrl) && (
                      <div className="mt-3">
                        <textarea
                          value={
                            questao.descricaoImagem
                          }
                          onChange={(event) =>
                            atualizarQuestao(
                              questao.id,
                              {
                                descricaoImagem:
                                  event.target
                                    .value,
                              }
                            )
                          }
                          rows={2}
                          placeholder="Descrição da imagem"
                          className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600 outline-none focus:border-green-400"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            gerarImagemQuestao(
                              questao
                            )
                          }
                          disabled={
                            imagemGerando ===
                            questao.id
                          }
                          className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-green-300 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {imagemGerando ===
                          questao.id ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <ImagePlus
                              size={15}
                            />
                          )}
                          {questao.imagemUrl
                            ? "Refazer imagem"
                            : "Gerar imagem"}
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={montarAvaliacao}
            disabled={salvando}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-green-700 px-7 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-400"
          >
            {salvando ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Salvando avaliação...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Montar avaliação
              </>
            )}
          </button>
        </div>
      </section>
    </main>
  );
}