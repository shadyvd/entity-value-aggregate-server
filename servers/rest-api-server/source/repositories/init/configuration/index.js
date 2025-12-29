/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseRepository } from '@twyr/framework-classes';
import { EVASBaseFactory } from '@twyr/framework-classes';

/**
 * @class Configuration
 * @extends EVASBaseRepository
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [iocContainer] - IoC module providing DI repositories
 * @param {object} [configuration] - requested repository configuration
 *
 * @classdesc The Configuration Repository Class.
 *
 */
class Configuration extends EVASBaseRepository {
	// #region Constructor
	constructor(location, iocContainer, configuration) {
		super(location, iocContainer, configuration);
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof Configuration
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
	 * @memberof Configuration
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name unload
	 *
4	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for implementing custom
	 * stop logic
	 *
	 */
	async unload() {
		await super.unload?.();
	}
	// #endregion

	// #region Public API
	/**
	 * @memberof Configuration
	 * @async
	 * @instance
	 * @function
	 * @name getConfig
	 *
	 * @param {string} [artifactName] - name of the artifact that needs configuration
	 *
	 * @returns {object} - Configuration for the requested artifact
	 *
	 */
	async getConfig(artifactName) {
		// TODO: MOVE AWAY FROM process.env AND MOVE TOWARDS SOMETHING
		// MORE SOPHISTICATED - DATABASE, REDIS, VAULT, ETC.
		const artifactConfig =
			process?.env?.[artifactName?.toUpperCase?.()] ?? undefined;
		return JSON?.parse?.(artifactConfig ?? '{}');
	}
	// #endregion

	// #region Getters / Setters
	get interface() {
		return {
			getConfig: this?.getConfig?.bind?.(this)
		};
	}
	// #endregion
}

/**
 * @class RepositoryFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Configuration Repository Class Factory.
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
	 * @returns {Configuration} - The configuration repository instance.
	 *
	 */
	static async createInstances(configuration, iocContainer) {
		if (!RepositoryFactory.#configurationInstance) {
			const configurationInstance = new Configuration(
				RepositoryFactory['$disk_unc'],
				iocContainer,
				configuration
			);

			await configurationInstance?.load?.(configuration);
			RepositoryFactory.#configurationInstance = configurationInstance;
		}

		return RepositoryFactory.#configurationInstance?.interface;
	}

	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description Clears the cached {Configuration} instances
	 */
	static async destroyInstances() {
		await RepositoryFactory.#configurationInstance?.unload?.();
		RepositoryFactory.#configurationInstance = undefined;

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
	 * Returns the name of this repository - Configuration
	 */
	static get RepositoryName() {
		return 'Configuration';
	}
	// #endregion

	// #region Private Static Members
	static #configurationInstance = undefined;
	// #endregion
}
