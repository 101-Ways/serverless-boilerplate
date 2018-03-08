import hook from "css-modules-require-hook";
import sass from "node-sass";
var cssModulesClassFormat = require("../cssmodulesClassFormat");

hook({
  extensions: [".scss", ".css"],
  generateScopedName: cssModulesClassFormat,
  camelCase: true,
  preprocessCss: (data, file) =>
    sass.renderSync({
      file,
      includePaths: ["./"]
    }).css
});
