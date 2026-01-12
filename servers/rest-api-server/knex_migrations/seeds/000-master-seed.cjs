'use strict';

const insertContactTypeMasterData = async function insertContactTypeMasterData(
	knex
) {
	// Step 0: If the data is already in there, skip...
	const artifactCount = await knex?.raw?.(
		`SELECT count(id) AS masterdata_count FROM contact_type_master`
	);
	if (Number?.(artifactCount?.rows?.[0]['masterdata_count'])) return;

	// Step 1: Insert the data...
	await knex?.('contact_type_master')?.insert?.({
		name: 'email',
		display_name: 'Email',
		description: 'Email address of the User'
	});

	await knex?.('contact_type_master')?.insert?.({
		name: 'landline',
		display_name: 'Landline / Fixed Line',
		description: `Phone number of the User's fixed line`
	});

	await knex?.('contact_type_master')?.insert?.({
		name: 'mobile',
		display_name: 'Mobile',
		description: `Mobile number of the User`
	});

	await knex?.('contact_type_master')?.insert?.({
		name: 'fax',
		display_name: 'Fax',
		description: `Fax number of the User`
	});

	await knex?.('contact_type_master')?.insert?.({
		name: 'social',
		display_name: 'Social Media',
		description: `Social Media Profile handle of the User`
	});
};

const insertGenderMasterData = async function insertGenderMasterData(knex) {
	// Step 0: If the data is already in there, skip...
	const artifactCount = await knex?.raw?.(
		`SELECT count(id) AS masterdata_count FROM gender_master`
	);
	if (Number?.(artifactCount?.rows?.[0]['masterdata_count'])) return;

	// Step 1: Insert the data...
	await knex?.('gender_master')?.insert?.({
		name: 'male',
		display_name: 'Male',
		description: 'Male gender'
	});

	await knex?.('gender_master')?.insert?.({
		name: 'female',
		display_name: 'Female',
		description: 'Female gender'
	});

	await knex?.('gender_master')?.insert?.({
		name: 'other',
		display_name: 'Other',
		description: 'Other gender'
	});
};

const insertConnectionStatusMasterData =
	async function insertConnectionStatusMasterData(knex) {
		// Step 0: If the data is already in there, skip...
		const artifactCount = await knex?.raw?.(
			`SELECT count(id) AS masterdata_count FROM connection_status_master`
		);
		if (Number?.(artifactCount?.rows?.[0]['masterdata_count'])) return;

		// Step 1: Insert the data...
		await knex?.('connection_status_master')?.insert?.({
			name: 'waiting',
			display_name: 'Waiting',
			description: 'Connection approval pending'
		});

		await knex?.('connection_status_master')?.insert?.({
			name: 'authorized',
			display_name: 'Authorized',
			description: 'Connection approved'
		});

		await knex?.('connection_status_master')?.insert?.({
			name: 'disabled',
			display_name: 'Disabled',
			description: 'Connection removed'
		});
	};

exports.seed = async function (knex) {
	// Step 1: Insert master data into contact types master
	await insertContactTypeMasterData(knex);

	// Step 2: Insert master data into genders master
	await insertGenderMasterData(knex);

	// Step 3: Insert master data into connection status master
	await insertConnectionStatusMasterData(knex);
};
