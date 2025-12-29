'use strict';

exports.up = async function (knex) {
	let exists;

	// Step 1: Create the "tenants_users" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('tenants_users');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('tenants_users', function (tenantUserTable) {
				tenantUserTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));
				tenantUserTable
					?.uuid?.('tenant_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('tenants')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');
				tenantUserTable
					?.uuid?.('user_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('users')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				tenantUserTable
					?.uuid?.('tenant_user_status_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('tenant_user_status_master')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				tenantUserTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				tenantUserTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				tenantUserTable?.unique?.(['id', 'tenant_id']);
				tenantUserTable?.unique?.(['id', 'user_id']);
				tenantUserTable?.unique?.(['tenant_id', 'user_id']);
			});
	}

	// Step 2: Create the "tenants_users_roles" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('tenants_users_roles');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'tenants_users_roles',
				function (tenantUserRoleTable) {
					tenantUserRoleTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

					tenantUserRoleTable?.uuid?.('tenant_id')?.notNullable?.();

					tenantUserRoleTable
						?.uuid?.('tenant_user_id')
						?.notNullable?.();

					tenantUserRoleTable
						?.uuid?.('tenant_role_id')
						?.notNullable?.();

					tenantUserRoleTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex?.fn?.now?.());

					tenantUserRoleTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex?.fn?.now?.());

					tenantUserRoleTable?.unique?.(['id', 'tenant_id']);

					tenantUserRoleTable?.unique?.([
						'tenant_user_id',
						'tenant_role_id'
					]);

					tenantUserRoleTable
						?.foreign?.(['tenant_user_id', 'tenant_id'])
						?.references?.(['id', 'tenant_id'])
						?.inTable?.('tenants_users')
						?.onDelete?.('CASCADE')
						?.onUpdate?.('CASCADE');

					tenantUserRoleTable
						?.foreign?.(['tenant_role_id', 'tenant_id'])
						?.references?.(['id', 'tenant_id'])
						?.inTable?.('tenant_roles')
						?.onDelete?.('CASCADE')
						?.onUpdate?.('CASCADE');
				}
			);
	}

	// Step 3: Tenant User update trigger
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_check_tenant_user_upsert_is_valid ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	is_valid_feature	INTEGER;
BEGIN
	IF TG_OP = 'UPDATE'
	THEN
		IF OLD.tenant_id <> NEW.tenant_id
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE = 'Tenant is NOT mutable';
			RETURN NULL;
		END IF;

		IF OLD.user_id <> NEW.user_id
		THEN
			RAISE SQLSTATE '2F003' USING MESSAGE ='User is NOT mutable';
			RETURN NULL;
		END IF;
	END IF;

	RETURN NEW;
END;
$$;`);

	// Step 4: Default tenant user permissions trigger
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_assign_default_role_to_tenant_user ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
DECLARE
	default_tenant_role	UUID;
BEGIN
	default_tenant_role := NULL;

	SELECT
		id
	FROM
		tenant_roles
	WHERE
		tenant_id = NEW.tenant_id AND
		default_for_new_user = true
	INTO
		default_tenant_role;

	IF default_tenant_role IS NULL
	THEN
		RETURN NEW;
	END IF;

	INSERT INTO tenants_users_roles (
		tenant_id,
		tenant_user_id,
		tenant_role_id
	)
	VALUES (
		NEW.tenant_id,
		NEW.id,
		default_tenant_role
	);

	RETURN NEW;
END;
$$;`);

	// Step 5: tenant user role upsert trigger
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION public.fn_remove_role_from_tenant_user ()
	RETURNS trigger
	LANGUAGE plpgsql
	VOLATILE
	CALLED ON NULL INPUT
	SECURITY INVOKER
	COST 1
	AS $$
BEGIN
	DELETE FROM
		tenants_users_roles
	WHERE
		tenant_user_id = NEW.tenant_user_id AND
		tenant_role_id IN (SELECT id FROM fn_get_role_descendants(NEW.tenant_role_id) WHERE level >= 2);

	DELETE FROM
		tenants_users_roles
	WHERE
		tenant_user_id = NEW.tenant_user_id AND
		tenant_role_id IN (SELECT id FROM fn_get_role_ancestors(NEW.tenant_role_id) WHERE level >= 2);

	RETURN NEW;
END;
$$;`);

	// Finally, create the triggers...
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_check_tenant_user_upsert_is_valid BEFORE INSERT OR UPDATE ON public.tenants_users FOR EACH ROW EXECUTE PROCEDURE public.fn_check_tenant_user_upsert_is_valid();'
		);
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_assign_default_role_to_tenant_user AFTER INSERT ON public.tenants_users FOR EACH ROW EXECUTE PROCEDURE public.fn_assign_default_role_to_tenant_user();'
		);
	await knex?.schema
		?.withSchema?.('public')
		?.raw?.(
			'CREATE TRIGGER trigger_remove_role_from_tenant_user AFTER INSERT OR UPDATE ON public.tenants_users_roles FOR EACH ROW EXECUTE PROCEDURE public.fn_remove_role_from_tenant_user();'
		);
};

exports.down = async function (knex) {
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_remove_role_from_tenant_user ON public.tenants_users_roles CASCADE;'
	);
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_assign_default_role_to_tenant_user ON public.tenants_users CASCADE;'
	);
	await knex?.raw?.(
		'DROP TRIGGER IF EXISTS trigger_check_tenant_user_upsert_is_valid ON public.tenants_users CASCADE;'
	);

	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_remove_role_from_tenant_user () CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_check_tenant_user_upsert_is_valid () CASCADE;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.fn_assign_default_role_to_tenant_user () CASCADE;`
	);

	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.tenants_users_roles CASCADE;`
	);
	await knex?.raw?.(`DROP TABLE IF EXISTS public.tenants_users CASCADE;`);
};
