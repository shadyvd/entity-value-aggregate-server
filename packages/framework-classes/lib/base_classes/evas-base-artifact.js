/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseClass } from '../evas-base-class.js';

/**
 *
 * @class EVASBaseArtifact
 * @extends EVASBaseClass
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 *
 * @classdesc
 * Serves as the "base class" for all artifacts in the Server,
 * including Repositories, BoundedContexts, Domains, Middleware, Surfaces,
 * and the ApplicationServer itself
 */
export class EVASBaseArtifact extends EVASBaseClass {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location) {
		super();
		this.#__dirname = location;

		if (serverEnvironment === 'production') return;
		console?.info?.(`\n${location}\n${this?.name}::constructor`);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof EVASBaseArtifact
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
	 * @memberof EVASBaseArtifact
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
			console?.info?.(`\n${this.#__dirname}\n${this?.name}::unload`);
		}

		this.#__dirname = undefined;
	}
	// #endregion

	// #region Getters / Setters
	/**
	 * @memberof EVASBaseArtifact
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
	// #endregion

	// #region Private Fields
	#__dirname = undefined;
	// #endregion
}
