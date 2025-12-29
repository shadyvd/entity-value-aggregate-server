/**
 * Imports for this file
 * TODO: IMPLEMENT RBAC AND ABAC
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { BaseSurface } from 'baseclass:surface';

/**
 * @class Roles
 * @extends BaseSurface
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Roles Surface for the Tenant Module in the Admin domain.
 */
export class Roles extends BaseSurface {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Protected Methods, to be overridden by derived classes
	/**
	 * @memberof Roles
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
			path: '/:tenantId',
			middlewares: [await this?._rbac?.('admin-tenant-role-create')],
			handler: this.#createRole?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'PATCH',
			path: '/:tenantId/:roleId',
			middlewares: [await this?._rbac?.('admin-tenant-role-update')],
			handler: this.#setRole?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'DEL',
			path: '/:tenantId/:roleId',
			middlewares: [await this?._rbac?.('admin-tenant-role-delete')],
			handler: this.#deleteRole?.bind?.(this)
		});

		return baseRoutes;
	}

	/**
	 * @memberof Roles
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
	async #createRole(ctxt) {
		const createStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'TENANT_ROLE::CREATE',
				{
					data: ctxt?.request?.body,
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user,
					tenantId: ctxt?.request?.params?.tenantId
				}
			);

		ctxt.status = createStatus?.status;
		ctxt.body = createStatus?.body;
	}

	async #setRole(ctxt) {
		const updateStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'TENANT_ROLE::SET',
				{
					data: ctxt?.request?.body,
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user,
					tenantId: ctxt?.request?.params?.tenantId,
					roleId: ctxt?.request?.params?.roleId
				}
			);

		ctxt.status = updateStatus?.status;
		ctxt.body = updateStatus?.body;
	}

	async #deleteRole(ctxt) {
		const deleteStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'TENANT_ROLE::DELETE',
				{
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user,
					tenantId: ctxt?.request?.params?.tenantId,
					roleId: ctxt?.request?.params?.roleId
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
 * @classdesc The Session Manager Module Roles Surface Class Factory.
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
	 * @returns {Roles} - The Roles surface instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!SurfaceFactory.#basicsInstance) {
			const basicsInstance = new Roles(
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
	 * @description Clears the Roles instance
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
	 * Returns the name of this surface - Roles
	 */
	static get SurfaceName() {
		return 'Roles';
	}
	// #endregion

	// #region Private Static Members
	static #basicsInstance = undefined;
	// #endregion
}
