/**
 * WARNING: DUE TO THE WAY OBJECTION.JS RESOLVES RELATIONSHIPS
 * EVERY MODEL CLASS IN THE ENTIRE SERVER HAS TO HAVE A UNIQUE
 * NAME
 *
 * THE RECOMMENDED APPROACH IS TO PREPEND THE DOMAIN NAME CHAIN
 * TO THE BEGINNING OF THE MODEL NAME
 *
 * IF YOU FORGET TO DO THIS, YOU WILL FACE RANDOM ERRORS WHEN
 * RUNNING IN PRODUCTION.
 *
 * YOU HAVE BEEN WARNED!
 */

'use strict';

/**
 * Imports for this file
 * @ignore
 */
const { Model } = require('objection');

/**
 * @class AdminDomain_TenantStatusMaster
 * @extends Model
 *
 * @classdesc An Objection.js Model for the Tenants table
 *
 */
class AdminDomain_TenantStatusMaster extends Model {
	// #region Static Getters / Setters
	static get tableName() {
		return 'tenant_status_master';
	}

	static relationMappings() {
		const Tenant = require('./tenant.cjs').Model;

		return {
			tenants: {
				relation: Model.HasManyRelation,
				modelClass: Tenant,
				join: {
					from: 'tenant_status_master.id',
					to: 'tenants.status'
				}
			}
		};
	}
	// #endregion
}

exports.Model = AdminDomain_TenantStatusMaster;
