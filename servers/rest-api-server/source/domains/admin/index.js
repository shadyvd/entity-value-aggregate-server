/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseDomain } from 'baseclass:domain';

/**
 * @class AdminDomain
 * @extends BaseDomain
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc An Base Domain for this Server.
 *
 */
export class AdminDomain extends BaseDomain {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Startup / Shutdown
	/**
	 * @memberof AdminDomain
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
	 * @memberof AdminDomain
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

	// #region "Protected" method overrides
	/**
	 * @memberof AdminDomain
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _registerSerializerTypes
	 *
	 * @returns {null} - Nothing.
	 *
	 * @description
	 * Registers the JSON:API serializer types
	 * for the current domain.
	 *
	 */
	_registerSerializerTypes(serializer) {
		super._registerSerializerTypes?.(serializer);

		// Step 0: Register the master table models
		serializer?.register?.('tenant_status_master', {
			relationships: {
				tenants: {
					type: 'tenant'
				}
			}
		});

		// Step 1: Register the Tenant model
		serializer?.register?.('tenant', {
			relationships: {
				tenantStatus: {
					type: 'tenant_status_master'
				},
				roles: {
					type: 'tenant-role'
				},
				users: {
					type: 'tenant-user'
				}
			}
		});
		serializer?.register?.('tenant-role', {
			relationships: {
				tenant: {
					type: 'tenant'
				}
			}
		});
		serializer?.register?.('tenant-user', {
			relationships: {
				tenant: {
					type: 'tenant'
				}
			}
		});
	}
	// #endregion
}

/**
 * @class DomainFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Session Manager Module AdminDomain Surface Class Factory.
 */
export default class DomainFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof DomainFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstance
	 *
	 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
	 *
	 * @returns {AdminDomain} - The AdminDomain domain instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!DomainFactory.#adminDomainInstance) {
			const adminDomainInstance = new AdminDomain(
				DomainFactory['$disk_unc'],
				domainInterface
			);

			await adminDomainInstance?.load?.();
			DomainFactory.#adminDomainInstance = adminDomainInstance;
		}

		return DomainFactory.#adminDomainInstance;
	}

	/**
	 * @memberof DomainFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description Clears the AdminDomain instance
	 */
	static async destroyInstances() {
		await DomainFactory.#adminDomainInstance?.unload?.();
		DomainFactory.#adminDomainInstance = undefined;

		return;
	}
	// #endregion

	// #region Getters
	/**
	 * @memberof DomainFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name DomainName
	 *
	 * @returns {string} - Name of this domain.
	 *
	 * @description
	 * Returns the name of this domain - AdminDomain
	 */
	static get DomainName() {
		return 'AdminDomain';
	}
	// #endregion

	// #region Private Static Members
	static #adminDomainInstance = undefined;
	// #endregion
}
