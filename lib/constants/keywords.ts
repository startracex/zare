export const KEYWORDS = {
    AS: "as",
    IMPORT: "import",
    LINK: "link",
    CSS: "css",
    FN: "fn",
    SERVE: "serve",
    IF: "@if",
    ELSE: "@else",
    EACH: "@each"
};

export type Keyword = typeof KEYWORDS[keyof typeof KEYWORDS];
