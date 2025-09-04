// .eslintrc.cjs  (voeg toe aan de repo-root)
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    plugins: ["@typescript-eslint", "react", "react-hooks"],
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:@typescript-eslint/recommended"
    ],
    settings: { react: { version: "detect" } },
    rules: {
      // Voorkom false-positives in JSX
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }
      ],
      // Tijdelijk relaxed — elders in repo staan veel any's
      "@typescript-eslint/no-explicit-any": "off",
      "react/react-in-jsx-scope": "off"
    },
    ignorePatterns: ["dist", "node_modules", "coverage", ".vite"]
  };
  