"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  ArrowLeft,
  Download,
  Move,
  RotateCcw,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { exportarAtividade } from "../utils/exportarAtividade";
import { exportarAtividadeWord } from "../utils/exportarAtividadeWord";
import CabecalhoEscolar from "../../componentes/CabecalhoEscolar/CabecalhoEscolar";
import { supabase } from "../../lib/supabase";

type ConfiguracaoAtividadeImagem = {
  etapaEnsino?: string;
  serie?: string;
  disciplina?: string;
  pedido?: string;
  quantidadeQuestoes?: number;
  tipoAtividade?: string;
};

export default function FinalizarAtividadePage() {
  const router = useRouter();

  const cabecalhoRef =
    useRef<HTMLDivElement>(null);

  const areaImagemRef =
    useRef<HTMLDivElement>(null);

  const arrastoRef = useRef<{
    x: number;
    y: number;
    posicaoX: number;
    posicaoY: number;
  } | null>(null);

  const [imagem, setImagem] =
    useState("");

  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoAtividadeImagem | null>(
      null
    );

  const [cabecalho, setCabecalho] =
    useState("");

  const [erro, setErro] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [larguraImagem, setLarguraImagem] =
    useState(100);

  const [posicaoX, setPosicaoX] =
    useState(50);

  const [posicaoY, setPosicaoY] =
    useState(0);

  const [
    versaoSelecionada,
    setVersaoSelecionada,
  ] = useState<"aluno" | "professor">(
    "aluno"
  );

  useEffect(() => {
    try {
      /*
       * A imagem original do aluno já está
       * salva no localStorage.
       */
      const imagemAluno =
        localStorage.getItem(
          "atividadeImagem"
        );

      /*
       * Quando existe gabarito, a cópia
       * do professor fica salva aqui.
       */
      const imagemProfessor =
        localStorage.getItem(
          "atividadeImagemProfessor"
        );

      const configuracaoSalva =
        localStorage.getItem(
          "configuracaoAtividadeImagem"
        );

      /*
       * Descobre qual versão estava sendo
       * visualizada antes de clicar em
       * "Adicionar cabeçalho".
       */
      const versaoSalva =
        localStorage.getItem(
          "atividadeVersaoSelecionada"
        );

      const versaoAtual:
        | "aluno"
        | "professor" =
        versaoSalva === "professor"
          ? "professor"
          : "aluno";

      setVersaoSelecionada(
        versaoAtual
      );

      /*
       * Escolhe a imagem correta.
       *
       * Professor:
       * usa a imagem com gabarito.
       *
       * Aluno:
       * usa a atividade normal.
       *
       * Se por algum motivo não existir
       * imagem do professor, volta para
       * a imagem do aluno.
       */
      const imagemSalva =
        versaoAtual === "professor" &&
        imagemProfessor?.startsWith(
          "data:image/"
        )
          ? imagemProfessor
          : imagemAluno;

      /*
       * Recupera o cabeçalho salvo.
       *
       * Mantemos também cabecalhoAvaliacao
       * como alternativa para não perder
       * cabeçalhos antigos que já tenham
       * sido salvos.
       */
      const cabecalhoSalvoLocal =
        localStorage.getItem(
          "cabecalhoAtividade"
        ) ||
        localStorage.getItem(
          "cabecalhoAvaliacao"
        ) ||
        "";

      if (
        !imagemSalva ||
        !imagemSalva.startsWith(
          "data:image/"
        )
      ) {
        setErro(
          "Não encontrei a atividade gerada. Volte e gere uma nova atividade."
        );

        return;
      }

      setImagem(imagemSalva);

      if (configuracaoSalva) {
        try {
          setConfiguracao(
            JSON.parse(
              configuracaoSalva
            )
          );
        } catch (error) {
          console.error(
            "Erro ao carregar configuração da atividade:",
            error
          );

          setConfiguracao(null);
        }
      }

      setCabecalho(
        cabecalhoSalvoLocal
      );

    } catch (error) {
      console.error(
        "Erro ao carregar a atividade:",
        error
      );

      setErro(
        "Não foi possível carregar os dados da atividade."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  /*
   * Salva automaticamente a atividade no Supabase
   * quando a tela de finalização é aberta.
   *
   * A impressão/Word continuam independentes.
   * O fingerprint evita criar cópias duplicadas
   * ao voltar para esta mesma atividade.
   */
  useEffect(() => {
    async function salvarAtividade() {
      if (!configuracao) return;

      const imagemAluno =
        localStorage.getItem("atividadeImagem");

      if (
        !imagemAluno ||
        !imagemAluno.startsWith("data:image/")
      ) {
        return;
      }

      const fingerprint = [
        imagemAluno.length,
        imagemAluno.slice(0, 80),
        imagemAluno.slice(-80),
      ].join("|");

      const fingerprintSalvo =
        localStorage.getItem(
          "atividadeSalvaFingerprint"
        );

      const idSalvo =
        localStorage.getItem(
          "atividadeSalvaId"
        );

      /*
       * Se esta mesma atividade já foi salva,
       * não cria outra cópia no banco.
       */
      if (
        idSalvo &&
        fingerprintSalvo === fingerprint
      ) {
        return;
      }

      try {
        const {
          data: { user },
          error: erroUsuario,
        } = await supabase.auth.getUser();

        if (erroUsuario) {
          console.error(
            "Erro ao identificar usuário para salvar atividade:",
            erroUsuario
          );
          return;
        }

        if (!user) {
          return;
        }

        const pedido =
          configuracao.pedido?.trim() || "";

        const tituloAtividade =
          pedido.length > 70
            ? `${pedido.slice(0, 70)}...`
            : pedido;

        const {
          data: atividadeSalva,
          error: erroSalvar,
        } = await supabase
          .from("atividades")
          .insert({
            usuario_id: user.id,
            titulo:
              tituloAtividade ||
              `${configuracao.disciplina || "Atividade"} - ${
                configuracao.serie || ""
              }`.trim(),
            etapa_ensino:
              configuracao.etapaEnsino || null,
            serie:
              configuracao.serie || null,
            disciplina:
              configuracao.disciplina || null,
            pedido:
              pedido || null,
            tipo_atividade:
              configuracao.tipoAtividade || null,
            quantidade_questoes:
              configuracao.quantidadeQuestoes || null,
            imagem:
              imagemAluno,
          })
          .select("id")
          .single();

        if (erroSalvar) {
          console.error(
            "Erro ao salvar atividade:",
            erroSalvar
          );
          return;
        }

        if (atividadeSalva?.id) {
          localStorage.setItem(
            "atividadeSalvaId",
            atividadeSalva.id
          );

          localStorage.setItem(
            "atividadeSalvaFingerprint",
            fingerprint
          );
        }
      } catch (error) {
        console.error(
          "Erro inesperado ao salvar atividade:",
          error
        );
      }
    }

    salvarAtividade();
  }, [configuracao]);

  const resumo = useMemo(() => {
    if (!configuracao) {
      return "";
    }

    return [
      configuracao.serie,
      configuracao.disciplina,
      configuracao.quantidadeQuestoes
        ? `${configuracao.quantidadeQuestoes} questões`
        : "",
    ]
      .filter(Boolean)
      .join(" • ");
  }, [configuracao]);


  function limitar(
    valor: number,
    minimo: number,
    maximo: number
  ) {
    return Math.min(
      maximo,
      Math.max(minimo, valor)
    );
  }

  function alterarLarguraImagem(
    novaLargura: number
  ) {
    const largura = limitar(
      novaLargura,
      45,
      100
    );

    const metade = largura / 2;

    setLarguraImagem(largura);
    setPosicaoX((atual) =>
      limitar(
        atual,
        metade,
        100 - metade
      )
    );
  }

  function centralizarImagem() {
    setPosicaoX(50);
  }

  function restaurarImagem() {
    setLarguraImagem(100);
    setPosicaoX(50);
    setPosicaoY(0);
  }

  function iniciarArrasto(
    event: ReactPointerEvent<HTMLImageElement>
  ) {
    if (!areaImagemRef.current) return;

    event.preventDefault();

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    arrastoRef.current = {
      x: event.clientX,
      y: event.clientY,
      posicaoX,
      posicaoY,
    };
  }

  function moverImagem(
    event: ReactPointerEvent<HTMLImageElement>
  ) {
    const inicio = arrastoRef.current;
    const area = areaImagemRef.current;

    if (!inicio || !area) return;

    event.preventDefault();

    const retangulo =
      area.getBoundingClientRect();

    if (
      retangulo.width <= 0 ||
      retangulo.height <= 0
    ) {
      return;
    }

    const deslocamentoX =
      ((event.clientX - inicio.x) /
        retangulo.width) *
      100;

    const deslocamentoY =
      ((event.clientY - inicio.y) /
        retangulo.height) *
      100;

    const metade = larguraImagem / 2;

    setPosicaoX(
      limitar(
        inicio.posicaoX + deslocamentoX,
        metade,
        100 - metade
      )
    );

    setPosicaoY(
      limitar(
        inicio.posicaoY + deslocamentoY,
        0,
        85
      )
    );
  }

  function finalizarArrasto(
    event: ReactPointerEvent<HTMLImageElement>
  ) {
    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    arrastoRef.current = null;
  }

  async function baixarPDF() {
    if (!imagem) {
      alert(
        "Nenhuma atividade foi encontrada."
      );

      return;
    }

    try {
      await exportarAtividade(
        cabecalhoRef.current,
        imagem,
        {
          tituloArquivo:
            versaoSelecionada ===
            "professor"
              ? "atividade-planejai-gabarito"
              : "atividade-planejai",
          ajusteImagem: {
            larguraPercentual: larguraImagem,
            posicaoXPercentual: posicaoX,
            posicaoYPercentual: posicaoY,
          },
        }
      );
    } catch (error) {
      console.error(
        "Erro ao exportar PDF da atividade:",
        error
      );

      alert(
        "Não foi possível preparar o PDF da atividade."
      );
    }
  }

  async function baixarWord() {
    if (!imagem) {
      alert(
        "Nenhuma atividade foi encontrada."
      );

      return;
    }

    try {
      await exportarAtividadeWord(
        cabecalhoRef.current,
        imagem,
        {
          tituloArquivo:
            versaoSelecionada ===
            "professor"
              ? "atividade-planejai-gabarito"
              : "atividade-planejai",
          ajusteImagem: {
            larguraPercentual: larguraImagem,
            posicaoXPercentual: posicaoX,
            posicaoYPercentual: posicaoY,
          },
        }
      );
    } catch (error) {
      console.error(
        "Erro ao gerar Word da atividade:",
        error
      );

      alert(
        "Não foi possível gerar o arquivo Word."
      );
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-semibold text-emerald-700">
          Preparando atividade...
        </p>
      </main>
    );
  }

  if (erro || !imagem) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-red-700">
            {erro ||
              "Atividade não encontrada."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/atividades"
              )
            }
            className="mt-5 cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white"
          >
            Voltar para atividades
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <style jsx global>{`
        .cabecalho-preview {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box;
          float: none !important;
          clear: both !important;
          overflow: visible;
        }

        .cabecalho-preview table {
          display: table !important;
          width: 100% !important;
          max-width: 100% !important;
          border-collapse: collapse !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          float: none !important;
        }

        .cabecalho-preview td,
        .cabecalho-preview th {
          border: 1px solid #000;
        }

        .cabecalho-preview img {
          max-width: 120px;
          max-height: 80px;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        .cabecalho-preview p {
          margin-top: 0;
          margin-bottom: 4px;
        }

        .cabecalho-preview > * {
          max-width: 100% !important;
          float: none !important;
        }

        .conteudo-atividade-tela {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          clear: both !important;
          float: none !important;
          touch-action: none;
        }

        .imagem-atividade-editavel {
          user-select: none;
          -webkit-user-drag: none;
          touch-action: none;
        }
      `}</style>

      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-600">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-emerald-900">
              Finalizar atividade
            </h1>

            <p className="text-sm text-slate-700">
              Edite o cabeçalho e baixe
              a atividade em Word ou PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/atividades/resultado"
              )
            }
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-emerald-800 shadow-sm"
          >
            <ArrowLeft size={19} />

            Voltar para a atividade
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        {resumo && (
          <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
            {resumo}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-100 p-4 sm:p-6">
            <div className="mx-auto w-full max-w-[794px]">
              <CabecalhoEscolar
                storageKey="cabecalhoAtividade"
                fallbackStorageKeys={[
                  "cabecalhoAvaliacao",
                ]}
                titulo="Cabeçalho da escola"
                descricao="Cole o cabeçalho usado pela escola. Você pode editar, adicionar a logo e salvar para reutilizar nas próximas atividades."
                valor={cabecalho}
                onChange={setCabecalho}
              />
            </div>
          </div>

          <div className="bg-slate-100 p-4 sm:p-6">
            <div className="mx-auto mb-4 w-full max-w-[794px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 font-extrabold text-slate-800">
                    <Move size={18} className="text-emerald-700" />
                    Ajustar atividade na folha
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Arraste a atividade dentro da folha e ajuste o tamanho.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={centralizarImagem}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Centralizar
                  </button>

                  <button
                    type="button"
                    onClick={restaurarImagem}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <RotateCcw size={14} />
                    Restaurar
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Tamanho</span>
                  <span>{larguraImagem}%</span>
                </div>

                <input
                  type="range"
                  min="45"
                  max="100"
                  step="1"
                  value={larguraImagem}
                  onChange={(event) =>
                    alterarLarguraImagem(
                      Number(event.target.value)
                    )
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            <div
              className="mx-auto flex aspect-[210/297] w-full max-w-[794px] flex-col overflow-hidden bg-white px-[4.76%] py-[3.37%] shadow-md"
              style={{
                boxSizing:
                  "border-box",
              }}
            >
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-black bg-white">
                {cabecalho.trim() && (
                  <div
                    ref={cabecalhoRef}
                    className="cabecalho-preview w-full shrink-0"
                    dangerouslySetInnerHTML={{
                      __html:
                        cabecalho,
                    }}
                  />
                )}

                <div
                  ref={areaImagemRef}
                  className="conteudo-atividade-tela min-h-0 flex-1 overflow-hidden bg-white p-[1.5%]"
                >
                  <img
                    src={imagem}
                    alt={
                      versaoSelecionada ===
                      "professor"
                        ? "Atividade pedagógica com gabarito"
                        : "Atividade pedagógica final"
                    }
                    onPointerDown={iniciarArrasto}
                    onPointerMove={moverImagem}
                    onPointerUp={finalizarArrasto}
                    onPointerCancel={finalizarArrasto}
                    draggable={false}
                    className="imagem-atividade-editavel absolute block cursor-grab bg-white active:cursor-grabbing"
                    style={{
                      width: `${larguraImagem}%`,
                      height: "auto",
                      maxWidth: "none",
                      maxHeight: "none",
                      left: `${posicaoX}%`,
                      top: `${posicaoY}%`,
                      transform: "translateX(-50%)",
                      filter:
                        "brightness(1.02) contrast(1.01)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={baixarWord}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <Download size={18} />

              Baixar Word
            </button>

            <button
              type="button"
              onClick={baixarPDF}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800"
            >
              <Download size={18} />

              Baixar PDF
            </button>
          </div>
        </div>
            </section>
    </main>
  );
}