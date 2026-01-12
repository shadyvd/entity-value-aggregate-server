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
 * @class ServerUserDomain_GenderMaster
 * @extends BaseModel
 *
 * @classdesc An Objection.js BaseModel for the Contact Type Master table
 *
 */
class ServerUserDomain_GenderMaster extends BaseModel {
	// #region Static Getters / Setters
	// eslint-disable-next-line jsdoc/require-jsdoc
	static get tableName() {
		return 'gender_master';
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	static relationMappings() {
		const ServerUser = require('./server-user.cjs').Model;

		return {
			serverUsers: {
				relation: BaseModel.HasManyRelation,
				modelClass: ServerUser,
				join: {
					from: 'gender_master.id',
					to: 'server_users.gender_id'
				}
			}
		};
	}
	// #endregion
}

exports.Model = ServerUserDomain_GenderMaster;
