"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Columns2,
  FileText,
  GraduationCap,
  ImagePlus,
  Italic,
  LayoutPanelTop,
  Loader2,
  Redo2,
  Save,
  Underline,
  Undo2,
} from "lucide-react";

import TopoAvaliacoes from "../componentes/TopoAvaliacoes";
import { exportarAvaliacao } from "../utils/exportarAvaliacao";
import { exportarAvaliacaoWord } from "../utils/exportarAvaliacaoWord";
import CabecalhoEscolar from "@/app/componentes/CabecalhoEscolar/CabecalhoEscolar";

function textoParaHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "<br>");
}

type ImagemSugerida = {
  marcacao: string;
  descricao: string;
};

function encontrarImagensSugeridas(
  texto: string
): ImagemSugerida[] {
  const regex =
    /\[IMAGEM SUGERIDA:\s*([^\]]+)\]/gi;

  return Array.from(texto.matchAll(regex)).map(
    (resultado) => ({
      marcacao: resultado[0],
      descricao: resultado[1].trim(),
    })
  );
}


function sanitizarHtmlCabecalho(html: string) {
  if (!html.trim()) {
    return "";
  }

  const container =
    document.createElement("div");

  container.innerHTML = html;

  /*
   * Remove elementos que podem trazer CSS do Word/Google Docs
   * para fora do cabeçalho e afetar a avaliação inteira.
   */
  container
    .querySelectorAll(
      "style, script, link, meta, iframe, object, embed"
    )
    .forEach((elemento) => elemento.remove());

  container
    .querySelectorAll<HTMLElement>("*")
    .forEach((elemento) => {
      /*
       * Remove eventos e atributos que não são necessários
       * para o cabeçalho.
       */
      Array.from(elemento.attributes).forEach(
        (atributo) => {
          const nome =
            atributo.name.toLowerCase();

          if (
            nome.startsWith("on") ||
            nome === "id"
          ) {
            elemento.removeAttribute(
              atributo.name
            );
          }
        }
      );

      const estilo = elemento.style;

      /*
       * Estes estilos são os que mais causam o problema
       * de jogar a avaliação para a lateral da folha.
       */
      [
        "position",
        "float",
        "left",
        "right",
        "top",
        "bottom",
        "transform",
        "translate",
        "margin-left",
        "margin-right",
        "min-width",
        "max-width",
      ].forEach((propriedade) => {
        estilo.removeProperty(propriedade);
      });

      /*
       * Larguras fixas vindas do Word podem ultrapassar
       * a folha. Tabelas e blocos passam a obedecer a
       * largura útil definida pelo PlanejAI.
       */
      if (
        elemento.tagName !== "IMG"
      ) {
        estilo.removeProperty("width");
      }

      if (
        elemento.tagName === "TABLE"
      ) {
        estilo.setProperty(
          "width",
          "100%"
        );
        estilo.setProperty(
          "max-width",
          "100%"
        );
        estilo.setProperty(
          "table-layout",
          "fixed"
        );
        estilo.setProperty(
          "border-collapse",
          "collapse"
        );
      }

      if (
        elemento.tagName === "IMG"
      ) {
        estilo.setProperty(
          "max-width",
          "120px"
        );
        estilo.setProperty(
          "max-height",
          "80px"
        );
        estilo.setProperty(
          "width",
          "auto"
        );
        estilo.setProperty(
          "height",
          "auto"
        );
        estilo.setProperty(
          "object-fit",
          "contain"
        );
      }
    });

  return container.innerHTML;
}

