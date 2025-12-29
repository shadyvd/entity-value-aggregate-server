'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const tenantCount = await knex?.raw?.(
		`SELECT count(id) AS tenant_count FROM tenants`
	);
	if (Number?.(tenantCount?.rows?.[0]?.['tenant_count'])) return;

	// Step 1: Insert the root tenant (Portal Administrator)
	let tenantStatusId = await knex?.raw?.(
		`SELECT id FROM tenant_status_master WHERE name = 'trial'`
	);

	tenantStatusId = tenantStatusId?.rows?.[0]?.['id'];

	let userId = await knex?.raw?.(
		`SELECT id FROM users WHERE email = 'admin@portal.com'`
	);

	userId = userId?.rows?.[0]?.['id'];

	await knex?.('tenants')?.insert?.({
		name: 'Portal Administrator',
		sub_domain: 'www',
		owner_id: userId,
		status: tenantStatusId
	});
};
