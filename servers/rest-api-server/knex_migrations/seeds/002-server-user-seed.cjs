'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const isServerUserPresent = await knex?.raw?.(
		`SELECT id FROM server_users WHERE mobile_no = '+911234567890'`
	);
	if (isServerUserPresent?.rows?.[0]?.['id']) return;

	// Step 1: Insert the first server-user
	let genderId = await knex?.raw?.(
		`SELECT id FROM gender_master WHERE name = 'male'`
	);
	genderId = genderId?.rows?.[0]?.['id'];

	let serverUserId = await knex?.('server_users')
		?.insert({
			mobile_no: '+911234567890',
			first_name: 'John',
			last_name: 'Doe',
			nickname: 'Johnny',
			date_of_birth: '1990-01-01',
			gender_id: genderId
		})
		?.returning?.('id');

	serverUserId = serverUserId?.[0]?.['id'];

	// Step 2: Insert contact
	let mobileContactTypeId = await knex?.raw?.(
		`SELECT id FROM contact_type_master WHERE name = 'mobile'`
	);
	mobileContactTypeId = mobileContactTypeId?.rows?.[0]?.['id'];

	await knex?.('server_user_contacts')?.insert?.({
		server_user_id: serverUserId,
		contact_type_id: mobileContactTypeId,
		contact: '+911234567890',
		is_primary: true,
		verified: true
	});

	// Step 4: Insert locale
	await knex?.('server_user_locales')?.insert?.({
		server_user_id: serverUserId,
		is_primary: true,
		locale_code: 'en-IN'
	});

	// Step 5: Insert the second server-user
	genderId = await knex?.raw?.(
		`SELECT id FROM gender_master WHERE name = 'female'`
	);

	genderId = genderId?.rows?.[0]?.['id'];
	serverUserId = await knex?.('server_users')
		?.insert({
			mobile_no: '+911098765432',
			first_name: 'Jane',
			last_name: 'Doe',
			nickname: 'Jane',
			date_of_birth: '1992-01-01',
			gender_id: genderId
		})
		?.returning?.('id');

	serverUserId = serverUserId?.[0]?.['id'];

	// Step 6: Insert contact
	await knex?.('server_user_contacts')?.insert?.({
		server_user_id: serverUserId,
		contact_type_id: mobileContactTypeId,
		contact: '+911098765432',
		is_primary: true,
		verified: true
	});

	// Step 8: Insert locale
	await knex?.('server_user_locales')?.insert?.({
		server_user_id: serverUserId,
		locale_code: 'en-IN',
		is_primary: true
	});
};
