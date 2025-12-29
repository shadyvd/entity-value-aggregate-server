/**
 * Imports for this file
 * @ignore
 */
import { Buffer } from 'node:buffer';
import { join } from 'node:path';

import { EVASBaseRepository } from '@twyr/framework-classes';
import { EVASBaseFactory } from '@twyr/framework-classes';

/**
 * Magic Number constants
 * @ignore
 */
const DEFAULT_LOGGER_LEVEL = 'info';
const DEFAULT_LOGGER_FORMAT = 'json';
const DEFAULT_LOGGER_TRANSPORTS = [];

/**
 * @class Logger
 * @extends EVASBaseRepository
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [iocContainer] - IoC module providing DI repositories
 * @param {object} [configuration] - requested repository configuration
 *
 * @classdesc The Logger Repository Class.
 *
 */
class Logger extends EVASBaseRepository {
	// #region Constructor
	constructor(location, iocContainer, configuration) {
		super(location, iocContainer, configuration);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof Logger
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
			loggerLevel: DEFAULT_LOGGER_LEVEL,
			loggerFormat: DEFAULT_LOGGER_FORMAT,
			loggerTransports: DEFAULT_LOGGER_TRANSPORTS
		};

		const configuration =
			await this?._mergeConfiguration?.(defaultConfiguration);

		// Step 2: Setup the client
		let winston = await import('winston');
		winston = winston?.['default'];

		const loggerLevel = configuration?.['loggerLevel'];

		let loggerFormat = configuration?.['loggerFormat'];
		loggerFormat = winston?.format?.combine?.(
			winston?.format?.timestamp?.(),
			// eslint-disable-next-line security/detect-object-injection
			winston?.format?.[loggerFormat]?.()
		);
		const loggerTransports = configuration?.['loggerTransports']?.map?.(
			(transport) => {
				return new winston.transports[transport?.name](
					transport?.options
				);
			}
		);

		if (!loggerTransports?.length) {
			loggerTransports?.push?.(
				new winston.transports.File({
					filename: join?.(
						this?.__dirname,
						'../../../logs/error.log'
					),
					format: loggerFormat,
					level: 'error'
				})
			);

			loggerTransports?.push?.(
				new winston.transports.File({
					filename: join?.(
						this?.__dirname,
						'../../../logs/combined.log'
					),
					format: loggerFormat
				})
			);

			loggerTransports?.push?.(
				new winston.transports.Console({
					format: winston?.format?.simple?.()
				})
			);
		}

		// Step 3: Open the logger instance
		this.#winston = winston?.createLogger?.({
			level: loggerLevel,
			transports: loggerTransports
		});
	}

	/**
	 * @memberof Logger
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
		this.#winston?.clear?.();
		this.#winston = undefined;

		await super.unload?.();
	}
	// #endregion

	// #region Getters / Setters
	get interface() {
		return this.#winston;
	}
	// #endregion

	// #region Private Fields
	#winston = undefined;
	// #endregion
}

/**
 * @class RepositoryFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Logger Repository Class Factory.
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
	 * @returns {Logger} - The logger repository instance.
	 *
	 */
	static async createInstances(configuration, iocContainer) {
		const repositoryKey = Buffer?.from?.(
			JSON?.stringify?.(configuration ?? {})
		)?.toString?.('base64');

		if (!RepositoryFactory.#loggerInstances?.has(repositoryKey)) {
			const loggerInstance = new Logger(
				RepositoryFactory['$disk_unc'],
				iocContainer,
				configuration
			);

			await loggerInstance?.load?.();
			RepositoryFactory.#loggerInstances?.set?.(
				repositoryKey,
				loggerInstance
			);
		}

		return RepositoryFactory.#loggerInstances?.get(repositoryKey)
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
	 * @description Clears the cached {Logger} instances
	 */
	static async destroyInstances(configuration) {
		if (configuration) {
			const repositoryKey = Buffer?.from?.(
				JSON?.stringify?.(configuration)
			)?.toString?.('base64');

			if (!RepositoryFactory.#loggerInstances?.has(repositoryKey)) return;

			const loggerInstance =
				RepositoryFactory.#loggerInstances?.get(repositoryKey);
			await loggerInstance?.unload?.();

			RepositoryFactory.#loggerInstances?.delete?.(repositoryKey);
			return;
		}

		const destroyResolutions = [];
		this.#loggerInstances?.forEach?.((loggerInstance) => {
			destroyResolutions?.push?.(loggerInstance?.unload?.());
		});

		await Promise?.allSettled?.(destroyResolutions);
		this.#loggerInstances?.clear?.();

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
	 * Returns the name of this repository - Logger
	 */
	static get RepositoryName() {
		return 'Logger';
	}
	// #endregion

	// #region Private Static Members
	static #loggerInstances = new Map();
	// #endregion
}
