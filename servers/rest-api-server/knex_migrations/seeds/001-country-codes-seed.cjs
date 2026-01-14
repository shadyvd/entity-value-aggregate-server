exports.seed = async function seedCountryCodes(knex) {
	// Step 0: If the data is already in there, skip...
	const countryCount = await knex?.raw?.(
		`SELECT count(iso_code) AS country_count FROM country_code_master`
	);
	if (Number?.(countryCount?.rows?.[0]['country_count'])) return;

	// Insert all country/region codes. Each entry has
	//   iso_code: ISO 3166-1 alpha-3 code
	//   unsd_code: UN M49/UNSD numeric code as a string
	//   country_name: WITS country or region name
	//   is_enabled: whether the code is enabled in your application (all false by default)
	await knex('country_code_master').insert([
		{
			iso_code: 'AFG',
			unsd_code: '004',
			country_name: 'Afghanistan',
			is_enabled: false
		},
		{
			iso_code: 'ALB',
			unsd_code: '008',
			country_name: 'Albania',
			is_enabled: false
		},
		{
			iso_code: 'DZA',
			unsd_code: '012',
			country_name: 'Algeria',
			is_enabled: false
		},
		{
			iso_code: 'ASM',
			unsd_code: '016',
			country_name: 'American Samoa',
			is_enabled: false
		},
		{
			iso_code: 'AND',
			unsd_code: '020',
			country_name: 'Andorra',
			is_enabled: false
		},
		{
			iso_code: 'AGO',
			unsd_code: '024',
			country_name: 'Angola',
			is_enabled: false
		},
		{
			iso_code: 'AIA',
			unsd_code: '660',
			country_name: 'Anguila',
			is_enabled: false
		},
		{
			iso_code: 'ATG',
			unsd_code: '028',
			country_name: 'Antigua and Barbuda',
			is_enabled: false
		},
		{
			iso_code: 'ARG',
			unsd_code: '032',
			country_name: 'Argentina',
			is_enabled: false
		},
		{
			iso_code: 'ARM',
			unsd_code: '051',
			country_name: 'Armenia',
			is_enabled: false
		},
		{
			iso_code: 'ABW',
			unsd_code: '533',
			country_name: 'Aruba',
			is_enabled: false
		},
		{
			iso_code: 'AUS',
			unsd_code: '036',
			country_name: 'Australia',
			is_enabled: false
		},
		{
			iso_code: 'AUT',
			unsd_code: '040',
			country_name: 'Austria',
			is_enabled: false
		},
		{
			iso_code: 'AZE',
			unsd_code: '031',
			country_name: 'Azerbaijan',
			is_enabled: false
		},
		{
			iso_code: 'BHS',
			unsd_code: '044',
			country_name: 'Bahamas, The',
			is_enabled: false
		},
		{
			iso_code: 'BHR',
			unsd_code: '048',
			country_name: 'Bahrain',
			is_enabled: false
		},
		{
			iso_code: 'BGD',
			unsd_code: '050',
			country_name: 'Bangladesh',
			is_enabled: false
		},
		{
			iso_code: 'BRB',
			unsd_code: '052',
			country_name: 'Barbados',
			is_enabled: false
		},
		{
			iso_code: 'BLR',
			unsd_code: '112',
			country_name: 'Belarus',
			is_enabled: false
		},
		{
			iso_code: 'BEL',
			unsd_code: '056',
			country_name: 'Belgium',
			is_enabled: false
		},
		{
			iso_code: 'BLX',
			unsd_code: '058',
			country_name: 'Belgium-Luxembourg',
			is_enabled: false
		},
		{
			iso_code: 'BLZ',
			unsd_code: '084',
			country_name: 'Belize',
			is_enabled: false
		},
		{
			iso_code: 'BEN',
			unsd_code: '204',
			country_name: 'Benin',
			is_enabled: false
		},
		{
			iso_code: 'BMU',
			unsd_code: '060',
			country_name: 'Bermuda',
			is_enabled: false
		},
		{
			iso_code: 'BTN',
			unsd_code: '064',
			country_name: 'Bhutan',
			is_enabled: false
		},
		{
			iso_code: 'BOL',
			unsd_code: '068',
			country_name: 'Bolivia',
			is_enabled: false
		},
		{
			iso_code: 'BIH',
			unsd_code: '070',
			country_name: 'Bosnia and Herzegovina',
			is_enabled: false
		},
		{
			iso_code: 'BWA',
			unsd_code: '072',
			country_name: 'Botswana',
			is_enabled: false
		},
		{
			iso_code: 'BAT',
			unsd_code: '080',
			country_name: 'Br. Antr. Terr',
			is_enabled: false
		},
		{
			iso_code: 'BRA',
			unsd_code: '076',
			country_name: 'Brazil',
			is_enabled: false
		},
		{
			iso_code: 'IOT',
			unsd_code: '086',
			country_name: 'British Indian Ocean Ter.',
			is_enabled: false
		},
		{
			iso_code: 'VGB',
			unsd_code: '092',
			country_name: 'British Virgin Islands',
			is_enabled: false
		},
		{
			iso_code: 'BRN',
			unsd_code: '096',
			country_name: 'Brunei',
			is_enabled: false
		},
		{
			iso_code: 'BGR',
			unsd_code: '100',
			country_name: 'Bulgaria',
			is_enabled: false
		},
		{
			iso_code: 'BFA',
			unsd_code: '854',
			country_name: 'Burkina Faso',
			is_enabled: false
		},
		{
			iso_code: 'BDI',
			unsd_code: '108',
			country_name: 'Burundi',
			is_enabled: false
		},
		{
			iso_code: 'KHM',
			unsd_code: '116',
			country_name: 'Cambodia',
			is_enabled: false
		},
		{
			iso_code: 'CMR',
			unsd_code: '120',
			country_name: 'Cameroon',
			is_enabled: false
		},
		{
			iso_code: 'CAN',
			unsd_code: '124',
			country_name: 'Canada',
			is_enabled: false
		},
		{
			iso_code: 'CPV',
			unsd_code: '132',
			country_name: 'Cape Verde',
			is_enabled: false
		},
		{
			iso_code: 'CYM',
			unsd_code: '136',
			country_name: 'Cayman Islands',
			is_enabled: false
		},
		{
			iso_code: 'CAF',
			unsd_code: '140',
			country_name: 'Central African Republic',
			is_enabled: false
		},
		{
			iso_code: 'TCD',
			unsd_code: '148',
			country_name: 'Chad',
			is_enabled: false
		},
		{
			iso_code: 'CHL',
			unsd_code: '152',
			country_name: 'Chile',
			is_enabled: false
		},
		{
			iso_code: 'CHN',
			unsd_code: '156',
			country_name: 'China',
			is_enabled: false
		},
		{
			iso_code: 'CXR',
			unsd_code: '162',
			country_name: 'Christmas Island',
			is_enabled: false
		},
		{
			iso_code: 'CCK',
			unsd_code: '166',
			country_name: 'Cocos (Keeling) Islands',
			is_enabled: false
		},
		{
			iso_code: 'COL',
			unsd_code: '170',
			country_name: 'Colombia',
			is_enabled: false
		},
		{
			iso_code: 'COM',
			unsd_code: '174',
			country_name: 'Comoros',
			is_enabled: false
		},
		{
			iso_code: 'ZAR',
			unsd_code: '180',
			country_name: 'Congo, Dem. Rep.',
			is_enabled: false
		},
		{
			iso_code: 'COG',
			unsd_code: '178',
			country_name: 'Congo, Rep.',
			is_enabled: false
		},
		{
			iso_code: 'COK',
			unsd_code: '184',
			country_name: 'Cook Islands',
			is_enabled: false
		},
		{
			iso_code: 'CRI',
			unsd_code: '188',
			country_name: 'Costa Rica',
			is_enabled: false
		},
		{
			iso_code: 'CIV',
			unsd_code: '384',
			country_name: "Cote d'Ivoire",
			is_enabled: false
		},
		{
			iso_code: 'HRV',
			unsd_code: '191',
			country_name: 'Croatia',
			is_enabled: false
		},
		{
			iso_code: 'CUB',
			unsd_code: '192',
			country_name: 'Cuba',
			is_enabled: false
		},
		{
			iso_code: 'CYP',
			unsd_code: '196',
			country_name: 'Cyprus',
			is_enabled: false
		},
		{
			iso_code: 'CZE',
			unsd_code: '203',
			country_name: 'Czech Republic',
			is_enabled: false
		},
		{
			iso_code: 'CSK',
			unsd_code: '200',
			country_name: 'Czechoslovakia',
			is_enabled: false
		},
		{
			iso_code: 'DNK',
			unsd_code: '208',
			country_name: 'Denmark',
			is_enabled: false
		},
		{
			iso_code: 'DJI',
			unsd_code: '262',
			country_name: 'Djibouti',
			is_enabled: false
		},
		{
			iso_code: 'DMA',
			unsd_code: '212',
			country_name: 'Dominica',
			is_enabled: false
		},
		{
			iso_code: 'DOM',
			unsd_code: '214',
			country_name: 'Dominican Republic',
			is_enabled: false
		},
		{
			iso_code: 'TMP',
			unsd_code: '626',
			country_name: 'East Timor',
			is_enabled: false
		},
		{
			iso_code: 'ECU',
			unsd_code: '218',
			country_name: 'Ecuador',
			is_enabled: false
		},
		{
			iso_code: 'EGY',
			unsd_code: '818',
			country_name: 'Egypt, Arab Rep.',
			is_enabled: false
		},
		{
			iso_code: 'SLV',
			unsd_code: '222',
			country_name: 'El Salvador',
			is_enabled: false
		},
		{
			iso_code: 'GNQ',
			unsd_code: '226',
			country_name: 'Equatorial Guinea',
			is_enabled: false
		},
		{
			iso_code: 'ERI',
			unsd_code: '232',
			country_name: 'Eritrea',
			is_enabled: false
		},
		{
			iso_code: 'EST',
			unsd_code: '233',
			country_name: 'Estonia',
			is_enabled: false
		},
		{
			iso_code: 'ETH',
			unsd_code: '231',
			country_name: 'Ethiopia (excludes Eritrea)',
			is_enabled: false
		},
		{
			iso_code: 'ETF',
			unsd_code: '230',
			country_name: 'Ethiopia (includes Eritrea)',
			is_enabled: false
		},
		{
			iso_code: 'EUN',
			unsd_code: '918',
			country_name: 'European Union',
			is_enabled: false
		},
		{
			iso_code: 'FRO',
			unsd_code: '234',
			country_name: 'Faeroe Islands',
			is_enabled: false
		},
		{
			iso_code: 'FLK',
			unsd_code: '238',
			country_name: 'Falkland Island',
			is_enabled: false
		},
		{
			iso_code: 'FJI',
			unsd_code: '242',
			country_name: 'Fiji',
			is_enabled: false
		},
		{
			iso_code: 'FIN',
			unsd_code: '246',
			country_name: 'Finland',
			is_enabled: false
		},
		{
			iso_code: 'PCZ',
			unsd_code: '592',
			country_name: 'Fm Panama Cz',
			is_enabled: false
		},
		{
			iso_code: 'ZW1',
			unsd_code: '717',
			country_name: 'Fm Rhod Nyas',
			is_enabled: false
		},
		{
			iso_code: 'TAN',
			unsd_code: '835',
			country_name: 'Fm Tanganyik',
			is_enabled: false
		},
		{
			iso_code: 'VDR',
			unsd_code: '868',
			country_name: 'Fm Vietnam Dr',
			is_enabled: false
		},
		{
			iso_code: 'SVR',
			unsd_code: '866',
			country_name: 'Fm Vietnam Rp',
			is_enabled: false
		},
		{
			iso_code: 'ZPM',
			unsd_code: '836',
			country_name: 'Fm Zanz-Pemb',
			is_enabled: false
		},
		{
			iso_code: 'ATF',
			unsd_code: '260',
			country_name: 'Fr. So. Ant. Tr',
			is_enabled: false
		},
		{
			iso_code: 'FRA',
			unsd_code: '250',
			country_name: 'France',
			is_enabled: false
		},
		{
			iso_code: 'FRE',
			unsd_code: '838',
			country_name: 'Free Zones',
			is_enabled: false
		},
		{
			iso_code: 'GUF',
			unsd_code: '254',
			country_name: 'French Guiana',
			is_enabled: false
		},
		{
			iso_code: 'PYF',
			unsd_code: '258',
			country_name: 'French Polynesia',
			is_enabled: false
		},
		{
			iso_code: 'GAB',
			unsd_code: '266',
			country_name: 'Gabon',
			is_enabled: false
		},
		{
			iso_code: 'GMB',
			unsd_code: '270',
			country_name: 'Gambia, The',
			is_enabled: false
		},
		{
			iso_code: 'GAZ',
			unsd_code: '274',
			country_name: 'Gaza Strip',
			is_enabled: false
		},
		{
			iso_code: 'GEO',
			unsd_code: '268',
			country_name: 'Georgia',
			is_enabled: false
		},
		{
			iso_code: 'DDR',
			unsd_code: '278',
			country_name: 'German Democratic Republic',
			is_enabled: false
		},
		{
			iso_code: 'DEU',
			unsd_code: '276',
			country_name: 'Germany',
			is_enabled: false
		},
		{
			iso_code: 'GHA',
			unsd_code: '288',
			country_name: 'Ghana',
			is_enabled: false
		},
		{
			iso_code: 'GIB',
			unsd_code: '292',
			country_name: 'Gibraltar',
			is_enabled: false
		},
		{
			iso_code: 'GRC',
			unsd_code: '300',
			country_name: 'Greece',
			is_enabled: false
		},
		{
			iso_code: 'GRL',
			unsd_code: '304',
			country_name: 'Greenland',
			is_enabled: false
		},
		{
			iso_code: 'GRD',
			unsd_code: '308',
			country_name: 'Grenada',
			is_enabled: false
		},
		{
			iso_code: 'GLP',
			unsd_code: '312',
			country_name: 'Guadeloupe',
			is_enabled: false
		},
		{
			iso_code: 'GUM',
			unsd_code: '316',
			country_name: 'Guam',
			is_enabled: false
		},
		{
			iso_code: 'GTM',
			unsd_code: '320',
			country_name: 'Guatemala',
			is_enabled: false
		},
		{
			iso_code: 'GIN',
			unsd_code: '324',
			country_name: 'Guinea',
			is_enabled: false
		},
		{
			iso_code: 'GNB',
			unsd_code: '624',
			country_name: 'Guinea-Bissau',
			is_enabled: false
		},
		{
			iso_code: 'GUY',
			unsd_code: '328',
			country_name: 'Guyana',
			is_enabled: false
		},
		{
			iso_code: 'HTI',
			unsd_code: '332',
			country_name: 'Haiti',
			is_enabled: false
		},
		{
			iso_code: 'VAT',
			unsd_code: '336',
			country_name: 'Holy See',
			is_enabled: false
		},
		{
			iso_code: 'HND',
			unsd_code: '340',
			country_name: 'Honduras',
			is_enabled: false
		},
		{
			iso_code: 'HKG',
			unsd_code: '344',
			country_name: 'Hong Kong, China',
			is_enabled: false
		},
		{
			iso_code: 'HUN',
			unsd_code: '348',
			country_name: 'Hungary',
			is_enabled: false
		},
		{
			iso_code: 'ISL',
			unsd_code: '352',
			country_name: 'Iceland',
			is_enabled: false
		},
		{
			iso_code: 'IND',
			unsd_code: '356',
			country_name: 'India',
			is_enabled: true
		},
		{
			iso_code: 'IDN',
			unsd_code: '360',
			country_name: 'Indonesia',
			is_enabled: false
		},
		{
			iso_code: 'IRN',
			unsd_code: '364',
			country_name: 'Iran, Islamic Rep.',
			is_enabled: false
		},
		{
			iso_code: 'IRQ',
			unsd_code: '368',
			country_name: 'Iraq',
			is_enabled: false
		},
		{
			iso_code: 'IRL',
			unsd_code: '372',
			country_name: 'Ireland',
			is_enabled: false
		},
		{
			iso_code: 'ISR',
			unsd_code: '376',
			country_name: 'Israel',
			is_enabled: false
		},
		{
			iso_code: 'ITA',
			unsd_code: '380',
			country_name: 'Italy',
			is_enabled: false
		},
		{
			iso_code: 'JAM',
			unsd_code: '388',
			country_name: 'Jamaica',
			is_enabled: false
		},
		{
			iso_code: 'JPN',
			unsd_code: '392',
			country_name: 'Japan',
			is_enabled: false
		},
		{
			iso_code: 'JTN',
			unsd_code: '396',
			country_name: 'Jhonston Island',
			is_enabled: false
		},
		{
			iso_code: 'JOR',
			unsd_code: '400',
			country_name: 'Jordan',
			is_enabled: false
		},
		{
			iso_code: 'KAZ',
			unsd_code: '398',
			country_name: 'Kazakhstan',
			is_enabled: false
		},
		{
			iso_code: 'KEN',
			unsd_code: '404',
			country_name: 'Kenya',
			is_enabled: false
		},
		{
			iso_code: 'KIR',
			unsd_code: '296',
			country_name: 'Kiribati',
			is_enabled: false
		},
		{
			iso_code: 'PRK',
			unsd_code: '408',
			country_name: 'Korea, Dem. Rep.',
			is_enabled: false
		},
		{
			iso_code: 'KOR',
			unsd_code: '410',
			country_name: 'Korea, Rep.',
			is_enabled: false
		},
		{
			iso_code: 'KWT',
			unsd_code: '414',
			country_name: 'Kuwait',
			is_enabled: false
		},
		{
			iso_code: 'KGZ',
			unsd_code: '417',
			country_name: 'Kyrgyz Republic',
			is_enabled: false
		},
		{
			iso_code: 'LAO',
			unsd_code: '418',
			country_name: 'Lao PDR',
			is_enabled: false
		},
		{
			iso_code: 'LVA',
			unsd_code: '428',
			country_name: 'Latvia',
			is_enabled: false
		},
		{
			iso_code: 'LBN',
			unsd_code: '422',
			country_name: 'Lebanon',
			is_enabled: false
		},
		{
			iso_code: 'LSO',
			unsd_code: '426',
			country_name: 'Lesotho',
			is_enabled: false
		},
		{
			iso_code: 'LBR',
			unsd_code: '430',
			country_name: 'Liberia',
			is_enabled: false
		},
		{
			iso_code: 'LBY',
			unsd_code: '434',
			country_name: 'Libya',
			is_enabled: false
		},
		{
			iso_code: 'LIE',
			unsd_code: '438',
			country_name: 'Liechtenstein',
			is_enabled: false
		},
		{
			iso_code: 'LTU',
			unsd_code: '440',
			country_name: 'Lithuania',
			is_enabled: false
		},
		{
			iso_code: 'LUX',
			unsd_code: '442',
			country_name: 'Luxembourg',
			is_enabled: false
		},
		{
			iso_code: 'MAC',
			unsd_code: '446',
			country_name: 'Macao',
			is_enabled: false
		},
		{
			iso_code: 'MKD',
			unsd_code: '807',
			country_name: 'Macedonia, FYR',
			is_enabled: false
		},
		{
			iso_code: 'MDG',
			unsd_code: '450',
			country_name: 'Madagascar',
			is_enabled: false
		},
		{
			iso_code: 'MWI',
			unsd_code: '454',
			country_name: 'Malawi',
			is_enabled: false
		},
		{
			iso_code: 'MYS',
			unsd_code: '458',
			country_name: 'Malaysia',
			is_enabled: false
		},
		{
			iso_code: 'MDV',
			unsd_code: '462',
			country_name: 'Maldives',
			is_enabled: false
		},
		{
			iso_code: 'MLI',
			unsd_code: '466',
			country_name: 'Mali',
			is_enabled: false
		},
		{
			iso_code: 'MLT',
			unsd_code: '470',
			country_name: 'Malta',
			is_enabled: false
		},
		{
			iso_code: 'MHL',
			unsd_code: '584',
			country_name: 'Marshall Islands',
			is_enabled: false
		},
		{
			iso_code: 'MTQ',
			unsd_code: '474',
			country_name: 'Martinique',
			is_enabled: false
		},
		{
			iso_code: 'MRT',
			unsd_code: '478',
			country_name: 'Mauritania',
			is_enabled: false
		},
		{
			iso_code: 'MUS',
			unsd_code: '480',
			country_name: 'Mauritius',
			is_enabled: false
		},
		{
			iso_code: 'MEX',
			unsd_code: '484',
			country_name: 'Mexico',
			is_enabled: false
		},
		{
			iso_code: 'FSM',
			unsd_code: '583',
			country_name: 'Micronesia, Fed. Sts.',
			is_enabled: false
		},
		{
			iso_code: 'MID',
			unsd_code: '488',
			country_name: 'Midway Islands',
			is_enabled: false
		},
		{
			iso_code: 'MDA',
			unsd_code: '498',
			country_name: 'Moldova',
			is_enabled: false
		},
		{
			iso_code: 'MCO',
			unsd_code: '492',
			country_name: 'Monaco',
			is_enabled: false
		},
		{
			iso_code: 'MNG',
			unsd_code: '496',
			country_name: 'Mongolia',
			is_enabled: false
		},
		{
			iso_code: 'MSR',
			unsd_code: '500',
			country_name: 'Montserrat',
			is_enabled: false
		},
		{
			iso_code: 'MAR',
			unsd_code: '504',
			country_name: 'Morocco',
			is_enabled: false
		},
		{
			iso_code: 'MOZ',
			unsd_code: '508',
			country_name: 'Mozambique',
			is_enabled: false
		},
		{
			iso_code: 'MMR',
			unsd_code: '104',
			country_name: 'Myanmar',
			is_enabled: false
		},
		{
			iso_code: 'NAM',
			unsd_code: '516',
			country_name: 'Namibia',
			is_enabled: false
		},
		{
			iso_code: 'NRU',
			unsd_code: '520',
			country_name: 'Nauru',
			is_enabled: false
		},
		{
			iso_code: 'NPL',
			unsd_code: '524',
			country_name: 'Nepal',
			is_enabled: false
		},
		{
			iso_code: 'NLD',
			unsd_code: '528',
			country_name: 'Netherlands',
			is_enabled: false
		},
		{
			iso_code: 'ANT',
			unsd_code: '530',
			country_name: 'Netherlands Antilles',
			is_enabled: false
		},
		{
			iso_code: 'NZE',
			unsd_code: '536',
			country_name: 'Neutral Zone',
			is_enabled: false
		},
		{
			iso_code: 'NCL',
			unsd_code: '540',
			country_name: 'New Caledonia',
			is_enabled: false
		},
		{
			iso_code: 'NZL',
			unsd_code: '554',
			country_name: 'New Zealand',
			is_enabled: false
		},
		{
			iso_code: 'NIC',
			unsd_code: '558',
			country_name: 'Nicaragua',
			is_enabled: false
		},
		{
			iso_code: 'NER',
			unsd_code: '562',
			country_name: 'Niger',
			is_enabled: false
		},
		{
			iso_code: 'NGA',
			unsd_code: '566',
			country_name: 'Nigeria',
			is_enabled: false
		},
		{
			iso_code: 'NIU',
			unsd_code: '570',
			country_name: 'Niue',
			is_enabled: false
		},
		{
			iso_code: 'NFK',
			unsd_code: '574',
			country_name: 'Norfolk Island',
			is_enabled: false
		},
		{
			iso_code: 'MNP',
			unsd_code: '580',
			country_name: 'Northern Mariana Islands',
			is_enabled: false
		},
		{
			iso_code: 'NOR',
			unsd_code: '578',
			country_name: 'Norway',
			is_enabled: false
		},
		{
			iso_code: 'OMN',
			unsd_code: '512',
			country_name: 'Oman',
			is_enabled: false
		},
		{
			iso_code: 'PCE',
			unsd_code: '582',
			country_name: 'Pacific Islands',
			is_enabled: false
		},
		{
			iso_code: 'PAK',
			unsd_code: '586',
			country_name: 'Pakistan',
			is_enabled: false
		},
		{
			iso_code: 'PLW',
			unsd_code: '585',
			country_name: 'Palau',
			is_enabled: false
		},
		{
			iso_code: 'PAN',
			unsd_code: '591',
			country_name: 'Panama',
			is_enabled: false
		},
		{
			iso_code: 'PNG',
			unsd_code: '598',
			country_name: 'Papua New Guinea',
			is_enabled: false
		},
		{
			iso_code: 'PRY',
			unsd_code: '600',
			country_name: 'Paraguay',
			is_enabled: false
		},
		{
			iso_code: 'PMY',
			unsd_code: '459',
			country_name: 'Pen Malaysia',
			is_enabled: false
		},
		{
			iso_code: 'PER',
			unsd_code: '604',
			country_name: 'Peru',
			is_enabled: false
		},
		{
			iso_code: 'PHL',
			unsd_code: '608',
			country_name: 'Philippines',
			is_enabled: false
		},
		{
			iso_code: 'PCN',
			unsd_code: '612',
			country_name: 'Pitcairn',
			is_enabled: false
		},
		{
			iso_code: 'POL',
			unsd_code: '616',
			country_name: 'Poland',
			is_enabled: false
		},
		{
			iso_code: 'PRT',
			unsd_code: '620',
			country_name: 'Portugal',
			is_enabled: false
		},
		{
			iso_code: 'PRI',
			unsd_code: '630',
			country_name: 'Puerto Rico',
			is_enabled: false
		},
		{
			iso_code: 'QAT',
			unsd_code: '634',
			country_name: 'Qatar',
			is_enabled: false
		},
		{
			iso_code: 'REU',
			unsd_code: '638',
			country_name: 'Reunion',
			is_enabled: false
		},
		{
			iso_code: 'ROM',
			unsd_code: '642',
			country_name: 'Romania',
			is_enabled: false
		},
		{
			iso_code: 'RUS',
			unsd_code: '643',
			country_name: 'Russian Federation',
			is_enabled: false
		},
		{
			iso_code: 'RWA',
			unsd_code: '646',
			country_name: 'Rwanda',
			is_enabled: false
		},
		{
			iso_code: 'RYU',
			unsd_code: '647',
			country_name: 'Ryukyu Is',
			is_enabled: false
		},
		{
			iso_code: 'SBH',
			unsd_code: '461',
			country_name: 'Sabah',
			is_enabled: false
		},
		{
			iso_code: 'SHN',
			unsd_code: '654',
			country_name: 'Saint Helena',
			is_enabled: false
		},
		{
			iso_code: 'KN1',
			unsd_code: '658',
			country_name: 'Saint Kitts-Nevis-Anguilla-Aru',
			is_enabled: false
		},
		{
			iso_code: 'SPM',
			unsd_code: '666',
			country_name: 'Saint Pierre and Miquelon',
			is_enabled: false
		},
		{
			iso_code: 'WSM',
			unsd_code: '882',
			country_name: 'Samoa',
			is_enabled: false
		},
		{
			iso_code: 'SMR',
			unsd_code: '674',
			country_name: 'San Marino',
			is_enabled: false
		},
		{
			iso_code: 'STP',
			unsd_code: '678',
			country_name: 'Sao Tome and Principe',
			is_enabled: false
		},
		{
			iso_code: 'SWK',
			unsd_code: '457',
			country_name: 'Sarawak',
			is_enabled: false
		},
		{
			iso_code: 'SAU',
			unsd_code: '682',
			country_name: 'Saudi Arabia',
			is_enabled: false
		},
		{
			iso_code: 'SEN',
			unsd_code: '686',
			country_name: 'Senegal',
			is_enabled: false
		},
		{
			iso_code: 'SYC',
			unsd_code: '690',
			country_name: 'Seychelles',
			is_enabled: false
		},
		{
			iso_code: 'SLE',
			unsd_code: '694',
			country_name: 'Sierra Leone',
			is_enabled: false
		},
		{
			iso_code: 'SIK',
			unsd_code: '698',
			country_name: 'SIKKIM',
			is_enabled: false
		},
		{
			iso_code: 'SGP',
			unsd_code: '702',
			country_name: 'Singapore',
			is_enabled: false
		},
		{
			iso_code: 'SVK',
			unsd_code: '703',
			country_name: 'Slovak Republic',
			is_enabled: false
		},
		{
			iso_code: 'SVN',
			unsd_code: '705',
			country_name: 'Slovenia',
			is_enabled: false
		},
		{
			iso_code: 'SLB',
			unsd_code: '090',
			country_name: 'Solomon Islands',
			is_enabled: false
		},
		{
			iso_code: 'SOM',
			unsd_code: '706',
			country_name: 'Somalia',
			is_enabled: false
		},
		{
			iso_code: 'ZAF',
			unsd_code: '710',
			country_name: 'South Africa',
			is_enabled: false
		},
		{
			iso_code: 'SVU',
			unsd_code: '810',
			country_name: 'Soviet Union',
			is_enabled: false
		},
		{
			iso_code: 'ESP',
			unsd_code: '724',
			country_name: 'Spain',
			is_enabled: false
		},
		{
			iso_code: 'SPE',
			unsd_code: '839',
			country_name: 'Special Categories',
			is_enabled: false
		},
		{
			iso_code: 'LKA',
			unsd_code: '144',
			country_name: 'Sri Lanka',
			is_enabled: false
		},
		{
			iso_code: 'KNA',
			unsd_code: '659',
			country_name: 'St. Kitts and Nevis',
			is_enabled: false
		},
		{
			iso_code: 'LCA',
			unsd_code: '662',
			country_name: 'St. Lucia',
			is_enabled: false
		},
		{
			iso_code: 'VCT',
			unsd_code: '670',
			country_name: 'St. Vincent and the Grenadines',
			is_enabled: false
		},
		{
			iso_code: 'SDN',
			unsd_code: '736',
			country_name: 'Sudan',
			is_enabled: false
		},
		{
			iso_code: 'SUR',
			unsd_code: '740',
			country_name: 'Suriname',
			is_enabled: false
		},
		{
			iso_code: 'SJM',
			unsd_code: '744',
			country_name: 'Svalbard and Jan Mayen Is',
			is_enabled: false
		},
		{
			iso_code: 'SWZ',
			unsd_code: '748',
			country_name: 'Swaziland',
			is_enabled: false
		},
		{
			iso_code: 'SWE',
			unsd_code: '752',
			country_name: 'Sweden',
			is_enabled: false
		},
		{
			iso_code: 'CHE',
			unsd_code: '756',
			country_name: 'Switzerland',
			is_enabled: false
		},
		{
			iso_code: 'SYR',
			unsd_code: '760',
			country_name: 'Syrian Arab Republic',
			is_enabled: false
		},
		{
			iso_code: 'TWN',
			unsd_code: '158',
			country_name: 'Taiwan',
			is_enabled: false
		},
		{
			iso_code: 'TJK',
			unsd_code: '762',
			country_name: 'Tajikistan',
			is_enabled: false
		},
		{
			iso_code: 'TZA',
			unsd_code: '834',
			country_name: 'Tanzania',
			is_enabled: false
		},
		{
			iso_code: 'THA',
			unsd_code: '764',
			country_name: 'Thailand',
			is_enabled: false
		},
		{
			iso_code: 'TGO',
			unsd_code: '768',
			country_name: 'Togo',
			is_enabled: false
		},
		{
			iso_code: 'TKL',
			unsd_code: '772',
			country_name: 'Tokelau',
			is_enabled: false
		},
		{
			iso_code: 'TON',
			unsd_code: '776',
			country_name: 'Tonga',
			is_enabled: false
		},
		{
			iso_code: 'TTO',
			unsd_code: '780',
			country_name: 'Trinidad and Tobago',
			is_enabled: false
		},
		{
			iso_code: 'TUN',
			unsd_code: '788',
			country_name: 'Tunisia',
			is_enabled: false
		},
		{
			iso_code: 'TUR',
			unsd_code: '792',
			country_name: 'Turkey',
			is_enabled: false
		},
		{
			iso_code: 'TKM',
			unsd_code: '795',
			country_name: 'Turkmenistan',
			is_enabled: false
		},
		{
			iso_code: 'TCA',
			unsd_code: '796',
			country_name: 'Turks and Caicos Isl.',
			is_enabled: false
		},
		{
			iso_code: 'TUV',
			unsd_code: '798',
			country_name: 'Tuvalu',
			is_enabled: false
		},
		{
			iso_code: 'UGA',
			unsd_code: '800',
			country_name: 'Uganda',
			is_enabled: false
		},
		{
			iso_code: 'UKR',
			unsd_code: '804',
			country_name: 'Ukraine',
			is_enabled: false
		},
		{
			iso_code: 'ARE',
			unsd_code: '784',
			country_name: 'United Arab Emirates',
			is_enabled: false
		},
		{
			iso_code: 'GBR',
			unsd_code: '826',
			country_name: 'United Kingdom',
			is_enabled: false
		},
		{
			iso_code: 'USA',
			unsd_code: '840',
			country_name: 'United States',
			is_enabled: false
		},
		{
			iso_code: 'UNS',
			unsd_code: '898',
			country_name: 'Unspecified',
			is_enabled: false
		},
		{
			iso_code: 'URY',
			unsd_code: '858',
			country_name: 'Uruguay',
			is_enabled: false
		},
		{
			iso_code: 'USP',
			unsd_code: '849',
			country_name: 'Us Msc.Pac.I',
			is_enabled: false
		},
		{
			iso_code: 'UZB',
			unsd_code: '860',
			country_name: 'Uzbekistan',
			is_enabled: false
		},
		{
			iso_code: 'VUT',
			unsd_code: '548',
			country_name: 'Vanuatu',
			is_enabled: false
		},
		{
			iso_code: 'VEN',
			unsd_code: '862',
			country_name: 'Venezuela',
			is_enabled: false
		},
		{
			iso_code: 'VNM',
			unsd_code: '704',
			country_name: 'Vietnam',
			is_enabled: false
		},
		{
			iso_code: 'VIR',
			unsd_code: '850',
			country_name: 'Virgin Islands (U.S.)',
			is_enabled: false
		},
		{
			iso_code: 'WAK',
			unsd_code: '872',
			country_name: 'Wake Island',
			is_enabled: false
		},
		{
			iso_code: 'WLF',
			unsd_code: '876',
			country_name: 'Wallis and Futura Isl.',
			is_enabled: false
		},
		{
			iso_code: 'ESH',
			unsd_code: '732',
			country_name: 'Western Sahara',
			is_enabled: false
		},
		{
			iso_code: 'WLD',
			unsd_code: '000',
			country_name: 'World',
			is_enabled: false
		},
		{
			iso_code: 'YDR',
			unsd_code: '720',
			country_name: 'Yemen Democratic',
			is_enabled: false
		},
		{
			iso_code: 'YEM',
			unsd_code: '887',
			country_name: 'Yemen, Rep.',
			is_enabled: false
		},
		{
			iso_code: 'SER',
			unsd_code: '891',
			country_name: 'Yugoslavia',
			is_enabled: false
		},
		// WITS truncates this name in its table; expand the abbreviation for clarity
		{
			iso_code: 'YUG',
			unsd_code: '890',
			country_name: 'Yugoslavia, FR (Serbia/Montenegro)',
			is_enabled: false
		},
		{
			iso_code: 'ZMB',
			unsd_code: '894',
			country_name: 'Zambia',
			is_enabled: false
		},
		{
			iso_code: 'ZWE',
			unsd_code: '716',
			country_name: 'Zimbabwe',
			is_enabled: false
		}
	]);
};
