'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const artifactCount = await knex?.raw?.(
		`SELECT count(id) AS artifact_count FROM artifacts WHERE name = 'admin-domain'`
	);
	if (Number?.(artifactCount?.rows?.[0]['artifact_count'])) return;

	// Step 1: Get the master data ids
	let domainModuleId = await knex?.raw?.(
		`SELECT id FROM artifact_type_master WHERE name = 'domain'`
	);
	domainModuleId = domainModuleId?.rows?.[0]?.['id'];

	let domainAvailabilityId = await knex?.raw?.(
		`SELECT id FROM artifact_availability_mode_master WHERE name = 'admin'`
	);
	domainAvailabilityId = domainAvailabilityId?.rows?.[0]?.['id'];

	// Step 2: Insert the list of servers and domains
	let domainId = await knex?.('artifacts')
		?.insert?.({
			name: 'admin-domain',
			display_name: 'The Administrator Domain',
			description:
				'The Domain containing the functionality to add new tenants, etc',
			artifact_type_id: domainModuleId,
			artifact_availability_mode_id: domainAvailabilityId
		})
		?.returning?.('id');
	domainId = domainId?.[0]?.['id'];

	// Step 3: Insert the list of permissions - tenant basics
	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: domainId,
		name: 'admin-tenant-basics-read',
		display_name: 'Admin Tenant Basics Read',
		description:
			'Read-only permissions for the Admin Domain, Tenant Module, Basics',
		implies_permissions: '["registered"]'
	});

	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: domainId,
		name: 'admin-tenant-basics-create',
		display_name: 'Admin Tenant Basics Create',
		description:
			'Create permissions for the Admin Domain, Tenant Module, Basics',
		implies_permissions: '["admin-tenant-basics-read"]'
	});

	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: domainId,
		name: 'admin-tenant-basics-update',
		display_name: 'Admin Tenant Basics Update',
		description:
			'Update permissions for the Admin Domain, Tenant Module, Basics',
		implies_permissions: '["admin-tenant-basics-read"]'
	});

	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: domainId,
		name: 'admin-tenant-basics-delete',
		display_name: 'Admin Tenant Basics Delete',
		description:
			'Delete permissions for the Admin Domain, Tenant Module, Basics',
		implies_permissions: '["admin-tenant-basics-read"]'
	});

	// Step 4: Insert the list of permissions - tenant roles
	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: domainId,
		name: 'admin-tenant-role-read',
		display_name: 'Admin Tenant Role Read',
		description:
			'Read-only permissions for the Admin Domain, Tenant Module, Role',
		implies_permissions: '["registered"]'
	});

	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: domainId,
		name: 'admin-tenant-role-create',
		display_name: 'Admin Tenant Role Create',
		description:
			'Create permissions for the Admin Domain, Tenant Module, Role',
		implies_permissions: '["admin-tenant-role-read"]'
	});

	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: domainId,
		name: 'admin-tenant-role-update',
		display_name: 'Admin Tenant Role Update',
		description:
			'Update permissions for the Admin Domain, Tenant Module, Role',
		implies_permissions: '["admin-tenant-role-read"]'
	});

	await knex?.('artifact_permissions')?.insert?.({
		artifact_id: domainId,
		name: 'admin-tenant-role-delete',
		display_name: 'Admin Tenant Role Delete',
		description:
			'Delete permissions for the Admin Domain, Tenant Module, Role',
		implies_permissions: '["admin-tenant-role-read"]'
	});
};
