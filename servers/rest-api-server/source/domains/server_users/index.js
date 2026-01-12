/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseDomain } from 'baseclass:domain';

/**
 * @class ServerUsers
 * @extends BaseDomain
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc An Base Domain for this Server.
 *
 */
export class ServerUsers extends BaseDomain {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Startup / Shutdown
	/**
	 * @memberof ServerUsers
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
	 * @memberof ServerUsers
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
	 * @memberof ServerUsers
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
				serverUserContacts: {
					type: 'server_user_contact'
				}
			}
		});

		serializer?.register?.('gender_master', {
			relationships: {
				serverUser: {
					type: 'server_user'
				}
			}
		});

		serializer?.register?.('locale_master', {
			relationships: {
				serverUserLocales: {
					type: 'server_user_locale'
				}
			}
		});

		// Step 1: Register the ServerUser model
		serializer?.register?.('server_user', {
			blacklist: ['password'],
			relationships: {
				contacts: {
					type: 'server_user_contact'
				},
				locales: {
					type: 'server_user_locale'
				},
				gender: {
					type: 'gender_master'
				}
			}
		});

		// Step 2: Register the ServerUser Contact model
		serializer?.register?.('server_user_contact', {
			relationships: {
				serverUser: {
					type: 'server_user'
				},
				contactType: {
					type: 'contact_type_master'
				}
			}
		});

		// Step 4: Register the ServerUser Locale model
		serializer?.register?.('server_user_locale', {
			relationships: {
				serverUser: {
					type: 'server_user'
				},
				locale: {
					type: 'locale_master'
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
 * @classdesc The ServerUser Domain Class Factory.
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
	 * @returns {ServerUsers} - The ServerUsers domain instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!DomainFactory.#serverUserDomainInstance) {
			const serverUserDomainInstance = new ServerUsers(
				DomainFactory['$disk_unc'],
				domainInterface
			);

			await serverUserDomainInstance?.load?.();
			DomainFactory.#serverUserDomainInstance = serverUserDomainInstance;
		}

		return DomainFactory.#serverUserDomainInstance;
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
	 * @description Clears the ServerUser Domain instance
	 */
	static async destroyInstances() {
		await DomainFactory.#serverUserDomainInstance?.unload?.();
		DomainFactory.#serverUserDomainInstance = undefined;

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
	 * Returns the name of this domain - ServerUsers
	 */
	static get DomainName() {
		return 'ServerUsers';
	}
	// #endregion

	// #region Private Static Members
	static #serverUserDomainInstance = undefined;
	// #endregion
}
