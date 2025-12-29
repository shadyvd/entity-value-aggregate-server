'use strict';

const insertModuleTypesMasterData = async function insertModuleTypesMasterData(
	knex
) {
	// Step 0: If the data is already in there, skip...
	const artifactCount = await knex?.raw?.(
		`SELECT count(id) AS masterdata_count FROM artifact_type_master`
	);
	if (Number?.(artifactCount?.rows?.[0]['masterdata_count'])) return;

	// Step 1: Insert the data...
	await knex?.('artifact_type_master')?.insert?.({
		name: 'server',
		display_name: 'Server',
		description: 'Top-Level programs that host other entities'
	});

	await knex?.('artifact_type_master')?.insert?.({
		name: 'domain',
		display_name: 'Domain',
		description: 'A single domain in the Server'
	});

	await knex?.('artifact_type_master')?.insert?.({
		name: 'feature',
		display_name: 'Module',
		description: 'A single feature of either the Server or the Domain'
	});

	await knex?.('artifact_type_master')?.insert?.({
		name: 'repository',
		display_name: 'Repository',
		description:
			'An entity that wraps an external third-party API - for either a Server or a Domain'
	});

	await knex?.('artifact_type_master')?.insert?.({
		name: 'surface',
		display_name: 'Surface',
		description: 'An entity that exposes API for a Module'
	});

	await knex?.('artifact_type_master')?.insert?.({
		name: 'middleware',
		display_name: 'Middleware',
		description: 'An entity that contains the business logic for a Module'
	});
};

const insertModuleAvailabilityModeMasterData =
	async function insertModuleAvailabilityModeMasterData(knex) {
		// Step 0: If the data is already in there, skip...
		const artifactCount = await knex?.raw?.(
			`SELECT count(id) AS masterdata_count FROM artifact_availability_mode_master`
		);
		if (Number?.(artifactCount?.rows?.[0]['masterdata_count'])) return;

		// Step 1: Insert the data...
		await knex?.('artifact_availability_mode_master')?.insert?.({
			name: 'admin',
			display_name: 'Administrator',
			description:
				'Modules that can be mapped only to the Administrator Tenant'
		});

		await knex?.('artifact_availability_mode_master')?.insert?.({
			name: 'default',
			display_name: 'Default',
			description: 'Modules that can be mapped to any Tenant'
		});
	};

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

const insertTenantStatusMasterData =
	async function insertTenantStatusMasterData(knex) {
		// Step 0: If the data is already in there, skip...
		const statusCount = await knex?.raw?.(
			`SELECT count(id) AS status_count FROM tenant_status_master`
		);
		if (Number?.(statusCount?.rows?.[0]['status_count'])) return;

		// Step 1: Insert the data...
		await knex?.('tenant_status_master')?.insert?.({
			name: 'trial',
			display_name: 'Trial',
			description:
				'Free Account - single line, maximum 10 machines, limited period. No aggregation.'
		});

		await knex?.('tenant_status_master')?.insert?.({
			name: 'standard',
			display_name: 'Standard',
			description:
				'Standard Account - unlimited lines and machines, paid. No aggregation.'
		});

		await knex?.('tenant_status_master')?.insert?.({
			name: 'enterprise',
			display_name: 'Enterprise',
			description:
				'Enterprise Account - all features enabled, including aggregation.'
		});
	};

const insertTenantUserStatusMasterData =
	async function insertTenantUserStatusMasterData(knex) {
		// Step 0: If the data is already in there, skip...
		const artifactCount = await knex?.raw?.(
			`SELECT count(id) AS masterdata_count FROM tenant_user_status_master`
		);
		if (Number?.(artifactCount?.rows?.[0]['masterdata_count'])) return;

		// Step 1: Insert the data...
		await knex?.('tenant_user_status_master')?.insert?.({
			name: 'waiting',
			display_name: 'Waiting',
			description: 'Connection approval pending'
		});

		await knex?.('tenant_user_status_master')?.insert?.({
			name: 'authorized',
			display_name: 'Authorized',
			description: 'Connection approved'
		});

		await knex?.('tenant_user_status_master')?.insert?.({
			name: 'disabled',
			display_name: 'Disabled',
			description: 'Connection removed'
		});
	};

exports.seed = async function (knex) {
	// Step 1: Insert master data into artifact types master
	await insertModuleTypesMasterData(knex);

	// Step 2: Insert master data into artifact availability modes master
	await insertModuleAvailabilityModeMasterData(knex);

	// Step 3: Insert master data into contact types master
	await insertContactTypeMasterData(knex);

	// Step 4: Insert master data into tenant status master
	await insertTenantStatusMasterData(knex);

	// Step 5: Insert master data into tenant user connection status master
	await insertTenantUserStatusMasterData(knex);
};
