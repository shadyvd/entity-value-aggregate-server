/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseSurface } from 'baseclass:surface';

/**
 * @class Main
 * @extends BaseSurface
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Main Surface for the Session Manager Module.
 */
export class Main extends BaseSurface {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof Main
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name load
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Sets the user role in the request headers for access control purposes
	 * by passing it in to the base class load method
	 *
	 */
	async load() {
		await super.load?.();
	}
	// #endregion

	// #region Protected Methods, to be overridden by derived classes
	/**
	 * @memberof Main
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _registerSurface
	 *
	 * @returns {null} - The routes to be added to the Rest API Router
	 *
	 * @description
	 * Adds the route definitions and handlers for this surface to
	 * the Rest API Router
	 *
	 */
	async _registerSurface() {
		const baseRoutes = await super._registerSurface?.();

		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/contact-types',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getContactTypes?.bind?.(this)
		});
		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/contact-types/:id',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getContactTypes?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/connection-statuses',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getConnectionStatuses?.bind?.(this)
		});
		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/connection-statuses/:id',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getConnectionStatuses?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/genders',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getGenders?.bind?.(this)
		});
		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/genders/:id',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getGenders?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/locales',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getLocales?.bind?.(this)
		});
		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/locales/:id',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getLocales?.bind?.(this)
		});

		return baseRoutes;
	}

	/**
	 * @memberof Main
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _unregisterSurface
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Removes the route definitions and handlers for this surface from
	 * the Rest API Router
	 *
	 */
	async _unregisterSurface() {
		await super._unregisterSurface?.();
		return;
	}
	// #endregion

	// #region Route Handlers
	/**
	 * @memberof Main
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name #getContactTypes
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Retrieves the contact types available in the system
	 * mobile, email, fax, landline, etc.
	 *
	 * @example
	 * // Retrieve all contact types
	 * $ curl -X GET -H "Content-Type: application/json" -b ./cookies.txt ${base_url}/api/v1/masterdata/contact-types/
	 *
	 * Array of contact types
	 * $
	 *
	 */
	async #getContactTypes(ctxt) {
		const masterdataList = await this.#getMasterdata(
			'CONTACT_TYPE',
			ctxt.params.id
		);

		ctxt.status = masterdataList?.status;
		ctxt.body = masterdataList?.body;
	}

	/**
	 * @memberof Main
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name #getConnectionStatuses
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Retrieves the connection statues available in the system
	 * pending, etc.
	 *
	 * @example
	 * // Retrieve all connection statuses
	 * $ curl -X GET -H "Content-Type: application/json" -b ./cookies.txt ${base_url}/api/v1/masterdata/connection-statuses/
	 *
	 * Array of connection statuses
	 * $
	 *
	 */
	async #getConnectionStatuses(ctxt) {
		const masterdataList = await this.#getMasterdata(
			'CONNECTION_STATUS',
			ctxt.params.id
		);

		ctxt.status = masterdataList?.status;
		ctxt.body = masterdataList?.body;
	}

	/**
	 * @memberof Main
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name #getGenders
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Retrieves the genders available in the system
	 *
	 * @example
	 * // Retrieve all genders
	 * $ curl -X GET -H "Content-Type: application/json" -b ./cookies.txt ${base_url}/api/v1/masterdata/genders/
	 *
	 * Array of genders
	 * $
	 *
	 */
	async #getGenders(ctxt) {
		const masterdataList = await this.#getMasterdata(
			'GENDER',
			ctxt.params.id
		);

		ctxt.status = masterdataList?.status;
		ctxt.body = masterdataList?.body;
	}

	/**
	 * @memberof Main
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name #getLocales
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Retrieves the locales available in the system
	 *
	 * @example
	 * // Retrieve all locales
	 * $ curl -X GET -H "Content-Type: application/json" -b ./cookies.txt ${base_url}/api/v1/masterdata/locales/
	 *
	 * Array of locales
	 * $
	 *
	 */
	async #getLocales(ctxt) {
		const masterdataList = await this.#getMasterdata(
			'LOCALE',
			ctxt.params.id
		);

		ctxt.status = masterdataList?.status;
		ctxt.body = masterdataList?.body;
	}
	// #endregion

	// #region Private Methods
	async #getMasterdata(masterdataType, id) {
		const apiRegistry = this?.domainInterface?.apiRegistry;
		const masterdataList = await apiRegistry?.execute?.(masterdataType, id);

		return masterdataList;
	}
	// #endregion
}

/**
 * @class SurfaceFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Session Manager Module Main Surface Class Factory.
 */
export default class SurfaceFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof SurfaceFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstance
	 *
	 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
	 *
	 * @returns {Main} - The Main surface instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!SurfaceFactory.#mainInstance) {
			const mainInstance = new Main(
				SurfaceFactory['$disk_unc'],
				domainInterface
			);

			await mainInstance?.load?.();
			SurfaceFactory.#mainInstance = mainInstance;
		}

		return SurfaceFactory.#mainInstance;
	}

	/**
	 * @memberof SurfaceFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description Clears the Main instance
	 */
	static async destroyInstances() {
		await SurfaceFactory.#mainInstance?.unload?.();
		SurfaceFactory.#mainInstance = undefined;

		return;
	}
	// #endregion

	// #region Getters
	/**
	 * @memberof SurfaceFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name SurfaceName
	 *
	 * @returns {string} - Name of this surface.
	 *
	 * @description
	 * Returns the name of this surface - Main
	 */
	static get SurfaceName() {
		return 'Main';
	}
	// #endregion

	// #region Private Static Members
	static #mainInstance = undefined;
	// #endregion
}
