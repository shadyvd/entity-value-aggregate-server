const { Model } = require('objection');

/**
 * @class BaseModel
 * @classdesc
 * The Base Class for all Objection.js Models in the Server.
 * Adds functionality to change the "updated_on" field on
 * each operation
 */
class BaseModel extends Model {
	// eslint-disable-next-line jsdoc/require-jsdoc
	$beforeUpdate() {
		// Set the updated_on (or updatedAt) column to the current time before any update operation
		this.updated_at = new Date().toISOString();
	}
}

module.exports = BaseModel;
