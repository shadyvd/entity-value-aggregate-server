/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseArtifact } from './evas-base-artifact.js';
import { DomainLifecycleManagerFactory } from '../lifecycle_managers/domain-lifecycle-manager.js';

/**
 * @class EVASBaseDomain
 * @extends EVASBaseArtifact
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc
 * The Base Class for all Domains.
 *
 */
export class EVASBaseDomain extends EVASBaseArtifact {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location);
		this.#domainInterface = domainInterface;
	}
	// #endregion

	// #region Startup / Shutdown
	/**
	 * @memberof EVASBaseDomain
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name load
	 *
	 * @returns {null} - Nothing.
	 *
	 * @description
	 * Loads / Initializes / Starts-up sub-artifacts.
	 *
	 */
	async load() {
		// Step 1: Basic init
		await super.load?.();

		// Step 2: Instantiate the loader, and let it
		// do its magic
		await DomainLifecycleManagerFactory?.createInstances?.(
			this?.__dirname,
			this?.domainInterface
		);

		return;
	}

	/**
	 * @memberof EVASBaseDomain
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name unload
	 *
	 * @returns {null} - Nothing.
	 *
	 * @description
	 * Shuts-down / Un-initializes / Un-loads sub-artifacts.
	 *
	 */
	async unload() {
		// Step 1: Unload the sub-artifacts
		await DomainLifecycleManagerFactory?.destroyInstances?.(
			this?.__dirname
		);

		// Step 2: Un-instantiate.
		this.#domainInterface = undefined;

		// Step 3: Basic un-init
		await super.unload?.();
		return;
	}
	// #endregion

	// #region Getters / Setters
	/**
	 * @memberof EVASBaseDomain
	 * @instance
	 * @member {object} domainInterface
	 *
	 * @returns {object} - Domain Interface
	 *
	 * @description
	 * Returns the domain interface instance that manages
	 * the IoC / API for this Domain
	 *
	 */
	get domainInterface() {
		return this.#domainInterface;
	}
	// #endregion

	// #region Private Fields
	#domainInterface = undefined;
	// #endregion
}
