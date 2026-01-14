// MAGIC NUMBERS
const SESSION_CACHE_TIMEOUT_DEVELOPMENT = 3_600; // 1 hours in seconds
const SESSION_CACHE_TIMEOUT_PRODUCTION = 86_400; // 24 hours in seconds

const getUserDetails = async function getUserDetails(
	userRole,
	userId,
	cacheRepository,
	databaseRepository
) {
	// Step 1: Get the details from the cache, if present
	let cachedUser = await cacheRepository?.get?.(
		`twyr!entity!value!aggregate!${userRole}!${userId}!basics`
	);
	if (cachedUser) {
		cachedUser = JSON?.parse?.(cachedUser);
		return cachedUser;
	}

	// Step 2: Get the details from the database, if present
	cachedUser = await databaseRepository?.raw?.(
		`SELECT * FROM ${userRole}s WHERE id = ? AND is_active = true`,
		[userId]
	);

	if (!cachedUser) return null;

	cachedUser = cachedUser?.rows?.[0];
	cachedUser['role'] = userRole;

	// Step 3: Get the contact details
	const contactDetails = await databaseRepository?.raw?.(
		`SELECT B.name as type, A.contact AS contact, A.verified AS verified FROM ${userRole}_contacts A INNER JOIN contact_type_master B ON (A.contact_type_id = B.id)  WHERE A.${userRole}_id = ?`,
		[userId]
	);
	cachedUser['contacts'] = contactDetails?.rows;

	// Step 4: Get the language preferences
	const localeDetails = await databaseRepository?.raw?.(
		`SELECT A.locale_code AS locale, A.is_primary AS primary, B.language_name AS language, B.is_rtl AS rtl FROM ${userRole}_locales A INNER JOIN locale_master B ON (A.locale_code = B.code)  WHERE A.${userRole}_id = ?`,
		[userId]
	);
	cachedUser['locales'] = localeDetails?.rows;

	// Finally, Set the details in the cache for the future...
	const cacheMulti = await cacheRepository?.multi?.();
	cacheMulti?.set?.(
		`twyr!entity!value!aggregate!${userRole}!${userId}!basics`,
		JSON?.stringify?.(cachedUser)
	);

	cacheMulti?.expire?.(
		`twyr!entity!value!aggregate!${userRole}!${userId}!basics`,
		global.serverEnvironment === 'development'
			? SESSION_CACHE_TIMEOUT_DEVELOPMENT
			: SESSION_CACHE_TIMEOUT_PRODUCTION
	);

	await cacheMulti?.exec?.();

	// Finally, return the details...
	return cachedUser;
};

/**
 * @async
 * @function
 * @name userSessionCache
 *
 * @param {string} [userRole] - Role of the user
 * @param {string} [userId] - GUID representing a User
 * @param {object} [cacheRepository] - Instance of cache repository
 * @param {object} [databaseRepository] - Instance of sql_database repository
 *
 * @returns {object} - User details from the cache
 *
 * @description
 * Retrieves User details from the database / cache and returns it
 *
 */
export default async function userSessionCache(
	userRole,
	userId,
	cacheRepository,
	databaseRepository
) {
	const userDetails = await getUserDetails(
		userRole,
		userId,
		cacheRepository,
		databaseRepository
	);

	if (!userDetails) {
		throw new Error(`User not found`);
	}

	return userDetails;
}
