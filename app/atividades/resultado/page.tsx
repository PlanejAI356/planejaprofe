"use client";

import { useEffect, useRef, useState } from "react";
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

import TopoAvaliacoes from "../../avaliacoes/componentes/TopoAvaliacoes";
import { exportarAvaliacao } from "../../avaliacoes/utils/exportarAvaliacao";
import { exportarAvaliacaoWord } from "../../avaliacoes/utils/exportarAvaliacaoWord";
import VisualizacaoExercicio, {
  ExercicioAtividade,
} from "../componentes/VisualizacaoExercicio";

type AtividadeGerada = {
  titulo: string;
  subtitulo?: string;
  modoCriacao?: "folha" | "especifica" | "revisao";
  exercicios: ExercicioAtividade[];
};

export default function ResultadoAtividadePage() {
  const [atividade, setAtividade] = useState<AtividadeGerada | null>(null);
  const [conteudoEditado, setConteudoEditado] = useState("");
  const [cabecalho, setCabecalho] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [duasColunas, setDuasColunas] = useState(false);
  const [cabecalhoSalvo, setCabecalhoSalvo] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);
  const cabecalhoRef = useRef<HTMLDivElement>(null);
  const documentoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const atividadeSalva = localStorage.getItem("atividadeJson");
    const atividadeEditada =
      localStorage.getItem("atividadeGeradaEditada") || "";
    const cabecalhoSalvoLocal =
      localStorage.getItem("cabecalhoAtividade") || "";

    if (!atividadeSalva) {
      setMensagem(
        "Nenhuma atividade foi encontrada. Volte à configuração e gere uma nova atividade."
      );
      setCarregando(false);
      return;
    }

    try {
      const atividadeRecebida = JSON.parse(
        atividadeSalva
      ) as AtividadeGerada;

      if (
        !atividadeRecebida ||
        !Array.isArray(atividadeRecebida.exercicios)
      ) {
        throw new Error("A atividade não possui exercícios válidos.");
      }

      setAtividade(atividadeRecebida);
      setConteudoEditado(atividadeEditada);
      setCabecalho(cabecalhoSalvoLocal);
      setCabecalhoSalvo(Boolean(cabecalhoSalvoLocal.trim()));
    } catch (error) {
      console.error("Erro ao carregar atividade:", error);
      setMensagem(
        "Os dados da atividade ficaram inválidos. Volte e gere novamente."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  function executarComando(comando: string, valor?: string) {
    document.execCommand(comando, false, valor);
    editorRef.current?.focus();
  }

  function salvarCabecalho() {
    const novoCabecalho = cabecalhoRef.current?.innerHTML || "";
    const cabecalhoSomenteTexto =
      cabecalhoRef.current?.innerText.trim() || "";

    if (!cabecalhoSomenteTexto) {
      localStorage.removeItem("cabecalhoAtividade");
      setCabecalho("");
      setCabecalhoSalvo(false);
      return;
    }

    localStorage.setItem("cabecalhoAtividade", novoCabecalho);
    setCabecalho(novoCabecalho);
    setCabecalhoSalvo(true);
  }

  function salvarConteudoAtual() {
    const htmlAtual = editorRef.current?.innerHTML || "";

    try {
      localStorage.setItem("atividadeGeradaEditada", htmlAtual);
      setConteudoEditado(htmlAtual);
      return true;
    } catch {
      setMensagem(
        "A atividade foi editada, mas o navegador não conseguiu salvar as alterações."
      );
      return false;
    }
  }

  async function baixarPDF() {
    const documento = documentoRef.current;

    if (!documento) {
      alert("Não foi possível localizar a atividade.");
      return;
    }

    if (!(editorRef.current?.innerText.trim() || "")) {
      alert("Nenhuma atividade foi encontrada.");
      return;
    }

    try {
      salvarConteudoAtual();
      await exportarAvaliacao(documento, {
        tituloArquivo: "atividade",
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Não foi possível preparar o PDF da atividade.");
    }
  }

  async function baixarWord() {
    const atividadeElemento = editorRef.current;

    if (!atividadeElemento) {
      alert("Não foi possível localizar a atividade.");
      return;
    }

    if (!atividadeElemento.innerText.trim()) {
      alert("Nenhuma atividade foi encontrada.");
      return;
    }

    try {
      salvarConteudoAtual();

      await exportarAvaliacaoWord(
        cabecalhoRef.current,
        atividadeElemento,
        {
          tituloArquivo: "atividade",
          duasColunas,
        }
      );
    } catch (error) {
      console.error("Erro ao gerar Word:", error);
      alert("Não foi possível gerar o arquivo Word.");
    }
  }

  function renderizarAtividadeEstruturada() {
    if (!atividade) return null;

    return (
      <div>
        <div className="mb-7 text-center">
          <h2 className="text-2xl font-extrabold uppercase text-slate-950">
            {atividade.titulo || "Atividade pedagógica"}
          </h2>

          {atividade.subtitulo && (
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {atividade.subtitulo}
            </p>
          )}
        </div>

        <div className="space-y-8">
          {atividade.exercicios.map((exercicio, indice) => (
            <article
              key={exercicio.id || `exercicio-${indice}`}
              className="break-inside-avoid"
            >
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-900 bg-white font-bold text-slate-950">
                  {indice + 1}
                </span>

                <h3 className="pt-1 text-lg font-bold text-slate-950">
                  {exercicio.titulo}
                </h3>
              </div>

              <VisualizacaoExercicio
                exercicio={{
                  ...exercicio,
                  gabarito: "",
                }}
              />
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopoAvaliacoes
        destinoVoltar="/atividades/revisao"
        textoVoltar="Revisar atividade"
      />

      <section className="mx-auto max-w-6xl px-4 py-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-center gap-2 bg-green-700 px-5 py-4 text-white">
            <GraduationCap size={23} />
            <h1 className="text-xl font-extrabold">Atividade do aluno</h1>
          </div>

          <div className="p-5">
            <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
              Edite a atividade, cole o cabeçalho da escola e organize o
              documento antes de baixar.
            </div>

            {!carregando && atividade && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <button
                  type="button"
                  title="Desfazer"
                  onClick={() => executarComando("undo")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Undo2 size={18} />
                </button>

                <button
                  type="button"
                  title="Refazer"
                  onClick={() => executarComando("redo")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Redo2 size={18} />
                </button>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <button
                  type="button"
                  title="Negrito"
                  onClick={() => executarComando("bold")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Bold size={18} />
                </button>

                <button
                  type="button"
                  title="Itálico"
                  onClick={() => executarComando("italic")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Italic size={18} />
                </button>

                <button
                  type="button"
                  title="Sublinhado"
                  onClick={() => executarComando("underline")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Underline size={18} />
                </button>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <button
                  type="button"
                  title="Alinhar à esquerda"
                  onClick={() => executarComando("justifyLeft")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignLeft size={18} />
                </button>

                <button
                  type="button"
                  title="Centralizar"
                  onClick={() => executarComando("justifyCenter")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignCenter size={18} />
                </button>

                <button
                  type="button"
                  title="Alinhar à direita"
                  onClick={() => executarComando("justifyRight")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignRight size={18} />
                </button>

                <button
                  type="button"
                  title="Justificar"
                  onClick={() => executarComando("justifyFull")}
                  className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <AlignJustify size={18} />
                </button>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <select
                  title="Tamanho da fonte"
                  defaultValue="3"
                  onChange={(evento) =>
                    executarComando("fontSize", evento.target.value)
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
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
                  onClick={() => setDuasColunas((valor) => !valor)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${
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

                  {duasColunas ? "Uma coluna" : "Duas colunas"}
                </button>

                <button
                  type="button"
                  onClick={salvarConteudoAtual}
                  className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-green-800"
                >
                  <Save size={18} />
                  Salvar alterações
                </button>
              </div>
            )}

            {mensagem && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {mensagem}
              </div>
            )}

            <div className="max-h-[760px] overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
              {carregando ? (
                <div className="flex min-h-[560px] items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  Carregando atividade...
                </div>
              ) : atividade ? (
                <div
                  ref={documentoRef}
                  className="mx-auto min-h-[1123px] w-full max-w-[794px] border border-slate-300 bg-white px-8 py-10 shadow-md sm:px-12"
                >
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
                          ? "Cabeçalho salvo. Ele aparecerá nas próximas atividades."
                          : "Copie o cabeçalho usado pela escola e cole nessa área."}
                      </p>

                      <button
                        type="button"
                        onClick={salvarCabecalho}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-green-700 px-4 py-2 text-xs font-extrabold text-green-800 transition hover:bg-green-50"
                      >
                        <Save size={16} />
                        Salvar cabeçalho
                      </button>
                    </div>
                  </div>

                  <div className="mb-6 border-t border-slate-300" />

                  {conteudoEditado ? (
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={salvarConteudoAtual}
                      className={`min-h-[760px] break-words text-sm leading-7 text-slate-900 outline-none ${
                        duasColunas
                          ? "columns-2 gap-10 [column-rule:1px_solid_#cbd5e1]"
                          : "columns-1"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: conteudoEditado,
                      }}
                    />
                  ) : (
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={salvarConteudoAtual}
                      className={`min-h-[760px] break-words text-sm leading-7 text-slate-900 outline-none ${
                        duasColunas
                          ? "columns-2 gap-10 [column-rule:1px_solid_#cbd5e1]"
                          : "columns-1"
                      }`}
                    >
                      {renderizarAtividadeEstruturada()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                  <FileText size={40} className="mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">
                    Nenhuma atividade foi encontrada.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Volte à configuração e gere uma nova atividade.
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