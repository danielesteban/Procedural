const locales = {
	en: {
		antialias: 'Antialias',
		askForChrome: 'Yes, get Chrome now',
		controls: 'Controls',
		controlsWalk: 'Walk',
		controlsRun: 'Run',
		controlsFlight: 'Toggle flight',
		controlsNightVision: 'Night vision',
		controlsFastTime: 'Toggle time speed',
		controlsGIF: 'Record a GIF',
		controlsScreenshot: 'Take a screenshot',
		debug: 'Debug info',
		encodingGIF: 'Encoding GIF...',
		error: 'Error',
		fullscreen: 'Full-Screen',
		highDPI: 'High DPI',
		inventory: 'Inventory',
		mute: 'Mute audio',
		nightVisionError: 'You need to enable PostProcessing (At the bottom right) in order to see the night vision effect.',
		ok: 'OK',
		postprocessing: 'PostProcessing',
		recordingGIF: 'Recording GIF...',
		renderedMeshes: '{rendered}/{loaded} meshes',
		worksBetterWithChrome: 'Works better with Chrome'
	},
	es: {
		askForChrome: 'Sí, obtener Chrome ahora',
		controls: 'Controles',
		controlsWalk: 'Caminar',
		controlsRun: 'Correr',
		controlsFlight: 'Vuelo',
		controlsNightVision: 'Visión nocturna',
		controlsFastTime: 'Velocidad del tiempo',
		controlsGIF: 'Grabar un GIF',
		controlsScreenshot: 'Captura de pantalla',
		nightVisionError: 'Debes activar PostProcessing (Abajo a la derecha) para poder ver el efecto de visión nocturna.',
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
