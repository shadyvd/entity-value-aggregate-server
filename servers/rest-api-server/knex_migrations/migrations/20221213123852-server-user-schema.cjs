'use strict';

exports.up = async function (knex) {
	let exists;

	// Step 1: Create the basic "server_users" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('server_users');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('server_users', function (serverUserTable) {
				serverUserTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

				serverUserTable?.text?.('mobile_no')?.notNullable?.();

				serverUserTable?.text?.('first_name')?.notNullable?.();
				serverUserTable?.text?.('middle_names');
				serverUserTable?.text?.('last_name')?.notNullable?.();
				serverUserTable?.text?.('nickname');

				serverUserTable?.date?.('date_of_birth')?.notNullable?.();
				serverUserTable
					?.uuid?.('gender_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('gender_master')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				serverUserTable
					?.boolean?.('is_active')
					?.notNullable?.()
					?.defaultTo?.(true);
				serverUserTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				serverUserTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				serverUserTable?.unique?.(['mobile_no']);
			});
	}

	// Step 2: Create the "server_user_contacts" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('server_user_contacts');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('server_user_contacts', function (contactsTable) {
				contactsTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));
				contactsTable
					?.uuid?.('server_user_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('server_users')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				contactsTable
					?.uuid?.('contact_type_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('contact_type_master')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');
				contactsTable?.text?.('contact')?.notNullable?.();
				contactsTable
					?.boolean?.('verified')
					?.notNullable?.()
					?.defaultTo?.(false);
				contactsTable
					?.boolean?.('is_primary')
					?.notNullable?.()
					?.defaultTo?.(false);

				contactsTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				contactsTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				contactsTable?.unique?.([
					'server_user_id',
					'contact_type_id',
					'contact'
				]);
			});
	}

	// Step 3: Create the "server_user_locales" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('server_user_locales');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('server_user_locales', function (localesTable) {
				localesTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));
				localesTable
					?.uuid?.('server_user_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('server_users')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				localesTable
					?.text?.('locale_code')
					?.notNullable?.()
					?.references?.('code')
					?.inTable?.('locale_master')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');

				localesTable
					?.boolean?.('is_primary')
					?.notNullable?.()
					?.defaultTo?.(false);

				localesTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex.fn.now());
				localesTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex.fn.now());

				localesTable?.unique?.(['id', 'server_user_id']);
			});
	}

	// Step 4: Create the server_user_contacts triggers
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION switch_server_user_primary_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
	does_primary_exist	INTEGER;
BEGIN
	-- This is basically the switch primary contact case
	IF NEW.is_primary = true
	THEN
		UPDATE
			public.server_user_contacts
		SET
			is_primary = false
		WHERE
			server_user_id = NEW.server_user_id AND
			id <> NEW.id;
	END IF;

	-- If there are no primaries, raise exception
	does_primary_exist := 0;
	SELECT
		COUNT(id)
	FROM
		server_user_contacts
	WHERE
		server_user_id = NEW.server_user_id AND
		is_primary = true
	INTO
		does_primary_exist;

	IF does_primary_exist <= 0
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'No primary contact detected';
		RETURN NULL;
	END IF;

	RETURN NEW;
END;
$$;
	`);

	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE TRIGGER
	trigger_switch_server_user_primary_contact
AFTER
	INSERT OR UPDATE
ON
	public.server_user_contacts
FOR EACH ROW
EXECUTE FUNCTION public.switch_server_user_primary_contact();
	`);

	// Step 5: Create the server_user_locales triggers
	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE OR REPLACE FUNCTION switch_server_user_primary_locale()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
	does_primary_exist	INTEGER;
BEGIN
	-- This is basically the switch primary locale case
	IF NEW.is_primary = true
	THEN
		UPDATE
			public.server_user_locales
		SET
			is_primary = false
		WHERE
			server_user_id = NEW.server_user_id AND
			id <> NEW.id;
	END IF;

	-- If there are no primaries, raise exception
	does_primary_exist := 0;
	SELECT
		COUNT(id)
	FROM
		server_user_locales
	WHERE
		server_user_id = NEW.server_user_id AND
		is_primary = true
	INTO
		does_primary_exist;

	IF does_primary_exist <= 0
	THEN
		RAISE SQLSTATE '2F003' USING MESSAGE = 'No primary locale detected';
		RETURN NULL;
	END IF;

	RETURN NEW;
END;
$$;
	`);

	await knex?.schema?.withSchema?.('public')?.raw?.(`
CREATE TRIGGER
	trigger_switch_server_user_primary_locale
AFTER
	INSERT OR UPDATE
ON
	public.server_user_locales
FOR EACH ROW
EXECUTE FUNCTION public.switch_server_user_primary_locale();
	`);
};

exports.down = async function (knex) {
	await knex?.raw?.(
		`DROP TRIGGER IF EXISTS trigger_switch_server_user_primary_locale ON public.server_user_locales CASCADE;;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.switch_server_user_primary_locale() CASCADE;`
	);

	await knex?.raw?.(
		`DROP TRIGGER IF EXISTS trigger_switch_server_user_primary_contact ON public.server_user_contacts CASCADE;;`
	);
	await knex?.raw?.(
		`DROP FUNCTION IF EXISTS public.switch_server_user_primary_contact() CASCADE;`
	);

	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.server_user_locales CASCADE;`
	);
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.server_user_contacts CASCADE;`
	);
	await knex?.raw?.(`DROP TABLE IF EXISTS public.server_users CASCADE;`);
};
