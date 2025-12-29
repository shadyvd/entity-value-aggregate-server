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
 * @class UserDomain_ContactTypeMaster
 * @extends Model
 *
 * @classdesc An Objection.js Model for the Contact Type Master table
 *
 */
class UserDomain_ContactTypeMaster extends Model {
	// #region Static Getters / Setters
	static get tableName() {
		return 'contact_type_master';
	}

	static relationMappings() {
		const UserContact = require('./user-contact.cjs').Model;

		return {
			userContacts: {
				relation: Model.HasManyRelation,
				modelClass: UserContact,
				join: {
					from: 'contact_type_master.id',
					to: 'user_contacts.contact_type_id'
				}
			}
		};
	}
	// #endregion
}

exports.Model = UserDomain_ContactTypeMaster;
