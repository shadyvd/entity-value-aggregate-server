'use strict';

exports.up = async function (knex) {
	let exists;

	// Step 1: Create the artifact type master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('artifact_type_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'artifact_type_master',
				(artifactTypeMasterTable) => {
					artifactTypeMasterTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

					artifactTypeMasterTable?.text?.('name')?.notNullable?.();
					artifactTypeMasterTable
						?.text?.('display_name')
						?.notNullable?.();
					artifactTypeMasterTable
						?.text?.('description')
						?.notNullable?.();

					artifactTypeMasterTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex?.fn?.now?.());
					artifactTypeMasterTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex?.fn?.now?.());
				}
			);
	}

	// Step 2: Create the artifact availability modes master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('artifact_availability_mode_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'artifact_availability_mode_master',
				function (artifactAvailabilityModeMasterTable) {
					artifactAvailabilityModeMasterTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

					artifactAvailabilityModeMasterTable
						?.text?.('name')
						?.notNullable?.();
					artifactAvailabilityModeMasterTable
						?.text?.('display_name')
						?.notNullable?.();
					artifactAvailabilityModeMasterTable
						?.text?.('description')
						?.notNullable?.();

					artifactAvailabilityModeMasterTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
					artifactAvailabilityModeMasterTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
				}
			);
	}

	// Step 3: Create the contact type master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('contact_type_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'contact_type_master',
				function (contactTypeMasterTable) {
					contactTypeMasterTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

					contactTypeMasterTable?.text?.('name')?.notNullable?.();
					contactTypeMasterTable
						?.text?.('display_name')
						?.notNullable?.();
					contactTypeMasterTable
						?.text?.('description')
						?.notNullable?.();

					contactTypeMasterTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
					contactTypeMasterTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
				}
			);
	}

	// Step 4: Create the tenant status master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('tenant_status_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'tenant_status_master',
				function (tenantStatusMasterTable) {
					tenantStatusMasterTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

					tenantStatusMasterTable?.text?.('name')?.notNullable?.();
					tenantStatusMasterTable
						?.text?.('display_name')
						?.notNullable?.();
					tenantStatusMasterTable
						?.text?.('description')
						?.notNullable?.();

					tenantStatusMasterTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
					tenantStatusMasterTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
				}
			);
	}

	// Step 5: Create the tenant user status master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('tenant_user_status_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'tenant_user_status_master',
				function (tenantUserStatusMasterTable) {
					tenantUserStatusMasterTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

					tenantUserStatusMasterTable
						?.text?.('name')
						?.notNullable?.();
					tenantUserStatusMasterTable
						?.text?.('display_name')
						?.notNullable?.();
					tenantUserStatusMasterTable
						?.text?.('description')
						?.notNullable?.();

					tenantUserStatusMasterTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
					tenantUserStatusMasterTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
				}
			);
	}
};

exports.down = async function (knex) {
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.tenant_user_status_master CASCADE;`
	);
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.tenant_status_master CASCADE;`
	);
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.contact_type_master CASCADE;`
	);
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.artifact_availability_mode_master CASCADE;`
	);
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.artifact_type_master CASCADE;`
	);
};
