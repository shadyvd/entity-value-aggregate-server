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
 * @class ServerUserDomain_LocaleMaster
 * @extends BaseModel
 *
 * @classdesc An Objection.js BaseModel for the Contact Type Master table
 *
 */
class ServerUserDomain_LocaleMaster extends BaseModel {
	// #region Static Getters / Setters
	// eslint-disable-next-line jsdoc/require-jsdoc
	static get tableName() {
		return 'locale_master';
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	static relationMappings() {
		const ServerUserLocale = require('./server-user-locale.cjs').Model;

		return {
			serverUserLocales: {
				relation: BaseModel.HasManyRelation,
				modelClass: ServerUserLocale,
				join: {
					from: 'locale_master.code',
					to: 'server_user_locales.locale_code'
				}
			}
		};
	}
	// #endregion
}

exports.Model = ServerUserDomain_LocaleMaster;
