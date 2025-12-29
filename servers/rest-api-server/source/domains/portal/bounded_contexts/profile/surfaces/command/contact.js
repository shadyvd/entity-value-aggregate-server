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
 * @classdesc The Contact Surface for the Profile Module of the User domain.
 */
export class Contact extends BaseSurface {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
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
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Adds the route definitions and handlers for this surface to
	 * the Rest API Router
	 *
	 */
	async _registerSurface() {
		const baseRoutes = await super._registerSurface?.();

		baseRoutes?.push?.({
			httpMethod: 'POST',
			path: '/',
			middlewares: [await this?._rbac?.('admin-create')],
			handler: this.#createProfileContact?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'PATCH',
			path: '/:contactId',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#setProfileContact?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'DEL',
			path: '/:contactId',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#deleteProfileContact?.bind?.(this)
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
	async #createProfileContact(ctxt) {
		const createStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'PROFILE::CREATE_CONTACT',
				{
					data: ctxt?.request?.body,
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user
				}
			);

		ctxt.status = createStatus?.status;
		ctxt.body = createStatus?.body;
	}

	async #setProfileContact(ctxt) {
		const updateStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'PROFILE::SET_CONTACT',
				{
					data: ctxt?.request?.body,
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user,
					contactId: ctxt?.request?.params?.contactId
				}
			);

		ctxt.status = updateStatus?.status;
		ctxt.body = updateStatus?.body;
	}

	async #deleteProfileContact(ctxt) {
		const deleteStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'PROFILE::DELETE_CONTACT',
				{
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user,
					contactId: ctxt?.request?.params?.contactId
				}
			);

		ctxt.status = deleteStatus?.status;
	}
	// #endregion
}

/**
 * @class SurfaceFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Session Manager Module Contact Surface Class Factory.
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
		if (!SurfaceFactory.#mainInstance) {
			const mainInstance = new Contact(
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
	 * @description Clears the Contact instance
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
	 * Returns the name of this surface - Contact
	 */
	static get SurfaceName() {
		return 'Contact';
	}
	// #endregion

	// #region Private Static Members
	static #mainInstance = undefined;
	// #endregion
}
