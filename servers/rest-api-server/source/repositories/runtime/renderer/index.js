/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseRepository } from '@twyr/framework-classes';
import { EVASBaseFactory } from '@twyr/framework-classes';

/**
 * @class Renderer
 * @extends EVASBaseRepository
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [iocContainer] - IoC module providing DI repositories
 * @param {object} [configuration] - requested repository configuration
 *
 * @classdesc The Renderer Repository Class.
 *
 */
class Renderer extends EVASBaseRepository {
	// #region Constructor
	constructor(location, iocContainer, configuration) {
		super(location, iocContainer, configuration);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof Renderer
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
	 * @memberof Renderer
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
		await super.unload?.();
	}
	// #endregion

	// #region Interface API
	/**
	 * @memberof Renderer
	 * @async
	 * @instance
	 * @function
	 * @name render
	 *
	 * @param {Array} renderData - The data to be rendered.
	 *
	 * @returns {null} Nothing.
	 *
	 * @description
	 * Renders data, and modifies the input to include rendered data.
	 */
	async render(renderData) {
		let ejs = await import('ejs');
		ejs = ejs?.['default'];

		const options = {
			async: true,
			compileDebug: global.serverEnvironment !== 'production'
		};

		let renderResolutions = [];
		for (const renderItem of renderData) {
			renderResolutions?.push?.(
				ejs?.render?.(
					renderItem?.template?.toString?.(),
					renderItem?.data,
					options
				)
			);
		}

		renderResolutions = await Promise?.allSettled?.(renderResolutions);
		renderResolutions?.forEach?.((renderedData, index) => {
			// eslint-disable-next-line security/detect-object-injection
			renderData[index].document = renderedData?.value?.toString?.();
		});

		return renderData;
	}
	// #endregion

	// #region Getters / Setters
	get interface() {
		return {
			render: this?.render?.bind?.(this)
		};
	}
	// #endregion

	// #region Private Methods
	// #endregion

	// #region Private Fields
	// #endregion
}

/**
 * @class RepositoryFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Renderer Repository Class Factory.
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
	 * @returns {Renderer} - The Renderer repository instance.
	 *
	 */
	static async createInstances(configuration, iocContainer) {
		if (!RepositoryFactory.#rendererInstance) {
			const rendererInstance = new Renderer(
				RepositoryFactory['$disk_unc'],
				iocContainer,
				configuration
			);

			await rendererInstance?.load?.();
			RepositoryFactory.#rendererInstance = rendererInstance;
		}

		return RepositoryFactory.#rendererInstance?.interface;
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
	 * @description Clears the cached {Renderer} instances
	 */
	static async destroyInstances(configuration) {
		configuration;
		if (!RepositoryFactory.#rendererInstance) return;

		await RepositoryFactory.#rendererInstance?.unload?.();
		RepositoryFactory.#rendererInstance = undefined;
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
	 * Returns the name of this repository - Renderer
	 */
	static get RepositoryName() {
		return 'Renderer';
	}
	// #endregion

	// #region Private Static Members
	static #rendererInstance = undefined;
	// #endregion
}
