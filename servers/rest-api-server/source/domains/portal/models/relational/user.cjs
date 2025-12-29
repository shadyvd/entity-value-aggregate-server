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
 * @class UserDomain_User
 * @extends Model
 *
 * @classdesc An Objection.js Model for the Users table
 *
 */
class UserDomain_User extends Model {
	// #region Static Getters / Setters
	static get tableName() {
		return 'users';
	}

	static relationMappings() {
		const Tenant = require('./tenant.cjs').Model;
		const TenantUser = require('./tenant-user.cjs').Model;
		const UserContact = require('./user-contact.cjs').Model;

		return {
			contacts: {
				relation: Model.HasManyRelation,
				modelClass: UserContact,
				join: {
					from: 'users.id',
					to: 'user_contacts.user_id'
				}
			},
			userTenants: {
				relation: Model.HasManyRelation,
				modelClass: TenantUser,
				join: {
					from: 'users.id',
					to: 'tenants_users.user_id'
				}
			},
			tenants: {
				relation: Model.ManyToManyRelation,
				modelClass: Tenant,
				join: {
					from: 'users.id',
					through: {
						from: 'tenants_users.user_id',
						to: 'tenants_users.tenant_id'
					},
					to: 'tenants.id'
				}
			}
		};
	}
	// #endregion
}

exports.Model = UserDomain_User;
