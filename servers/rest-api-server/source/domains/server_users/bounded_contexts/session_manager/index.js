/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseBoundedContext } from 'baseclass:bounded-context';

/**
 * @class SessionManager
 * @extends BaseBoundedContext
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The SessionManager BoundedContext Class.
 *
 */
class SessionManager extends BaseBoundedContext {
	// #region Constructor
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Startup / Shutdown
	/**
	 * @memberof SessionManager
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name load
	 *
	 * @returns {null} - Nothing.
	 *
	 * @description Loads / Initializes / Starts-up sub-artifacts.
	 *
	 */
	async load() {
		await super.load?.();
		return;
	}

	/**
	 * @memberof SessionManager
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name unload
	 *
	 * @returns {null} - Nothing.
	 *
	 * @description Shuts-down / Un-initializes / Un-loads sub-artifacts.
	 *
	 */
	async unload() {
		await super.unload?.();
		return;
	}
	// #endregion
}

/**
 * @class BoundedContextFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The SessionManager BoundedContext Class Factory.
 */
export default class BoundedContextFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof BoundedContextFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstance
	 *
	 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
	 *
	 * @returns {SessionManager} - The SessionManager module instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!BoundedContextFactory.#sessionManagerInstance) {
			const sessionManagerInstance = new SessionManager(
				BoundedContextFactory['$disk_unc'],
				domainInterface
			);

			await sessionManagerInstance?.load?.();
			BoundedContextFactory.#sessionManagerInstance =
				sessionManagerInstance;
		}

		return BoundedContextFactory.#sessionManagerInstance;
	}

	/**
	 * @memberof BoundedContextFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description Clears the SessionManager instance
	 */
	static async destroyInstances() {
		await BoundedContextFactory.#sessionManagerInstance?.unload?.();
		BoundedContextFactory.#sessionManagerInstance = undefined;

		return;
	}
	// #endregion

	// #region Getters
	/**
	 * @memberof BoundedContextFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name BoundedContextName
	 *
	 * @returns {string} - Name of this bounded context.
	 *
	 * @description
	 * Returns the name of this bounded context - SessionManager
	 */
	static get BoundedContextName() {
		return 'SessionManager';
	}
	// #endregion

	// #region Private Static Members
	static #sessionManagerInstance = undefined;
	// #endregion
}
