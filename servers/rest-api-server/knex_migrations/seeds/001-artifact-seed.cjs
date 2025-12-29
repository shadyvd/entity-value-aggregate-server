'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const artifactCount = await knex?.raw?.(
		`SELECT count(id) AS artifact_count FROM artifacts`
	);
	if (Number?.(artifactCount?.rows?.[0]['artifact_count'])) return;

	// Step 1: Get the master data ids
	let serverModuleId = await knex?.raw?.(
		`SELECT id FROM artifact_type_master WHERE name = 'server'`
	);
	serverModuleId = serverModuleId?.rows?.[0]?.['id'];

	let serverAvailabilityId = await knex?.raw?.(
		`SELECT id FROM artifact_availability_mode_master WHERE name = 'default'`
	);
	serverAvailabilityId = serverAvailabilityId?.rows?.[0]?.['id'];

	// Step 2: Insert the list of servers and domains
	let serverId = await knex?.('artifacts')
		?.insert?.({
			name: 'rest-api-server',
			display_name: 'The REST API Server',
			description: 'The REST API Server that hosts all the Twyr products',
			artifact_type_id: serverModuleId,
			artifact_availability_mode_id: serverAvailabilityId
		})
		?.returning?.('id');
	serverId = serverId?.[0]?.['id'];

	// Step 3: Insert the list of permissions
	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: serverId,
		name: 'public',
		display_name: 'Public',
		description: 'Public / Non-logged-in permissions'
	});

	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: serverId,
		name: 'registered',
		display_name: 'Registered',
		description: 'Basic Logged-in user permissions',
		implies_permissions: '["public"]'
	});

	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: serverId,
		name: 'administrator',
		display_name: 'Administrator',
		description: 'Administrator Privileges',
		implies_permissions: '["registered"]'
	});
};
