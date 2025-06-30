import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import parser from 'svelte-eslint-parser';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: { 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: parser,
			ecmaVersion: 5,
			sourceType: 'script',
			parserOptions: {
				parser: '@typescript-eslint/parser',
				svelteConfig
			}
		}
	},
	{
		files: ['**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		files: ['**/*.svelte.ts', '**/*.svelte.js', '**/*.ts', '**/*.js'],
		extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
		settings: {
			'import/extensions': ['.js', '.ts', '.svelte'],
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts', '.js'],
				// https://github.com/import-js/eslint-plugin-import/issues/2837#issuecomment-1646122243
				'svelte-eslint-parser': ['.svelte']
			},
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true
				}
			}
		},
		rules: {
			'import/first': 'error',

			'import/no-duplicates': 'error',

			'import/order': [
				'error',
				{
					groups: [['builtin', 'external'], 'internal', 'parent', 'sibling', 'index', 'type'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true }
				}
			],

			'import/newline-after-import': ['error', { count: 1 }],

			'import/no-useless-path-segments': [
				'error',
				{
					noUselessIndex: true
				}
			]
		}
	}
);
