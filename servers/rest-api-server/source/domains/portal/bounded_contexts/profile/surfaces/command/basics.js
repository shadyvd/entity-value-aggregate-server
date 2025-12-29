/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseSurface } from 'baseclass:surface';

/**
 * @class Basics
 * @extends BaseSurface
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Basics Surface for the Profile Module of the User domain.
 */
export class Basics extends BaseSurface {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Protected Methods, to be overridden by derived classes
	/**
	 * @memberof Basics
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
			handler: this.#createProfile?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'PATCH',
			path: '/',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#setProfile?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'DEL',
			path: '/',
			middlewares: [await this?._rbac?.('registered')],
			handler: this.#deleteProfile?.bind?.(this)
		});

		return baseRoutes;
	}

	/**
	 * @memberof Basics
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
	async #createProfile(ctxt) {
		const createStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'PROFILE::CREATE',
				{
					data: ctxt?.request?.body,
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user
				}
			);

		ctxt.status = createStatus?.status;
		ctxt.body = createStatus?.body;
	}

	async #setProfile(ctxt) {
		const updateStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'PROFILE::SET',
				{
					data: ctxt?.request?.body,
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user
				}
			);

		ctxt.status = updateStatus?.status;
		ctxt.body = updateStatus?.body;
	}

	async #deleteProfile(ctxt) {
		const deleteStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'PROFILE::DELETE',
				{
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user
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
 * @classdesc The Session Manager Module Basics Surface Class Factory.
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
	 * @returns {Basics} - The Basics surface instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!SurfaceFactory.#basicsInstance) {
			const basicsInstance = new Basics(
				SurfaceFactory['$disk_unc'],
				domainInterface
			);

			await basicsInstance?.load?.();
			SurfaceFactory.#basicsInstance = basicsInstance;
		}

		return SurfaceFactory.#basicsInstance;
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
	 * @description Clears the Basics instance
	 */
	static async destroyInstances() {
		await SurfaceFactory.#basicsInstance?.unload?.();
		SurfaceFactory.#basicsInstance = undefined;

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
	 * Returns the name of this surface - Basics
	 */
	static get SurfaceName() {
		return 'Basics';
	}
	// #endregion

	// #region Private Static Members
	static #basicsInstance = undefined;
	// #endregion
}
