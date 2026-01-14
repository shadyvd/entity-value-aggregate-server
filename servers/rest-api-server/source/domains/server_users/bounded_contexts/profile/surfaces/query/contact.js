/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseSurface } from 'baseclass:surface';

/**
 * @class Contact
 * @extends BaseSurface
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Contact Surface for the ServerUser Profile Context.
 */
export class Contact extends BaseSurface {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof Contact
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
	 * @memberof Contact
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
			version: 1,
			httpMethod: 'GET',
			path: '/',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getContact?.bind?.(this)
		});

		baseRoutes?.push?.({
			version: 1,
			httpMethod: 'GET',
			path: '/:contactId',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#getContact?.bind?.(this)
		});

		return baseRoutes;
	}

	/**
	 * @memberof Contact
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
	 * @memberof Contact
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name #getProfile
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Retrieves the profile contact(s) associated with input data
	 *
	 * If the path is GET /, it retrieves the array of server-user
	 * contacts associated with the logged-in server-user
	 *
	 * If the path is GET /:contactId, it retrieves only the
	 * contact records associated with that contact id
	 *
	 * The response payload will be in the JSON:API format
	 *
	 * @example
	 * // Retrieve all server-user contacts
	 * $ curl -X GET -H "Content-Type: application/json" -b ./cookies.txt ${base_url}/api/v1/server_users/profile/contact/:contactId
	 *
	 * Array of server-user contact data
	 * $
	 *
	 * @example
	 * // Retrieve all contacts for the logged-in user
	 * //
	 * // If serverUserId is provided, and the serverUserId is part of the same
	 * // mobile number as the logged-in user, then all that server-user's contacts
	 * // will be retrieved
	 * //
	 * // If the contactId is also provided, then a single contact matching the
	 * // serverUserId and the contactId is returned
	 * //
	 * $ curl -X GET -H "Content-Type: application/json" -b ./cookies.txt ${base_url}/api/v1/server_users/profile/contact/:serverUserId/:contactId
	 *
	 * ServerUser's contact data
	 * $
	 * // The response data will look similar to this:
	 * "payload": {
	 * 	"jsonapi": {
	 * 		"version": "1.0"
	 * 	},
	 * 	"data": [
	 * 		{
	 * 			"type": "server-user-contact",
	 * 			"id": "a7e21b5a-3874-49ea-b89c-7b09681331af",
	 * 			"attributes": {
	 * 				"server_user_id": "74ab54ba-6426-49b6-ae65-6735ecd5944f",
	 * 				"contact_type_id": "a4922101-83ba-4361-bdba-4faaa6873904",
	 * 				"contact": "+911234567890",
	 * 				"verified": true,
	 * 				"created_at": "2026-01-03T10:35:23.974Z",
	 * 				"updated_at": "2026-01-03T10:35:23.974Z"
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
	async #getContact(ctxt) {
		const apiRegistry = this?.domainInterface?.apiRegistry;
		const contactStatus = await apiRegistry?.execute?.('READ_CONTACT', {
			user: ctxt?.state?.user,
			contactId: ctxt?.params?.['contactId']
		});

		ctxt.status = contactStatus?.status;
		ctxt.body = contactStatus?.body;
	}
	// #endregion
}

/**
 * @class SurfaceFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The ServerUser Domain Profile Contacts Surface Class Factory.
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
	 * @returns {Contact} - The Contact surface instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!SurfaceFactory.#contactInstance) {
			const contactInstance = new Contact(
				SurfaceFactory['$disk_unc'],
				domainInterface
			);

			await contactInstance?.load?.();
			SurfaceFactory.#contactInstance = contactInstance;
		}

		return SurfaceFactory.#contactInstance;
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
	 * @description Clears the Contact instance
	 */
	static async destroyInstances() {
		await SurfaceFactory.#contactInstance?.unload?.();
		SurfaceFactory.#contactInstance = undefined;

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
	 * Returns the name of this surface - Contact
	 */
	static get SurfaceName() {
		return 'Contact';
	}
	// #endregion

	// #region Private Static Members
	static #contactInstance = undefined;
	// #endregion
}
