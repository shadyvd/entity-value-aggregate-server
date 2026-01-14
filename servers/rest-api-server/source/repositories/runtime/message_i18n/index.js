/**
 * Imports for this file
 * @ignore
 */
import { EVASBaseRepository } from '@twyr/framework-classes';
import { EVASBaseFactory } from '@twyr/framework-classes';

/**
 * @class MessageI18N
 * @extends EVASBaseRepository
 *
 * @param {string} [location] - __dirname for this file in CJS, basically
 * @param {object} [iocContainer] - IoC module providing DI repositories
 * @param {object} [configuration] - requested repository configuration
 *
 * @classdesc The MessageI18N Repository Class.
 *
 */
class MessageI18N extends EVASBaseRepository {
	// #region Constructor
	constructor(location, iocContainer, configuration) {
		super(location, iocContainer, configuration);
	}
	// #endregion

	// #region Lifecycle Methods
	/**
	 * @memberof MessageI18N
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name load
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for implementing custom
	 * start logic
	 *
	 */
	async load() {
		await super.load?.();

		const databaseRepository =
			await this?.iocContainer?.resolve?.('SQLDatabase');

		// Step 1: Get all the locales we've enabled in the system,
		// along with the fallbacks
		let enabledLocales = await databaseRepository?.raw?.(
			`SELECT code FROM locale_master WHERE is_enabled = true;`
		);
		enabledLocales = enabledLocales?.rows?.map?.((row) => row?.code) ?? [];

		const staticCatalog = {};
		(enabledLocales ?? []).forEach((el) => {
			// eslint-disable-next-line security/detect-object-injection
			staticCatalog[el] = {};
		});

		// TODO: Write a DB FUNCTION to walk up the priority tree of fallbacks
		// and return the full list of fallbacks for each locale.
		// For now, just get the direct fallbacks
		const fallbackLocales = await databaseRepository?.(
			'locale_fallback_master'
		)
			?.select('locale_code', 'fallback_locale_code')
			?.whereIn?.('locale_code', enabledLocales)
			?.andWhere('priority', 1);

		const i18nFallbacks = {};
		(fallbackLocales ?? []).forEach((row) => {
			const { locale_code, fallback_locale_code } = row;
			// eslint-disable-next-line security/detect-object-injection
			i18nFallbacks[locale_code] = fallback_locale_code;
		});

		// Step 2: Setup the i18n instance
		let I18n = await import('i18n');
		I18n = I18n?.['default'];

		I18n?.configure?.({
			debug: global.serverEnvironment !== 'production',
			locales: enabledLocales,
			staticCatalog: staticCatalog,
			fallbacks: i18nFallbacks,
			defaultLocale: 'en-US',
			objectNotation: false,
			updateFiles: false,
			syncFiles: false,
			autoReload: false,

			logDebugFn: this.#i18nDebugLog?.bind(this),
			logWarnFn: this.#i18nWarnLog?.bind(this),
			logErrorFn: this.#i18nErrorLog?.bind(this)
		});

		this.#i18n = I18n;

		// Step 3: Load the translations
		await this.#loadTranslations?.();
		return;
	}

	/**
	 * @memberof MessageI18N
	 * @async
	 * @instance
	 * @override
	 * @function
	 * @name unload
	 *
	 * @returns {null} - Nothing
	 *
	 * @description
	 * To be overridden by artifact implementations - for implementing custom
	 * stop logic
	 *
	 */
	async unload() {
		await super.unload?.();
		this.#i18n = undefined;
	}
	// #endregion

	// #region Getters / Setters
	get interface() {
		return {
			translate: this.#translate.bind(this)
		};
	}
	// #endregion

	// #region Private Methods
	async #loadTranslations() {
		const databaseRepository =
			await this?.iocContainer?.resolve?.('SQLDatabase');

		// Step 1: Get all the locales we've enabled in the system,
		// along with the fallbacks
		let enabledLocales = await databaseRepository?.raw?.(
			`SELECT code FROM locale_master WHERE is_enabled = true;`
		);
		enabledLocales = enabledLocales?.rows?.map?.((row) => row?.code) ?? [];

		// Step 2: Fetch the system messages from the database
		let systemMessages = await databaseRepository?.(
			'system_message_by_locale_master'
		)
			?.select('message_code', 'locale_code', 'message_text')
			?.whereIn?.('locale_code', enabledLocales);

		// Step 3: Organize the messages into locales, etc.
		const i18nCatalog = {};
		for (const systemMessage of systemMessages) {
			const { message_code, locale_code, message_text } = systemMessage;

			// eslint-disable-next-line security/detect-object-injection
			if (!i18nCatalog[locale_code]) {
				// eslint-disable-next-line security/detect-object-injection
				i18nCatalog[locale_code] = {};
			}

			// eslint-disable-next-line security/detect-object-injection
			i18nCatalog[locale_code][message_code] = message_text;
		}

