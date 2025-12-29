'use strict';

exports.up = async function (knex) {
	let exists;

	// Step 1: Create the "tenants_artifacts" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('tenants_artifacts');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('tenants_artifacts', function (tenantModuleTable) {
				tenantModuleTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

				tenantModuleTable
					?.uuid?.('tenant_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('tenants')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				tenantModuleTable
					?.uuid?.('artifact_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('artifacts')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				tenantModuleTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				tenantModuleTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				tenantModuleTable?.unique?.(['id', 'tenant_id']);
				tenantModuleTable?.unique?.(['tenant_id', 'artifact_id']);
			});
	}

	// Step 2: Create the "tenant_role_permissions" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('tenant_role_permissions');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'tenant_role_permissions',
				function (tenantRolePermissionTable) {
					tenantRolePermissionTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

					tenantRolePermissionTable
						?.uuid?.('tenant_id')
						?.notNullable?.();
					tenantRolePermissionTable
						?.uuid?.('tenant_role_id')
						?.notNullable?.();

					tenantRolePermissionTable
						?.uuid?.('artifact_id')
						?.notNullable?.();
					tenantRolePermissionTable
						?.uuid?.('artifact_permission_id')
						?.notNullable?.();

					tenantRolePermissionTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex?.fn?.now?.());
					tenantRolePermissionTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex?.fn?.now?.());

					tenantRolePermissionTable
						?.foreign?.(['tenant_id', 'artifact_id'])
						?.references?.(['tenant_id', 'artifact_id'])
						?.inTable?.('tenants_artifacts')
						?.onDelete?.('CASCADE')
						?.onUpdate?.('CASCADE');

					tenantRolePermissionTable
						?.foreign?.(['artifact_permission_id', 'artifact_id'])
						?.references?.(['id', 'artifact_id'])
						?.inTable?.('artifact_permissions')
						?.onDelete?.('CASCADE')
						?.onUpdate?.('CASCADE');

					tenantRolePermissionTable
						?.foreign?.(['tenant_role_id', 'tenant_id'])
						?.references?.(['id', 'tenant_id'])
						?.inTable?.('tenant_roles')
						?.onDelete?.('CASCADE')
						?.onUpdate?.('CASCADE');

					tenantRolePermissionTable?.unique?.(['id', 'tenant_id']);

					tenantRolePermissionTable?.unique?.([
						'tenant_role_id',
						'artifact_permission_id'
					]);
				}
			);
	}

	// Step 3: Check only Servers, and Domains are added to tenant_artifacts
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_check_tenant_artifact_upsert_is_valid ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	is_mappable_artifact	INTEGER;
	artifact_parent		UUID;
	is_admin_only		INTEGER;
	tenant_sub_domain	TEXT;
BEGIN
	/* Rule #1: Module should be mappable - Server or Domain */
	is_mappable_artifact := 0;
	SELECT
		count(id)
	FROM
		artifacts
	WHERE
		id = NEW.artifact_id AND
		artifact_type_id IN (SELECT id FROM artifact_type_master WHERE name = 'domain' OR name = 'server')
	INTO
		is_mappable_artifact;

	IF is_mappable_artifact <= 0
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Only Servers, or Domains, can be mapped to tenants';
		RETURN NULL;
	END IF;

	/* Rule #2: Parent Module must already be mapped */
	artifact_parent := NULL;
	SELECT
		parent_id
	FROM
		artifacts
	WHERE
		id = NEW.artifact_id
	INTO
		artifact_parent;

	IF artifact_parent IS NULL
	THEN
		RETURN NEW;
	END IF;

	is_mappable_artifact := 0;
	SELECT
		count(id)
	FROM
		tenants_artifacts
	WHERE
		tenant_id = NEW.tenant_id AND
		artifact_id = artifact_parent
	INTO
		is_mappable_artifact;

	IF is_mappable_artifact = 0
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Parent artifact not mapped to this Tenant';
	END IF;

	/* Rule #3: Admin Modules can be mapped only to the root tenant */
	is_admin_only := 0;
	SELECT
		COUNT(artifact_availability_mode_id)
	FROM
		artifacts
	WHERE
		id IN (SELECT id FROM fn_get_artifact_ancestors(NEW.artifact_id)) AND
		artifact_type_id <> (SELECT id FROM artifact_type_master WHERE name = 'server') AND
		artifact_availability_mode_id = (SELECT id FROM artifact_availability_mode_master WHERE name = 'admin')
	INTO
		is_admin_only;

	IF is_admin_only = 0
	THEN
		RETURN NEW;
	END IF;

	tenant_sub_domain := '';
	SELECT
		sub_domain
	FROM
		tenants
	WHERE
		id = NEW.tenant_id
	INTO
		tenant_sub_domain;

	IF tenant_sub_domain <> 'admin'
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Admin only artifacts can be mapped only to the admin panel';
		RETURN NULL;
	END IF;

	RETURN NEW;
END;
$$;`);

	// Step 4: Assign all artifact permissions to tenant admin role when it is added to a tenant
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_assign_servers_to_new_tenant ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
BEGIN
	INSERT INTO
		tenants_artifacts (tenant_id, artifact_id)
	SELECT
		NEW.id,
		id
	FROM
		artifacts
	WHERE
		parent_id IS NULL;

	RETURN NEW;
END;
$$;`);

	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_assign_artifact_permissions_to_new_tenant ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	admin_role_id	UUID;
