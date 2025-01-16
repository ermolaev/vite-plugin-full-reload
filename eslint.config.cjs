const parser = require("@typescript-eslint/parser");

module.exports = [
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.vue"],
        ignores: ["examples/*", "dist/*", "node_modules/*"],
        languageOptions: {
            parser,
            parserOptions: {
                ecmaVersion: 8,
                sourceType: "module",
                project: "./tsconfig.json"
            }
        },
        plugins: {
            "@typescript-eslint": require("@typescript-eslint/eslint-plugin")
        },
    }
];