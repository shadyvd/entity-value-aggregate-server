/* eslint-disable security/detect-object-injection */
/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseRepository } from '@twyr/framework-classes';
import { EVASBaseFactory } from '@twyr/framework-classes';

import ModelFactory from './audit-trail-model.js';

/**
 * @class Audit
 * @extends EVASBaseRepository
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [iocContainer] - IoC module providing DI repositories
 * @param {object} [configuration] - requested repository configuration
 *
 * @classdesc The Audit Repository Class.
 *
 */
class Audit extends EVASBaseRepository {
	// #region Constructor
	constructor(location, iocContainer, configuration) {
		super(location, iocContainer, configuration);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof Audit
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
	}

	/**
	 * @memberof Audit
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
		await super.unload?.();
	}
	// #endregion

	// #region Interface API
	/**
	 * @memberof Audit
	 * @async
	 * @instance
	 * @function
	 * @name publish
	 *
	 * @param {object} auditData - The data to be sent for future auditing.
	 *
	 * @returns {null} Nothing.
	 *
	 * @description
	 * Sends data to an audit server.
	 */
	async publish(auditData) {
		const auditPayload = this.#cleanBeforePublish?.(auditData);

		const logger = await this?.iocContainer?.resolve?.('Logger');
		logger?.debug?.(
			`Audit Payload: ${JSON?.stringify?.(auditPayload, undefined, '\t')}\n`
		);

		auditPayload['start_time'] = new Date(auditPayload?.['start_time']);
		auditPayload['end_time'] = new Date(auditPayload?.['end_time']);

		const connectionInstance =
			await this?.iocContainer?.resolve?.('MongoDB');

		const UserAuditTrailModel =
			await ModelFactory?.createInstance?.(connectionInstance);

		const userAuditTrailModel = new UserAuditTrailModel(auditPayload);

		// NOTE: Deliberately NOT awaiting here
		// No sense wasting time waiting for this
		// and reducing server performance
		userAuditTrailModel?.save?.();

		// TODO: Send to an actual Audit Server
		// The "actual" audit server should take care of
		// storing the audit trail in the chosen log store -
		// MongoDB / ELK / Open Telemetry / TimescaleDB
		// or whatever else is the store-du-jour
	}
	// #endregion

	// #region Getters / Setters
	get interface() {
		return {
			publish: this?.publish?.bind?.(this)
		};
	}
	// #endregion

	// #region Private Methods
	#cleanBeforePublish(auditPayload) {
		if (!auditPayload) return;

		const confidentialKeyList = ['password', 'image', 'random'];

		const keys = Object?.keys?.(auditPayload);
		for (const key of keys) {
			if (!auditPayload?.[key]) {
				delete auditPayload[key];
				continue;
			}

			if (confidentialKeyList?.includes?.(key)) {
				auditPayload[key] = '********';
				continue;
			}

			if (typeof auditPayload?.[key] === 'object') {
				auditPayload[key] = this.#cleanBeforePublish?.(
					auditPayload?.[key]
				);

				if (!auditPayload?.[key]) {
					delete auditPayload?.[key];
					continue;
				}
			}
		}

		if (!Object?.keys?.(auditPayload)?.length) return;
		return auditPayload;
	}
	// #endregion

	// #region Private Fields
	// #endregion
}

/**
 * @class RepositoryFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The Audit Repository Class Factory.
 */
export default class RepositoryFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstance
	 *
	 * @param {object} [configuration] - requested repository configuration
	 * @param {object} [iocContainer] - IoC Container providing DI Repositories
	 *
	 * @returns {Audit} - The Audit repository instance.
	 *
	 */
	static async createInstances(configuration, iocContainer) {
		const scope = configuration ?? 'server';
		if (!RepositoryFactory.#auditInstances?.has(scope)) {
			const auditInstance = new Audit(
				RepositoryFactory['$disk_unc'],
				iocContainer,
				scope
			);

			await auditInstance?.load?.();
			RepositoryFactory.#auditInstances?.set?.(scope, auditInstance);
		}

		return RepositoryFactory.#auditInstances?.get(scope)?.interface;
	}

	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @param {object} [configuration] - requested repository configuration
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description Clears the cached {Audit} instances
	 */
	static async destroyInstances(configuration) {
		if (configuration) {
			if (!RepositoryFactory.#auditInstances?.has(configuration)) return;

			const auditInstance =
				RepositoryFactory.#auditInstances?.get(configuration);
			await auditInstance?.unload?.();

			RepositoryFactory.#auditInstances?.delete?.(configuration);
			return;
		}

		const destroyResolutions = [];
		this.#auditInstances?.forEach?.((auditInstance) => {
			destroyResolutions?.push?.(auditInstance?.unload?.());
		});

		await Promise?.allSettled?.(destroyResolutions);
		this.#auditInstances?.clear?.();

		return;
	}
	// #endregion

	// #region Getters
	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name RepositoryName
	 *
	 * @returns {string} - Name of this repository.
	 *
	 * @description
	 * Returns the name of this repository - Audit
	 */
	static get RepositoryName() {
		return 'Audit';
	}
	// #endregion

	// #region Private Static Members
	static #auditInstances = new Map();
	// #endregion
}
