"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  BadgeDollarSign,
  BookOpen,
  ClipboardList,
  Crown,
  Download,
  Eye,
  Handshake,
  LayoutDashboard,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

type Usuario = {
  id: string;
  nome?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  plano?: string | null;
  planos_restantes?: number | null;
  mercado_pago_id?: string | null;
  cupom_origem?: string | null;
};

type Parceiro = {
  id: string;
  user_id?: string | null;
  nome?: string | null;
  cupom?: string | null;
  comissao_percentual?: number | null;
  ativo?: boolean | null;

  totalAcessos?: number;
  totalVisitantes?: number;
  totalCadastros?: number;
  totalPagamentos?: number;
  valorVendas?: number;
  comissaoTotal?: number;
  conversao?: number;
};

type Indicacao = {
  id: string;
  parceiro_id?: string | null;
  cupom?: string | null;
  email_cliente?: string | null;
  status?: string | null;
  valor_assinatura?: number | null;
  valor_comissao?: number | null;
  mercado_pago_id?: string | null;
};

type AtividadeBiblioteca = {
  id: string;
  titulo?: string | null;
  etapa_ensino?: string | null;
  serie?: string | null;
  disciplina?: string | null;
  pedido?: string | null;
  tipo_atividade?: string | null;
  quantidade_questoes?: number | null;
  imagem?: string | null;
  created_at?: string | null;
  publicar_biblioteca?: boolean | null;
  descartada_biblioteca?: boolean | null;
};

type AvaliacaoBiblioteca = {
  id: string;
  titulo?: string | null;
  etapa_ensino?: string | null;
  serie?: string | null;
  disciplina?: string | null;
  conteudos?: string | null;
  avaliacao_completa?: string | null;
  status?: string | null;
  created_at?: string | null;
  publicar_biblioteca?: boolean | null;
  publicado_em?: string | null;
  descartada_biblioteca?: boolean | null;
};

type Resumo = {
  totalUsuarios: number;
  totalPremium: number;
  totalGratuitos: number;
  parceirosAtivos: number;
  pagamentosParceiros: number;
};

type DadosAdmin = {
  resumo: Resumo;
  usuarios: Usuario[];
  parceiros: Parceiro[];
  indicacoes: Indicacao[];
};

