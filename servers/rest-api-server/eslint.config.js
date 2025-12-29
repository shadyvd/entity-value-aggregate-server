import js from '@eslint/js';
import globals from 'globals';
// import editorconfig from 'eslint-plugin-editorconfig';
import jsdoc from 'eslint-plugin-jsdoc';
import jsonc from 'eslint-plugin-jsonc';
import mocha from 'eslint-plugin-mocha';
import n from 'eslint-plugin-n';
import prettier from 'eslint-plugin-prettier';
import security from 'eslint-plugin-security';
import unicorn from 'eslint-plugin-unicorn';

import { globalIgnores } from 'eslint/config';

export default [
	/* --------------------------------------------------
	 * Base JavaScript rules
	 * -------------------------------------------------- */
	js.configs.recommended,

	/* --------------------------------------------------
	 * EditorConfig alignment
	 * -------------------------------------------------- */
	// editorconfig,

	/* --------------------------------------------------
	 * Global JS / Node configuration
	 * -------------------------------------------------- */
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.node, // for Node.js environments
				...globals.mocha, // for Mocha test files
				serverEnvironment: true
			}
		},
		plugins: {
			jsdoc,
			n,
			security,
			unicorn,
			prettier
		},
		rules: {
			/* ---------- Prettier ---------- */
			'prettier/prettier': 'error',

			/* ---------- Node ---------- */
			'n/no-missing-import': 'off', // handled by bundlers / TS
			'n/no-unpublished-import': 'off',
			'n/no-process-exit': 'warn',

			/* ---------- JSDoc ---------- */
			'jsdoc/require-jsdoc': [
				'warn',
				{
					publicOnly: true,
					require: {
						FunctionDeclaration: true,
						MethodDefinition: true,
						ClassDeclaration: true
					}
				}
			],
			'jsdoc/require-param': 'warn',
			'jsdoc/require-returns': 'warn',
			'jsdoc/check-alignment': 'error',
			'jsdoc/check-indentation': 'error',

			/* ---------- Security ---------- */
			'security/detect-object-injection': 'warn',
			'security/detect-non-literal-fs-filename': 'warn',
			'security/detect-child-process': 'warn',

			/* ---------- Unicorn ---------- */
			'unicorn/prefer-node-protocol': 'error',
			'unicorn/prefer-module': 'error',
			'unicorn/no-null': 'off',
			'unicorn/prevent-abbreviations': 'off',
			'unicorn/filename-case': [
				'error',
				{
					case: 'kebabCase'
				}
			]
		}
	},

	/* --------------------------------------------------
	 * Mocha test files
	 * -------------------------------------------------- */
	{
		files: ['test/**/*.js', '**/*.spec.js', '**/*.test.js'],
		plugins: {
			mocha
		},
		languageOptions: {
			globals: {
				...globals.browser, // for browser environments
				...globals.mocha, // for Mocha test files
				serverEnvironment: true
			}
		},
		rules: {
			'mocha/no-exclusive-tests': 'error',
			'mocha/no-skipped-tests': 'warn',
			'mocha/no-mocha-arrows': 'off',
			'mocha/max-top-level-suites': ['warn', { limit: 1 }]
		}
	},

	/* --------------------------------------------------
	 * JSON / JSONC files
	 * -------------------------------------------------- */
	{
		files: ['**/*.json', '**/*.jsonc'],
		languageOptions: {
			parser: jsonc.parser,
			globals: {
				...globals.browser, // for browser environments
				...globals.mocha, // for Mocha test files
				serverEnvironment: true
			}
		},
		plugins: {
			jsonc,
			prettier
		},
		rules: {
			'jsonc/quote-props': ['error', 'always'],
			'jsonc/sort-keys': 'off',
			'prettier/prettier': 'error'
		}
	},

	/* --------------------------------------------------
	 * Global Ignores
	 * -------------------------------------------------- */
	globalIgnores([
		'./.*.json',
		'.github/',
		'.husky/',
		'.vscode/',
		'buildresults/',
		'coverage/',
		'depcruise/',
		'deploy/',
		'docs/',
		'jsdoc_default/',
		'logs/',
		'node_modules/',
		'stats/',
		'package.json',
		'package-lock.json',
		'yarn.lock',
		'pnpm-lock.yaml',
		'eslint.config.js'
	])
];