BEGIN
	admin_role_id := NULL;
	SELECT
		id
	FROM
		tenant_roles
	WHERE
		tenant_id = NEW.tenant_id AND
		parent_id IS NULL
	INTO
		admin_role_id;

	INSERT INTO
		tenant_role_permissions (
			tenant_id,
			tenant_role_id,
			artifact_id,
			artifact_permission_id
		)
	SELECT
		NEW.tenant_id,
		admin_role_id,
		NEW.artifact_id,
		id
	FROM
		artifact_permissions
	WHERE
		artifact_id = NEW.artifact_id;

	RETURN NEW;
END;
$$;`);

	// Step 5: Remove descendant artifacts when the parent is removed from the tenant
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_remove_descendant_artifact_from_tenant ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
BEGIN
	DELETE FROM
		tenants_artifacts
	WHERE
		tenant_id = OLD.tenant_id AND
		artifact_id IN (SELECT id FROM fn_get_artifact_descendants(OLD.artifact_id) WHERE level = 2);

	RETURN OLD;
END;
$$;`);

	// Step 6: Remove permission from descendant roles when it is removed from a parent role
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_remove_role_permission_from_descendants ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
BEGIN
	DELETE FROM
		tenant_role_permissions
	WHERE
		tenant_role_id IN (SELECT id FROM fn_get_role_descendants(OLD.tenant_role_id) WHERE level = 2) AND
		artifact_permission_id = OLD.artifact_permission_id;

	RETURN OLD;
END;
$$;`);

	// Step 6: Check parent role has permission when adding to a descendant role
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_check_role_permission_upsert_is_valid ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	parent_role_id						UUID;
	does_parent_role_have_permission	INTEGER;
BEGIN
	parent_role_id := NULL;
	SELECT
		parent_id
	FROM
		tenant_roles
	WHERE
		id = NEW.tenant_role_id AND
		tenant_id = NEW.tenant_id
	INTO
		parent_role_id;

	IF parent_role_id IS NULL
	THEN
		RETURN NEW;
	END IF;

	does_parent_role_have_permission := 0;
	SELECT
		COUNT(tenant_role_id)
	FROM
		tenant_role_permissions
	WHERE
		tenant_role_id = parent_role_id AND
		artifact_permission_id = NEW.artifact_permission_id
	INTO
		does_parent_role_have_permission;

	IF does_parent_role_have_permission > 0
	THEN
		RETURN NEW;
	END IF;

	RAISE SQLSTATE '2F003' USING MESSAGE = 'Parent Role does not have this permission';
	RETURN NULL;
END;
$$;`);

	// Finally, create the triggers
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_check_tenant_artifact_upsert_is_valid BEFORE INSERT OR UPDATE ON public.tenants_artifacts FOR EACH ROW EXECUTE PROCEDURE public.fn_check_tenant_artifact_upsert_is_valid();'
		);

	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_assign_servers_to_new_tenant AFTER INSERT ON public.tenants FOR EACH ROW EXECUTE PROCEDURE public.fn_assign_servers_to_new_tenant();'
		);

	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_assign_artifact_permissions_to_new_tenant AFTER INSERT ON public.tenants_artifacts FOR EACH ROW EXECUTE PROCEDURE public.fn_assign_artifact_permissions_to_new_tenant();'
		);

	await knex.schema
		.withSchema('public')
		.raw(
			'CREATE TRIGGER trigger_remove_descendant_artifact_from_tenant AFTER DELETE ON public.tenants_artifacts FOR EACH ROW EXECUTE PROCEDURE public.fn_remove_descendant_artifact_from_tenant();'
		);

	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_remove_role_permission_from_descendants AFTER DELETE ON public.tenant_role_permissions FOR EACH ROW EXECUTE PROCEDURE public.fn_remove_role_permission_from_descendants();'
		);
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_check_role_permission_upsert_is_valid BEFORE INSERT OR UPDATE ON public.tenant_role_permissions FOR EACH ROW EXECUTE PROCEDURE public.fn_check_role_permission_upsert_is_valid();'
		);
};

exports.down = async function (knex) {
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_check_role_permission_upsert_is_valid ON public.tenant_role_permissions CASCADE;'
	);
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_remove_role_permission_from_descendants ON public.tenant_role_permissions CASCADE;'
	);
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_remove_descendant_artifact_from_tenant ON public.tenants_artifacts CASCADE;'
	);
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_assign_servers_to_new_tenant ON public.tenants CASCADE;'
	);
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_assign_artifact_permissions_to_new_tenant ON public.tenants_artifacts CASCADE;'
	);
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_check_tenant_artifact_upsert_is_valid ON public.tenants_artifacts CASCADE;'
	);

	await knex?.raw?.(
		'DROP FUNCTION IF EXISTS public.fn_check_role_permission_upsert_is_valid () CASCADE;'
	);
	await knex?.raw?.(
		'DROP FUNCTION IF EXISTS public.fn_remove_role_permission_from_descendants () CASCADE;'
	);
	await knex?.raw?.(
		'DROP FUNCTION IF EXISTS public.fn_remove_descendant_artifact_from_tenant () CASCADE;'
	);
	await knex?.raw?.(
		'DROP FUNCTION IF EXISTS public.fn_assign_servers_to_new_tenant () CASCADE;'
	);
	await knex?.raw?.(
		'DROP FUNCTION IF EXISTS public.fn_assign_artifact_permissions_to_new_tenant () CASCADE;'
	);
	await knex.raw(
		'DROP FUNCTION IF EXISTS public.fn_check_tenant_artifact_upsert_is_valid () CASCADE;'
	);

	await knex?.raw?.(
		'DROP TABLE IF EXISTS public.tenant_role_permissions CASCADE;'
	);
	await knex?.raw?.('DROP TABLE IF EXISTS public.tenants_artifacts CASCADE;');
};
