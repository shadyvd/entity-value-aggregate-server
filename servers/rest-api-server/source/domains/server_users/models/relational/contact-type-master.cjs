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
const BaseModel = require('./../../../../../base_classes/objection-model.cjs');

/**
 * @class ServerUserDomain_ContactTypeMaster
 * @extends BaseModel
 *
 * @classdesc An Objection.js BaseModel for the Contact Type Master table
 *
 */
class ServerUserDomain_ContactTypeMaster extends BaseModel {
	// #region Static Getters / Setters
	// eslint-disable-next-line jsdoc/require-jsdoc
	static get tableName() {
		return 'contact_type_master';
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	static relationMappings() {
		const ServerUserContact = require('./server-user-contact.cjs').Model;

		return {
			serverUserContacts: {
				relation: BaseModel.HasManyRelation,
				modelClass: ServerUserContact,
				join: {
					from: 'contact_type_master.id',
					to: 'server_user_contacts.contact_type_id'
				}
			}
		};
	}
	// #endregion
}

exports.Model = ServerUserDomain_ContactTypeMaster;
