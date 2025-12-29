/**
 * Imports for this file
 * @ignore
 */

/**
 * Magic constants
 * @ignore
 */
const COLLECTION_NAME = 'audit_trail';
const MODEL_NAME = 'audit_trail_model';

/**
 * @class ModelFactory
 *
 * @classdesc The UserAuditTrail MongoDB/Mongoose Model Class Factory.
 */
export default class ModelFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		// Intentionally left blank
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof ModelFactory
	 * @async
	 * @static
	 * @function
	 * @name createInstance
	 *
	 * @param {object} [connectionInstance] - Mongoose Connection Instance
	 *
	 * @returns {Mongoose.Model} - The UserAuditTrail Model instance.
	 *
	 */
	static async createInstance(connectionInstance) {
		// eslint-disable-next-line security/detect-object-injection
		if (connectionInstance?.models?.[MODEL_NAME]) {
			// eslint-disable-next-line security/detect-object-injection
			return connectionInstance?.models?.[MODEL_NAME];
		}

		let mongoose = await import('mongoose');
		mongoose = mongoose?.['default'];

		const UserAuditTrailSchema = mongoose?.Schema?.(
			{
				id: mongoose?.Schema?.Types?.String,
				start_time: mongoose?.Schema?.Types?.Date,
				end_time: mongoose?.Schema?.Types?.Date,
				duration_in_ms: mongoose?.Schema?.Types?.Number,

				user: {
					id: mongoose?.Schema?.Types?.String,
					name: mongoose?.Schema?.Types?.String
				},

				tenant: {
					id: mongoose?.Schema?.Types?.String,
					name: mongoose?.Schema?.Types?.String,
					sub_domain: mongoose?.Schema?.Types?.String
				},

				'request-meta': {
					headers: mongoose?.Schema?.Types?.Mixed,
					method: mongoose?.Schema?.Types?.String,
					url: mongoose?.Schema?.Types?.String,
					ip: mongoose?.Schema?.Types?.String
				},

				'response-meta': {
					headers: mongoose?.Schema?.Types?.Mixed,
					status: {
						code: mongoose?.Schema?.Types?.String,
						message: mongoose?.Schema?.Types?.String
					}
				},

				data: mongoose?.Schema?.Types?.Mixed,
				error: mongoose?.Schema?.Types?.Mixed
			},
			{
				collection: COLLECTION_NAME,
				timestamps: true,
				timeseries: {
					timeField: 'start_time',
					metaField: 'request_meta'
				}
			}
		);

		const UserAuditTrailModel = connectionInstance?.model?.(
			MODEL_NAME,
			UserAuditTrailSchema,
			COLLECTION_NAME
		);

		return UserAuditTrailModel;
	}
	// #endregion
}
