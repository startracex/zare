module.exports = {
  port: 8185,
  static: "./static",
  pages: "./pages",
  outdir: "./dist",
  includes: ["./static"],
  generateStaticParams(path) {
    switch (path) {
      case "user/[id]":
        return {
          id: ["zare_user"],
        };
    }
  },
};
