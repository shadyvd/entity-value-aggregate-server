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
 * @class AdminDomain_Tenant
 * @extends Model
 *
 * @classdesc An Objection.js Model for the Tenants table
 *
 */
class AdminDomain_Tenant extends Model {
	// #region Static Getters / Setters
	static get tableName() {
		return 'tenants';
	}

	static relationMappings() {
		const TenantStatusMaster = require('./tenant-status-master.cjs').Model;
		const TenantRole = require('./tenant-role.cjs').Model;
		const TenantUser = require('./tenant-user.cjs').Model;

		return {
			tenantStatus: {
				relation: Model.HasOneRelation,
				modelClass: TenantStatusMaster,
				join: {
					from: 'tenants.status',
					to: 'tenant_status_master.id'
				}
			},
			roles: {
				relation: Model.HasManyRelation,
				modelClass: TenantRole,
				join: {
					from: 'tenants.id',
					to: 'tenant_roles.tenant_id'
				}
			},
			users: {
				relation: Model.HasManyRelation,
				modelClass: TenantUser,
				join: {
					from: 'tenants.id',
					to: 'tenants_users.tenant_id'
				}
			}
		};
	}
	// #endregion
}

exports.Model = AdminDomain_Tenant;
