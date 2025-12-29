/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseDomain } from 'baseclass:domain';

/**
 * @class UserDomain
 * @extends BaseDomain
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc An Base Domain for this Server.
 *
 */
export class UserDomain extends BaseDomain {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Startup / Shutdown
	/**
	 * @memberof UserDomain
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
	 * @memberof UserDomain
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
	 * @memberof UserDomain
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
		serializer?.register?.('contact_type_master', {
			relationships: {
				userContacts: {
					type: 'user_contact'
				}
			}
		});

		serializer?.register?.('tenant_status_master', {
			relationships: {
				tenants: {
					type: 'tenant'
				}
			}
		});

		// Step 1: Register the User model
		serializer?.register?.('user', {
			blacklist: ['password'],
			relationships: {
				contacts: {
					type: 'user_contact'
				},
				tenantUsers: {
					type: 'tenant_user'
				},
				tenants: {
					type: 'tenant'
				}
			}
		});

		// Step 1: Register the User Contact model
		serializer?.register?.('user_contact', {
			relationships: {
				user: {
					type: 'user'
				},
				contactType: {
					type: 'contact_type_master'
				}
			}
		});

		// Step 3: Register the Tenant model
		serializer?.register?.('tenant', {
			relationships: {
				tenantStatus: {
					type: 'tenant_status_master'
				},
				tenantUsers: {
					type: 'tenant_user'
				},
				users: {
					type: 'user'
				}
			}
		});

		// Step 4: Register the Tenant User model
		serializer?.register?.('tenant_user', {
			relationships: {
				tenant: {
					type: 'tenant'
				},
				user: {
					type: 'user'
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
 * @classdesc The Session Manager Module UserDomain Surface Class Factory.
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
	 * @returns {UserDomain} - The UserDomain domain instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!DomainFactory.#userDomainInstance) {
			const userDomainInstance = new UserDomain(
				DomainFactory['$disk_unc'],
				domainInterface
			);

			await userDomainInstance?.load?.();
			DomainFactory.#userDomainInstance = userDomainInstance;
		}

		return DomainFactory.#userDomainInstance;
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
	 * @description Clears the UserDomain instance
	 */
	static async destroyInstances() {
		await DomainFactory.#userDomainInstance?.unload?.();
		DomainFactory.#userDomainInstance = undefined;

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
	 * Returns the name of this domain - UserDomain
	 */
	static get DomainName() {
		return 'UserDomain';
	}
	// #endregion

	// #region Private Static Members
	static #userDomainInstance = undefined;
	// #endregion
}
