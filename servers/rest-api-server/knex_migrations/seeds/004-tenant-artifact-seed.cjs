'use strict';

exports.seed = async function (knex) {
	// Step 0: If this seed has been run, simply return
	const tenantModuleCount = await knex?.raw?.(
		`SELECT count(id) AS tenant_artifact_count FROM tenants_artifacts`
	);
	if (Number?.(tenantModuleCount?.rows?.[0]?.['tenant_artifact_count']))
		return;

	// Add the Server itself to the admin tenant
	let rootTenantId = await knex?.raw?.(
		`SELECT id FROM tenants WHERE sub_domain = 'admin'`
	);
	rootTenantId = rootTenantId?.rows?.[0]?.['id'];

	let webserverModuleId = await knex?.raw?.(
		`SELECT id FROM artifacts WHERE parent_id IS NULL`
	);
	webserverModuleId = webserverModuleId?.rows?.[0]?.['id'];

	await knex?.raw?.(
		`INSERT INTO tenants_artifacts (tenant_id, artifact_id) VALUES ('${rootTenantId}', '${webserverModuleId}')`
	);
};
