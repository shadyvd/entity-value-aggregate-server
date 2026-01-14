'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const areSystemMessagesPresent = await knex?.raw?.(
		`SELECT COUNT(message_code) AS message_count FROM system_message_by_locale_master`
	);
	if (areSystemMessagesPresent?.rows?.[0]?.['message_count'] > 0) return;

	// Step 1: Insert the system messages
	await knex?.('system_message_by_locale_master')?.insert([
		{
			message_code: 'SERVER_USERS::SESSION_MANAGER::OTP_MESSAGE_SMS',
			locale_code: 'en-IN',
			message_text:
				'Your OTP for Twyr is {{otp}}. Valid until {{expiryTime}}.'
		},
		{
			message_code: 'SERVER_USERS::SESSION_MANAGER::OTP_MESSAGE_RESPONSE',
			locale_code: 'en-IN',
			message_text:
				'An OTP has been sent to your registered mobile number.'
		}
	]);
};
