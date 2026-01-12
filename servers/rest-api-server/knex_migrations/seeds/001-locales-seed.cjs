/* eslint-disable security/detect-object-injection */
/**
 * Seed ALL CLDR locales (language + territory)
 *
 * Sources:
 * - cldr-localenames-full
 * - cldr-core
 * - cldr-misc-full
 */

// CLDR data
const languageNames = require('cldr-localenames-full/main/en/languages.json');
const territoryNames = require('cldr-localenames-full/main/en/territories.json');
const likelySubtags = require('cldr-core/supplemental/likelySubtags.json');
const rtlLanguages = require('cldr-misc-full/main/en/layout.json').main.en
	.layout.orientation.characterOrder;

exports.seed = async function (knex) {
	const now = knex.fn.now();

	const languages = languageNames.main.en.localeDisplayNames.languages;
	const territories = territoryNames.main.en.localeDisplayNames.territories;
	const subtags = likelySubtags.supplemental.likelySubtags;

	const rtlLangSet = new Set(
		Object.entries(rtlLanguages)
			.filter(([, dir]) => dir === 'right-to-left')
			.map(([lang]) => lang)
	);

	const rows = [];

	/**
	 * Build locales from likelySubtags
	 * Example:
	 * en → en-Latn-US
	 * hi → hi-Deva-IN
	 */
	// eslint-disable-next-line no-unused-vars
	for (const [tag, expanded] of Object.entries(subtags)) {
		const parts = expanded.split('-');

		if (parts.length < 3) continue;

		const [language, , territory] = parts;

		if (!languages[language] || !territories[territory]) continue;

		const localeCode = `${language}-${territory}`;

		rows.push({
			code: localeCode,
			language_code: language,
			language_name: languages[language],
			country_code: territory,
			country_name: territories[territory],
			is_rtl: rtlLangSet.has(language),
			created_at: now,
			updated_at: now
		});
	}

	/**
	 * Deduplicate locales (CLDR can produce repeats)
	 */
	const uniqueRows = Object.values(
		rows.reduce((acc, row) => {
			acc[row.code] = row;
			return acc;
		}, {})
	);

	await knex('locale_master')
		.insert(uniqueRows)
		.onConflict('code')
		.merge({
			language_code: knex.raw('EXCLUDED.language_code'),
			country_code: knex.raw('EXCLUDED.country_code'),
			language_name: knex.raw('EXCLUDED.language_name'),
			country_name: knex.raw('EXCLUDED.country_name'),
			is_rtl: knex.raw('EXCLUDED.is_rtl')
		});

	await knex('locale_master')
		.whereIn('code', ['en-US', 'en-GB', 'en-IN'])
		.update({
			is_enabled: true,
			updated_at: now
		});
};
