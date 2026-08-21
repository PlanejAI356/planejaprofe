export function arquivoParaDataUrl(
  arquivo: File
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const leitor = new FileReader();

      leitor.onload = () => {
        resolve(String(leitor.result));
      };

      leitor.onerror = () => {
        reject(
          new Error(
            "Não foi possível carregar a imagem."
          )
        );
      };

      leitor.readAsDataURL(arquivo);
    }
  );
}

export function sanitizarHtmlCabecalho(
  html: string
) {
  if (!html.trim()) {
    return "";
  }

  const container =
    document.createElement("div");

  container.innerHTML = html;

  // Remove elementos que podem interferir
  // no restante da avaliação ou atividade.
  container
    .querySelectorAll(
      "style, script, link, meta, iframe, object, embed"
    )
    .forEach((elemento) =>
      elemento.remove()
    );

  container
    .querySelectorAll<HTMLElement>("*")
    .forEach((elemento) => {
      Array.from(
        elemento.attributes
      ).forEach((atributo) => {
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
      });

      const estilo = elemento.style;

      [
        "position",
        "float",
        "left",
        "right",
        "top",
        "bottom",
        "transform",
        "translate",
        "min-width",
      ].forEach((propriedade) => {
        estilo.removeProperty(
          propriedade
        );
      });

      // A tabela deve respeitar a largura
      // disponível do cabeçalho.
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
          "border-collapse",
          "collapse"
        );

        estilo.setProperty(
          "table-layout",
          "auto"
        );
      }

      // Logo/slogan não pode ultrapassar
      // o espaço disponível.
      if (
        elemento.tagName === "IMG"
      ) {
        estilo.setProperty(
          "max-width",
          "100%"
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

export function normalizarImagensCabecalho(
  raiz: HTMLElement
) {
  raiz
    .querySelectorAll<HTMLImageElement>(
      "img"
    )
    .forEach((imagem) => {
      imagem.setAttribute(
        "draggable",
        "true"
      );

      imagem.style.maxWidth =
        "100%";

      imagem.style.height = "auto";

      imagem.style.objectFit =
        "contain";

      imagem.style.cursor = "grab";
    });
}