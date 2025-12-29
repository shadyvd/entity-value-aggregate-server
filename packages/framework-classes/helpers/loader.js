/**
 * Imports for this file
 * @ignore
 */

import { dirname, join } from 'node:path';

import { fdir as FDir } from 'fdir';

/**
 * @async
 * @function
 * @name loader
 *
 * @param {string} [location] - search path
 * @param {boolean} [allFiles] - whether to include all files or just directories
 *
 * @returns {Array} - Array of the default exports found in the search path
 *
 * @description
 * Imports artifacts found in the searchPath, and returns the found artifact
 * factories as an array
 *
 */
export async function loader(location, allFiles = false) {
	// Step 1: Search for files in the location with depth 1
	const artifactLocations = await locateArtifacts(location, allFiles);

	// Step 2: Import all the found files
	const artifactFactories = await importArtifacts(artifactLocations);

	// Finally, return the factories
	return artifactFactories;
}

/**
 * @async
 * @function
 * @name locateArtifacts
 *
 * @param {string} [location] - search path
 * @param {boolean} [allFiles] - whether to include all files or just directories
 *
 * @returns {Array} - Array of folders found in the search path
 *
 * @description
 * Returns the folders found in the search path as an array
 *
 */
async function locateArtifacts(location, allFiles) {
	try {
		if (allFiles) {
			const crawlerApi = new FDir()?.withFullPaths?.()?.withMaxDepth?.(0);
			const artifactFiles = await crawlerApi
				?.crawl?.(location)
				?.withPromise?.();

			return artifactFiles;
		} else {
			const crawlerApi = new FDir()?.onlyDirs?.()?.withMaxDepth?.(0);
			const artifactLocations = await crawlerApi
				?.crawl?.(location)
				?.withPromise?.();

			// Remove the root location from the results - we want only sub-folders
			artifactLocations?.shift?.();
			return artifactLocations?.map((artifactLocation) => {
				return join(artifactLocation, 'index.js');
			});
		}
	} catch (error) {
		throw new Error(`Error locating artifacts @ ${location}`, {
			cause: error
		});
	}
}

/**
 * @async
 * @function
 * @name importArtifacts
 *
 * @param {Array} [artifactLocations] - artifact folders found in locateArtifacts
 *
 * @returns {Array} - Array of factories (default exports) found in the search path
 *
 * @description
 * - Finds the index.js files
 * - Imports them
 * - Sets the location of the file on the default export
 * - Returns the exports, which should be the Factories
 *
 */
async function importArtifacts(artifactLocations) {
	const errors = [];

	// Step 1: Import the artifact files
	let artifactImports;
	try {
		const importResolutions = [];
		for (const artifactFile of artifactLocations) {
			importResolutions?.push?.(import(artifactFile));
			continue;
		}

		artifactImports = await Promise?.allSettled?.(importResolutions);

		for (let index = 0; index < artifactImports?.length; index++) {
			// eslint-disable-next-line security/detect-object-injection
			const artifactImport = artifactImports?.[index];

			if (artifactImport?.status !== 'fulfilled') {
				errors?.push?.(
					// eslint-disable-next-line security/detect-object-injection
					new Error(`Failed to import ${artifactLocations[index]}`, {
						cause: artifactImport?.reason
					})
				);
				continue;
			}

			if (!artifactImport?.value?.['default']) {
				errors?.push?.(
					new Error(
						// eslint-disable-next-line security/detect-object-injection
						`${artifactLocations[index]} does not have a default export`
					)
				);
				continue;
			}

			artifactImport.value['default']['$disk_unc'] = dirname?.(
				// eslint-disable-next-line security/detect-object-injection
				artifactLocations[index]
			);
		}
	} catch (error) {
		errors?.push?.(`Error importing artifact files`, { cause: error });
	}

	// Code sanity... error checks
	if (errors?.length) {
		throw new AggregateError(
			errors,
			'Error importing at least one artifact file'
		);
	}

	// Finally, return the ArtifactFactories
	artifactImports = artifactImports?.map?.((artifactImport) => {
		return artifactImport?.value?.['default'];
	});

	return artifactImports;
}
