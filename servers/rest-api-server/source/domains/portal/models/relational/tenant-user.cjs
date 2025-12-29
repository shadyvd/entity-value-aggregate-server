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
 * @class UserDomain_TenantUser
 * @extends Model
 *
 * @classdesc An Objection.js Model for the Tenants_Users table
 *
 */
class UserDomain_TenantUser extends Model {
	// #region Static Getters / Setters
	static get tableName() {
		return 'tenants_users';
	}

	static relationMappings() {
		const Tenant = require('./tenant.cjs').Model;
		const User = require('./user.cjs').Model;

		return {
			tenant: {
				relation: Model.HasOneRelation,
				modelClass: Tenant,
				join: {
					from: 'tenants_users.tenant_id',
					to: 'tenants.id'
				}
			},

			user: {
				relation: Model.HasOneRelation,
				modelClass: User,
				join: {
					from: 'tenants_users.user_id',
					to: 'users.id'
				}
			}
		};
	}
	// #endregion
}

exports.Model = UserDomain_TenantUser;
