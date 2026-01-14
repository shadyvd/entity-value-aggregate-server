/**
 * Generate locale fallback chains using CLDR rules
 */

exports.seed = async function (knex) {
	const locales = await knex('locale_master').select('code');
	const localeSet = new Set(locales.map((l) => l.code));

	const rows = [];

	for (const code of localeSet) {
		let priority = 1;

		/**
		 * Step 1: language-REGION → language-LANGUAGE
		 * Example: fr-CA → fr-FR, or en-US
		 */
		const doesMainLanguageExist = await knex?.raw?.(
			`SELECT code FROM locale_master WHERE code = ?;`,
			[
				`${code?.split('-')?.[0]}-${code?.split('-')?.[0]?.toUpperCase?.()}`
			]
		);

		if (
			doesMainLanguageExist?.rows?.length &&
			doesMainLanguageExist?.rows?.[0]?.code !== code
		) {
			rows.push({
				locale_code: code,
				fallback_locale_code: doesMainLanguageExist?.rows?.[0]?.code,
				priority: priority++
			});
		}

		/**
		 * Step 2: language → en-US (global default)
		 */
		if (code !== 'en-US') {
			rows.push({
				locale_code: code,
				fallback_locale_code: 'en-US',
				priority: priority++
			});
		}
	}

	// Deduplicate (safety)
	const uniqueRows = Object.values(
		rows.reduce((acc, r) => {
			acc[`${r.locale_code}:${r.priority}`] = r;
			return acc;
		}, {})
	);

	await knex('locale_fallback_master')
		.insert(uniqueRows)
		.onConflict(['locale_code', 'priority'])
		.ignore();
};
