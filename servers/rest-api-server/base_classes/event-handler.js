/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseEventHandler } from '@twyr/framework-classes';

/**
 * @class BaseEventHandler
 * @extends EVASBaseEventHandler
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Base Class for all Event Handlers.
 */
export class BaseEventHandler extends EVASBaseEventHandler {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof BaseEventHandler
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
		await this?._registerHandlers?.();
	}

	/**
	 * @memberof BaseEventHandler
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
		await this?._unregisterHandlers?.();
		await super.unload?.();
	}
	// #endregion

	// #region Protected Methods, to be overridden by derived classes
	/**
	 * @memberof BaseEventHandler
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _registerHandlers
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for adding their API
	 * to the eventEmitter in the domainInterface
	 *
	 */
	async _registerHandlers() {
		return [];
	}

	/**
	 * @memberof BaseEventHandler
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _unregisterHandlers
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for removing their API
	 * from the eventEmitter in the domainInterface
	 *
	 */
	async _unregisterHandlers() {
		return;
	}
	// #endregion
}
