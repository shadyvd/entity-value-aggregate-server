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
const BaseModel = require('../../../../../base_classes/objection-model.cjs');

/**
 * @class ServerUserDomain_ServerUser
 * @extends BaseModel
 *
 * @classdesc An Objection.js Model for the ServerUsers table
 *
 */
class ServerUserDomain_ServerUser extends BaseModel {
	// #region Static Getters / Setters
	// eslint-disable-next-line jsdoc/require-jsdoc
	static get tableName() {
		return 'server_users';
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	static relationMappings() {
		const ServerUserContact = require('./server-user-contact.cjs').Model;
		const ServerUserLocale = require('./server-user-locale.cjs').Model;
		const ServerUserGender = require('./gender-master.cjs').Model;

		return {
			contacts: {
				relation: BaseModel.HasManyRelation,
				modelClass: ServerUserContact,
				join: {
					from: 'server_users.id',
					to: 'server_user_contacts.server_user_id'
				}
			},
			locales: {
				relation: BaseModel.HasManyRelation,
				modelClass: ServerUserLocale,
				join: {
					from: 'server_users.id',
					to: 'server_user_locales.server_user_id'
				}
			},
			gender: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: ServerUserGender,
				join: {
					from: 'server_users.gender_id',
					to: 'gender_master.id'
				}
			}
		};
	}
	// #endregion
}

exports.Model = ServerUserDomain_ServerUser;
