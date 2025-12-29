/**
 * Imports for this file
 * @ignore
 */
import { Buffer } from 'node:buffer';

import { EVASBaseFactory } from '../factories/evas-base-factory.js';
import { EVASBaseLifecycleManager } from './evas-base-lifecycle-manager.js';

/**
 * @class BoundedContextLifecycleManager
 * @extends EVASBaseLifecycleManager
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The BoundedContext Lifecycle Manager Class.
 *
 */
class BoundedContextLifecycleManager extends EVASBaseLifecycleManager {
	// #region Constructor
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof BoundedContextLifecycleManager
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name load
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * 1. Loads middlewares
	 * 2. Loads surfaces
	 * 3. Loads event handlers
	 *
	 */
	async load() {
		const errors = [];

		try {
			await super.load?.();
		} catch (error) {
			errors?.push?.(error);
		}

		// Step 1: Load the middlewares
		try {
			await this.#loadMiddlewares?.();
		} catch (error) {
			errors?.push?.(error);
		}

		// Step 2: Load the surfaces
		try {
			await this.#loadSurfaces?.();
		} catch (error) {
			errors?.push?.(error);
		}

		// Step 3: Load the event handlers
		try {
			await this.#loadEventHandlers?.();
		} catch (error) {
			errors?.push?.(error);
		}

		if (!errors?.length) return;

		const errorToBeThrown = new AggregateError(
			errors,
			`Error loading ${this?.name}`
		);

		throw errorToBeThrown;
	}

	/**
	 * @memberof BoundedContextLifecycleManager
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name unload
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description
	 * 1. Unloads event processors
	 * 2. Unloads surfaces
	 * 3. Unloads middlewares
	 *
	 */
	async unload() {
		let errors = [];

		// Step 1: Unload the event processors
		try {
			await this._unloadArtifacts?.(this.#eventProcessors);
			this.#eventProcessors?.clear?.();
		} catch (error) {
			errors?.push?.(error);
		}

		// Step 2: Unload the query surfaces
		try {
			await this._unloadArtifacts?.(this.#querySurfaces);
			this.#querySurfaces?.clear?.();
		} catch (error) {
			errors?.push?.(error);
		}

		// Step 3: Unload the command surfaces
		try {
			await this._unloadArtifacts?.(this.#commandSurfaces);
			this.#commandSurfaces?.clear?.();
		} catch (error) {
			errors?.push?.(error);
		}

		// Step 4: Unload the middlewares
		try {
			await this._unloadArtifacts?.(this.#middlewares);
			this.#middlewares?.clear?.();
		} catch (error) {
			errors?.push?.(error);
		}

		// Step 3: Call base class
		try {
			await super.unload?.();
		} catch (error) {
			errors?.push?.(error);
		}

		if (!errors?.length) return;

		const errorToBeThrown = new AggregateError(
			errors,
			`Error unloading ${this?.name}`
		);

		throw errorToBeThrown;
	}
	// #endregion

	// #region Private Methods
	/**
	 * @memberof BoundedContextLifecycleManager
	 * @async
	 * @instance
	 * @funservers/rest-api-server/source/domains/admin/bounded_contexts/tenant/command_surfacesction
	 * @name #loadSurfaces
	 *
	 * @returns {null} - Nothing.
	 *
	 * @description
	 * Loads all the surfaces (API collections) of this BoundedContext
	 *
	 */
	async #loadSurfaces() {
		// Step 1: Load Command Surfaces
		const CommandSurfaceFactories = await this._loadArtifacts?.(
			'surfaces/command',
			true
		);
		for (const CommandSurfaceFactory of CommandSurfaceFactories) {
			const commandSurfaceInstance =
				await CommandSurfaceFactory?.createInstances?.(
					this?.domainInterface
				);

			this.#commandSurfaces?.set?.(
				CommandSurfaceFactory?.SurfaceName,
				commandSurfaceInstance
			);
		}

		// Step 2: Load Query Surfaces
		const QuerySurfaceFactories = await this._loadArtifacts?.(
			'surfaces/query',
			true
		);
		for (const QuerySurfaceFactory of QuerySurfaceFactories) {
			const querySurfaceInstance =
				await QuerySurfaceFactory?.createInstances?.(
					this?.domainInterface
				);

			this.#querySurfaces?.set?.(
				QuerySurfaceFactory?.SurfaceName,
				querySurfaceInstance
			);
		}
	}

	/**
	 * @memberof BoundedContextLifecycleManager
	 * @async
	 * @instance
	 * @function
	 * @name #loadEventHandlers
	 *
	 * @returns {null} - Nothing.
	 *
	 * @description
	 * Loads all the event handlers of this BoundedContext
	 *
	 */
	async #loadEventHandlers() {
		const EventHandlerFactories = await this._loadArtifacts?.(
			'event_handlers',
			true
		);
		for (const EventHandlerFactory of EventHandlerFactories) {
			const eventHandlerInstance =
				await EventHandlerFactory?.createInstances?.(
					this?.domainInterface
				);

			this.#eventProcessors?.set?.(
				EventHandlerFactory?.EventHandlerName,
				eventHandlerInstance
			);
		}
	}

	/**
	 * @memberof BoundedContextLifecycleManager
	 * @async
	 * @instance
	 * @function
	 * @name #loadMiddlewares
	 *
	 * @returns {null} - Nothing.
	 *
	 * @description
	 * Loads all the middlewares (business logic) of this BoundedContext
	 *
	 */
	async #loadMiddlewares() {
		const MiddlewareFactories = await this._loadArtifacts?.(
			'middlewares',
			true
		);
		for (const MiddlewareFactory of MiddlewareFactories) {
			const middlewareInstance =
				await MiddlewareFactory?.createInstances?.(
					this?.domainInterface
				);

			this.#middlewares?.set?.(
				MiddlewareFactory?.MiddlewareName,
				middlewareInstance
			);
		}
	}
	// #endregion

	// #region Private Fields
	#commandSurfaces = new Map();
	#querySurfaces = new Map();
	#eventProcessors = new Map();
	#middlewares = new Map();
	// #endregion
}
/**
 * The Factory for the Application Server Lifecycle Manager class
 *
 * @class BoundedContextLifecycleManagerFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Application Server Lifecycle Manager Class Factory.
 */
export class BoundedContextLifecycleManagerFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Creation API
	/**
	 * @memberof BoundedContextLifecycleManagerFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstances
	 *
	 * @param {string} [location] - __dirname for this file in CJS, basically
	 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
	 *
	 * @returns {BoundedContextLifecycleManager} - Instance of Lifecycle manager.
	 *
	 */
	static async createInstances(location, domainInterface) {
		const locationKey = Buffer?.from?.(location)?.toString?.('base64');

		if (
			BoundedContextLifecycleManagerFactory.#boundedContextLifecycleManagerInstances?.has?.(
				locationKey
			)
		) {
			return BoundedContextLifecycleManagerFactory.#boundedContextLifecycleManagerInstances?.get?.(
				locationKey
			);
		}

		const boundedContextLifecycleManagerInstance =
			new BoundedContextLifecycleManager(location, domainInterface);
		await boundedContextLifecycleManagerInstance?.load?.();

		BoundedContextLifecycleManagerFactory.#boundedContextLifecycleManagerInstances?.set?.(
			locationKey,
			boundedContextLifecycleManagerInstance
		);

		return boundedContextLifecycleManagerInstance;
	}

	/**
	 * @memberof BoundedContextLifecycleManagerFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @param {string} [location] - __dirname for this file in CJS, basically
	 *
	 * @returns {null} - Nothing
	 *
	 */
	static async destroyInstances(location) {
		const locationKey = Buffer?.from?.(location)?.toString?.('base64');

		const boundedContextLifecycleManagerInstance =
			BoundedContextLifecycleManagerFactory.#boundedContextLifecycleManagerInstances?.get?.(
				locationKey
			);

		if (!boundedContextLifecycleManagerInstance) return;

		await boundedContextLifecycleManagerInstance?.unload?.();
		BoundedContextLifecycleManagerFactory.#boundedContextLifecycleManagerInstances?.delete?.(
			locationKey
		);
	}
	// #endregion

	// #region Private Static Members
	static #boundedContextLifecycleManagerInstances = new Map();
	// #endregion
}
