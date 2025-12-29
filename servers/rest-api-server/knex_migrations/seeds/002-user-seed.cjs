'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const isUserPresent = await knex?.raw?.(
		`SELECT id FROM users WHERE email = 'admin@portal.com'`
	);
	if (isUserPresent?.rows?.[0]?.['id']) return;

	// Step 1: Insert the root user (admin@portal.com)
	let userId = await knex?.('users')
		?.insert({
			email: 'admin@portal.com',
			password:
				'$pbkdf2-sha512$i=25000$TcpuHsGqh+o3S+KNIXREjw$MjHMSkGA5WHnRWG0UbUP/CPxfADCN+o+8momCsXOzRSigcty3/R3CPftGy7l9EcLoF1BYpo8Q7/PlnfRC24PkA',
			first_name: 'Admin',
			last_name: 'Portal',
			nickname: 'admin'
		})
		?.returning?.('id');

	userId = userId?.[0]?.['id'];

	// Step 2: Get the id of the contact type
	let mobileContactTypeId = await knex?.raw?.(
		`SELECT id FROM contact_type_master WHERE name = 'mobile'`
	);
	mobileContactTypeId = mobileContactTypeId?.rows?.[0]?.['id'];

	await knex?.('user_contacts')?.insert?.({
		user_id: userId,
		contact_type_id: mobileContactTypeId,
		contact: '+911234567890',
		verified: true
	});
};
