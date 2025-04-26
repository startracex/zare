export const KEYWORDS = {
    AS: "as",
    IMPORT: "import",
    LINK: "link",
    CSS: "css",
    RETURN: "return",
    IF: "@if",
    ELSE: "@else",
    EACH: "@each"
};

export type Keyword = typeof KEYWORDS[keyof typeof KEYWORDS];
