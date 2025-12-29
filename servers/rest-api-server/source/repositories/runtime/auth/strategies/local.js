/**
 * @async
 * @function
 * @name localStrategy
 *
 * @param {object} [passportInstance] - Instance of koa-passport
 * @param {object} [cacheRepository] - Instance of cache repository
 * @param {object} [databaseRepository] - Instance of sql_database repository
 *
 * @returns {null} - Nothing
 *
 * @description
 * Sets up local authentication strategy for koa-passport
 *
 */
export default async function localStrategy(
	passportInstance,
	cacheRepository,
	databaseRepository
) {
	let upash = await import('upash');
	upash = upash?.['default'];

	let pbkdf2 = await import('@phc/pbkdf2');
	pbkdf2 = pbkdf2?.['default'];

	upash?.install?.('pbkdf2', pbkdf2);

	let LocalStrategy = await import('passport-local');
	LocalStrategy = LocalStrategy?.Strategy;

	passportInstance?.use?.(
		'server-local',
		new LocalStrategy(
			{ passReqToCallback: true },
			async (request, username, password, callback) => {
				try {
					let userRecord = await databaseRepository?.raw?.(
						`SELECT * FROM users WHERE email = ? `,
						[username]
					);
					userRecord = userRecord?.rows?.[0];
					if (!userRecord) {
						throw new Error(`Credential mismatch`);
					}

					const credentialMatch = await upash?.verify?.(
						userRecord?.['password'],
						password
					);
					if (!credentialMatch) {
						throw new Error(`Credential mismatch`);
					}

					callback?.(undefined, userRecord);
				} catch (error) {
					callback?.(error);
				}
			}
		)
	);
}
