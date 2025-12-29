/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseBoundedContext } from 'baseclass:bounded-context';

/**
 * @class Profile
 * @extends BaseBoundedContext
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Profile BoundedContext Class.
 *
 */
class Profile extends BaseBoundedContext {
	// #region Constructor
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Startup / Shutdown
	/**
	 * @memberof Profile
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
	 * @memberof Profile
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
 * @classdesc The Profile BoundedContext Class Factory.
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
	 * @returns {Profile} - The Profile module instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!BoundedContextFactory.#profileInstance) {
			const profileInstance = new Profile(
				BoundedContextFactory['$disk_unc'],
				domainInterface
			);

			await profileInstance?.load?.();
			BoundedContextFactory.#profileInstance = profileInstance;
		}

		return BoundedContextFactory.#profileInstance;
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
	 * @description Clears the Profile instance
	 */
	static async destroyInstances() {
		await BoundedContextFactory.#profileInstance?.unload?.();
		BoundedContextFactory.#profileInstance = undefined;

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
	 * Returns the name of this bounded context - Profile
	 */
	static get BoundedContextName() {
		return 'Profile';
	}
	// #endregion

	// #region Private Static Members
	static #profileInstance = undefined;
	// #endregion
}
