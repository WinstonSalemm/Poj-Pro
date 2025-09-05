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
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='script'][attributes.some(attr => attr.type === 'JSXAttribute' && attr.name.name === 'src' && typeof attr.value.value === 'string' && attr.value.value.endsWith('.css'))]",
          message: 'Do not load CSS using a <script> tag. Use a <link rel="stylesheet"> tag instead.',
        },
        {
          selector: "JSXOpeningElement[name.name='link'][attributes.some(attr => attr.type === 'JSXAttribute' && attr.name.name === 'rel' && attr.value.value === 'preload')][attributes.some(attr => attr.type === 'JSXAttribute' && attr.name.name === 'as' && attr.value.value === 'script')]",
          message: 'Do not preload CSS as a script. Use <link rel="preload" as="style"> instead.',
        },
      ],
    },
  },
];

export default eslintConfig;
