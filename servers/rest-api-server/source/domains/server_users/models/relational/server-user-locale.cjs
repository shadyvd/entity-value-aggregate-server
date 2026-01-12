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
 * @class ServerUserDomain_ServerUserLocale
 * @extends BaseModel
 *
 * @classdesc An Objection.js BaseModel for the ServerUserLocale table
 *
 */
class ServerUserDomain_ServerUserLocale extends BaseModel {
	// #region Static Getters / Setters
	// eslint-disable-next-line jsdoc/require-jsdoc
	static get tableName() {
		return 'server_user_locales';
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	static relationMappings() {
		const LocaleMaster = require('./locale-master.cjs').Model;
		const ServerUser = require('./server-user.cjs').Model;

		return {
			serverUser: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: ServerUser,
				join: {
					from: 'server_user_locales.server_user_id',
					to: 'server_users.id'
				}
			},
			locale: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: LocaleMaster,
				join: {
					from: 'server_user_locales.locale_code',
					to: 'locale_master.code'
				}
			}
		};
	}
	// #endregion
}

exports.Model = ServerUserDomain_ServerUserLocale;
