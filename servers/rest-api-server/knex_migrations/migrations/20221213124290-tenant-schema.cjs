'use strict';

exports.up = async function (knex) {
	let exists;

	// Step 1: Create the basic "tenants" table
	exists = await knex?.schema?.withSchema?.('public')?.hasTable?.('tenants');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('tenants', function (tenantTable) {
				tenantTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

				tenantTable?.text?.('name')?.notNullable?.();
				tenantTable?.text?.('sub_domain')?.notNullable?.();
				tenantTable
					?.uuid?.('owner_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('users')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				tenantTable
					?.uuid?.('status')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('tenant_status_master')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				tenantTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				tenantTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				tenantTable?.unique?.(['sub_domain']);
			});
	}

	// Step 2: Create the "tenant_roles" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('tenant_roles');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('tenant_roles', function (tenantRolesTable) {
				tenantRolesTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));
				tenantRolesTable
					?.uuid?.('tenant_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('tenants')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				tenantRolesTable?.uuid?.('parent_id');

				tenantRolesTable?.text?.('name')?.notNullable?.();
				tenantRolesTable?.text?.('display_name')?.notNullable?.();
				tenantRolesTable?.text?.('description')?.notNullable?.();

				tenantRolesTable
					?.boolean?.('default_for_new_user')
					?.notNullable?.()
					?.defaultTo?.(false);

				tenantRolesTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				tenantRolesTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				tenantRolesTable?.unique?.(['id', 'tenant_id']);
				tenantRolesTable?.unique?.(['parent_id', 'name']);

				tenantRolesTable
					?.foreign?.(['parent_id', 'tenant_id'])
					?.references?.(['id', 'tenant_id'])
					?.inTable?.('tenant_roles')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');
			});
	}

	// Step 3: Tree traversal functions for the tenant_roles table
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_get_role_ancestors (IN roleid uuid)
	RETURNS TABLE (level integer, id uuid, parent_id uuid, name text)
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
BEGIN
	RETURN QUERY
	WITH RECURSIVE q AS (
		SELECT
			1 AS level,
			A.id,
			A.parent_id,
			A.name
		FROM
			tenant_roles A
		WHERE
			A.id = roleid
		UNION ALL
		SELECT
			q.level + 1,
			B.id,
			B.parent_id,
			B.name
		FROM
			q,
			tenant_roles B
		WHERE
			B.id = q.parent_id
	)
	SELECT DISTINCT
		q.level,
		q.id,
		q.parent_id,
		q.name
	FROM
		q
	ORDER BY
		q.level;
END;
$$;`);

	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_get_role_descendants (IN roleid uuid)
	RETURNS TABLE (level integer, id uuid, parent_id uuid, name text)
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
BEGIN
	RETURN QUERY
	WITH RECURSIVE q AS (
		SELECT
			1 AS level,
			A.id,
			A.parent_id,
			A.name
		FROM
			tenant_roles A
		WHERE
			A.id = roleid
		UNION ALL
		SELECT
			q.level + 1,
			B.id,
			B.parent_id,
			B.name
		FROM
			q,
			tenant_roles B
		WHERE
			B.parent_id = q.id
	)
	SELECT DISTINCT
		q.level,
		q.id,
		q.parent_id,
		q.name
	FROM
		q
	ORDER BY
		q.level;
END;
$$;`);

	// Step 4: Tenant Creation trigger for sane defaults
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_assign_defaults_to_tenant ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	admin_role_id		UUID;
	user_role_id		UUID;
	primary_tenant_id	UUID;
BEGIN
	admin_role_id := NULL;

	INSERT INTO tenant_roles (
		tenant_id,
		name,
		display_name,
		description
	)
	VALUES (
		NEW.id,
		'administrators',
		NEW.name || ' Administrators',
		'The Administrator Role for ' || NEW.name
	)
	RETURNING
		id
	INTO
		admin_role_id;

	INSERT INTO tenant_roles (
		tenant_id,
		parent_id,
		name,
		display_name,
		description,
		default_for_new_user
	)
	VALUES (
		NEW.id,
		admin_role_id,
		'users',
		NEW.name || ' Users',
		'Default Role for ' || NEW.name,
		true
	);

	RETURN NEW;
END;
$$;`);

	// Step 5: Role creation trigger for sanity
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_check_role_update_is_valid ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$

BEGIN
	IF OLD.parent_id <> NEW.parent_id
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'Role cannot change parent';
		RETURN NULL;
	END IF;

	IF OLD.default_for_new_user = false AND NEW.default_for_new_user = true
	THEN
		UPDATE
			tenant_roles
		SET
			default_for_new_user = false
		WHERE
			tenant_id = NEW.tenant_id AND
			id <> NEW.id AND
			default_for_new_user = true;
	END IF;

	RETURN NEW;
END;
$$;`);

	// Finally, create the triggers...
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_assign_defaults_to_tenant AFTER INSERT ON public.tenants FOR EACH ROW EXECUTE PROCEDURE public.fn_assign_defaults_to_tenant();'
		);
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_check_role_update_is_valid BEFORE UPDATE ON public.tenant_roles FOR EACH ROW EXECUTE PROCEDURE public.fn_check_role_update_is_valid();'
		);
};

exports.down = async function (knex) {
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_check_role_update_is_valid ON public.tenant_roles CASCADE;'
	);
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_assign_defaults_to_tenant ON public.tenants CASCADE;'
	);

	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_check_role_update_is_valid () CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_assign_defaults_to_tenant () CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_get_role_descendants (IN uuid) CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_get_role_ancestors (IN uuid) CASCADE;`
	);

	await knex?.raw?.(`DROP TABLE IF EXISTS public.tenant_roles CASCADE;`);
	await knex?.raw?.(`DROP TABLE IF EXISTS public.tenants CASCADE;`);
};
