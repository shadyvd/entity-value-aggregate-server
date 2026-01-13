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
	const territoryToCountryCodeMap = new Map();
	const territoryToCountryISONameMap = new Map();

	territoryToCountryISONameMap.set(
		'Bosnia & Herzegovina',
		'Bosnia and Herzegovina'
	);
	territoryToCountryISONameMap.set('Côte d’Ivoire', "Cote d'Ivoire");
	territoryToCountryISONameMap.set('Czechia', 'Czech Republic');
	territoryToCountryISONameMap.set('Egypt', 'Egypt, Arab Rep.');
	territoryToCountryISONameMap.set('Ethiopia', 'Ethiopia (includes Eritrea)');
	territoryToCountryISONameMap.set('Faroe Islands', 'Faeroe Islands');
	territoryToCountryISONameMap.set('Gambia', 'Gambia, The');
	territoryToCountryISONameMap.set('Hong Kong SAR China', 'Hong Kong, China');
	territoryToCountryISONameMap.set('Iran', 'Iran, Islamic Rep.');
	territoryToCountryISONameMap.set('Kyrgyzstan', 'Kyrgyz Republic');
	territoryToCountryISONameMap.set('Laos', 'Lao PDR');
	territoryToCountryISONameMap.set('Macao SAR China', 'Macao');
	territoryToCountryISONameMap.set('Micronesia', 'Micronesia, Fed. Sts.');
	territoryToCountryISONameMap.set(
		'Montenegro',
		'Yugoslavia, FR (Serbia/Montenegro)'
	);
	territoryToCountryISONameMap.set('Myanmar (Burma)', 'Myanmar');
	territoryToCountryISONameMap.set('North Korea', 'Korea, Dem. Rep.');
	territoryToCountryISONameMap.set('North Macedonia', 'Macedonia, FYR');
	territoryToCountryISONameMap.set('Russia', 'Russian Federation');
	territoryToCountryISONameMap.set(
		'Serbia',
		'Yugoslavia, FR (Serbia/Montenegro)'
	);
	territoryToCountryISONameMap.set('Slovakia', 'Slovak Republic');
	territoryToCountryISONameMap.set('South Korea', 'Korea, Rep.');
	territoryToCountryISONameMap.set('South Sudan', 'Sudan');
	territoryToCountryISONameMap.set('Syria', 'Syrian Arab Republic');
	territoryToCountryISONameMap.set('Türkiye', 'Turkey');
	territoryToCountryISONameMap.set('Vatican City', 'Holy See');
	territoryToCountryISONameMap.set('Yemen', 'Yemen, Rep.');

	/**
	 * Build locales from likelySubtags
	 * Example:
	 * en → en-Latn-US
	 * hi → hi-Deva-IN
	 */
	// eslint-disable-next-line no-unused-vars
	for (const [tag, expanded] of Object.entries(subtags)) {
		const parts = expanded?.split?.('-');
		if (parts.length < 3) continue;

		const [language, , territory] = parts;
		if (!languages[language] || !territories[territory]) continue;

		const localeCode = `${language}-${territory}`;
		let countryCode = territoryToCountryCodeMap?.get?.(territory);
		if (!countryCode) {
			countryCode = await knex?.raw?.(
				`SELECT iso_code FROM public.country_code_master WHERE country_name = ? LIMIT 1;`,
				[
					territoryToCountryISONameMap.get(territories[territory]) ||
						territories[territory]
				]
			);

			countryCode = countryCode?.rows?.[0]?.iso_code;
		}

		if (!countryCode) {
			console.error(
				`Country code not found for territory: ${territories[territory]}`
			);
			continue;
		}

		territoryToCountryCodeMap.set(territory, countryCode);
		rows.push({
			code: localeCode,
			language_code: language,
			language_name: languages[language],
			country_code: countryCode,
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
