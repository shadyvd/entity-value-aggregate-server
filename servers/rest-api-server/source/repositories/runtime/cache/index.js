/**
 * Imports for this file
 * @ignore
 */
import { Buffer } from 'node:buffer';
import { createClient } from 'redis';

import { EVASBaseRepository } from '@twyr/framework-classes';
import { EVASBaseFactory } from '@twyr/framework-classes';

/**
 * Magic Number constants
 * @ignore
 */
const DEFAULT_REDIS_HOST = '127.0.0.1';
const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_DATABASE = 0;

const DEFAULT_MAX_RETRY_COUNT = 5;

/**
 * @class Cache
 * @extends EVASBaseRepository
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [iocContainer] - IoC module providing DI repositories
 * @param {object} [configuration] - requested repository configuration
 *
 * @classdesc The Cache Repository Class.
 *
 */
class Cache extends EVASBaseRepository {
	// #region Constructor
	constructor(location, iocContainer, configuration) {
		super(location, iocContainer, configuration);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof Cache
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

		// Step 1: Setup the configuration
		const defaultConfiguration = {
			socket: {
				host: DEFAULT_REDIS_HOST,
				port: DEFAULT_REDIS_PORT,
				database: DEFAULT_REDIS_DATABASE,
				reconnectStrategy: (retries /* cause */) => {
					this.#retryCount = retries;

					if (retries > DEFAULT_MAX_RETRY_COUNT) {
						return false;
					}

					return Math.min(retries * 250, 5000);
				}
			}
		};

		const configuration =
			await this?._mergeConfiguration?.(defaultConfiguration);

		// Step 2: Setup the client
		this.#redis = createClient(configuration);
		this.#redis?.on?.('connect', this.#handleRedisConnection?.bind(this));
		this.#redis?.on?.(
			'reconnecting',
			this.#handleRedisReconnection?.bind(this)
		);
		this.#redis?.on?.('error', this.#handleRedisError?.bind(this));

		//
		// PATCH STUFF THAT WE NEED
		//
		this.#redis.setex = this.#redis.setEx.bind(this.#redis);

		// Step 3: Open a connection to the server
		await this.#redis?.connect?.();

		// Step 4: In development mode, monitor all the commands
		// sent to the cache server
		//
		// TODO: ONCE the Redis driver fixes its bugs
		//
		/*
		if (serverEnvironment === 'production') return;
		if (this?.configuration) return;

		this.#monitor = this.#redis?.duplicate?.();
		this.#monitor?.on?.(
			'monitor',
			this.#logRedisCommands?.bind?.(this)
		);

		await this.#monitor?.connect?.();
		await this.#monitor?.sendCommand?.(['MONITOR']);
		*/
	}

	/**
	 * @memberof Cache
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
		if (this.#monitor) {
			await this.#monitor?.disconnect?.();
			this.#monitor = undefined;
		}

		if (this.#redis) {
			await this.#redis?.disconnect?.();
			this.#redis = undefined;
		}

		await super.unload?.();
	}
	// #endregion

	// #region Getters / Setters
	get interface() {
		return this.#redis;
	}
	// #endregion

	// #region Private Methods
	//
	// TODO: ONCE the Redis driver fixes its bugs
	//
	/*
	async #logRedisCommands() {
		const logger = await this?.iocContainer?.resolve?.('Logger');
		logger?.debug?.(arguments);
	}
	*/

	async #handleRedisConnection() {
		this.#retryCount = 0;
	}

	async #handleRedisReconnection() {}

	async #handleRedisError(error) {
		const logger = await this?.iocContainer?.resolve?.('Logger');
		logger?.error?.(
			`Redis Error (Re-try count = ${this.#retryCount}): ${error?.message}\n${error.stack}`
		);

		if (this.#retryCount > DEFAULT_MAX_RETRY_COUNT) throw error;
	}
	// #endregion

	// #region Private Fields
	#redis = undefined;
	#monitor = undefined;

	#retryCount = 0;
	// #endregion
}

/**
 * @class RepositoryFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Cache Repository Class Factory.
 */
export default class RepositoryFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstance
	 *
	 * @param {object} [configuration] - requested repository configuration
	 * @param {object} [iocContainer] - IoC Container providing DI Repositories
	 *
	 * @returns {Cache} - The cache repository instance.
	 *
	 */
	static async createInstances(configuration, iocContainer) {
		const repositoryKey = Buffer?.from?.(
			JSON?.stringify?.(configuration ?? {})
		)?.toString?.('base64');

		if (!RepositoryFactory.#cacheInstances?.has(repositoryKey)) {
			const cacheInstance = new Cache(
				RepositoryFactory['$disk_unc'],
				iocContainer,
				configuration
			);

			await cacheInstance?.load?.();
			RepositoryFactory.#cacheInstances?.set?.(
				repositoryKey,
				cacheInstance
			);
		}

		return RepositoryFactory.#cacheInstances?.get(repositoryKey)?.interface;
	}

	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @param {object} [configuration] - requested repository configuration
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description Clears the cached {Cache} instances
	 */
	static async destroyInstances(configuration) {
		if (configuration) {
			const repositoryKey = Buffer?.from?.(
				JSON?.stringify?.(configuration)
			)?.toString?.('base64');

			if (!RepositoryFactory.#cacheInstances?.has(repositoryKey)) return;

			const cacheInstance =
				RepositoryFactory.#cacheInstances?.get(repositoryKey);
			await cacheInstance?.unload?.();

			RepositoryFactory.#cacheInstances?.delete?.(repositoryKey);
			return;
		}

		const destroyResolutions = [];
		this.#cacheInstances?.forEach?.((cacheInstance) => {
			destroyResolutions?.push?.(cacheInstance?.unload?.());
		});

		await Promise?.allSettled?.(destroyResolutions);
		this.#cacheInstances?.clear?.();

		return;
	}
	// #endregion

	// #region Getters
	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name RepositoryName
	 *
	 * @returns {string} - Name of this repository.
	 *
	 * @description
	 * Returns the name of this repository - Cache
	 */
	static get RepositoryName() {
		return 'Cache';
	}
	// #endregion

	// #region Private Static Members
	static #cacheInstances = new Map();
	// #endregion
}
