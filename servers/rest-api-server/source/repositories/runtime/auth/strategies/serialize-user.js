/**
 * Imports for this file
 * @ignore
 */
import userSessionCache from '../helpers/user-session-cache.js';

/**
 * @async
 * @function
 * @name serializeDeserialize
 *
 * @param {object} [passportInstance] - Instance of koa-passport
 * @param {object} [cacheRepository] - Instance of cache repository
 * @param {object} [databaseRepository] - Instance of sql_database repository
 *
 * @returns {null} - Nothing
 *
 * @description
 * Sets up user serialization / deserialization for koa-passport
 *
 */
export default async function serializeDeserialize(
	passportInstance,
	cacheRepository,
	databaseRepository
) {
	passportInstance?.serializeUser?.(async (request, user, callback) => {
		callback?.(undefined, user?.id);
	});

	passportInstance?.deserializeUser?.(
		async (request, sessionUser, callback) => {
			try {
				const deserializedUser = await userSessionCache(
					sessionUser.role,
					sessionUser.id,
					cacheRepository,
					databaseRepository
				);
				callback?.(undefined, deserializedUser);
			} catch (error) {
				callback?.(error);
			}
		}
	);
}
