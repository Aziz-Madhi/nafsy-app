// https://docs.expo.dev/guides/using-eslint/
// @ts-check
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const reactCompiler = require("eslint-plugin-react-compiler");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "node_modules/*", "*.d.ts", "convex/_generated/*"],
    plugins: {
      "react-compiler": reactCompiler,
    },
    rules: {
      // React Compiler
      "react-compiler/react-compiler": "error",
      
      // TypeScript preferences
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      
      // Import organization
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/export": "error",
      
      // React best practices
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-no-leaked-render": "error",
      "react/no-unstable-nested-components": "error",
      
      // Code quality
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
]);
