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
  Italic,
  LayoutPanelTop,
  Loader2,
  Redo2,
  Save,
  Underline,
  Undo2,
} from "lucide-react";

import TopoAvaliacoes from "../componentes/TopoAvaliacoes";

export default function ResultadoAvaliacaoPage() {
  const [conteudoAluno, setConteudoAluno] = useState("");
  const [cabecalho, setCabecalho] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [duasColunas, setDuasColunas] = useState(false);
  const [cabecalhoSalvo, setCabecalhoSalvo] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const cabecalhoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const provaSalva = localStorage.getItem("provaGerada") || "";
    const cabecalhoSalvoLocal =
      localStorage.getItem("cabecalhoAvaliacao") || "";

    setConteudoAluno(provaSalva);
    setCabecalho(cabecalhoSalvoLocal);
    setCabecalhoSalvo(Boolean(cabecalhoSalvoLocal.trim()));
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (
      editorRef.current &&
      conteudoAluno &&
      editorRef.current.innerText.trim() === ""
    ) {
      editorRef.current.innerText = conteudoAluno;
    }
  }, [conteudoAluno]);

  useEffect(() => {
    if (
      cabecalhoRef.current &&
      cabecalho &&
      cabecalhoRef.current.innerText.trim() === ""
    ) {
      cabecalhoRef.current.innerText = cabecalho;
    }
  }, [cabecalho]);

  function executarComando(
    comando: string,
    valor?: string
  ) {
    document.execCommand(comando, false, valor);

    editorRef.current?.focus();
  }

  function salvarCabecalho() {
    const novoCabecalho =
      cabecalhoRef.current?.innerHTML || "";

    const cabecalhoSomenteTexto =
      cabecalhoRef.current?.innerText.trim() || "";

    if (!cabecalhoSomenteTexto) {
      localStorage.removeItem("cabecalhoAvaliacao");
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

  function salvarAlteracoesProva() {
    const provaEditada =
      editorRef.current?.innerHTML || "";

    localStorage.setItem(
      "provaGeradaEditada",
      provaEditada
    );
  }

  function alternarColunas() {
    setDuasColunas((valorAtual) => !valorAtual);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopoAvaliacoes
        destinoVoltar="/avaliacoes"
        textoVoltar="Voltar às avaliações"
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
              Edite a avaliação, cole o cabeçalho da escola e
              organize o documento antes de baixar.
            </div>

            {!carregando && conteudoAluno && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <button
                  type="button"
                  title="Desfazer"
                  onClick={() =>
                    executarComando("undo")
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Undo2 size={18} />
                </button>

                <button
                  type="button"
                  title="Refazer"
                  onClick={() =>
                    executarComando("redo")
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
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
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Bold size={18} />
                </button>

                <button
                  type="button"
                  title="Itálico"
                  onClick={() =>
                    executarComando("italic")
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Italic size={18} />
                </button>

                <button
                  type="button"
                  title="Sublinhado"
                  onClick={() =>
                    executarComando("underline")
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Underline size={18} />
                </button>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <button
                  type="button"
                  title="Alinhar à esquerda"
                  onClick={() =>
                    executarComando("justifyLeft")
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignLeft size={18} />
                </button>

                <button
                  type="button"
                  title="Centralizar"
                  onClick={() =>
                    executarComando("justifyCenter")
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignCenter size={18} />
                </button>

                <button
                  type="button"
                  title="Alinhar à direita"
                  onClick={() =>
                    executarComando("justifyRight")
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignRight size={18} />
                </button>

                <button
                  type="button"
                  title="Justificar"
                  onClick={() =>
                    executarComando("justifyFull")
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
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
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="2">Pequena</option>
                  <option value="3">Normal</option>
                  <option value="4">Média</option>
                  <option value="5">Grande</option>
                </select>

                <button
                  type="button"
                  title={
                    duasColunas
                      ? "Usar uma coluna"
                      : "Usar duas colunas"
                  }
                  onClick={alternarColunas}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    duasColunas
                      ? "border-green-700 bg-green-50 text-green-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {duasColunas ? (
                    <LayoutPanelTop size={18} />
                  ) : (
                    <Columns2 size={18} />
                  )}

                  {duasColunas
                    ? "Uma coluna"
                    : "Duas colunas"}
                </button>

                <button
                  type="button"
                  onClick={salvarAlteracoesProva}
                  className="ml-auto flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-green-800"
                >
                  <Save size={18} />
                  Salvar alterações
                </button>
              </div>
            )}

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
                <div className="mx-auto min-h-[1123px] w-full max-w-[794px] bg-white px-8 py-10 shadow-md sm:px-12">
                  <div className="mb-4">
                    <div
                      ref={cabecalhoRef}
                      contentEditable
                      suppressContentEditableWarning
                      data-placeholder="COLE AQUI O CABEÇALHO DA SUA ESCOLA"
                      className="min-h-[130px] w-full rounded-lg border border-dashed border-slate-300 px-5 py-4 text-center text-sm leading-6 text-slate-900 outline-none transition empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      dangerouslySetInnerHTML={{
                        __html: cabecalho,
                      }}
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p
                        className={`text-xs font-semibold ${
                          cabecalhoSalvo
                            ? "text-green-700"
                            : "text-slate-500"
                        }`}
                      >
                        {cabecalhoSalvo
                          ? "Cabeçalho salvo. Ele aparecerá nas próximas avaliações."
                          : "Copie o cabeçalho usado pela escola e cole nessa área."}
                      </p>

                      <button
                        type="button"
                        onClick={salvarCabecalho}
                        className="flex items-center gap-2 rounded-lg border border-green-700 px-4 py-2 text-xs font-extrabold text-green-800 transition hover:bg-green-50"
                      >
                        <Save size={16} />
                        Salvar cabeçalho
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 border-t border-slate-300" />

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => {
                      const valorAtual =
                        editorRef.current?.innerHTML || "";

                      localStorage.setItem(
                        "provaGeradaEditada",
                        valorAtual
                      );
                    }}
                    className={`min-h-[760px] text-sm leading-7 text-slate-900 outline-none ${
                      duasColunas
                        ? "columns-2 gap-10 [column-rule:1px_solid_#e2e8f0]"
                        : "columns-1"
                    }`}
                  >
                    {conteudoAluno}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                  <FileText
                    size={40}
                    className="mb-3 text-slate-300"
                  />

                  <p className="text-sm font-semibold text-slate-600">
                    Nenhuma avaliação foi encontrada.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Volte à configuração e gere uma nova
                    avaliação.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="rounded-xl border border-green-700 px-5 py-3 text-sm font-extrabold text-green-800 transition hover:bg-green-50"
              >
                Visualizar
              </button>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Baixar Word
                </button>

                <button
                  type="button"
                  className="rounded-xl bg-green-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-green-800"
                >
                  Baixar PDF
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-green-700 px-5 py-3 text-sm font-extrabold text-green-800 transition hover:bg-green-50"
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