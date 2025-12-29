/**
 * Imports for this file
 * @ignore
 */

/**
 * @class EVASBaseClass
 *
 * @classdesc
 * The Framework Base Class. All artifacts, in general, across
 * the servers in this monorepo derive from this
 */
export class EVASBaseClass {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		// Intentionally blank
	}
	// #endregion

	// #region Getters / Setters
	/**
	 * @memberof EVASBaseClass
	 * @instance
	 * @readonly
	 * @member {string} name
	 * @returns {string} Name of the Class.
	 */
	get name() {
		return this?.constructor?.name ?? 'EVASBaseClass';
	}
	// #endregion
}
