/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseRepository } from '@twyr/framework-classes';
import { EVASBaseFactory } from '@twyr/framework-classes';

/**
 * Magic Number constants
 * @ignore
 */
const DEFAULT_MONGODB_HOST = '127.0.0.1';
const DEFAULT_MONGODB_PORT = 27_017;
const DEFAULT_MONGODB_DATABASE = 'twyr';

const DEFAULT_MONGODB_USER = undefined;
const DEFAULT_MONGODB_PASSWORD = undefined;

const DEFAULT_MONGODB_PROTOCOL_FAMILY = 4;

/**
 * @class MongoDB
 * @extends EVASBaseRepository
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [iocContainer] - IoC module providing DI repositories
 * @param {object} [configuration] - requested repository configuration
 *
 * @classdesc The MongoDB Repository Class.
 *
 */
class MongoDB extends EVASBaseRepository {
	// #region Constructor
	constructor(location, iocContainer, configuration) {
		super(location, iocContainer, configuration);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof MongoDB
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
			host: DEFAULT_MONGODB_HOST,
			port: DEFAULT_MONGODB_PORT,
			dbName: DEFAULT_MONGODB_DATABASE,

			user: DEFAULT_MONGODB_USER,
			pass: DEFAULT_MONGODB_PASSWORD,

			family: DEFAULT_MONGODB_PROTOCOL_FAMILY
		};

		const configuration =
			await this?._mergeConfiguration?.(defaultConfiguration);

		// Step 2: Setup the Client
		let mongoose = await import('mongoose');
		mongoose = mongoose?.['default'];

		mongoose?.set?.('strictQuery', true);
		mongoose?.connection?.on?.(
			'error',
			this.#mongoConnectionError.bind(this)
		);

		// Step 3: Open a connection to the server
		let connectionString = `mongodb://${configuration?.host}:${configuration?.port}`;
		this.#mongoose = await mongoose?.createConnection?.(connectionString, {
			family: configuration?.family,
			user: configuration?.user,
			pass: configuration?.pass,
			dbName: configuration?.dbName
		});
	}

	/**
	 * @memberof MongoDB
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
		if (!this.#mongoose) return;

		await this.#mongoose?.close?.();
		this.#mongoose = undefined;

		await super.unload?.();
	}
	// #endregion

	// #region Getters / Setters
	get interface() {
		return this.#mongoose;
	}
	// #endregion

	// #region Private Methods
	async #mongoConnectionError(error) {
		const logger = await this?.iocContainer?.resolve?.('Logger');
		logger?.error?.(
			`${this.name}::#mongoConnectionError: ${error.message} @\n${error.stack}`
		);
	}
	// #endregion

	// #region Private Fields
	#mongoose = undefined;
	// #endregion
}

/**
 * @class RepositoryFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The MongoDB Repository Class Factory.
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
	 * @returns {MongoDB} - The MongoDB repository instance.
	 *
	 */
	static async createInstances(configuration, iocContainer) {
		const repositoryKey = Buffer?.from?.(
			JSON?.stringify?.(configuration ?? {})
		)?.toString?.('base64');

		if (!RepositoryFactory.#mongodbInstances?.has(repositoryKey)) {
			const mongodbInstance = new MongoDB(
				RepositoryFactory['$disk_unc'],
				iocContainer,
				configuration
			);

			await mongodbInstance?.load?.();
			RepositoryFactory.#mongodbInstances?.set?.(
				repositoryKey,
				mongodbInstance
			);
		}

		return RepositoryFactory.#mongodbInstances?.get(repositoryKey)
			?.interface;
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
	 * @description Clears the cached {MongoDB} instances
	 */
	static async destroyInstances(configuration) {
		if (configuration) {
			const repositoryKey = Buffer?.from?.(
				JSON?.stringify?.(configuration)
			)?.toString?.('base64');

			if (!RepositoryFactory.#mongodbInstances?.has(repositoryKey))
				return;

			const mongodbInstance =
				RepositoryFactory.#mongodbInstances?.get(repositoryKey);
			await mongodbInstance?.unload?.();

			RepositoryFactory.#mongodbInstances?.delete?.(configuration);
			return;
		}

		const destroyResolutions = [];
		this.#mongodbInstances?.forEach?.((MongoDBInstance) => {
			destroyResolutions?.push?.(MongoDBInstance?.unload?.());
		});

		await Promise?.allSettled?.(destroyResolutions);
		this.#mongodbInstances?.clear?.();

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
	 * Returns the name of this repository - MongoDB
	 */
	static get RepositoryName() {
		return 'MongoDB';
	}
	// #endregion

	// #region Private Static Members
	static #mongodbInstances = new Map();
	// #endregion
}
