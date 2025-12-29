'use strict';

exports.up = async function (knex) {
	let exists;

	// Step 1: Create the basic "users" table
	exists = await knex?.schema?.withSchema?.('public')?.hasTable?.('users');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('users', function (userTable) {
				userTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

				userTable?.text?.('email')?.notNullable?.();
				userTable?.text?.('password')?.notNullable?.();

				userTable?.text?.('first_name')?.notNullable?.();
				userTable?.text?.('middle_names');
				userTable?.text?.('last_name')?.notNullable?.();
				userTable?.text?.('nickname');

				userTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				userTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				userTable?.unique?.(['email']);
			});
	}

	// Step 2: Create the "user_contacts" table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('user_contacts');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('user_contacts', function (contactsTable) {
				contactsTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));
				contactsTable
					?.uuid?.('user_id')
					?.notNullable?.()
					?.references?.('id')
					?.inTable?.('users')
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
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());
				contactsTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex?.fn?.now?.());

				contactsTable?.unique?.(['id', 'user_id']);
				contactsTable?.unique?.([
					'user_id',
					'contact_type_id',
					'contact'
				]);
			});
	}
};

exports.down = async function (knex) {
	await knex?.raw?.(`DROP TABLE IF EXISTS public.user_contacts CASCADE;`);
	await knex?.raw?.(`DROP TABLE IF EXISTS public.users CASCADE;`);
};
