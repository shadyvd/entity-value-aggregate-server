/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseSurface } from 'baseclass:surface';

/**
 * @class Locale
 * @extends BaseSurface
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Locale Surface for the ServerUser Profile Context.
 */
export class Locale extends BaseSurface {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof Locale
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
	 * @memberof Locale
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
			path: '/',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getLocale?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'GET',
			path: '/:localeId',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getLocale?.bind?.(this)
		});

		return baseRoutes;
	}

	/**
	 * @memberof Locale
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
	 * @memberof Locale
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name #getProfile
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Retrieves the profile locale(es) associated with input data
	 *
	 * If the path is GET /, it retrieves the array of server-user
	 * locales associated with the logged-in server-user
	 *
	 * If the path is GET /:localeId, it retrieves only the
	 * locale records associated with that locale id
	 *
	 * The response payload will be in the JSON:API format
	 *
	 * @example
	 * // Retrieve all server-user locales
	 * $ curl -X GET -H "Content-Type: application/json" -b ./cookies.txt ${base_url}/api/v1/server-users/profile/locale/:localeId
	 *
	 * Array of server-user locale data
	 * $
	 *
	 * @example
	 * // Retrieve all locales for the logged-in user
	 * //
	 * // If serverUserId is provided, and the serverUserId is part of the same
	 * // mobile number as the logged-in user, then all that server-user's locales
	 * // will be retrieved
	 * //
	 * // If the localeId is also provided, then a single locale matching the
	 * // serverUserId and the localeId is returned
	 * //
	 * $ curl -X GET -H "Content-Type: application/json" -b ./cookies.txt ${base_url}/api/v1/server_users/profile/locale/:serverUserId/:localeId
	 *
	 * ServerUser's locale data
	 * $
	 * // The response data will look similar to this:
	 * "payload": {
	 * 	"jsonapi": {
	 * 		"version": "1.0"
	 * 	},
	 * 	"data": [
	 * 		{
	 * 			"type": "server_user_locale",
	 * 			"id": "80414835-0dac-489f-b12a-7b9f0a44c3af",
	 * 			"attributes": {
	 * 				"server_user_id": "74ab54ba-6426-49b6-ae65-6735ecd5944f",
	 * 				"locale_code": "en-IN",
	 * 				"created_at": "2026-01-03T10:35:23.984Z",
	 * 				"updated_at": "2026-01-03T10:35:23.984Z"
	 * 			},
	 * 			"relationships": {
	 * 				"serverUser": {
	 * 					"data": {
	 * 						"type": "server-user",
	 * 						"id": "74ab54ba-6426-49b6-ae65-6735ecd5944f"
	 * 					}
	 * 				}
	 * 			}
	 * 		}
	 * 	],
	 * 	"included": [
	 * 		{
	 * 			"type": "server-user",
	 * 			"id": "74ab54ba-6426-49b6-ae65-6735ecd5944f",
	 * 			"attributes": {
	 * 				"mobile_no": "+911234567890",
	 * 				"is_primary": true,
	 * 				"first_name": "Jane",
	 * 				"last_name": "Doe",
	 * 				"nickname": "Jane",
	 * 				"date_of_birth": "1991-12-31T18:30:00.000Z",
	 * 				"gender_id": "1f588591-0147-4c16-a6b2-7299ea5563f6",
	 * 				"created_at": "2026-01-03T10:35:23.969Z",
	 * 				"updated_at": "2026-01-03T10:35:23.969Z"
	 * 			}
	 * 		}
	 * 	]
	 * }
	 *
	 */
	async #getLocale(ctxt) {
		const apiRegistry = this?.domainInterface?.apiRegistry;
		const localeStatus = await apiRegistry?.execute?.('READ_LOCALE', {
			user: ctxt?.state?.user,
			localeId: ctxt?.params?.['localeId']
		});

		ctxt.status = localeStatus?.status;
		ctxt.body = localeStatus?.body;
	}
	// #endregion
}

/**
 * @class SurfaceFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The ServerUser Domain Profile Locales Surface Class Factory.
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
	 * @returns {Locale} - The Locale surface instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!SurfaceFactory.#localeInstance) {
			const localeInstance = new Locale(
				SurfaceFactory['$disk_unc'],
				domainInterface
			);

			await localeInstance?.load?.();
			SurfaceFactory.#localeInstance = localeInstance;
		}

		return SurfaceFactory.#localeInstance;
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
	 * @description Clears the Locale instance
	 */
	static async destroyInstances() {
		await SurfaceFactory.#localeInstance?.unload?.();
		SurfaceFactory.#localeInstance = undefined;

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
	 * Returns the name of this surface - Locale
	 */
	static get SurfaceName() {
		return 'Locale';
	}
	// #endregion

	// #region Private Static Members
	static #localeInstance = undefined;
	// #endregion
}
