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
 * @class UserDomain_UserContact
 * @extends Model
 *
 * @classdesc An Objection.js Model for the UserContacts table
 *
 */
class UserDomain_UserContact extends Model {
	// #region Static Getters / Setters
	static get tableName() {
		return 'user_contacts';
	}

	static relationMappings() {
		const ContactTypeMaster = require('./contact-type-master.cjs').Model;
		const User = require('./user.cjs').Model;

		return {
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'user_contacts.user_id',
					to: 'users.id'
				}
			},
			contactType: {
				relation: Model.BelongsToOneRelation,
				modelClass: ContactTypeMaster,
				join: {
					from: 'user_contacts.contact_type_id',
					to: 'contact_type_master.id'
				}
			}
		};
	}
	// #endregion
}

exports.Model = UserDomain_UserContact;
