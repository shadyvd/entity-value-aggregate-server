/**
 * Imports for this file
 * @ignore
 */
import { dirname, join, normalize, relative } from 'node:path';
import { EVASBaseSurface } from '@twyr/framework-classes';

/**
 * @class BaseSurface
 * @extends EVASBaseSurface
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Base Class for all Surfaces in this Server.
 */
export class BaseSurface extends EVASBaseSurface {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof BaseSurface
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name load
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for implementing custom
	 * start logic
	 *
	 */
	async load() {
		await super.load?.();

		let inflection = await import('inflection');
		inflection = inflection?.['default'];

		// Step 1: Compute the URL Path
		let surfacePath = relative?.(
			// eslint-disable-next-line no-undef
			dirname?.(serverFilePath),
			dirname?.(this?.__dirname)
		);

		surfacePath = surfacePath?.replaceAll?.('_', '-');
		[
			'server',
			'domains',
			'bounded-contexts',
			'surfaces',
			'command',
			'query',
			'middlewares',
			'repositories'
		]?.forEach?.((reservedWord) => {
			surfacePath = surfacePath?.replaceAll?.(reservedWord, '');
		});

		surfacePath = inflection?.transform?.(surfacePath, [
			'foreignKey',
			'dasherize'
		]);

		// Step 2: Setup the surface router, and add the surface
		let inflectedName = inflection?.transform?.(this?.name, [
			'foreignKey',
			'dasherize'
		]);

		surfacePath =
			inflectedName === 'main-id'
				? surfacePath
				: join?.(surfacePath, inflectedName);

		surfacePath = surfacePath?.replaceAll?.('-id', '');
		surfacePath = normalize?.(surfacePath);
		if (surfacePath?.endsWith?.('/'))
			surfacePath = surfacePath?.slice?.(0, -1);

		let Router = await import('@koa/router');
		Router = Router?.['default'];

		this.#router = new Router({ prefix: `${surfacePath}` });

		// Step 3: Get the surface surface, and register it with the surface router
		const surface = await this?._registerSurface?.();
		for (const restApi of surface) {
			const httpMethod = restApi?.httpMethod?.toLowerCase?.();
			const restPath = normalize?.(restApi?.path);

			const routeMiddlewares = restApi?.middlewares?.slice?.() ?? [];
			routeMiddlewares?.push?.(restApi?.handler);

			// eslint-disable-next-line security/detect-object-injection
			this.#router?.[httpMethod]?.(restPath, ...routeMiddlewares);
		}

		// Finally, add this router to the RESTApi Repository...
		const restApiInstance =
			await this?.domainInterface?.iocContainer?.resolve?.('RestApi');
		const mainRouter = restApiInstance?.router;

		mainRouter?.use?.(this.#router?.routes?.());
	}

	/**
	 * @memberof BaseSurface
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name unload
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for implementing custom
	 * stop logic
	 *
	 */
	async unload() {
		await this?._unregisterSurface?.();

		if (this.#router) this.#router.stack.length = 0;
		this.#router = undefined;

		await super.unload?.();
	}
	// #endregion

	// #region Protected Methods, to be overridden by derived classes
	/**
	 * @memberof BaseSurface
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _registerSurface
	 *
	 * @returns {Array} - Array containing the routes exposed by this surface
	 *
	 * @description
	 * To be overridden by artifact implementations - for registering custom
	 * routes with the surface's Koa Router instance
	 *
	 */
	async _registerSurface() {
		return [];
	}

	/**
	 * @memberof BaseSurface
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _unregisterSurface
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for un-registering
	 * the routes exposed by this surface
	 *
	 */
	async _unregisterSurface() {
		this.#router.stack.length = 0;
		return;
	}

	/**
	 * @memberof BaseSurface
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _rbac
	 *
	 * @param {string} [permission] - A Boolean Expression String with the required User permissions
	 *
	 * @returns {Function} - Koa Middleware
	 *
	 * @description
	 * Used by artifact implementations for adding a RBAC middleware
	 * in their route definitions - as part of the _registerSurface
	 * implementation - to check the User permissions before reaching
	 * the actual handler
	 *
	 */
	async _rbac(permission) {
		let permissionParser = await import('boolean-parser');
		permissionParser = permissionParser?.['default'];

		// Step 1: Parse the permissions...
		let parsedPermissions =
			permissionParser?.parseBooleanQuery?.(permission);

		if (
			parsedPermissions?.length === 1 &&
			parsedPermissions?.[0]?.length === 1
		)
			parsedPermissions = parsedPermissions?.[0]?.[0];

		// Step 2: Setup the permission checker function
		const checkSinglePermission = function checkSinglePermission(
			permissionToCheck,
			usersPermissions
		) {
			const checkForNegative = permissionToCheck?.indexOf?.('NOT') >= 0;

			if (checkForNegative)
				permissionToCheck = permissionToCheck
					?.replace?.('NOT', '')
					?.trim?.();

			const permissionCheck =
				usersPermissions?.includes?.(permissionToCheck);

			return checkForNegative ? !permissionCheck : permissionCheck;
		};

		// Step 3: Create the Koa middleware...
		const permissionCheckerMiddleware =
			async function permissionCheckerMiddleware(ctxt, next) {
				// Step 3.1: Get the tenant id
				const tenantId = ctxt?.state?.tenant?.id;
				if (!tenantId) {
					throw new Error(
						`Unknown tenant! Cannot compute permissions`
					);
				}

				// Step 3.2: Check if the User is present in the Context
				const userPermissions =
					// eslint-disable-next-line security/detect-object-injection
					ctxt?.state?.user?.tenants?.[tenantId]?.['permissions'];

				if (!userPermissions) {
					throw new Error(
						`User has no permissions with this Tenant!`
					);
				}

				// Step 3.3: The trivial Cases...
				if (parsedPermissions === 'registered') {
					await next?.();
					return;
				}

				if (userPermissions?.includes?.('administrator')) {
					await next?.();
					return;
				}

				// Step 3.4: If we're looking for only one permission...
				if (!Array?.isArray?.(parsedPermissions)) {
					const validPermission = checkSinglePermission?.(
						parsedPermissions,
						userPermissions
					);

					if (validPermission) {
						await next?.();
						return;
					}

					throw new Error(
						`User does not have the "${permission}" permission with this Tenant!`
					);
				}

				// Step 3.5: We are looking if the User has at least one permission
				let doesUserHavePermission = false;

				for (const permissionCombination of parsedPermissions) {
					if (doesUserHavePermission) break;

					if (permissionCombination?.length === 1) {
						doesUserHavePermission = checkSinglePermission?.(
							permissionCombination?.[0],
							userPermissions
						);
						continue;
					}

					let isPermissionCombinationOk = true;
					for (const permissionItem of permissionCombination) {
						isPermissionCombinationOk =
							isPermissionCombinationOk &&
							checkSinglePermission?.(
								permissionItem,
								userPermissions
							);
					}

					doesUserHavePermission = isPermissionCombinationOk;
				}

				if (!doesUserHavePermission) {
					throw new Error(
						`User doesn't have the required permissions with this Tenant!`
					);
				}

				await next?.();
			};

		// Finally, return the middleware...
		return permissionCheckerMiddleware?.bind?.(this);
	}

	/**
	 * @memberof BaseSurface
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
				await next?.();
				return;
			};

		return assetAccessCheckerMiddleware?.bind?.(this);
	}
	// #endregion

	// #region Private Fields
	#router = undefined;
	// #endregion
}
