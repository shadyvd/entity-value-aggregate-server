/**
 * Imports for this file
 * @ignore
 */
import { backOff } from 'exponential-backoff';
import { EVASBaseMiddleware } from '@twyr/framework-classes';
import { createErrorForPropagation } from '@twyr/error-serializer';

/**
 * Magic Number constants
 * @ignore
 */
const MAX_RETRY_COUNT = 5;

/**
 * @class BaseMiddleware
 * @extends EVASBaseMiddleware
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [domainInterface] - Domain functionality exposed to sub-artifacts
 *
 * @classdesc The Base Class for all Middlewares.
 */
export class BaseMiddleware extends EVASBaseMiddleware {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor(location, domainInterface) {
		super(location, domainInterface);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof BaseMiddleware
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
		await this?._registerApi?.();
	}

	/**
	 * @memberof BaseMiddleware
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
		await this?._unregisterApi?.();
		await super.unload?.();
	}
	// #endregion

	// #region Protected Methods, to be overridden by derived classes
	/**
	 * @memberof BaseMiddleware
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _registerApi
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for adding their API
	 * to the apiRegistry in the domainInterface
	 *
	 */
	async _registerApi() {
		return [];
	}

	/**
	 * @memberof BaseMiddleware
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _unregisterApi
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for removing their API
	 * from the apiRegistry in the domainInterface
	 *
	 */
	async _unregisterApi() {
		return;
	}
	// #endregion

	// #region "Protected" methods
	/**
	 * @memberof BaseMiddleware
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _executeWithBackOff
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Surrounds the given method with an exponential back-off retry mechanism
	 * to enable circuit breaker like functionality
	 *
	 */
	async _executeWithBackOff(method) {
		const logger =
			await this?.domainInterface?.iocContainer?.resolve?.('Logger');

		const returnValue = await backOff?.(method, {
			delayFirstAttempt: false,
			numOfAttempts: MAX_RETRY_COUNT,
			retry: (error) => {
				logger?.error?.(error?.message);
			}
		});

		return returnValue;
	}

	/**
	 * @memberof BaseMiddleware
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _getModelsFromDomain
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Fetches the models from the domainInterface
	 *
	 */
	async _getModelsFromDomain(modelList) {
		let models = await this?.domainInterface?.models?.(modelList);
		const errors = [];

		models = models
			?.map?.((model) => {
				if (model?.error) {
					errors?.push?.(model?.error);
					return;
				}

				return model?.model;
			})
			?.filter?.((model) => {
				return model ?? false;
			});

		if (errors?.length) {
			const propagatedError = createErrorForPropagation?.(
				`${this?.name}::_getModelsFromDomain: error fetching models`,
				errors
			);

			throw propagatedError;
		}

		if (models?.length <= 1) {
			models = models?.pop?.();
		}

		return models;
	}

	/**
	 * @memberof BaseMiddleware
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name _getTemplatesFromDomain
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * Fetches the templates from the domainInterface
	 *
	 */
	async _getTemplatesFromDomain(templateList) {
		let templates = await this?.domainInterface?.templates?.(templateList);
		const errors = [];

		templates = templates
			?.map?.((template) => {
				if (template?.error) {
					errors?.push?.(template?.error);
					return;
				}

				return template?.template;
			})
			?.filter?.((template) => {
				return template ?? false;
			});

		if (errors?.length) {
			const propagatedError = createErrorForPropagation?.(
				`${this?.name}::_getTemplatesFromDomain: error fetching templates`,
				errors
			);

			throw propagatedError;
		}

		if (templates?.length <= 1) {
			templates = templates?.pop?.();
		}

		return templates;
	}
	// #endregion
}