		// Step 4: Load the messages into i18n
		for (const localeCode of Object.keys(i18nCatalog)) {
			this.#i18n?.addLocale?.(localeCode);
			this.#i18n?.setLocale?.(localeCode);

			const localeCatalog = this.#i18n?.getCatalog?.(localeCode);
			// eslint-disable-next-line security/detect-object-injection
			for (const messageCode of Object.keys(i18nCatalog[localeCode])) {
				// eslint-disable-next-line security/detect-object-injection
				localeCatalog[messageCode] =
					// eslint-disable-next-line security/detect-object-injection
					i18nCatalog[localeCode][messageCode];
			}
		}
		return;
	}

	async #translate(key, locale, variables) {
		// Implementation for translation logic goes here
		// This is a placeholder implementation
		// return `Translated(${key}, ${locale}, ${JSON.stringify(variables ?? {})})`;
		let translatedMessage = undefined;

		if (!translatedMessage) {
			translatedMessage = this.#i18n?.__?.(
				{ phrase: key, locale: locale },
				variables
			);
		}

		if (!translatedMessage) {
			await this.#loadTranslations?.();
			translatedMessage = this.#i18n?.__?.(
				{ phrase: key, locale: locale },
				variables
			);
		}

		return translatedMessage
			? translatedMessage
			: `COULD NOT TRANSLATE: ${key}, ${locale}, ${JSON.stringify(variables ?? {})}`;
	}

	async #i18nDebugLog(message) {
		const logger = await this?.iocContainer?.resolve?.('Logger');
		logger?.debug?.(`i18n::debug: ${message}`);
	}

	async #i18nWarnLog(message) {
		const logger = await this?.iocContainer?.resolve?.('Logger');
		logger?.warn?.(`i18n::warn: ${message}`);
	}

	async #i18nErrorLog(message) {
		const logger = await this?.iocContainer?.resolve?.('Logger');
		logger?.error?.(`i18n::error: ${message}`);
	}
	// #endregion

	// #region Private Fields
	#i18n = undefined;
	// #endregion
}

/**
 * @class RepositoryFactory
 * @extends EVASBaseFactory
 *
 * @classdesc The MessageI18N Repository Class Factory.
 */
export default class RepositoryFactory extends EVASBaseFactory {
	// #region Constructor
	// eslint-disable-next-line jsdoc/require-jsdoc
	constructor() {
		super();
	}
	// #endregion

	// #region Lifecycle API
	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name createInstance
	 *
	 * @param {object} [configuration] - requested repository configuration
	 * @param {object} [iocContainer] - IoC Container providing DI Repositories
	 *
	 * @returns {MessageI18N} - The MessageI18N repository instance.
	 *
	 */
	static async createInstances(configuration, iocContainer) {
		const repositoryKey = Buffer?.from?.(
			JSON?.stringify?.(configuration ?? {})
		)?.toString?.('base64');

		if (!RepositoryFactory.#messageI18NInstances?.has(repositoryKey)) {
			const messageI18NInstance = new MessageI18N(
				RepositoryFactory['$disk_unc'],
				iocContainer,
				configuration
			);

			await messageI18NInstance?.load?.();
			RepositoryFactory.#messageI18NInstances?.set?.(
				repositoryKey,
				messageI18NInstance
			);
		}

		return RepositoryFactory.#messageI18NInstances?.get(repositoryKey)
			?.interface;
	}

	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name destroyInstances
	 *
	 * @param {object} [configuration] - requested repository configuration
	 *
	 * @returns {undefined} - Nothing.
	 *
	 * @description Clears the cached {MessageI18N} instances
	 */
	static async destroyInstances(configuration) {
		if (configuration) {
			const repositoryKey = Buffer?.from?.(
				JSON?.stringify?.(configuration)
			)?.toString?.('base64');

			if (!RepositoryFactory.#messageI18NInstances?.has(repositoryKey))
				return;

			const messageI18NInstance =
				RepositoryFactory.#messageI18NInstances?.get(repositoryKey);
			await messageI18NInstance?.unload?.();

			RepositoryFactory.#messageI18NInstances?.delete?.(configuration);
			return;
		}

		const destroyResolutions = [];
		this.#messageI18NInstances?.forEach?.((sqlDatabaseInstance) => {
			destroyResolutions?.push?.(sqlDatabaseInstance?.unload?.());
		});

		await Promise?.allSettled?.(destroyResolutions);
		this.#messageI18NInstances?.clear?.();

		return;
	}
	// #endregion

	// #region Getters
	/**
	 * @memberof RepositoryFactory
	 * @async
	 * @static
	 * @override
	 * @function
	 * @name RepositoryName
	 *
	 * @returns {string} - Name of this repository.
	 *
	 * @description
	 * Returns the name of this repository - MessageI18N
	 */
	static get RepositoryName() {
		return 'MessageI18N';
	}
	// #endregion

	// #region Private Static Members
	static #messageI18NInstances = new Map();
	// #endregion
}
