import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      // Keep ts-comment strict, we'll fix occurrences in code
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': false,
        'ts-nocheck': false,
      }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='script']:has(JSXAttribute[name.name='src'][value.value$='.css'])",
          message: 'Do not load CSS using a <script> tag. Use a <link rel="stylesheet"> tag instead.',
        },
        {
          selector: "JSXOpeningElement[name.name='link']:has(JSXAttribute[name.name='rel'][value.value='preload']):has(JSXAttribute[name.name='as'][value.value='script'])",
          message: 'Do not preload CSS as a script. Use <link rel="preload" as="style"> instead.',
        },
      ],
    },
  },
];

export default eslintConfig;