function formatarDinheiro(
  valor?: number | null
) {
  return Number(valor || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [dados, setDados] =
    useState<DadosAdmin | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [atualizando, setAtualizando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [buscaUsuario, setBuscaUsuario] =
    useState("");

  const [
    filtroPlano,
    setFiltroPlano,
  ] = useState<
    "nao-premium" | "premium" | "ayanne"
  >("nao-premium");

  const [aba, setAba] = useState<
    "usuarios" | "parceiros" | "indicacoes" | "biblioteca"
  >("usuarios");

  const [
    atividadesBiblioteca,
    setAtividadesBiblioteca,
  ] = useState<AtividadeBiblioteca[]>([]);

  const [
    avaliacoesBiblioteca,
    setAvaliacoesBiblioteca,
  ] = useState<AvaliacaoBiblioteca[]>([]);

  const [
    tipoMaterialBiblioteca,
    setTipoMaterialBiblioteca,
  ] = useState<"atividades" | "avaliacoes">("atividades");

  const [
    carregandoBiblioteca,
    setCarregandoBiblioteca,
  ] = useState(false);

  const [
    buscaBiblioteca,
    setBuscaBiblioteca,
  ] = useState("");

  const [
    filtroBiblioteca,
    setFiltroBiblioteca,
  ] = useState<
    "todas" | "publicadas" | "nao-publicadas"
  >("nao-publicadas");

  const [
    atividadeSelecionada,
    setAtividadeSelecionada,
  ] = useState<AtividadeBiblioteca | null>(null);

  const [
    avaliacaoSelecionada,
    setAvaliacaoSelecionada,
  ] = useState<AvaliacaoBiblioteca | null>(null);

  const [
    carregandoPreview,
    setCarregandoPreview,
  ] = useState(false);

  const [
    alterandoBiblioteca,
    setAlterandoBiblioteca,
  ] = useState<string | null>(null);

  const [
    usuarioSelecionado,
    setUsuarioSelecionado,
  ] = useState<Usuario | null>(null);

  const [
    alterandoPlano,
    setAlterandoPlano,
  ] = useState(false);

  const carregarPainel =
    useCallback(async () => {
      try {
        setErro("");

        const {
          data: { session },
          error: erroSessao,
        } =
          await supabase.auth.getSession();

        if (
          erroSessao ||
          !session?.access_token
        ) {
          setErro(
            "Você precisa entrar na sua conta para acessar o painel administrativo."
          );
          return;
        }

        const resposta = await fetch(
          "/api/admin/resumo",
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const resultado =
          await resposta
            .json()
            .catch(() => null);

        if (!resposta.ok) {
          throw new Error(
            resultado?.erro ||
              "Não foi possível carregar o painel."
          );
        }

        setDados(resultado);
      } catch (error) {
        console.error(
          "Erro ao carregar painel administrativo:",
          error
        );

        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o painel."
        );
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    }, []);

  const carregarBiblioteca =
    useCallback(async () => {
      try {
        setCarregandoBiblioteca(true);

        const {
          data: { session },
          error: erroSessao,
        } = await supabase.auth.getSession();

        if (
          erroSessao ||
          !session?.access_token
        ) {
          throw new Error(
            "Sua sessão expirou. Entre novamente."
          );
        }

        const headers = {
          Authorization:
            `Bearer ${session.access_token}`,
        };

        const [
          respostaAtividades,
          respostaAvaliacoes,
        ] = await Promise.all([
          fetch(
            "/api/admin/biblioteca",
            {
              method: "GET",
              headers,
              cache: "no-store",
            }
          ),
          fetch(
            "/api/admin/biblioteca?tipo=avaliacoes",
            {
              method: "GET",
              headers,
              cache: "no-store",
            }
          ),
        ]);

        const [
          resultadoAtividades,
          resultadoAvaliacoes,
        ] = await Promise.all([
          respostaAtividades.json().catch(() => null),
          respostaAvaliacoes.json().catch(() => null),
        ]);

        if (!respostaAtividades.ok) {
          throw new Error(
            resultadoAtividades?.erro ||
              "Não foi possível carregar as atividades."
          );
        }

        if (!respostaAvaliacoes.ok) {
          throw new Error(
            resultadoAvaliacoes?.erro ||
              "Não foi possível carregar as avaliações."
          );
        }

        setAtividadesBiblioteca(
          resultadoAtividades?.atividades || []
        );

        setAvaliacoesBiblioteca(
          resultadoAvaliacoes?.avaliacoes || []
        );
      } catch (error) {
        console.error(
          "Erro ao carregar biblioteca no admin:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a biblioteca."
        );
      } finally {
        setCarregandoBiblioteca(false);
      }
    }, []);

  useEffect(() => {
    carregarPainel();
  }, [carregarPainel]);

  useEffect(() => {
    if (
      aba === "biblioteca" &&
      atividadesBiblioteca.length === 0
    ) {
      carregarBiblioteca();
    }
  }, [
    aba,
    atividadesBiblioteca.length,
    carregarBiblioteca,
  ]);

  async function atualizar() {
    setAtualizando(true);
    await carregarPainel();

    if (aba === "biblioteca") {
      await carregarBiblioteca();
    }
  }

  async function visualizarAtividade(
    atividade: AtividadeBiblioteca
  ) {
    try {
      setCarregandoPreview(true);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        `/api/admin/biblioteca?id=${encodeURIComponent(
          atividade.id
        )}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível abrir a atividade."
        );
      }

      setAtividadeSelecionada(
        resultado?.atividade || null
      );
    } catch (error) {
      console.error(
        "Erro ao visualizar atividade:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível visualizar a atividade."
      );
    } finally {
      setCarregandoPreview(false);
    }
  }

  async function alterarPublicacaoBiblioteca(
    atividade: AtividadeBiblioteca,
    publicar: boolean
  ) {
    const acao = publicar
      ? "publicar esta atividade na Biblioteca"
      : "retirar esta atividade da Biblioteca";

    const confirmou = window.confirm(
      `Tem certeza que deseja ${acao}?`
    );

    if (!confirmou) {
      return;
    }

    try {
      setAlterandoBiblioteca(atividade.id);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        "/api/admin/biblioteca",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            atividadeId: atividade.id,
            publicar,
          }),
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível alterar a publicação."
        );
      }

      setAtividadesBiblioteca((listaAtual) =>
        listaAtual.map((item) =>
          item.id === atividade.id
            ? {
                ...item,
                publicar_biblioteca: publicar,
              }
            : item
        )
      );

      setAtividadeSelecionada((atual) =>
        atual?.id === atividade.id
          ? {
              ...atual,
              publicar_biblioteca: publicar,
            }
          : atual
      );

      alert(
        publicar
          ? "Atividade publicada na Biblioteca!"
          : "Atividade retirada da Biblioteca."
      );
    } catch (error) {
      console.error(
        "Erro ao alterar publicação:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a publicação."
      );
    } finally {
      setAlterandoBiblioteca(null);
    }
  }

  async function editarTituloAtividade(
    atividade: AtividadeBiblioteca
  ) {
    const tituloAtual =
      atividade.titulo?.trim() || "";

    const novoTitulo = window.prompt(
      "Edite o título da atividade:",
      tituloAtual
    );

    if (novoTitulo === null) {
      return;
    }

    const tituloLimpo = novoTitulo.trim();

    if (!tituloLimpo) {
      alert("O título não pode ficar vazio.");
      return;
    }

    if (tituloLimpo === tituloAtual) {
      return;
    }

    try {
      setAlterandoBiblioteca(atividade.id);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        "/api/admin/biblioteca",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            atividadeId: atividade.id,
            acao: "editar_titulo",
            titulo: tituloLimpo,
          }),
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível editar o título."
        );
      }

      setAtividadesBiblioteca((listaAtual) =>
        listaAtual.map((item) =>
          item.id === atividade.id
            ? {
                ...item,
                titulo: tituloLimpo,
              }
            : item
        )
      );

      setAtividadeSelecionada((atual) =>
        atual?.id === atividade.id
          ? {
              ...atual,
              titulo: tituloLimpo,
            }
          : atual
      );

      alert("Título atualizado com sucesso!");
    } catch (error) {
      console.error(
        "Erro ao editar título da atividade:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível editar o título."
      );
    } finally {
      setAlterandoBiblioteca(null);
    }
  }


  async function descartarAtividadeBiblioteca(
    atividade: AtividadeBiblioteca
  ) {
    const confirmou = window.confirm(
      `Descartar esta atividade da curadoria da Biblioteca?\n\n${
        atividade.titulo || "Atividade sem título"
      }\n\nEla continuará normalmente na conta do professor e não será excluída.`
    );

    if (!confirmou) {
      return;
    }

    try {
      setAlterandoBiblioteca(atividade.id);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        "/api/admin/biblioteca",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            atividadeId: atividade.id,
            acao: "descartar",
          }),
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível descartar a atividade."
        );
      }

      setAtividadesBiblioteca((listaAtual) =>
        listaAtual.filter(
          (item) => item.id !== atividade.id
        )
      );

      setAtividadeSelecionada((atual) =>
        atual?.id === atividade.id
          ? null
          : atual
      );

      alert(
        "Atividade retirada da fila de revisão. Ela continua normalmente para o professor."
      );
    } catch (error) {
      console.error(
        "Erro ao descartar atividade da curadoria:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível descartar a atividade."
      );
    } finally {
      setAlterandoBiblioteca(null);
    }
  }

  async function baixarAtividadeAdmin(
    atividade: AtividadeBiblioteca
  ) {
    if (!atividade.imagem) {
      alert(
        "Esta atividade não possui imagem disponível para download."
      );
      return;
    }

    try {
      const resposta = await fetch(
        atividade.imagem
      );

      if (!resposta.ok) {
        throw new Error(
          "Não foi possível baixar a atividade."
        );
      }

      const blob =
        await resposta.blob();

      const urlTemporaria =
        URL.createObjectURL(blob);

      const nomeSeguro =
        (
          atividade.titulo ||
          "atividade-planejai"
        )
          .normalize("NFD")
          .replace(
            /[\u0300-\u036f]/g,
            ""
          )
          .replace(
            /[^a-zA-Z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          )
          .toLowerCase() ||
        "atividade-planejai";

      const extensao =
        blob.type ===
        "image/jpeg"
          ? "jpg"
          : blob.type ===
              "image/webp"
            ? "webp"
            : "png";

      const link =
        document.createElement("a");

      link.href = urlTemporaria;
      link.download =
        `${nomeSeguro}.${extensao}`;

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(
        urlTemporaria
      );
    } catch (error) {
      console.error(
        "Erro ao baixar atividade:",
        error
      );

      alert(
        "Não foi possível baixar a atividade. Tente novamente."
      );
    }
  }

  async function visualizarAvaliacao(
    avaliacao: AvaliacaoBiblioteca
  ) {
    try {
      setCarregandoPreview(true);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        `/api/admin/biblioteca?tipo=avaliacoes&id=${encodeURIComponent(
          avaliacao.id
        )}`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível abrir a avaliação."
        );
      }

      setAvaliacaoSelecionada(
        resultado?.avaliacao || null
      );
    } catch (error) {
      console.error(
        "Erro ao visualizar avaliação:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível visualizar a avaliação."
      );
    } finally {
      setCarregandoPreview(false);
    }
  }

  async function alterarPublicacaoAvaliacao(
    avaliacao: AvaliacaoBiblioteca,
    publicar: boolean
  ) {
    const acao = publicar
      ? "publicar esta avaliação na Biblioteca"
      : "retirar esta avaliação da Biblioteca";

    if (!window.confirm(`Tem certeza que deseja ${acao}?`)) {
      return;
    }

    try {
      setAlterandoBiblioteca(avaliacao.id);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        "/api/admin/biblioteca",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "avaliacao",
            avaliacaoId: avaliacao.id,
            publicar,
          }),
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível alterar a publicação da avaliação."
        );
      }

      setAvaliacoesBiblioteca((listaAtual) =>
        listaAtual.map((item) =>
          item.id === avaliacao.id
            ? {
                ...item,
                publicar_biblioteca: publicar,
                publicado_em:
                  resultado?.avaliacao?.publicado_em ?? null,
              }
            : item
        )
      );

      setAvaliacaoSelecionada((atual) =>
        atual?.id === avaliacao.id
          ? {
              ...atual,
              publicar_biblioteca: publicar,
              publicado_em:
                resultado?.avaliacao?.publicado_em ?? null,
            }
          : atual
      );

      alert(
        publicar
          ? "Avaliação publicada na Biblioteca!"
          : "Avaliação retirada da Biblioteca."
      );
    } catch (error) {
      console.error(
        "Erro ao alterar publicação da avaliação:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a publicação da avaliação."
      );
    } finally {
      setAlterandoBiblioteca(null);
    }
  }

  async function descartarAvaliacaoBiblioteca(
    avaliacao: AvaliacaoBiblioteca
  ) {
    const confirmou = window.confirm(
      `Descartar esta avaliação da curadoria da Biblioteca?\n\n${
        avaliacao.titulo || "Avaliação sem título"
      }\n\nEla continuará normalmente na conta do professor e não será excluída.`
    );

    if (!confirmou) return;

    try {
      setAlterandoBiblioteca(avaliacao.id);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        "/api/admin/biblioteca",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "avaliacao",
            avaliacaoId: avaliacao.id,
            acao: "descartar",
          }),
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível descartar a avaliação."
        );
      }

      setAvaliacoesBiblioteca((listaAtual) =>
        listaAtual.filter(
          (item) => item.id !== avaliacao.id
        )
      );

      setAvaliacaoSelecionada((atual) =>
        atual?.id === avaliacao.id
          ? null
          : atual
      );

      alert(
        "Avaliação retirada da fila de revisão. Ela continua normalmente para o professor."
      );
    } catch (error) {
      console.error(
        "Erro ao descartar avaliação da curadoria:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível descartar a avaliação."
      );
    } finally {
      setAlterandoBiblioteca(null);
    }
  }

  async function editarTituloAvaliacao(
    avaliacao: AvaliacaoBiblioteca
  ) {
    const tituloAtual =
      avaliacao.titulo?.trim() || "";

    const novoTitulo = window.prompt(
      "Edite o título da avaliação:",
      tituloAtual
    );

    if (novoTitulo === null) return;

    const tituloLimpo = novoTitulo.trim();

    if (!tituloLimpo) {
      alert("O título não pode ficar vazio.");
      return;
    }

    if (tituloLimpo === tituloAtual) return;

    try {
      setAlterandoBiblioteca(avaliacao.id);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        "/api/admin/biblioteca",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "avaliacao",
            avaliacaoId: avaliacao.id,
            acao: "editar_titulo",
            titulo: tituloLimpo,
          }),
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível editar o título da avaliação."
        );
      }

      setAvaliacoesBiblioteca((listaAtual) =>
        listaAtual.map((item) =>
          item.id === avaliacao.id
            ? { ...item, titulo: tituloLimpo }
            : item
        )
      );

      setAvaliacaoSelecionada((atual) =>
        atual?.id === avaliacao.id
          ? { ...atual, titulo: tituloLimpo }
          : atual
      );

      alert("Título atualizado com sucesso!");
    } catch (error) {
      console.error(
        "Erro ao editar título da avaliação:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível editar o título da avaliação."
      );
    } finally {
      setAlterandoBiblioteca(null);
    }
  }

  async function alterarPlanoUsuario(
    usuario: Usuario,
    novoPlano: "premium" | "gratuito"
  ) {
    const acao =
      novoPlano === "premium"
        ? "liberar o Premium"
        : "retirar o Premium";

    const confirmou = window.confirm(
      `Tem certeza que deseja ${acao} para ${
        usuario.email || "este usuário"
      }?`
    );

    if (!confirmou) {
      return;
    }

    try {
      setAlterandoPlano(true);

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (
        erroSessao ||
        !session?.access_token
      ) {
        throw new Error(
          "Sua sessão expirou. Entre novamente."
        );
      }

      const resposta = await fetch(
        "/api/admin/usuarios/plano",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            usuarioId: usuario.id,
            plano: novoPlano,
          }),
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => null);

      if (!resposta.ok) {
        throw new Error(
          resultado?.erro ||
            "Não foi possível alterar o plano."
        );
      }

      await carregarPainel();

      setUsuarioSelecionado(
        resultado.usuario
      );

      alert(
        novoPlano === "premium"
          ? "Premium liberado com sucesso!"
          : "Premium retirado com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao alterar plano:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o plano."
      );
    } finally {
      setAlterandoPlano(false);
    }
  }

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const usuariosFiltrados =
    useMemo(() => {
      const busca =
        buscaUsuario
          .trim()
          .toLowerCase();

      return (
        dados?.usuarios.filter(
          (usuario) => {
            const nome =
              usuario.nome
                ?.toLowerCase() || "";

            const email =
              usuario.email
                ?.toLowerCase() || "";

            const correspondeBusca =
              !busca ||
              nome.includes(busca) ||
              email.includes(busca);

            const ehPremium =
              String(
                usuario.plano || ""
              ).toLowerCase() === "premium";

            const cupomOrigem =
              String(
                usuario.cupom_origem || ""
              )
                .trim()
                .toUpperCase();

            const correspondePlano =
              filtroPlano === "premium"
                ? ehPremium
                : !ehPremium;

            const correspondeOrigem =
              filtroPlano === "ayanne"
                ? cupomOrigem === "AYANNE"
                : true;

            return (
              correspondeBusca &&
              correspondePlano &&
              correspondeOrigem
            );
          }
        ) || []
      );
    }, [
      buscaUsuario,
      dados?.usuarios,
      filtroPlano,
    ]);

  const atividadesBibliotecaFiltradas =
    useMemo(() => {
      const busca = buscaBiblioteca
        .trim()
        .toLowerCase();

      return atividadesBiblioteca.filter(
        (atividade) => {
          const correspondeStatus =
            filtroBiblioteca === "todas"
              ? true
              : filtroBiblioteca === "publicadas"
                ? atividade.publicar_biblioteca === true
                : atividade.publicar_biblioteca !== true;

          if (!correspondeStatus) {
            return false;
          }

          if (!busca) {
            return true;
          }

          return [
            atividade.titulo,
            atividade.pedido,
            atividade.disciplina,
            atividade.serie,
            atividade.etapa_ensino,
          ].some((valor) =>
            String(valor || "")
              .toLowerCase()
              .includes(busca)
          );
        }
      );
    }, [
      atividadesBiblioteca,
      buscaBiblioteca,
      filtroBiblioteca,
    ]);

  const avaliacoesBibliotecaFiltradas =
    useMemo(() => {
      const busca = buscaBiblioteca
        .trim()
        .toLowerCase();

      return avaliacoesBiblioteca.filter(
        (avaliacao) => {
          const correspondeStatus =
            filtroBiblioteca === "todas"
              ? true
              : filtroBiblioteca === "publicadas"
                ? avaliacao.publicar_biblioteca === true
                : avaliacao.publicar_biblioteca !== true;

          if (!correspondeStatus) {
            return false;
          }

          if (!busca) {
            return true;
          }

          return [
            avaliacao.titulo,
            avaliacao.conteudos,
            avaliacao.disciplina,
            avaliacao.serie,
            avaliacao.etapa_ensino,
          ].some((valor) =>
            String(valor || "")
              .toLowerCase()
              .includes(busca)
          );
        }
      );
    }, [
      avaliacoesBiblioteca,
      buscaBiblioteca,
      filtroBiblioteca,
    ]);

  const parceirosPorId =
    useMemo(() => {
      const mapa = new Map<
        string,
        Parceiro
      >();

      dados?.parceiros.forEach(
        (parceiro) => {
          mapa.set(
            parceiro.id,
            parceiro
          );
        }
      );

      return mapa;
    }, [dados?.parceiros]);

  const percentualPremium =
    dados?.resumo.totalUsuarios
      ? Math.round(
          (dados.resumo.totalPremium /
            dados.resumo.totalUsuarios) *
            100
        )
      : 0;

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-emerald-600"
            size={42}
          />

          <p className="mt-4 font-semibold text-slate-600">
            Carregando painel administrativo...
          </p>
        </div>
      </main>
    );
  }

  if (erro || !dados) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
          <ShieldCheck
            size={52}
            className="mx-auto text-emerald-600"
          />

          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">
            Painel Administrativo
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            {erro ||
              "Não foi possível carregar o painel."}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setCarregando(true);
                carregarPainel();
              }}
              className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              Tentar novamente
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/login")
              }
              className="cursor-pointer rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700"
            >
              Ir para o login
            </button>
          </div>
        </div>
      </main>
    );
  }

  const cards = [
    {
      titulo: "Total de usuários",
      valor:
        dados.resumo.totalUsuarios,
      descricao:
        "Clientes sem contar parceiros",
      icone: Users,
    },
    {
      titulo: "Premium ativos",
      valor:
        dados.resumo.totalPremium,
      descricao:
        `${percentualPremium}% dos usuários`,
      icone: Crown,
    },
    {
      titulo: "Gratuitos",
      valor:
        dados.resumo.totalGratuitos,
      descricao:
        "Ainda não Premium",
      icone: UserRound,
    },
    {
      titulo: "Parceiros ativos",
      valor:
        dados.resumo.parceirosAtivos,
      descricao:
        "Parceiros disponíveis",
      icone: Handshake,
    },
    {
      titulo: "Pagamentos parceiros",
      valor:
        dados.resumo
          .pagamentosParceiros,
      descricao:
        "Indicações pagas",
      icone: BadgeDollarSign,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <LayoutDashboard
                size={25}
              />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Painel Administrativo
              </h1>

              <p className="text-sm text-slate-500">
                Controle do PlanejAI
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={atualizar}
              disabled={atualizando}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  atualizando
                    ? "animate-spin"
                    : ""
                }
              />

              Atualizar
            </button>

            <button
              type="button"
              onClick={sair}
              className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => {
            const Icone =
              card.icone;

            return (
              <div
                key={card.titulo}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {card.titulo}
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {card.valor}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Icone
                      size={22}
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {card.descricao}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Conversão geral
            </p>

            <div className="mt-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-4xl font-extrabold text-emerald-700">
                    {percentualPremium}%
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    dos usuários são Premium
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-600">
                  {
                    dados.resumo
                      .totalPremium
                  }{" "}
                  de{" "}
                  {
                    dados.resumo
                      .totalUsuarios
                  }
                </p>
              </div>

              <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width:
                      `${Math.min(
                        percentualPremium,
                        100
                      )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-bold text-slate-900">
              Visão rápida
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Premium
                </span>

                <strong className="text-emerald-700">
                  {
                    dados.resumo
                      .totalPremium
                  }
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Gratuitos
                </span>

                <strong>
                  {
                    dados.resumo
                      .totalGratuitos
                  }
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Parceiros
                </span>

                <strong>
                  {
                    dados.resumo
                      .parceirosAtivos
                  }
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setAba("usuarios")
            }
            className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-bold transition ${
              aba === "usuarios"
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Usuários
          </button>

          <button
            type="button"
            onClick={() =>
              setAba("parceiros")
            }
            className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-bold transition ${
              aba === "parceiros"
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Parceiros
          </button>

          <button
            type="button"
            onClick={() =>
              setAba("indicacoes")
            }
            className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-bold transition ${
              aba === "indicacoes"
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Indicações
          </button>

          <button
            type="button"
            onClick={() =>
              setAba("biblioteca")
            }
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
              aba === "biblioteca"
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            <BookOpen size={17} />
            Biblioteca
          </button>
        </div>

        {aba === "usuarios" && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Usuários
                  </h2>

                  <p className="text-sm text-slate-500">
                    {usuariosFiltrados.length} usuário(s) exibido(s)
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={buscaUsuario}
                    onChange={(event) =>
                      setBuscaUsuario(
                        event.target.value
                      )
                    }
                    placeholder="Buscar nome ou e-mail..."
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFiltroPlano("nao-premium")
                  }
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filtroPlano === "nao-premium"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Não Premium ({dados.resumo.totalGratuitos})
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFiltroPlano("premium")
                  }
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filtroPlano === "premium"
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Premium ({dados.resumo.totalPremium})
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFiltroPlano("ayanne")
                  }
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filtroPlano === "ayanne"
                      ? "bg-violet-600 text-white"
                      : "border border-violet-300 bg-white text-violet-700 hover:bg-violet-50"
                  }`}
                >
                  Somente AYANNE
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1450px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      Nome
                    </th>

                    <th className="px-5 py-4">
                      E-mail
                    </th>

                    <th className="px-5 py-4">
                      WhatsApp
                    </th>

                    <th className="px-5 py-4">
                      Contato por e-mail
                    </th>

                    <th className="px-5 py-4">
                      Plano
                    </th>

                    <th className="px-5 py-4">
                      Parceiro de origem
                    </th>

                    <th className="px-5 py-4">
                      Planos restantes
                    </th>

                    <th className="px-5 py-4">
                      Mercado Pago ID
                    </th>

                    <th className="px-5 py-4">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosFiltrados.map(
                    (usuario) => {
                      const numeroLimpo =
                        String(
                          usuario.whatsapp ||
                            ""
                        ).replace(
                          /\D/g,
                          ""
                        );

                      const numeroWhatsApp =
                        numeroLimpo
                          ? numeroLimpo.startsWith(
                              "55"
                            )
                            ? numeroLimpo
                            : `55${numeroLimpo}`
                          : "";

                      const primeiroNome =
                        usuario.nome
                          ?.trim()
                          .split(" ")[0] ||
                        "";

                      const mensagemWhatsApp =
                        `Oi${
                          primeiroNome
                            ? `, ${primeiroNome}`
                            : ""
                        }! Vi que você se cadastrou no PlanejAI através do cupom AYANNE e estou passando para te avisar que estamos nas últimas oportunidades de testar a plataforma gratuitamente.\n\n` +
                        `Se você ainda não chegou a experimentar de verdade, aproveite para entrar e criar algo que esteja precisando para suas aulas — pode ser um planejamento, uma avaliação ou uma atividade.\n\n` +
                        `A ideia é você conhecer o PlanejAI na prática e ver se ele realmente pode facilitar sua rotina.\n\n` +
                        `Acesse: https://planejaioficial.com.br\n\n` +
                        `Aproveite essa oportunidade para testar antes de decidir se quer continuar.`;

                      const assuntoEmail =
                        "Cupom AYANNE: últimas oportunidades para testar o PlanejAI";

                      const mensagemEmail =
                        `Olá${
                          primeiroNome
                            ? `, ${primeiroNome}`
                            : ""
                        }!\n\n` +
                        `Você se cadastrou no PlanejAI utilizando o cupom AYANNE e queremos te fazer um lembrete importante.\n\n` +
                        `Estamos entrando nas últimas oportunidades para experimentar o PlanejAI gratuitamente.\n\n` +
                        `Se você ainda não testou a plataforma ou entrou apenas para conhecer, aproveite para experimentar agora com algo que realmente precisa preparar para suas aulas.\n\n` +
                        `No PlanejAI, você pode criar planejamentos de aula, avaliações personalizadas e atividades pedagógicas com auxílio da inteligência artificial.\n\n` +
                        `Comece a semana colocando o PlanejAI à prova. Escolha algo que você precisa preparar e veja, na prática, se ele pode economizar seu tempo.\n\n` +
                        `Acesse sua conta: https://planejaioficial.com.br\n\n` +
                        `Você não precisa decidir nada agora. Primeiro experimente.\n\n` +
                        `Equipe PlanejAI`;

                      return (
                        <tr
                          key={
                            usuario.id
                          }
                          className="border-t border-slate-100"
                        >
                          <td className="px-5 py-4 font-semibold text-slate-800">
                            {usuario.nome ||
                              "Sem nome"}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {usuario.email ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            {numeroWhatsApp ? (
                              <a
                                href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
                                  mensagemWhatsApp
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex cursor-pointer items-center whitespace-nowrap rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                              >
                                Chamar no WhatsApp
                              </a>
                            ) : (
                              <span className="text-slate-400">
                                Sem WhatsApp
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {usuario.email ? (
                              <a
                                href={`mailto:${usuario.email}?subject=${encodeURIComponent(
                                  assuntoEmail
                                )}&body=${encodeURIComponent(
                                  mensagemEmail
                                )}`}
                                className="inline-flex cursor-pointer items-center whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                              >
                                Enviar e-mail
                              </a>
                            ) : (
                              <span className="text-slate-400">
                                Sem e-mail
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                usuario.plano ===
                                "premium"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {usuario.plano ===
                              "premium"
                                ? "Premium"
                                : "Gratuito"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {usuario.cupom_origem ? (
                              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                                {
                                  usuario.cupom_origem
                                }
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Sem parceiro
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {usuario.planos_restantes ??
                              "-"}
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {usuario.mercado_pago_id ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setUsuarioSelecionado(
                                  usuario
                                )
                              }
                              className="cursor-pointer whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                            >
                              Gerenciar
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aba === "parceiros" && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-extrabold text-slate-900">
                Parceiros
              </h2>

              <p className="text-sm text-slate-500">
                {dados.parceiros.length} parceiro(s)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      Nome
                    </th>
                    <th className="px-5 py-4">
                      Cupom
                    </th>
                    <th className="px-5 py-4">
                      Acessos
                    </th>
                    <th className="px-5 py-4">
                      Visitantes
                    </th>
                    <th className="px-5 py-4">
                      Cadastros
                    </th>
                    <th className="px-5 py-4">
                      Pagamentos
                    </th>
                    <th className="px-5 py-4">
                      Conversão
                    </th>
                    <th className="px-5 py-4">
                      Comissão
                    </th>
                    <th className="px-5 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dados.parceiros.map(
                    (parceiro) => (
                      <tr
                        key={parceiro.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {parceiro.nome ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 font-mono font-semibold text-slate-600">
                          {parceiro.cupom ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 font-bold text-blue-700">
                          {parceiro.totalAcessos ??
                            0}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {parceiro.totalVisitantes ??
                            0}
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-800">
                          {parceiro.totalCadastros ??
                            0}
                        </td>

                        <td className="px-5 py-4 font-bold text-emerald-700">
                          {parceiro.totalPagamentos ??
                            0}
                        </td>

                        <td className="px-5 py-4">
                          {parceiro.conversao ??
                            0}
                          %
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-emerald-700">
                            {formatarDinheiro(
                              parceiro.comissaoTotal
                            )}
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            {Number(
                              parceiro.comissao_percentual ||
                                0
                            )}
                            % por venda
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              parceiro.ativo
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {parceiro.ativo
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aba === "indicacoes" && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-extrabold text-slate-900">
                Indicações
              </h2>

              <p className="text-sm text-slate-500">
                {
                  dados.indicacoes
                    .length
                }{" "}
                registro(s)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      Parceiro
                    </th>
                    <th className="px-5 py-4">
                      Cliente
                    </th>
                    <th className="px-5 py-4">
                      Cupom
                    </th>
                    <th className="px-5 py-4">
                      Status
                    </th>
                    <th className="px-5 py-4">
                      Assinatura
                    </th>
                    <th className="px-5 py-4">
                      Comissão
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dados.indicacoes.map(
                    (indicacao) => {
                      const parceiro =
                        indicacao.parceiro_id
                          ? parceirosPorId.get(
                              indicacao.parceiro_id
                            )
                          : undefined;

                      return (
                        <tr
                          key={
                            indicacao.id
                          }
                          className="border-t border-slate-100"
                        >
                          <td className="px-5 py-4 font-semibold">
                            {parceiro?.nome ||
                              "Sem parceiro"}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {indicacao.email_cliente ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 font-mono">
                            {indicacao.cupom ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                indicacao.status ===
                                "pago"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : indicacao.status ===
                                      "pendente"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {indicacao.status ||
                                "-"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {formatarDinheiro(
                              indicacao.valor_assinatura
                            )}
                          </td>

                          <td className="px-5 py-4 font-bold text-emerald-700">
                            {formatarDinheiro(
                              indicacao.valor_comissao
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aba === "biblioteca" && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                    <BookOpen
                      size={21}
                      className="text-emerald-600"
                    />
                    Biblioteca de Materiais
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Revise atividades e avaliações antes de disponibilizá-las na Biblioteca.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={carregarBiblioteca}
                  disabled={carregandoBiblioteca}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={17}
                    className={
                      carregandoBiblioteca
                        ? "animate-spin"
                        : ""
                    }
                  />
                  Atualizar materiais
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setTipoMaterialBiblioteca("atividades")
                  }
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    tipoMaterialBiblioteca === "atividades"
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <BookOpen size={16} />
                  Atividades
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTipoMaterialBiblioteca("avaliacoes")
                  }
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    tipoMaterialBiblioteca === "avaliacoes"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ClipboardList size={16} />
                  Avaliações
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-xl">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={buscaBiblioteca}
                    onChange={(event) =>
                      setBuscaBiblioteca(event.target.value)
                    }
                    placeholder="Buscar título, conteúdo, série ou disciplina..."
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    ["nao-publicadas", "Pendentes"],
                    ["publicadas", "Revisadas / Publicadas"],
                    ["todas", "Todas"],
                  ].map(([valor, rotulo]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() =>
                        setFiltroBiblioteca(
                          valor as
                            | "todas"
                            | "publicadas"
                            | "nao-publicadas"
                        )
                      }
                      className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        filtroBiblioteca === valor
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {carregandoBiblioteca ? (
              <div className="py-16 text-center">
                <LoaderCircle
                  size={38}
                  className="mx-auto animate-spin text-emerald-600"
                />
                <p className="mt-3 font-semibold text-slate-600">
                  Carregando materiais...
                </p>
              </div>
            ) : tipoMaterialBiblioteca === "atividades" ? (
              <div className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-600">
                    {atividadesBibliotecaFiltradas.length}{" "}
                    atividade(s) exibida(s)
                  </p>
                  <p className="text-xs text-slate-400">
                    A imagem completa só é carregada ao visualizar.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {atividadesBibliotecaFiltradas.map((atividade) => {
                    const publicada =
                      atividade.publicar_biblioteca === true;
                    const alterando =
                      alterandoBiblioteca === atividade.id;

                    return (
                      <article
                        key={atividade.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              publicada
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {publicada
                              ? "✓ Revisada / Publicada"
                              : "Pendente de revisão"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {atividade.quantidade_questoes
                              ? `${atividade.quantidade_questoes} questão(ões)`
                              : atividade.tipo_atividade || "Atividade"}
                          </span>
                        </div>

                        <h3 className="mt-3 line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5 text-slate-900">
                          {atividade.titulo || "Atividade sem título"}
                        </h3>

                        <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                          <p><strong className="text-slate-700">Série:</strong>{" "}{atividade.serie || "-"}</p>
                          <p><strong className="text-slate-700">Disciplina:</strong>{" "}{atividade.disciplina || "-"}</p>
                        </div>

                        {atividade.pedido && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {atividade.pedido}
                          </p>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => visualizarAtividade(atividade)} disabled={carregandoPreview} className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"><Eye size={15} />Ver</button>
                          <button type="button" onClick={() => editarTituloAtividade(atividade)} disabled={alterando} className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"><Pencil size={14} />Editar</button>
                          <button type="button" onClick={() => alterarPublicacaoBiblioteca(atividade, !publicada)} disabled={alterando} className={`cursor-pointer rounded-lg px-2 py-2 text-[11px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${publicada ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>{alterando ? "..." : publicada ? "Retirar" : "Publicar"}</button>
                          {!publicada && (
                            <button type="button" onClick={() => descartarAtividadeBiblioteca(atividade)} disabled={alterando} className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 size={14} />Descartar</button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {atividadesBibliotecaFiltradas.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
                    <BookOpen size={34} className="mx-auto text-slate-400" />
                    <p className="mt-3 font-bold text-slate-700">Nenhuma atividade encontrada</p>
                    <p className="mt-1 text-sm text-slate-500">Tente mudar a busca ou o filtro.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-600">
                    {avaliacoesBibliotecaFiltradas.length}{" "}
                    avaliação(ões) exibida(s)
                  </p>
                  <p className="text-xs text-slate-400">
                    O conteúdo completo é carregado ao visualizar.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {avaliacoesBibliotecaFiltradas.map((avaliacao) => {
                    const publicada =
                      avaliacao.publicar_biblioteca === true;
                    const alterando =
                      alterandoBiblioteca === avaliacao.id;

                    return (
                      <article
                        key={avaliacao.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              publicada
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {publicada
                              ? "✓ Revisada / Publicada"
                              : "Pendente de revisão"}
                          </span>
                          <span className="text-xs font-semibold text-blue-600">
                            Avaliação
                          </span>
                        </div>

                        <h3 className="mt-3 line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5 text-slate-900">
                          {avaliacao.titulo || "Avaliação sem título"}
                        </h3>

                        <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                          <p><strong className="text-slate-700">Série:</strong>{" "}{avaliacao.serie || "-"}</p>
                          <p><strong className="text-slate-700">Disciplina:</strong>{" "}{avaliacao.disciplina || "-"}</p>
                        </div>

                        {avaliacao.conteudos && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {avaliacao.conteudos}
                          </p>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => visualizarAvaliacao(avaliacao)} disabled={carregandoPreview} className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"><Eye size={15} />Ver</button>
                          <button type="button" onClick={() => editarTituloAvaliacao(avaliacao)} disabled={alterando} className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"><Pencil size={14} />Editar</button>
                          <button type="button" onClick={() => alterarPublicacaoAvaliacao(avaliacao, !publicada)} disabled={alterando} className={`cursor-pointer rounded-lg px-2 py-2 text-[11px] font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${publicada ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>{alterando ? "..." : publicada ? "Retirar" : "Publicar"}</button>
                          {!publicada && (
                            <button type="button" onClick={() => descartarAvaliacaoBiblioteca(avaliacao)} disabled={alterando} className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 size={14} />Descartar</button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {avaliacoesBibliotecaFiltradas.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
                    <ClipboardList size={34} className="mx-auto text-slate-400" />
                    <p className="mt-3 font-bold text-slate-700">Nenhuma avaliação encontrada</p>
                    <p className="mt-1 text-sm text-slate-500">Tente mudar a busca ou o filtro.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck
            size={15}
          />

          Área administrativa protegida
        </div>
      </section>

      {atividadeSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  Prévia da atividade
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {atividadeSelecionada.titulo ||
                    "Atividade"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {atividadeSelecionada.serie || "-"}{" "}
                  •{" "}
                  {atividadeSelecionada.disciplina || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAtividadeSelecionada(null)
                }
                disabled={Boolean(
                  alterandoBiblioteca
                )}
                className="cursor-pointer rounded-lg px-3 py-2 text-xl font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="max-h-[68vh] overflow-auto bg-slate-100 p-4 sm:p-6">
              {atividadeSelecionada.imagem ? (
                <img
                  src={atividadeSelecionada.imagem}
                  alt={
                    atividadeSelecionada.titulo ||
                    "Prévia da atividade"
                  }
                  className="mx-auto h-auto max-w-full rounded-xl bg-white shadow-sm"
                />
              ) : (
                <div className="py-16 text-center text-slate-500">
                  A imagem desta atividade não está disponível.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
              {atividadeSelecionada.imagem && (
                <button
                  type="button"
                  onClick={() =>
                    baixarAtividadeAdmin(
                      atividadeSelecionada
                    )
                  }
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
                >
                  <Download size={17} />
                  Baixar imagem
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  editarTituloAtividade(atividadeSelecionada)
                }
                disabled={
                  alterandoBiblioteca ===
                  atividadeSelecionada.id
                }
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil size={17} />
                Editar título
              </button>

              <button
                type="button"
                onClick={() =>
                  alterarPublicacaoBiblioteca(
                    atividadeSelecionada,
                    atividadeSelecionada.publicar_biblioteca !==
                      true
                  )
                }
                disabled={
                  alterandoBiblioteca ===
                  atividadeSelecionada.id
                }
                className={`cursor-pointer rounded-xl px-5 py-3 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  atividadeSelecionada.publicar_biblioteca ===
                  true
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {alterandoBiblioteca ===
                atividadeSelecionada.id
                  ? "Alterando..."
                  : atividadeSelecionada.publicar_biblioteca ===
                      true
                    ? "Retirar da Biblioteca"
                    : "Publicar na Biblioteca"}
              </button>

              {atividadeSelecionada.publicar_biblioteca !== true && (
                <button
                  type="button"
                  onClick={() =>
                    descartarAtividadeBiblioteca(atividadeSelecionada)
                  }
                  disabled={
                    alterandoBiblioteca === atividadeSelecionada.id
                  }
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={17} />
                  Descartar da revisão
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setAtividadeSelecionada(null)
                }
                className="cursor-pointer rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {avaliacaoSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Prévia da avaliação
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  {avaliacaoSelecionada.titulo || "Avaliação"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {avaliacaoSelecionada.serie || "-"}{" "}•{" "}
                  {avaliacaoSelecionada.disciplina || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAvaliacaoSelecionada(null)}
                disabled={Boolean(alterandoBiblioteca)}
                className="cursor-pointer rounded-lg px-3 py-2 text-xl font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="max-h-[68vh] overflow-auto bg-slate-100 p-4 sm:p-6">
              <div className="mx-auto max-w-4xl rounded-2xl bg-white p-5 shadow-sm">
                {avaliacaoSelecionada.conteudos && (
                  <div className="mb-5 rounded-xl bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Conteúdos
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {avaliacaoSelecionada.conteudos}
                    </p>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                  {avaliacaoSelecionada.avaliacao_completa ||
                    "O conteúdo desta avaliação não está disponível."}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => editarTituloAvaliacao(avaliacaoSelecionada)}
                disabled={alterandoBiblioteca === avaliacaoSelecionada.id}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil size={17} />
                Editar título
              </button>

              <button
                type="button"
                onClick={() =>
                  alterarPublicacaoAvaliacao(
                    avaliacaoSelecionada,
                    avaliacaoSelecionada.publicar_biblioteca !== true
                  )
                }
                disabled={alterandoBiblioteca === avaliacaoSelecionada.id}
                className={`cursor-pointer rounded-xl px-5 py-3 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  avaliacaoSelecionada.publicar_biblioteca === true
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {alterandoBiblioteca === avaliacaoSelecionada.id
                  ? "Alterando..."
                  : avaliacaoSelecionada.publicar_biblioteca === true
                    ? "Retirar da Biblioteca"
                    : "Publicar na Biblioteca"}
              </button>

              {avaliacaoSelecionada.publicar_biblioteca !== true && (
                <button
                  type="button"
                  onClick={() => descartarAvaliacaoBiblioteca(avaliacaoSelecionada)}
                  disabled={alterandoBiblioteca === avaliacaoSelecionada.id}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={17} />
                  Descartar da revisão
                </button>
              )}

              <button
                type="button"
                onClick={() => setAvaliacaoSelecionada(null)}
                className="cursor-pointer rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {usuarioSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  Controle de usuário
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Gerenciar usuário
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setUsuarioSelecionado(
                    null
                  )
                }
                disabled={alterandoPlano}
                className="cursor-pointer rounded-lg px-3 py-2 text-xl font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-5">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Nome
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {usuarioSelecionado.nome ||
                    "Sem nome"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  E-mail
                </p>

                <p className="mt-1 break-all text-slate-700">
                  {usuarioSelecionado.email ||
                    "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    WhatsApp
                  </p>

                  <p className="mt-1 text-slate-700">
                    {usuarioSelecionado.whatsapp ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Parceiro de origem
                  </p>

                  <p className="mt-1 font-semibold text-slate-700">
                    {usuarioSelecionado.cupom_origem ||
                      "Sem parceiro"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Plano atual
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      usuarioSelecionado.plano ===
                      "premium"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {usuarioSelecionado.plano ===
                    "premium"
                      ? "Premium"
                      : "Gratuito"}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Planos restantes
                  </p>

                  <p className="mt-2 font-bold text-slate-800">
                    {usuarioSelecionado.planos_restantes ??
                      "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {usuarioSelecionado.plano ===
              "premium" ? (
                <button
                  type="button"
                  disabled={
                    alterandoPlano
                  }
                  onClick={() =>
                    alterarPlanoUsuario(
                      usuarioSelecionado,
                      "gratuito"
                    )
                  }
                  className="cursor-pointer rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {alterandoPlano
                    ? "Alterando..."
                    : "Retirar Premium"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    alterandoPlano
                  }
                  onClick={() =>
                    alterarPlanoUsuario(
                      usuarioSelecionado,
                      "premium"
                    )
                  }
                  className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {alterandoPlano
                    ? "Alterando..."
                    : "Liberar Premium"}
                </button>
              )}

              <button
                type="button"
                disabled={
                  alterandoPlano
                }
                onClick={() =>
                  setUsuarioSelecionado(
                    null
                  )
                }
                className="cursor-pointer rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}