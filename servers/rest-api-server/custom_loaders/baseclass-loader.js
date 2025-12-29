/**
 * Imports for this file
 * @ignore
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

import { errorSerializer } from '@twyr/error-serializer';

/**
 * @async
 * @function
 * @name resolve
 *
 * @param {string} [specifier] - the url to be resolved
 * @param {object} [context] - random stuff
 * @param {Function} [nextResolve] - callback
 *
 * @returns {object} - containing details of the resolved base class file.
 *
 * @description
 * Resolves to the file path of the requested base class class.
 */
export async function resolve(specifier, context, nextResolve) {
	if (!specifier.startsWith('baseclass:')) {
		return nextResolve(specifier);
	}

	const __filename = fileURLToPath?.(import.meta?.url);
	const __dirname = dirname?.(__filename);

	const baseclassFile = specifier?.replace?.('baseclass:', '')?.trim?.();
	const baseclassFolder = './../base_classes';
	const baseclassFilePath = join?.(
		__dirname,
		baseclassFolder,
		`${baseclassFile}.js`
	);

	return {
		shortCircuit: true,
		url: `file://${baseclassFilePath}`
	};
}

/**
 * @async
 * @function
 * @name load
 *
 * @param {string} [url] - the url to be resolved
 * @param {object} [context] - random stuff
 * @param {Function} [nextLoad] - callback
 *
 * @returns {object} - containing the base class.
 *
 * @description Loads the requested base class.__dirname
 */
export async function load(url, context, nextLoad) {
	if (!url.startsWith('baseclass:')) {
		return nextLoad(url);
	}

	try {
		const __filename = fileURLToPath?.(import.meta?.url);
		const __dirname = dirname?.(__filename);

		const baseclassFile = url?.replace?.('baseclass:', '')?.trim?.();
		const baseclassFolder = './../base_classes';
		const baseclassFilePath = join?.(
			__dirname,
			baseclassFolder,
			`${baseclassFile}.js`
		);

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const baseClass = await readFile?.(baseclassFilePath);
		return {
			format: 'module',
			shortCircuit: true,
			source: baseClass
		};
	} catch (error) {
		const serializedError = errorSerializer?.(error);

		console?.error?.(
			`Error Loading Base Class File::${url}: ${serializedError}`
		);

		throw error;
	}
}
