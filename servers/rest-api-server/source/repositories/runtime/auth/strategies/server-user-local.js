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
	let LocalStrategy = await import('passport-local');
	LocalStrategy = LocalStrategy?.Strategy;

	passportInstance?.use?.(
		'server-user-local',
		new LocalStrategy(
			{ passReqToCallback: true },
			async (request, username, password, callback) => {
				try {
					let serverUserRecord = await databaseRepository?.raw?.(
						`SELECT * FROM server_users WHERE mobile_no = ? AND is_active = true`,
						[username]
					);
					serverUserRecord = serverUserRecord?.rows?.[0];
					if (!serverUserRecord) {
						const userError = new Error(
							'EVASERVER::AUTH_REPOSITORY::USER_NOT_FOUND_IN_DB'
						);
						userError.code =
							'EVASERVER::AUTH_REPOSITORY::USER_NOT_FOUND_IN_DB';

						throw userError;
					}

					const otpNumber = await cacheRepository?.get?.(
						`server-user-otp-${serverUserRecord?.['mobile_no']}`
					);

					if (!otpNumber) {
						const userError = new Error(
							'EVASERVER::AUTH_REPOSITORY::OTP_EXPIRED_OR_INVALID'
						);
						userError.code =
							'EVASERVER::AUTH_REPOSITORY::OTP_EXPIRED_OR_INVALID';

						throw userError;
					}

					if (otpNumber !== password) {
						const userError = new Error(
							'EVASERVER::AUTH_REPOSITORY::OTP_EXPIRED_OR_INVALID'
						);
						userError.code =
							'EVASERVER::AUTH_REPOSITORY::OTP_EXPIRED_OR_INVALID';

						throw userError;
					}

					callback?.(undefined, serverUserRecord);
				} catch (error) {
					callback?.(error);
				}
			}
		)
	);
}
