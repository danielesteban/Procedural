const locales = {
	en: {
		antialias: 'Antialias',
		askForChrome: 'Yes, get Chrome now',
		debug: 'Debug info',
		error: 'Error',
		fullscreen: 'Full-Screen',
		highDPI: 'High DPI',
		inventory: 'Inventory',
		mute: 'Mute audio',
		ok: 'OK',
		renderedMeshes: '{rendered}/{loaded} meshes',
		worksBetterWithChrome: 'Works better with Chrome'
	},
	es: {
		askForChrome: 'Sí, obtener Chrome ahora',
		worksBetterWithChrome: 'Funciona mejor con Chrome'
	}
};

/* Locale Autodetection */
const defaultLocale = 'en';
const availableLocales = Object.keys(locales);
const storedLocale = localStorage.locale;
const browserLocale = (
	(window.navigator.languages ? window.navigator.languages[0] : null) ||
	window.navigator.language ||
	window.navigator.browserLanguage ||
	window.navigator.userLanguage ||
	defaultLocale
).substr(0, 2).toLowerCase();

const locale = ~availableLocales.indexOf(storedLocale) ? storedLocale :
							(~availableLocales.indexOf(browserLocale) ? browserLocale :
							defaultLocale);

export default {...locales[defaultLocale], ...locales[locale]};
