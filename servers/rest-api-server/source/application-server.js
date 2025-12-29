/**
 * Imports for this file
 * @ignore
 */
import { EventEmitter } from 'node:events';

import { EVASBaseArtifact } from '@twyr/framework-classes';
import { EVASBaseFactory } from '@twyr/framework-classes';

import { ServerLifecycleManagerFactory } from '@twyr/framework-classes';

import { APIRegistry } from '@twyr/api-registry';
import { IocContainer } from '@twyr/server-dependency-manager';

/**
 * @class ApplicationServer
 * @extends EVASBaseArtifact
 *
 * @param {string} [location] - __dirname for this file, basically
 * @param {string} [serverName] - name for this application server
 *
 * @classdesc The Server's Application Class.
 *
 */
class ApplicationServer extends EVASBaseArtifact {
	// #region Constructor
	constructor(location, serverName) {
		super(location);
		this.#serverName = serverName;
	}
	// #endregion

	// #region Startup / Shutdown
	/**
	 * @memberof ApplicationServer
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
		// Step 1: Basic init
		await super.load?.();

		// Step 2: Instantiate the loader and IoC container
		this.#apiRegistry = new APIRegistry(this.#serverName, undefined);
		this.#iocContainer = new IocContainer(this.#serverName, undefined);
		this.#eventEmitter = new EventEmitter();

		const serverInterface = Object?.assign?.(
			{},
			{
				apiRegistry: this.#apiRegistry,
				iocContainer: this.#iocContainer,
				eventEmitter: this.#eventEmitter
			}
		);
		await ServerLifecycleManagerFactory?.createInstances?.(
			this?.__dirname,
			serverInterface
		);

		// Step 3: Start listening for HTTP Requests
		const restApiRepository =
			await this.#iocContainer?.resolve?.('RestApi');
		await restApiRepository?.start?.();

		// Finally, announce we're up...
		const loggerRepository = await this.#iocContainer?.resolve?.('Logger');
		loggerRepository?.info?.(
			`\n\nTICKING AWAY THE MOMENTS THAT MAKE UP A DULL DAY...`
		);

		return;
	}

	/**
	 * @memberof ApplicationServer
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
		// Step 1: Announce that we're going down..
		const loggerRepository = await this.#iocContainer?.resolve?.('Logger');
		loggerRepository?.info?.(
			`\n\nTHE TIME IS GONE, THE SONG IS OVER\nTHOUGHT I'D SOMETHING MORE TO SAY...\n`
		);

		// Step 2: Stop the REST API server
		const restApiRepository =
			await this.#iocContainer?.resolve?.('RestApi');
		await restApiRepository?.stop?.();

		// Step 3: Unload the sub-artifacts
		await ServerLifecycleManagerFactory?.destroyInstances?.();

		// Step 4: Un-instantiate.
		this.#apiRegistry = undefined;
		this.#iocContainer = undefined;

		// Finally, Basic un-init
		await super.unload?.();
		this.#serverName = undefined;
		return;
	}
	// #endregion

	// #region Private Fields
	#apiRegistry = undefined;
	#iocContainer = undefined;
	#eventEmitter = undefined;

	#serverName = undefined;
	// #endregion
}

/**
 * @class ApplicationServerFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Application Server Class Factory.
 */
export default class ApplicationServerFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Creation API
	/**
	 * @memberof ApplicationServerFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstances
	 *
	 * @param {string} [location] - __dirname for this file in CJS, basically
	 * @param {string} [serverName] - process name of this server
	 *
	 * @returns {ApplicationServer} - The server application instance.
	 *
	 */
	static async createInstances(location, serverName) {
		if (!ApplicationServerFactory.#ApplicationServerInstance) {
			ApplicationServerFactory.#ApplicationServerInstance =
				new ApplicationServer(location, serverName);

			await ApplicationServerFactory.#ApplicationServerInstance?.load?.();
		}

		return ApplicationServerFactory.#ApplicationServerInstance;
	}

	/**
	 * @memberof ApplicationServerFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description Clears the cached {ApplicationServer} instances
	 *
	 */
	static async destroyInstances() {
		if (!ApplicationServerFactory.#ApplicationServerInstance) return;

		await ApplicationServerFactory.#ApplicationServerInstance?.unload?.();
		ApplicationServerFactory.#ApplicationServerInstance = undefined;
	}
	// #endregion

	// #region Private Static Members
	static #ApplicationServerInstance = undefined;
	// #endregion
}
