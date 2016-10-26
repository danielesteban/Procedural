import requestAnimationFrame from 'raf';
import WebFont from 'webfontloader';
import {Clear, Debug, History} from 'Engine/Context';
import * as Levels from 'Levels';
import * as Textures from 'Textures';

/* Main loop */
let level;
let lastTicks = window.performance.now();
const animate = () => {
	Debug && Debug.FPSMeter.tickStart();
	const ticks = window.performance.now();
	const delta = (ticks - lastTicks) / 1000;
	lastTicks = ticks;
	level && level.animate(delta);
	Clear();
	level && level.render();
	Debug && Debug.FPSMeter.tick();
	requestAnimationFrame(animate);
};
animate();

/* Bootstrapper */
const loaded = {font: false, textures: false};
const init = () => {
	if(!loaded.font || !loaded.textures) return;
	const LoadLevel = () => {
		/* Destroy the current level */
		const current = level;
		level = null;
		current && current.destroy();

		/* Fetch level & params from browser history */
		const params = History.location.pathname.substr(1).split('/');
		let path = params.shift() || 'main';

		/* Load the level (if exists) */
		const id = path.substr(0, 1).toUpperCase() + path.substr(1).toLowerCase();
		if(!Levels[id]) return History.replace('/');
		requestAnimationFrame(() => (level = new Levels[id](params)));
	};
	History.listen(LoadLevel);
	LoadLevel();
};

/* Font loader */
WebFont.load({
	google: {
		families: ['Lato:100'],
		classes: false
	},
	active: () => {
		loaded.font = true;
		init();
	}
});

/* Texture loader handler */
window.addEventListener(Textures.LoadedEvent, (e) => {
	if(e.data === 'all') {
		loaded.textures = true;
		init();
	}
});
