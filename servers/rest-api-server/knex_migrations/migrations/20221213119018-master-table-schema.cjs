'use strict';

exports.up = async function (knex) {
	let exists;

	// Step 1: Create the contact type master table
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

	// Step 2: Create the genders master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('gender_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('gender_master', function (genderMasterTable) {
				genderMasterTable
					?.uuid?.('id')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

				genderMasterTable?.text?.('name')?.notNullable?.();
				genderMasterTable?.text?.('display_name')?.notNullable?.();
				genderMasterTable?.text?.('description')?.notNullable?.();

				genderMasterTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex.fn.now());
				genderMasterTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex.fn.now());
			});
	}

	// Step 3: Create the connection status master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('connection_status_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'connection_status_master',
				function (connectionStatusMasterTable) {
					connectionStatusMasterTable
						?.uuid?.('id')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.(knex?.raw?.('gen_random_uuid()'));

					connectionStatusMasterTable
						?.text?.('name')
						?.notNullable?.();
					connectionStatusMasterTable
						?.text?.('display_name')
						?.notNullable?.();
					connectionStatusMasterTable
						?.text?.('description')
						?.notNullable?.();

					connectionStatusMasterTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
					connectionStatusMasterTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
				}
			);
	}

	// Step 4: Create the country code master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('country_code_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'country_code_master',
				function (countryCodeMasterTable) {
					countryCodeMasterTable
						?.text?.('iso_code')
						?.notNullable?.()
						?.primary?.()
						?.defaultTo?.('IND')
						?.comment?.(
							`The 3-letter alphabetic code used by the International Standards Organization for each country`
						);

					countryCodeMasterTable
						?.text?.('unsd_code')
						?.notNullable?.()
						?.defaultTo?.('356')
						?.comment?.(
							`The 3-digit numeric code used by the United Nations Statistics Division for each country`
						);

					countryCodeMasterTable
						?.text?.('country_name')
						?.notNullable?.()
						?.defaultTo?.('India');
					countryCodeMasterTable
						?.boolean?.('is_enabled')
						?.notNullable?.()
						?.defaultTo?.(false);

					countryCodeMasterTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
					countryCodeMasterTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
				}
			);
	}

	// Step 5: Create the locales master table
	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('locale_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.('locale_master', function (localesMasterTable) {
				localesMasterTable
					?.text?.('code')
					?.notNullable?.()
					?.primary?.()
					?.defaultTo?.('en-US');
				localesMasterTable?.text?.('language_code')?.notNullable?.();
				localesMasterTable?.text?.('language_name')?.notNullable?.();
				localesMasterTable
					?.text?.('country_code')
					?.notNullable?.()
					?.references?.('iso_code')
					?.inTable?.('country_code_master')
					?.onDelete?.('CASCADE')
					?.onUpdate?.('CASCADE');
				localesMasterTable?.text?.('country_name')?.notNullable?.();
				localesMasterTable?.text?.('is_rtl')?.notNullable?.();
				localesMasterTable
					?.boolean?.('is_enabled')
					?.notNullable?.()
					?.defaultTo?.(false);

				localesMasterTable
					?.timestamp?.('created_at')
					?.notNullable?.()
					?.defaultTo?.(knex.fn.now());
				localesMasterTable
					?.timestamp?.('updated_at')
					?.notNullable?.()
					?.defaultTo?.(knex.fn.now());
			});
	}

	exists = await knex?.schema
		?.withSchema?.('public')
		?.hasTable?.('locale_fallback_master');
	if (!exists) {
		await knex?.schema
			?.withSchema?.('public')
			?.createTable?.(
				'locale_fallback_master',
				function (localesFallbackMasterTable) {
					localesFallbackMasterTable
						?.text?.('locale_code')
						?.notNullable?.()
						?.defaultTo?.('en-US')
						?.references?.('code')
						?.inTable?.('locale_master')
						?.onDelete?.('CASCADE')
						?.onUpdate?.('CASCADE');

					localesFallbackMasterTable
						?.text?.('fallback_locale_code')
						?.notNullable?.()
						?.defaultTo?.('en-US')
						?.references?.('code')
						?.inTable?.('locale_master')
						?.onDelete?.('CASCADE')
						?.onUpdate?.('CASCADE');

					localesFallbackMasterTable
						?.integer?.('priority')
						?.notNullable?.();

					localesFallbackMasterTable
						?.timestamp?.('created_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());
					localesFallbackMasterTable
						?.timestamp?.('updated_at')
						?.notNullable?.()
						?.defaultTo?.(knex.fn.now());

					localesFallbackMasterTable?.primary?.([
						'locale_code',
						'priority'
					]);
				}
			);
	}
};

exports.down = async function (knex) {
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.locale_fallback_master CASCADE;`
	);
	await knex?.raw?.(`DROP TABLE IF EXISTS public.locale_master CASCADE;`);
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.country_code_master CASCADE;`
	);
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.connection_status_master CASCADE;`
	);
	await knex?.raw?.(`DROP TABLE IF EXISTS public.gender_master CASCADE;`);
	await knex?.raw?.(
		`DROP TABLE IF EXISTS public.contact_type_master CASCADE;`
	);
};
