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
 * @classdesc The Basics Surface for the Tenant Module in the Admin domain.
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
			path: '/create',
			middlewares: [
				await this?._rbac?.('registered OR admin-tenant-basics-create'),
				await this?._abac?.()
			],
			handler: this.#createTenant?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'PATCH',
			path: '/:tenantId',
			middlewares: [
				await this?._rbac?.('admin-tenant-basics-update'),
				await this?._abac?.()
			],
			handler: this.#setTenant?.bind?.(this)
		});

		baseRoutes?.push?.({
			httpMethod: 'DEL',
			path: '/:tenantId',
			middlewares: [
				await this?._rbac?.('admin-tenant-basics-delete'),
				await this?._abac?.()
			],
			handler: this.#deleteTenant?.bind?.(this)
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
	async #createTenant(ctxt) {
		const createStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'TENANT_BASICS::CREATE',
				{
					data: ctxt?.request?.body,
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user
				}
			);

		ctxt.status = createStatus?.status;
		ctxt.body = createStatus?.body;
	}

	async #setTenant(ctxt) {
		const updateStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'TENANT_BASICS::SET',
				{
					data: ctxt?.request?.body,
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user
				}
			);

		ctxt.status = updateStatus?.status;
		ctxt.body = updateStatus?.body;
	}

	async #deleteTenant(ctxt) {
		const deleteStatus =
			await this?.domainInterface?.apiRegistry?.execute?.(
				'TENANT_BASICS::DELETE',
				{
					tenant: ctxt?.state?.tenant,
					user: ctxt?.state?.user,
					tenantId:
						ctxt?.request?.params?.tenantId ??
						ctxt?.state?.tenant?.id
				}
			);

		ctxt.status = deleteStatus?.status;
	}
	// #endregion

	// #region ABAC implementation
	/**
	 * @memberof Basics
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _abac
	 *
	 * @returns {Function} - Koa Middleware
	 *
	 * @description
	 * Used by artifact implementations for adding a ABAC middleware
	 * in their route definitions - as part of the _registerSurface
	 * implementation - to check the User permissions before reaching
	 * the actual handler
	 *
	 * Unlike the _rbac() method, this has to be a custom implementation
	 * for each domain / bounded context / surface combination - the default
	 * implementation (here) creating the no-op middleware for demo
	 * purposes
	 *
	 */
	async _abac() {
		const assetAccessCheckerMiddleware =
			async function assetAccessCheckerMiddleware(ctxt, next) {
				if (
					['admin', 'www']?.includes?.(
						ctxt?.state?.tenant?.['sub_domain']
					)
				) {
					await next?.();
					return;
				}

				throw new Error(
					`Tenant operations can be accessed only from the www tenant`
				);
			};

		return assetAccessCheckerMiddleware?.bind?.(this);
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
