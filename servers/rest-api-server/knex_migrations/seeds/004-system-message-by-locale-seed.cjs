'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const areSystemMessagesPresent = await knex?.raw?.(
		`SELECT COUNT(message_code) AS message_count FROM system_message_by_locale_master`
	);
	if (areSystemMessagesPresent?.rows?.[0]?.['message_count'] > 0) return;

	// Step 1: Insert the system messages
	await knex?.('system_message_by_locale_master')?.insert([
		// The server-level messages
		// The server-level errors
		{
			message_code: 'UNKNOWN_ERROR',
			locale_code: 'en-IN',
			message_text:
				"System Error. We're working to fix it. Apologies for the inconvenience"
		},
		{
			message_code: 'AUTH_REPOSITORY::USER_NOT_FOUND_IN_DB',
			locale_code: 'en-IN',
			message_text: 'User not found in the system.'
		},
		{
			message_code: 'AUTH_REPOSITORY::OTP_EXPIRED_OR_INVALID',
			locale_code: 'en-IN',
			message_text: 'OTP expired or invalid.'
		},
		// Server User domain, Session Manager context messages
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
		},
		{
			message_code: 'SERVER_USERS::SESSION_MANAGER::LOGOUT_MESSAGE',
			locale_code: 'en-IN',
			message_text: 'Logged out server_user: {{userName}}.'
		},
		// Server User domain, Session Manager context errors
		{
			message_code:
				'SERVER_USERS::SESSION_MANAGER::EXISTING_ACTIVE_SESSION',
			locale_code: 'en-IN',
			message_text: 'Active session already exists.'
		},
		{
			message_code: 'SERVER_USERS::SESSION_MANAGER::NO_ACTIVE_SESSION',
			locale_code: 'en-IN',
			message_text: 'No active session.'
		},
		{
			message_code:
				'SERVER_USERS::SESSION_MANAGER::AUTHORIZATION_FAILURE',
			locale_code: 'en-IN',
			message_text:
				'Permission denied. Contact the administration team to fix this issue.'
		},
		// Server User domain, Profile context messages
		// Server User domain, Profile context errors
		{
			message_code: 'SERVER_USERS::PROFILE::INVALID_OTP',
			locale_code: 'en-IN',
			message_text:
				'Profile cannot be created for {{body.first_name}} {{body.last_name}}. OTP mismatch.'
		},
		{
			message_code: 'SERVER_USERS::PROFILE::DUPLICATE_USER',
			locale_code: 'en-IN',
			message_text:
				'Profile cannot be created for {{body.first_name}} {{body.last_name}}. User already exists.'
		},
		{
			message_code: 'SERVER_USERS::PROFILE::MINOR_USER',
			locale_code: 'en-IN',
			message_text:
				'Profile cannot be created for {{body.first_name}} {{body.last_name}}. User is a minor.'
		}
	]);
};
