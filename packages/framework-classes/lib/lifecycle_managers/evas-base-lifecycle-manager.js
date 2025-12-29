/**
 * Imports for this file
 * @ignore
 */
import { join } from 'node:path';

import { EVASBaseClass } from '../evas-base-class.js';
import { loader } from '../../helpers/loader.js';

/**
 * @class EVASBaseLifecycleManager
 * @extends EVASBaseClass
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc
 * The Base Lifecycle Manager Class for all Artifacts.
 */
export class EVASBaseLifecycleManager extends EVASBaseClass {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super();

		this.#__dirname = location;
		this.#domainInterface = domainInterface;

		if (serverEnvironment === 'production') return;
		console?.info?.(`\n${location}\n${this?.name}::constructor`);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof EVASBaseLifecycleManager
	 * @async
	 * @instance
	 * @function
	 * @name load
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for implementing custom
	 * start logic
	 *
	 */
	async load() {
		if (serverEnvironment === 'production') return;
		console?.info?.(`${this?.name}::load`);
	}

	/**
	 * @memberof EVASBaseLifecycleManager
	 * @async
	 * @instance
	 * @function
	 * @name unload
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for implementing custom
	 * stop logic
	 *
	 */
	async unload() {
		if (serverEnvironment !== 'production') {
			console?.info?.(`\n${this?.__dirname}\n${this?.name}::unload`);
		}

		this.#domainInterface = undefined;
		this.#__dirname = undefined;
	}
	// #endregion

	// #region "Protected Methods" - to be used only by derived classes
	/**
	 * @memberof EVASBaseLifecycleManager
	 * @async
	 * @instance
	 * @protected
	 * @function
	 * @name _loadArtifacts
	 *
	 * @param {string} [path] - search path for the artifacts
	 * @param {boolean} [allFiles=false] - whether to load all files, or only index.js
	 *
	 * @returns {Map} - A Map of the loaded / instantiated artifacts.
	 *
	 */
	async _loadArtifacts(path, allFiles = false) {
		const artifactsLocation = join?.(this.#__dirname, path);
		const ArtifactFactories = await loader?.(artifactsLocation, allFiles);

		return ArtifactFactories;
	}

	/**
	 * @memberof EVASBaseLifecycleManager
	 * @async
	 * @instance
	 * @protected
	 * @function
	 * @name _unloadArtifacts
	 *
	 * @param {Map} [artifacts] - map of artifacts to be unloaded
	 *
	 * @returns {null} - Nothing.
	 *
	 */
	async _unloadArtifacts(artifacts) {
		const errors = [];

		try {
			let artifactUnloadResolutions = [];
			// eslint-disable-next-line no-unused-vars
			for (const [artifactName, artifactInstance] of artifacts) {
				artifactUnloadResolutions?.push?.(artifactInstance?.unload?.());
			}

			artifactUnloadResolutions = await Promise?.allSettled?.(
				artifactUnloadResolutions
			);

			for (const unloadResolution of artifactUnloadResolutions) {
				if (unloadResolution?.status === 'fulfilled') continue;
				errors?.push?.(unloadResolution?.reason);
			}
		} catch (error) {
			errors?.push?.(error);
		}

		if (!errors?.length) return;

		throw new AggregateError(errors, `Unload Artifacts Error`);
	}
	// #endregion

	// #region Getters / Setters
	/**
	 * @memberof EVASBaseLifecycleManager
	 * @instance
	 * @member {string} __dirname
	 *
	 * @returns {string} - Location of this file
	 *
	 * @description
	 * Returns the path to the directory (on disk) for this file
	 * In ES6, we do not have __dirname, so the file that loads
	 * this should pass it in
	 *
	 */
	get __dirname() {
		return this.#__dirname;
	}

	/**
	 * @memberof EVASBaseLifecycleManager
	 * @instance
	 * @member {object} domainInterface
	 *
	 * @member {object} domainInterface
	 *
	 * @returns {object} - Domain Interface
	 *
	 * @description
	 * Returns the domain interface instance that manages
	 * the IoC / API for this Server
	 *
	 *
	 */
	get domainInterface() {
		return this.#domainInterface;
	}
	// #endregion

	// #region Private Fields
	#__dirname = undefined;
	#domainInterface = undefined;
	// #endregion
}
