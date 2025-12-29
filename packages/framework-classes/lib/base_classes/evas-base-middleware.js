/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseArtifact } from './evas-base-artifact.js';

/**
 * @class EVASBaseMiddleware
 * @extends EVASBaseArtifact
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc
 * The Base Class for all Middlewares.
 */
export class EVASBaseMiddleware extends EVASBaseArtifact {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location);
		this.#domainInterface = domainInterface;
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof EVASBaseMiddleware
	 * @async
	 * @instance
	 * @override
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
		await super.load?.();
	}

	/**
	 * @memberof EVASBaseMiddleware
	 * @async
	 * @instance
	 * @override
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
		this.#domainInterface = undefined;
		await super.unload?.();
	}
	// #endregion

	// #region Getters / Setters
	/**
	 * @memberof EVASBaseMiddleware
	 * @instance
	 * @member {object} domainInterface
	 *
	 * @returns {object} - The Domain's interface
	 *
	 * @description
	 * Returns the interface exposed by this Middleware's
	 * Domain to its sub-artifacts
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
