/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseClass } from '@twyr/framework-classes';

/**
 * @class IocContainer
 * @extends EVASBaseClass
 *
 * @param {string} [domainName] - name of the IoC Container's Domain
 * @param {object} [parentContainer] - IoCContainer for the parent context
 *
 * @classdesc The IoC Container for the Server(s) in this monorepo.
 */
export class IocContainer extends EVASBaseClass {
	// #region Constructor
	//eslint-disable-next-line jsdoc/require-jsdoc
	constructor(domainName, parentContainer) {
		super();
		this.#domainName = domainName?.toLocaleUpperCase?.();
		this.#parentContainer = parentContainer;
	}
	// #endregion

	// #region Resolution API
	/**
	 * @memberof IocContainer
	 * @async
	 * @instance
	 * @function
	 * @name resolve
	 *
	 * @param {string} [name] - name of the repository requested
	 * @param {object} [configuration] - requested repository configuration
	 *
	 * @returns {object} - Repository object.
	 *
	 * @description
	 * - Retrieves the factory instance from the owned or borrowed factory maps.
	 * - Creates the repository instance using the Factory and the Configuration
	 * - Returns the newly created instance
	 */
	async resolve(name, configuration) {
		try {
			// Step 1: Get the RepositoryFactory...
			let RepositoryFactory =
				this.#ownedFactories?.get?.(name) ??
				this.#borrowedFactories?.get?.(name);

			// Step 2: We don't have it - so borrow it from some place
			// up the chain...
			if (!RepositoryFactory) {
				RepositoryFactory = await this.#parentContainer?.borrow?.(name);
				this.#borrowedFactories?.set?.(name, RepositoryFactory);
			}

			// OOPS: We don't have a clue as to what this Repository is
			// Throw
			if (!RepositoryFactory) {
				throw new Error(
					`Unable to instantiate ${this?.domainPath}::${name} repository instance: Factory not found`
				);
			}

			// Step 3: Instantiate the repository object using the configuration
			// provided
			const repositoryInstance =
				await RepositoryFactory?.createInstances?.(configuration, this);

			// OOPS: Can't instantiate for some reason. Throw.
			if (!repositoryInstance) {
				throw new Error(
					`Unable to instantiate ${this?.domainPath}::${name} repository instance: Factory failed to create instance`
				);
			}

			// Finally, give them what they're asking for
			return repositoryInstance;
		} catch (error) {
			throw new Error(
				`Error resolving ${this?.domainPath}::${name} repository`,
				{
					cause: error
				}
			);
		}
	}
	// #endregion

	// #region Lifecycle Management API for Repository Factories
	/**
	 * @memberof IocContainer
	 * @async
	 * @instance
	 * @function
	 * @name borrow
	 *
	 * @param {string} [name] - name of the repository
	 *
	 * @returns {object} - RepositoryFactory for the repository.
	 *
	 * @description
	 * Returns the RepositoryFactory for the requested repository
	 */
	async borrow(name) {
		if (this.#ownedFactories?.has?.(name)) {
			return this.#ownedFactories?.get?.(name);
		}

		if (this.#borrowedFactories?.has?.(name)) {
			return this.#borrowedFactories?.get?.(name);
		}

		if (this.#parentContainer) {
			const RepositoryFactory =
				await this.#parentContainer?.borrow?.(name);
			this.#borrowedFactories?.set?.(name, RepositoryFactory);

			return RepositoryFactory;
		}

		return;
	}

	/**
	 * @memberof IocContainer
	 * @async
	 * @instance
	 * @function
	 * @name register
	 *
	 * @param {string} [name] - name of the repository getting registered
	 * @param {object} [factory] - the factory to be used for instantiating the repository, or returning an existing instance
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description
	 * Registers the artifact factory against its name in the Map
	 */
	async register(name, factory) {
		try {
			this.#ownedFactories?.set?.(name, factory);

			if (serverEnvironment === 'production') return;
			console?.info?.(
				`${this?.domainPath}::${this?.name}::register: ${name} repository`
			);
		} catch (error) {
			throw new Error(
				`Error registering repository: ${this?.domainPath}::${this?.name}::${name}`,
				{
					cause: error
				}
			);
		}
	}

	/**
	 * @memberof IocContainer
	 * @async
	 * @instance
	 * @function
	 * @name unregister
	 *
	 * @param {string} [name] - name of the repository getting unregistered
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description
	 * Removes the artifact from the map
	 */
	async unregister(name) {
		try {
			if (this.#ownedFactories?.has?.(name)) {
				const factory = this.#ownedFactories?.get?.(name);
				await factory?.destroyInstances?.();

				this.#ownedFactories?.delete?.(name);

				if (serverEnvironment === 'production') return;
				console?.info?.(
					`\n${this?.domainPath}::${this?.name}::unregister: ${name} repository`
				);
			}

			if (this.#borrowedFactories?.has?.(name)) {
				this.#borrowedFactories?.delete?.(name);
			}
		} catch (error) {
			throw new Error(
				`Error un-registering repository: ${this?.domainPath}::${this?.name}::${name}`,
				{
					cause: error
				}
			);
		}
	}

	/**
	 * @memberof IocContainer
	 * @async
	 * @instance
	 * @function
	 * @name unregisterAll
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description
	 * Removes all artifacts from the map
	 */
	async unregisterAll() {
		const errors = [];

		try {
			let promiseResolutions = [];

			this.#ownedFactories?.forEach?.((factory) => {
				promiseResolutions?.push?.(factory?.destroyInstances?.());
			});

			promiseResolutions =
				await Promise?.allSettled?.(promiseResolutions);

			promiseResolutions?.forEach?.((resolution) => {
				if (resolution?.status === 'fulfilled') return;
				errors?.push?.(resolution?.reason);
			});

			this.#ownedFactories?.clear?.();
			this.#borrowedFactories?.clear?.();

			if (serverEnvironment === 'production') return;
			console?.info?.(
				`\n${this?.domainPath}::${this?.name}::unregisterAll`
			);
		} catch (error) {
			errors?.push?.(error);
		}

		if (!errors?.length) return;
		throw new AggregateError(
			errors,
			`${this?.domainPath}::${this?.name}::Error un-registering all repositories`
		);
	}
	// #endregion

	// #region Getters / Setters
	/**
	 * @memberof IocContainer
	 * @instance
	 * @readonly
	 * @member {string} name
	 * @returns {string} Path of this instance, starting from the server down through the domain chain.
	 */
	get domainPath() {
		if (this.#parentContainer) {
			return `${this.#parentContainer?.domainPath ?? ''}::${this.#domainName ?? ''}`;
		} else {
			return this.#domainName ?? '';
		}
	}
	// #endregion

	// #region Private Fields
	#domainName = undefined;
	#parentContainer = undefined;

	#borrowedFactories = new Map();
	#ownedFactories = new Map();
	// #endregion
}
