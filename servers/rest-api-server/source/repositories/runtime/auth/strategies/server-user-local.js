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
						throw new Error(`ServerUser record not found`);
					}

					const otpNumber = await cacheRepository?.get?.(
						`server-user-otp-${serverUserRecord?.['mobile_no']}`
					);

					if (!otpNumber) {
						throw new Error(
							`OTP has expired. Please request a new OTP.`
						);
					}

					if (otpNumber !== password) {
						throw new Error(
							`Invalid OTP number. Please try again.`
						);
					}

					callback?.(undefined, serverUserRecord);
				} catch (error) {
					callback?.(error);
				}
			}
		)
	);
}
