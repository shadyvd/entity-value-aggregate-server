'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const tenantUserCount = await knex?.raw?.(
		`SELECT count(id) AS tenant_user_count FROM tenants_users`
	);
	if (Number?.(tenantUserCount?.rows?.[0]?.['tenant_user_count'])) return;

	// Step 1: Insert root user as a user of the root tenant
	let rootTenantId = await knex?.raw?.(
		`SELECT id FROM tenants WHERE sub_domain = 'www'`
	);
	rootTenantId = rootTenantId?.rows?.[0]?.['id'];

	let rootUserId = await knex?.raw?.(
		`SELECT id FROM users WHERE email = 'admin@portal.com'`
	);
	rootUserId = rootUserId?.rows?.[0]?.['id'];

	let authStatusId = await knex?.raw?.(
		`SELECT id FROM tenant_user_status_master WHERE name = 'authorized'`
	);
	authStatusId = authStatusId?.rows?.[0]?.['id'];

	let tenantUserId = await knex?.('tenants_users')
		?.insert?.({
			tenant_id: rootTenantId,
			user_id: rootUserId,
			tenant_user_status_id: authStatusId
		})
		?.returning?.('id');

	tenantUserId = tenantUserId?.[0]?.['id'];

	// Step 2: Get the id of the tenant's root role
	let rootTenantRoleId = await knex?.raw?.(
		`SELECT id FROM tenant_roles WHERE parent_id IS NULL`
	);

	rootTenantRoleId = rootTenantRoleId?.rows?.[0]?.['id'];

	// Step 3: Promote root user as admin for the root tenant
	await knex?.raw?.(
		`UPDATE tenants_users_roles SET tenant_role_id = ? WHERE tenant_user_id = ?`,
		[rootTenantRoleId, tenantUserId]
	);
};
