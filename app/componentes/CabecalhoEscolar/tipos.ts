export type TipoUsoCabecalho =
  | "avaliacao"
  | "atividade";

export type CabecalhoEscolarProps = {
  tipo: TipoUsoCabecalho;

  valor: string;

  onChange: (html: string) => void;

  chaveLocalStorage?: string;

  titulo?: string;

  descricao?: string;

  mostrarBotaoSalvar?: boolean;

  onSalvar?: (html: string) => void;
};