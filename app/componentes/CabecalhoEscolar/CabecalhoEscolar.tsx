"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ImagePlus,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";

import type {
  CabecalhoEscolarProps,
} from "./tipos";

import {
  arquivoParaDataUrl,
  normalizarImagensCabecalho,
  sanitizarHtmlCabecalho,
} from "./utils";

export default function CabecalhoEscolar({
  valor,
  onChange,
  chaveLocalStorage,
  titulo = "Cabeçalho da escola",
  descricao = "Cole o cabeçalho usado pela escola e edite antes de salvar.",
  mostrarBotaoSalvar = true,
  onSalvar,
}: CabecalhoEscolarProps) {
  const editorRef =
    useRef<HTMLDivElement>(null);

  const inputImagemRef =
    useRef<HTMLInputElement>(null);

  const [salvo, setSalvo] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const htmlLimpo =
      sanitizarHtmlCabecalho(valor);

    if (
      editorRef.current.innerHTML !==
      htmlLimpo
    ) {
      editorRef.current.innerHTML =
        htmlLimpo;
    }

    normalizarImagensCabecalho(
      editorRef.current
    );
  }, [valor]);

  function atualizarEstado() {
    if (!editorRef.current) {
      return;
    }

    const html =
      sanitizarHtmlCabecalho(
        editorRef.current.innerHTML
      );

    editorRef.current.innerHTML =
      html;

    normalizarImagensCabecalho(
      editorRef.current
    );

    onChange(html);

    setSalvo(false);
    setMensagem("");
  }

  async function processarColagem(
    evento:
      React.ClipboardEvent<HTMLDivElement>
  ) {
    const clipboard =
      evento.clipboardData;

    if (!clipboard) {
      return;
    }

    const htmlColado =
      clipboard.getData("text/html");

    const itens = Array.from(
      clipboard.items || []
    );

    const arquivosImagem = itens
      .filter(
        (item) =>
          item.kind === "file" &&
          item.type.startsWith(
            "image/"
          )
      )
      .map(
        (item) =>
          item.getAsFile()
      )
      .filter(
        (
          arquivo
        ): arquivo is File =>
          Boolean(arquivo)
      );

    if (htmlColado) {
      evento.preventDefault();

      const container =
        document.createElement(
          "div"
        );

      container.innerHTML =
        sanitizarHtmlCabecalho(
          htmlColado
        );

      const imagensHtml =
        Array.from(
          container.querySelectorAll<HTMLImageElement>(
            "img"
          )
        );

      const imagensBase64:
        string[] = [];

      for (
        const arquivo of
        arquivosImagem
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
            (
              imagemHtml,
              indice
            ) => {
              const dataUrl =
                imagensBase64[
                  Math.min(
                    indice,
                    imagensBase64.length -
                      1
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

              imagem.src =
                dataUrl;

              imagem.alt =
                "Imagem do cabeçalho";

              imagem.style.maxWidth =
                "120px";

              imagem.style.maxHeight =
                "80px";

              imagem.style.height =
                "auto";

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

      window.setTimeout(
        atualizarEstado,
        0
      );

      return;
    }

    if (
      arquivosImagem.length > 0
    ) {
      evento.preventDefault();

      for (
        const arquivo of
        arquivosImagem
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

      atualizarEstado();
    }
  }

  async function adicionarImagem(
    arquivo?: File
  ) {
    if (
      !arquivo ||
      !editorRef.current
    ) {
      return;
    }

    const dataUrl =
      await arquivoParaDataUrl(
        arquivo
      );

    editorRef.current.focus();

    document.execCommand(
      "insertImage",
      false,
      dataUrl
    );

    atualizarEstado();
  }

  function limparCabecalho() {
    if (!editorRef.current) {
      return;
    }

    const confirmar =
      window.confirm(
        "Deseja apagar todo o cabeçalho?"
      );

    if (!confirmar) {
      return;
    }

    editorRef.current.innerHTML =
      "";

    onChange("");

    if (chaveLocalStorage) {
      localStorage.removeItem(
        chaveLocalStorage
      );
    }

    setSalvo(false);

    setMensagem(
      "Cabeçalho removido."
    );
  }

  function desfazer() {
    editorRef.current?.focus();

    document.execCommand(
      "undo"
    );

    atualizarEstado();
  }

  function refazer() {
    editorRef.current?.focus();

    document.execCommand(
      "redo"
    );

    atualizarEstado();
  }

  function salvarCabecalho() {
    if (!editorRef.current) {
      return;
    }

    const html =
      sanitizarHtmlCabecalho(
        editorRef.current.innerHTML
      );

    editorRef.current.innerHTML =
      html;

    onChange(html);

    if (chaveLocalStorage) {
      if (html.trim()) {
        localStorage.setItem(
          chaveLocalStorage,
          html
        );
      } else {
        localStorage.removeItem(
          chaveLocalStorage
        );
      }
    }

    onSalvar?.(html);

    setSalvo(true);

    setMensagem(
      "Cabeçalho salvo."
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h2 className="font-bold text-slate-950">
          {titulo}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {descricao}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <button
            type="button"
            onClick={desfazer}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <Undo2 size={16} />
            Desfazer
          </button>

          <button
            type="button"
            onClick={refazer}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw size={16} />
            Refazer
          </button>

          <button
            type="button"
            onClick={() =>
              inputImagemRef.current?.click()
            }
            className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
          >
            <ImagePlus size={16} />
            Adicionar imagem
          </button>

          <button
            type="button"
            onClick={limparCabecalho}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Limpar cabeçalho
          </button>

          <input
            ref={inputImagemRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const arquivo =
                event.target.files?.[0];

              void adicionarImagem(
                arquivo
              );

              event.target.value =
                "";
            }}
          />
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="COLE AQUI O CABEÇALHO DA SUA ESCOLA"
          onPaste={processarColagem}
          onInput={atualizarEstado}
          className="cabecalho-escolar-editor mt-4 min-h-[150px] w-full overflow-x-auto rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p
            className={`text-xs font-semibold ${
              salvo
                ? "text-emerald-700"
                : "text-slate-500"
            }`}
          >
            {mensagem ||
              "Você pode editar o cabeçalho antes de salvar."}
          </p>

          {mostrarBotaoSalvar && (
            <button
              type="button"
              onClick={salvarCabecalho}
              className="flex items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
            >
              <Save size={16} />
              Salvar cabeçalho
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .cabecalho-escolar-editor table {
          width: 100% !important;
          max-width: 100% !important;
          border-collapse: collapse !important;
        }

        .cabecalho-escolar-editor td,
        .cabecalho-escolar-editor th {
          border: 1px solid #000;
          box-sizing: border-box;
        }

        .cabecalho-escolar-editor img {
          max-width: 120px;
          max-height: 80px;
          width: auto;
          height: auto;
          object-fit: contain;
          cursor: grab;
        }

        .cabecalho-escolar-editor:empty::before {
          content: attr(
            data-placeholder
          );
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}