export default function ResultadoAvaliacaoPage() {
  const [conteudoAluno, setConteudoAluno] =
    useState("");
  const [cabecalho, setCabecalho] =
    useState("");
  const [carregando, setCarregando] =
    useState(true);
  const [duasColunas, setDuasColunas] =
    useState(false);
  const [cabecalhoSalvo, setCabecalhoSalvo] =
    useState(false);
  const [gerandoImagens, setGerandoImagens] =
    useState(false);
  const [progressoImagens, setProgressoImagens] =
    useState("");
  const [mensagemImagens, setMensagemImagens] =
    useState("");

  const editorRef = useRef<HTMLDivElement>(null);
  const cabecalhoRef =
    useRef<HTMLDivElement>(null);
  const documentoRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const provaGerada =
      localStorage.getItem("provaGerada") || "";

    let provaEditada = "";

    try {
      const provaSalva = provaGerada
        ? JSON.parse(provaGerada)
        : null;

      const avaliacaoId =
        provaSalva &&
        typeof provaSalva === "object"
          ? provaSalva.id
          : null;

      if (avaliacaoId) {
        provaEditada =
          localStorage.getItem(
            `provaGeradaEditada:${avaliacaoId}`
          ) || "";
      }
    } catch {
      provaEditada = "";
    }

    const cabecalhoBruto =
      localStorage.getItem(
        "cabecalhoAvaliacao"
      ) || "";

    const cabecalhoSalvoLocal =
      sanitizarHtmlCabecalho(
        cabecalhoBruto
      );

    if (
      cabecalhoSalvoLocal &&
      cabecalhoSalvoLocal !==
        cabecalhoBruto
    ) {
      localStorage.setItem(
        "cabecalhoAvaliacao",
        cabecalhoSalvoLocal
      );
    }

    let conteudoInicial = provaEditada;

    if (!conteudoInicial && provaGerada) {
      try {
        const provaSalva = JSON.parse(provaGerada);

        if (
          provaSalva &&
          typeof provaSalva === "object" &&
          typeof provaSalva.avaliacaoCompleta === "string"
        ) {
          conteudoInicial =
            provaSalva.avaliacaoCompleta;
        } else if (
          typeof provaSalva === "string"
        ) {
          conteudoInicial =
            textoParaHtml(provaSalva);
        } else {
          conteudoInicial =
            textoParaHtml(provaGerada);
        }
      } catch {
        conteudoInicial =
          textoParaHtml(provaGerada);
      }
    }

    setConteudoAluno(conteudoInicial);
    setCabecalho(cabecalhoSalvoLocal);
    setCabecalhoSalvo(
      Boolean(cabecalhoSalvoLocal.trim())
    );
    setCarregando(false);
  }, []);

  function arquivoParaDataUrl(
    arquivo: File
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onload = () => {
        if (typeof leitor.result === "string") {
          resolve(leitor.result);
          return;
        }

        reject(
          new Error(
            "Não foi possível converter a imagem."
          )
        );
      };

      leitor.onerror = () => {
        reject(
          new Error(
            "Não foi possível ler a imagem."
          )
        );
      };

      leitor.readAsDataURL(arquivo);
    });
  }

  async function incorporarImagensDoCabecalho() {
    const editor = cabecalhoRef.current;

    if (!editor) {
      return;
    }

    const imagens = Array.from(
      editor.querySelectorAll<HTMLImageElement>("img")
    );

    for (const imagem of imagens) {
      const origem = imagem.getAttribute("src") || "";

      if (!origem || origem.startsWith("data:")) {
        continue;
      }

      try {
        const resposta = await fetch(origem);

        if (!resposta.ok) {
          continue;
        }

        const blob = await resposta.blob();

        if (!blob.type.startsWith("image/")) {
          continue;
        }

        const arquivo = new File(
          [blob],
          "imagem-cabecalho",
          { type: blob.type }
        );

        imagem.src =
          await arquivoParaDataUrl(arquivo);
      } catch {
        /*
         * Algumas imagens vindas do Word usam uma
         * origem local/temporária que o navegador
         * não permite acessar. Nesse caso mantemos
         * a colagem sem interromper o cabeçalho.
         */
      }
    }
  }

  async function processarColagemCabecalho(
    evento: React.ClipboardEvent<HTMLDivElement>
  ) {
    const clipboard =
      evento.clipboardData;

    if (!clipboard) {
      return;
    }

    const itens = Array.from(
      clipboard.items || []
    );

    const arquivosImagem = itens
      .filter(
        (item) =>
          item.kind === "file" &&
          item.type.startsWith("image/")
      )
      .map((item) => item.getAsFile())
      .filter(
        (arquivo): arquivo is File =>
          Boolean(arquivo)
      );

    const htmlColado =
      clipboard.getData("text/html");

    /*
     * O Word pode enviar a tabela em HTML e a logo/slogan
     * separadamente como arquivo. Tratamos os dois juntos.
     */
    if (htmlColado) {
      evento.preventDefault();

      try {
        const container =
          document.createElement("div");

        container.innerHTML =
          sanitizarHtmlCabecalho(
            htmlColado
          );

        const imagensHtml = Array.from(
          container.querySelectorAll<HTMLImageElement>(
            "img"
          )
        );

        const imagensBase64: string[] =
          [];

        for (
          const arquivo of arquivosImagem
        ) {
          imagensBase64.push(
            await arquivoParaDataUrl(
              arquivo
            )
          );
        }

        if (
          imagensBase64.length > 0
        ) {
          if (
            imagensHtml.length > 0
          ) {
            imagensHtml.forEach(
              (imagemHtml, indice) => {
                const dataUrl =
                  imagensBase64[
                    Math.min(
                      indice,
                      imagensBase64.length - 1
                    )
                  ];

                if (dataUrl) {
                  imagemHtml.src =
                    dataUrl;
                  imagemHtml.removeAttribute(
                    "srcset"
                  );
                }
              }
            );
          } else {
            const primeiraCelula =
              container.querySelector<HTMLElement>(
                "td, th"
              );

            const destino =
              primeiraCelula ||
              container;

            imagensBase64.forEach(
              (dataUrl) => {
                const imagem =
                  document.createElement(
                    "img"
                  );

                imagem.src = dataUrl;
                imagem.alt =
                  "Imagem do cabeçalho";
                imagem.style.maxWidth =
                  "120px";
                imagem.style.maxHeight =
                  "80px";
                imagem.style.width =
                  "auto";
                imagem.style.height =
                  "auto";
                imagem.style.objectFit =
                  "contain";
                imagem.style.display =
                  "block";
                imagem.style.margin =
                  "0 auto";

                destino.prepend(
                  imagem
                );
              }
            );
          }
        }

        document.execCommand(
          "insertHTML",
          false,
          container.innerHTML
        );

        await incorporarImagensDoCabecalho();

        const htmlAtual =
          sanitizarHtmlCabecalho(
            cabecalhoRef.current
              ?.innerHTML || ""
          );

        if (cabecalhoRef.current) {
          cabecalhoRef.current.innerHTML =
            htmlAtual;
        }

        setCabecalho(htmlAtual);
        setCabecalhoSalvo(false);
      } catch (error) {
        console.error(
          "Erro ao colar cabeçalho com imagem:",
          error
        );
      }

      return;
    }

    if (
      arquivosImagem.length > 0
    ) {
      evento.preventDefault();

      try {
        for (
          const arquivo of arquivosImagem
        ) {
          const dataUrl =
            await arquivoParaDataUrl(
              arquivo
            );

          document.execCommand(
            "insertImage",
            false,
            dataUrl
          );
        }

        const htmlAtual =
          sanitizarHtmlCabecalho(
            cabecalhoRef.current
              ?.innerHTML || ""
          );

        if (cabecalhoRef.current) {
          cabecalhoRef.current.innerHTML =
            htmlAtual;
        }

        setCabecalho(htmlAtual);
        setCabecalhoSalvo(false);
      } catch (error) {
        console.error(
          "Erro ao colar imagem no cabeçalho:",
          error
        );
      }

      return;
    }

    window.setTimeout(() => {
      const htmlAtual =
        sanitizarHtmlCabecalho(
          cabecalhoRef.current
            ?.innerHTML || ""
        );

      if (cabecalhoRef.current) {
        cabecalhoRef.current.innerHTML =
          htmlAtual;
      }

      setCabecalho(htmlAtual);
      setCabecalhoSalvo(false);
    }, 0);
  }

  function executarComando(
    comando: string,
    valor?: string
  ) {
    document.execCommand(
      comando,
      false,
      valor
    );
    editorRef.current?.focus();
  }

  function salvarCabecalho() {
    const novoCabecalho =
      sanitizarHtmlCabecalho(
        cabecalhoRef.current
          ?.innerHTML || ""
      );

    if (cabecalhoRef.current) {
      cabecalhoRef.current.innerHTML =
        novoCabecalho;
    }

    const cabecalhoSomenteTexto =
      cabecalhoRef.current?.innerText.trim() ||
      "";

    const possuiImagem = Boolean(
      cabecalhoRef.current?.querySelector(
        "img"
      )
    );

    if (
      !cabecalhoSomenteTexto &&
      !possuiImagem
    ) {
      localStorage.removeItem(
        "cabecalhoAvaliacao"
      );
      setCabecalho("");
      setCabecalhoSalvo(false);
      return;
    }

    localStorage.setItem(
      "cabecalhoAvaliacao",
      novoCabecalho
    );

    setCabecalho(novoCabecalho);
    setCabecalhoSalvo(true);
  }

  function salvarConteudoAtual() {
    const provaEditada =
      editorRef.current?.innerHTML || "";

    try {
      const provaGerada =
        localStorage.getItem("provaGerada") || "";

      const provaSalva = provaGerada
        ? JSON.parse(provaGerada)
        : null;

      const avaliacaoId =
        provaSalva &&
        typeof provaSalva === "object"
          ? provaSalva.id
          : null;

      if (avaliacaoId) {
        localStorage.setItem(
          `provaGeradaEditada:${avaliacaoId}`,
          provaEditada
        );
      }

      return true;
    } catch {
      setMensagemImagens(
        "As imagens foram inseridas, mas o navegador não conseguiu salvá-las localmente por falta de espaço."
      );
      return false;
    }
  }

  function salvarAlteracoesProva() {
    salvarConteudoAtual();
  }

  function alternarColunas() {
    setDuasColunas(
      (valorAtual) => !valorAtual
    );
  }

  function substituirMarcacaoPorImagem(
    marcacao: string,
    descricao: string,
    imagem: string
  ) {
    const editor = editorRef.current;

    if (!editor) {
      return false;
    }

    const leitor = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT
    );

    let noAtual = leitor.nextNode();

    while (noAtual) {
      const textoAtual =
        noAtual.nodeValue || "";
      const posicao =
        textoAtual.indexOf(marcacao);

      if (posicao !== -1) {
        const antes = textoAtual.slice(
          0,
          posicao
        );
        const depois = textoAtual.slice(
          posicao + marcacao.length
        );

        const fragmento =
          document.createDocumentFragment();

        if (antes) {
          fragmento.appendChild(
            document.createTextNode(antes)
          );
        }

        const blocoImagem =
          document.createElement("div");

        blocoImagem.setAttribute(
          "data-imagem-avaliacao",
          "true"
        );
        blocoImagem.style.textAlign = "center";
        blocoImagem.style.margin = "16px 0";
        blocoImagem.style.breakInside = "avoid";
        blocoImagem.contentEditable = "false";
        blocoImagem.style.display = "block";
        blocoImagem.style.width = "100%";
        blocoImagem.style.maxWidth = "100%";
        blocoImagem.style.height = "auto";
        blocoImagem.style.overflow = "hidden";

        const elementoImagem =
          document.createElement("img");

        elementoImagem.src = imagem;
        elementoImagem.alt = descricao;
        elementoImagem.style.display = "block";
        elementoImagem.style.width = "100px";
        elementoImagem.style.maxWidth = "100%";
        elementoImagem.style.height = "auto";
        elementoImagem.style.objectFit = "contain";
        elementoImagem.style.margin = "0 auto";
        elementoImagem.contentEditable = "false";
        elementoImagem.style.cursor = "pointer";
        elementoImagem.tabIndex = 0;
elementoImagem.addEventListener("click", () => {
  elementoImagem.focus();
});
elementoImagem.addEventListener("focus", () => {
  elementoImagem.style.outline =
    "3px solid #15803d";
  elementoImagem.style.outlineOffset = "3px";
});
elementoImagem.addEventListener("blur", () => {
  elementoImagem.style.outline = "none";
});
        elementoImagem.style.margin = "0 auto";
        elementoImagem.style.border = "1px solid #cbd5e1";
        elementoImagem.style.borderRadius = "8px";
        elementoImagem.draggable = false;
        elementoImagem.style.pointerEvents = "none";

        blocoImagem.appendChild(
          elementoImagem
        );
        fragmento.appendChild(blocoImagem);

        if (depois) {
          fragmento.appendChild(
            document.createTextNode(depois)
          );
        }

        noAtual.parentNode?.replaceChild(
          fragmento,
          noAtual
        );

        return true;
      }

      noAtual = leitor.nextNode();
    }

    return false;
  }

  async function gerarTodasAsImagens() {
    const editor = editorRef.current;

    if (!editor || gerandoImagens) {
      return;
    }

    setMensagemImagens("");

    const imagensSugeridas =
      encontrarImagensSugeridas(
        editor.innerText
      );

    if (imagensSugeridas.length === 0) {
      setMensagemImagens(
        "Esta avaliação não possui sugestões de imagens para gerar."
      );
      return;
    }

    try {
      setGerandoImagens(true);

      let imagensInseridas = 0;

      for (
        let indice = 0;
        indice < imagensSugeridas.length;
        indice += 1
      ) {
        const item = imagensSugeridas[indice];

        setProgressoImagens(
          `Gerando imagem ${indice + 1} de ${imagensSugeridas.length}...`
        );

        const resposta = await fetch(
          "/api/gerar-imagem-avaliacao",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              descricao: item.descricao,
            }),
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.erro ||
              `Não foi possível gerar a imagem ${indice + 1}.`
          );
        }

        const foiSubstituida =
          substituirMarcacaoPorImagem(
            item.marcacao,
            item.descricao,
            dados.imagem
          );

        if (foiSubstituida) {
          imagensInseridas += 1;
          salvarConteudoAtual();
        }
      }

      setMensagemImagens(
        `${imagensInseridas} ${
          imagensInseridas === 1
            ? "imagem foi gerada e inserida"
            : "imagens foram geradas e inseridas"
        } na avaliação.`
      );
    } catch (error) {
      console.error(
        "Erro ao gerar imagens:",
        error
      );

      setMensagemImagens(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar as imagens."
      );
    } finally {
      setGerandoImagens(false);
      setProgressoImagens("");
    }
  }

  async function baixarPDF() {
    const documento = documentoRef.current;

    if (!documento) {
      alert(
        "Não foi possível localizar a avaliação."
      );
      return;
    }

    const textoAvaliacao =
      editorRef.current?.innerText.trim() || "";

    if (!textoAvaliacao) {
      alert(
        "Nenhuma avaliação foi encontrada."
      );
      return;
    }

    try {
      salvarConteudoAtual();

      await exportarAvaliacao(
        documento,
        {
          tituloArquivo: "avaliacao",
        }
      );
    } catch (error) {
      console.error(
        "Erro ao exportar PDF:",
        error
      );

      alert(
        "Não foi possível preparar o PDF da avaliação."
      );
    }
  }

  async function baixarWord() {
  const avaliacaoElemento =
    editorRef.current;

  if (!avaliacaoElemento) {
    alert(
      "Não foi possível localizar a avaliação."
    );
    return;
  }

  const textoAvaliacao =
    avaliacaoElemento.innerText.trim();

  if (!textoAvaliacao) {
    alert(
      "Nenhuma avaliação foi encontrada."
    );
    return;
  }

  try {
    salvarConteudoAtual();

    await exportarAvaliacaoWord(
      cabecalhoRef.current,
      avaliacaoElemento,
      {
        tituloArquivo: "avaliacao",
        duasColunas,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao gerar Word:",
      error
    );

    alert(
      "Não foi possível gerar o arquivo Word."
    );
  }
}
  return (
    <main className="min-h-screen bg-slate-50">
      <style jsx global>{`
        .cabecalho-editor table,
        .cabecalho-preview table {
          width: 100% !important;
          border-collapse: collapse !important;
          table-layout: fixed;
        }

        .cabecalho-editor td,
        .cabecalho-editor th,
        .cabecalho-preview td,
        .cabecalho-preview th {
          border: 1px solid #000;
          box-sizing: border-box;
        }

        .cabecalho-editor img,
        .cabecalho-preview img {
          max-width: 120px;
          max-height: 80px;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        .cabecalho-editor:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }

        .cabecalho-editor p,
        .cabecalho-preview p {
          margin-top: 0;
          margin-bottom: 4px;
        }

        .cabecalho-editor,
        .cabecalho-preview {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
          float: none !important;
          clear: both !important;
        }

        .cabecalho-editor {
          overflow-x: auto;
        }

        .cabecalho-preview {
          overflow: visible;
        }

        .cabecalho-editor::after,
        .cabecalho-preview::after {
          content: "";
          display: block;
          clear: both;
        }

        .cabecalho-editor table,
        .cabecalho-preview table {
          display: table !important;
          width: 100% !important;
          max-width: 100% !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          float: none !important;
        }

        .cabecalho-editor > *,
        .cabecalho-preview > * {
          max-width: 100% !important;
          float: none !important;
        }

        .conteudo-avaliacao-tela {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          clear: both !important;
          float: none !important;
          position: relative !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        .conteudo-avaliacao-tela > * {
          max-width: 100% !important;
          float: none !important;
          position: static !important;
        }
      `}</style>

      <TopoAvaliacoes
        destinoVoltar="/avaliacoes"
        textoVoltar="Configurar avaliação"
      />

      <section className="mx-auto max-w-6xl px-4 py-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-center gap-2 bg-green-700 px-5 py-4 text-white">
            <GraduationCap size={23} />

            <h1 className="text-xl font-extrabold">
              Avaliação do aluno
            </h1>
          </div>

          <div className="p-5">
            <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
              Edite a avaliação, cole o
              cabeçalho da escola e organize o
              documento antes de baixar.
            </div>

            {!carregando && conteudoAluno && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <button
                  type="button"
                  title="Desfazer"
                  onClick={() =>
                    executarComando("undo")
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Undo2 size={18} />
                </button>

                <button
                  type="button"
                  title="Refazer"
                  onClick={() =>
                    executarComando("redo")
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Redo2 size={18} />
                </button>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <button
                  type="button"
                  title="Negrito"
                  onClick={() =>
                    executarComando("bold")
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Bold size={18} />
                </button>

                <button
                  type="button"
                  title="Itálico"
                  onClick={() =>
                    executarComando("italic")
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Italic size={18} />
                </button>

                <button
                  type="button"
                  title="Sublinhado"
                  onClick={() =>
                    executarComando(
                      "underline"
                    )
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Underline size={18} />
                </button>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <button
                  type="button"
                  title="Alinhar à esquerda"
                  onClick={() =>
                    executarComando(
                      "justifyLeft"
                    )
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignLeft size={18} />
                </button>

                <button
                  type="button"
                  title="Centralizar"
                  onClick={() =>
                    executarComando(
                      "justifyCenter"
                    )
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignCenter size={18} />
                </button>

                <button
                  type="button"
                  title="Alinhar à direita"
                  onClick={() =>
                    executarComando(
                      "justifyRight"
                    )
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignRight size={18} />
                </button>

                <button
                  type="button"
                  title="Justificar"
                  onClick={() =>
                    executarComando(
                      "justifyFull"
                    )
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignJustify size={18} />
                </button>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <select
                  title="Tamanho da fonte"
                  defaultValue="3"
                  onChange={(evento) =>
                    executarComando(
                      "fontSize",
                      evento.target.value
                    )
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="2">
                    Pequena
                  </option>
                  <option value="3">
                    Normal
                  </option>
                  <option value="4">
                    Média
                  </option>
                  <option value="5">
                    Grande
                  </option>
                </select>

                <button
                  type="button"
                  title={
                    duasColunas
                      ? "Usar uma coluna"
                      : "Usar duas colunas"
                  }
                  onClick={alternarColunas}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    duasColunas
                      ? "border-green-700 bg-green-50 text-green-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {duasColunas ? (
                    <LayoutPanelTop
                      size={18}
                    />
                  ) : (
                    <Columns2 size={18} />
                  )}

                  {duasColunas
                    ? "Uma coluna"
                    : "Duas colunas"}
                </button>

                <button
                  type="button"
                  onClick={
                    salvarAlteracoesProva
                  }
                  className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-green-800"
                >
                  <Save size={18} />
                  Salvar alterações
                </button>
              </div>
            )}

            {mensagemImagens && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                {mensagemImagens}
              </div>
            )}

            <div className="mb-5">
              <CabecalhoEscolar
                tipo="avaliacao"
                valor={cabecalho}
                onChange={(html) => {
                  setCabecalho(html);
                  setCabecalhoSalvo(false);
                }}
                chaveLocalStorage="cabecalhoAvaliacao"
                titulo="Cabeçalho da escola"
                descricao="Cole o cabeçalho usado pela escola e edite antes de salvar."
                onSalvar={(html) => {
                  setCabecalho(html);
                  setCabecalhoSalvo(
                    Boolean(html.trim())
                  );
                }}
              />
            </div>

            <div className="max-h-[760px] overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
              {carregando ? (
                <div className="flex min-h-[560px] items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Carregando avaliação...
                </div>
              ) : conteudoAluno ? (
                <div
                  ref={documentoRef}
                  className="mx-auto flex min-h-[1123px] w-full max-w-[794px] flex-col border-2 border-black bg-white px-8 py-10 shadow-md sm:px-12"
                >
                  {cabecalho.trim() && (
                    <div
                      ref={cabecalhoRef}
                      className="cabecalho-preview mb-5 w-full shrink-0"
                      dangerouslySetInnerHTML={{
                        __html: cabecalho,
                      }}
                    />
                  )}

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => {
                      salvarConteudoAtual();
                    }}
                    className={`conteudo-avaliacao-tela min-h-[760px] w-full flex-none break-words text-sm leading-7 text-slate-900 outline-none ${
                      duasColunas
                        ? "columns-2 gap-10 [column-rule:1px_solid_#cbd5e1]"
                        : "columns-1"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: conteudoAluno,
                    }}
                  />
                </div>
              ) : (
                <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                  <FileText
                    size={40}
                    className="mb-3 text-slate-300"
                  />

                  <p className="text-sm font-semibold text-slate-600">
                    Nenhuma avaliação foi
                    encontrada.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Volte à configuração e gere
                    uma nova avaliação.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={baixarWord}
                  className="cursor-pointer rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Baixar Word
                </button>

                <button
                  type="button"
                  onClick={baixarPDF}
                  className="cursor-pointer rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-green-800"
                >
                  Baixar PDF
                </button>

                <button
                  type="button"
                  className="cursor-pointer rounded-xl border border-green-700 px-5 py-3 text-sm font-extrabold text-green-800 transition hover:bg-green-50"
                >
                  Gerar versão do professor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}