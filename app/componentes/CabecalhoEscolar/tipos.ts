export type TipoUsoCabecalho =
  | "avaliacao"
  | "atividade";

export type CabecalhoEscolarProps = {
  tipo?: TipoUsoCabecalho;

  valor: string;

  onChange: (html: string) => void;

  /*
   * Mantido para a Avaliação,
   * que já usa esse nome.
   */
  chaveLocalStorage?: string;

  /*
   * Usado também pela Atividade.
   * O componente aceita os dois nomes
   * para não quebrar o que já funciona.
   */
  storageKey?: string;

  /*
   * Permite procurar um cabeçalho antigo
   * em outra chave caso a principal
   * ainda não tenha conteúdo.
   */
  fallbackStorageKeys?: string[];

  titulo?: string;

  descricao?: string;

  mostrarBotaoSalvar?: boolean;

  onSalvar?: (html: string) => void;
};