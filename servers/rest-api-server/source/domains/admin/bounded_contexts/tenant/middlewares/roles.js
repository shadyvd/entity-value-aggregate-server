/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseFactory } from '@twyr/framework-classes';
import { createErrorForPropagation } from '@twyr/error-serializer';
import { BaseMiddleware } from 'baseclass:middleware';

/**
 * @class Roles
 * @extends BaseMiddleware
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Middleware to handle login / logout / register
 */
export class Roles extends BaseMiddleware {
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
	 * @name _registerApi
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Adds the API to the apiRegistry in the domainInterface
	 *
	 */
	async _registerApi() {
		const errors = [];

		try {
			let registerResolutions = [];

			const baseApis = await super._registerApi?.();
			for (const baseApi of baseApis ?? []) {
				registerResolutions?.push?.(
					this?.domainInterface?.apiRegistry?.register?.(
						baseApi?.pattern,
						baseApi?.handler
					)
				);
			}

			registerResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.register?.(
					'ROLE::CREATE',
					this.#createRole?.bind?.(this)
				)
			);
			registerResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.register?.(
					'ROLE::GETALL',
					this.#getAllRoles?.bind?.(this)
				)
			);
			registerResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.register?.(
					'ROLE::GET',
					this.#getRole?.bind?.(this)
				)
			);
			registerResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.register?.(
					'ROLE::SET',
					this.#setRole?.bind?.(this)
				)
			);
			registerResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.register?.(
					'ROLE::DELETE',
					this.#deleteRole?.bind?.(this)
				)
			);

			registerResolutions =
				await Promise?.allSettled?.(registerResolutions);
			for (const registerResolution of registerResolutions) {
				if (registerResolution?.status === 'fulfilled') continue;
				errors?.push?.(registerResolution?.reason);
			}
		} catch (error) {
			errors?.push?.(error);
		}

		if (!errors?.length) return;

		const propagatedError = createErrorForPropagation?.(
			`${this?.name}::_registerApi error`,
			errors
		);

		if (propagatedError) throw propagatedError;
	}

	/**
	 * @memberof Roles
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _unregisterApi
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Removes the API from the apiRegistry in the domainInterface
	 *
	 */
	async _unregisterApi() {
		const errors = [];

		try {
			let unregisterResolutions = [];

			unregisterResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.unregister?.(
					'ROLE::DELETE',
					this.#deleteRole?.bind?.(this)
				)
			);
			unregisterResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.unregister?.(
					'ROLE::SET',
					this.#setRole?.bind?.(this)
				)
			);
			unregisterResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.unregister?.(
					'ROLE::GET',
					this.#getRole?.bind?.(this)
				)
			);
			unregisterResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.unregister?.(
					'ROLE::GETALL',
					this.#getAllRoles?.bind?.(this)
				)
			);
			unregisterResolutions?.push?.(
				this?.domainInterface?.apiRegistry?.unregister?.(
					'ROLE::CREATE',
					this.#createRole?.bind?.(this)
				)
			);

			unregisterResolutions = await Promise?.allSettled?.(
				unregisterResolutions
			);
			for (const unregisterResolution of unregisterResolutions) {
				if (unregisterResolution?.status === 'fulfilled') continue;
				errors?.push?.(unregisterResolution?.reason);
			}

			await super._unregisterApi?.();
		} catch (error) {
			errors?.push?.(error);
		}

		if (!errors?.length) return;

		const propagatedError = createErrorForPropagation?.(
			`${this?.name}::_unregisterApi error`,
			errors
		);

		if (propagatedError) throw propagatedError;
	}
	// #endregion

	// #region Handlers
	async #createRole({ data }) {
		// Step 0: Get the models
		const TenantRoleModel = await this?._getModelsFromDomain?.([
			{
				type: 'relational',
				name: 'tenant-role'
			}
		]);

		// Step 1: De-serialize from JSON API Format
		const tenantRole =
			await this?.domainInterface?.serializer?.deserializeAsync?.(
				data?.data?.type,
				data
			);

		// Step 2: Insert into the database
		let createdRole = await this?._executeWithBackOff?.(() => {
			return TenantRoleModel?.query?.()?.insertAndFetch?.(tenantRole);
		});

		// Step 3: Serialize to JSON API Format
		createdRole = await this?.domainInterface?.serializer?.serializeAsync?.(
			'tenant-role',
			createdRole
		);

		// Finally, return..
		return {
			status: 200,
			body: createdRole
		};
	}

	async #getAllRoles() {
		let TenantRoleModel = await this?._getModelsFromDomain?.([
			{
				type: 'relational',
				name: 'tenant-role'
			}
		]);

		let tenantRoleData = await this?._executeWithBackOff?.(() => {
			return TenantRoleModel?.query?.();
		});

		// Serialize to JSON API Format
		tenantRoleData =
			await this?.domainInterface?.serializer?.serializeAsync?.(
				'tenant-role',
				tenantRoleData
			);

		return {
			status: 200,
			body: tenantRoleData
		};
	}

	async #getRole({ roleId }) {
		let TenantRoleModel = await this?._getModelsFromDomain?.([
			{
				type: 'relational',
				name: 'tenant-role'
			}
		]);

		let tenantRoleData = await this?._executeWithBackOff?.(() => {
			return TenantRoleModel?.query?.()?.findById?.(roleId);
		});

		// Serialize to JSON API Format
		tenantRoleData =
			await this?.domainInterface?.serializer?.serializeAsync?.(
				'tenant-role',
				tenantRoleData
			);

		return {
			status: 200,
			body: tenantRoleData
		};
	}

	async #setRole({ data }) {
		let TenantRoleModel = await this?._getModelsFromDomain?.([
			{
				type: 'relational',
				name: 'tenant-role'
			}
		]);

		// Step 1: De-serialize from JSON API Format, and remove non-update-able
		// fields
		const tenantRoleData =
			await this?.domainInterface?.serializer?.deserializeAsync?.(
				data?.data?.type,
				data
			);

		const tenantRoleId = tenantRoleData?.id;

		delete tenantRoleData?.id;
		delete tenantRoleData?.created_at;
		delete tenantRoleData?.updated_at;

		// Step 2: Update the database
		let updatedTenantRole = await this?._executeWithBackOff?.(() => {
			return TenantRoleModel?.query?.()?.patchAndFetchById?.(
				tenantRoleId,
				tenantRoleData
			);
		});

		// Finally... return
		updatedTenantRole =
			await this?.domainInterface?.serializer?.serializeAsync?.(
				'tenant-role',
				updatedTenantRole
			);

		return {
			status: 200,
			body: updatedTenantRole
		};
	}

	async #deleteRole({ roleId }) {
		let TenantModel = await this?._getModelsFromDomain?.([
			{
				type: 'relational',
				name: 'tenant-role'
			}
		]);

		await this?._executeWithBackOff?.(() => {
			return TenantModel?.query?.()?.deleteById?.(roleId);
		});

		return {
			status: 204
		};
	}
	// #endregion
}

/**
 * @class MiddlewareFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Roles Module Roles Middleware Class Factory.
 */
export default class MiddlewareFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof MiddlewareFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstance
	 *
	 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
	 *
	 * @returns {Roles} - The Roles middleware instance.
	 *
	 */
	static async createInstances(domainInterface) {
		if (!MiddlewareFactory.#tenantInstance) {
			const tenantInstance = new Roles(
				MiddlewareFactory['$disk_unc'],
				domainInterface
			);

			await tenantInstance?.load?.();
			MiddlewareFactory.#tenantInstance = tenantInstance;
		}

		return MiddlewareFactory.#tenantInstance;
	}

	/**
	 * @memberof MiddlewareFactory
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
		await MiddlewareFactory.#tenantInstance?.unload?.();
		MiddlewareFactory.#tenantInstance = undefined;

		return;
	}
	// #endregion

	// #region Getters
	/**
	 * @memberof MiddlewareFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name MiddlewareName
	 *
	 * @returns {string} - Name of this middleware.
	 *
	 * @description
	 * Returns the name of this middleware - Roles
	 */
	static get MiddlewareName() {
		return 'Roles';
	}
	// #endregion

	// #region Private Static Members
	static #tenantInstance = undefined;
	// #endregion
}
