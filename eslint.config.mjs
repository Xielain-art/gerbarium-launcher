import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig(
  {
    ignores: [
      "**/dist/**",
      "**/dist-electron/**",
      "**/build/**",
      "**/release/**",
      "**/.agents/**",
      "**/.codex/**",
      "**/.gemini/**",
      "**/.claude/**",
      "**/.github/**",
      "**/graphify-out/**",
      "**/_legacy_app/**",
      "index.js",
      "node_modules",
      "eslint.config.mjs",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2024,
    },
  },
  {
    files: ["**/*.js"],
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "@stylistic/semi": ["error", "never"],
      "@stylistic/quotes": ["error", "single"],
      "@stylistic/indent": ["error", 4],
      "@stylistic/member-delimiter-style": [
        "error",
        {
          multiline: {
            delimiter: "none",
            requireLast: false,
          },
          singleline: {
            delimiter: "comma",
            requireLast: false,
          },
        },
      ],
      "@stylistic/linebreak-style": ["error", "windows"],
      "no-var": ["error"],
      "no-control-regex": "off",
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: false,
          argsIgnorePattern: "^_|^reject$",
        },
      ],
    },
  },
  {
    files: ["app/assets/js/scripts/*.js"],
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["src/renderer/src/components/shadcn/ui/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);
