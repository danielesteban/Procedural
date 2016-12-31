import {Controls} from 'Dialogs';
import {cE, aC, aE, tN} from './DOM';
import Music from './Music';
import i18n from 'i18n';

/* Global input state */
export const State = {
	mouseX: 0,
	mouseY: 0,
	movementX: 0,
	movementY: 0,
	primary: 0,
	secondary: 0,
	forward: 0,
	backward: 0,
	left: 0,
	right: 0,
	run: 0,
	flight: 0,
	fastTime: 0,
	nightVision: 0,
	screenshot: 0
};
const resetState = () => {
	const persist = [
		'flight',
		'fastTime',
		'nightVision',
		'screenshot'
	];
	for(let id in State) !(~persist.indexOf(id)) && (State[id] = 0);
};
aE(window, 'blur', resetState);

/* Capture status  */
let isEnabled = true;
export const Capture = ({enabled, lock}) => {
	!(isEnabled = enabled) && resetState();
	if(lock === undefined) return;
	autoLock = lock;
	if(lock) !isLocked && requestPointerLock();
	else isLocked && exitPointerLock();
};

/* Pointer lock stuff */
let isLocked = false;
let autoLock = true;
const pointerLockChange = () => {
	isLocked = !!(document.pointerLockElement			||
								document.mozPointerLockElement	||
								document.webkitPointerLockElement);
	settings.style.display = fork.style.display = isLocked ? 'none' : '';
};

aE(document, 'pointerlockchange', pointerLockChange);
aE(document, 'mozpointerlockchange', pointerLockChange);
aE(document, 'webkitpointerlockchange', pointerLockChange);

const requestPointerLock = () => {
	if(document.documentElement.mozRequestPointerLock) document.documentElement.mozRequestPointerLock();
	else if(document.documentElement.webkitRequestPointerLock) document.documentElement.webkitRequestPointerLock();
	else document.documentElement.requestPointerLock();
};

const exitPointerLock = () => {
	if(document.mozExitPointerLock) document.mozExitPointerLock();
	else if(document.webkitExitPointerLock) document.webkitExitPointerLock();
	else document.exitPointerLock();
};

/* Fullscreen stuff */
let isFullScreen = false;
let autoFullscreen = localStorage.fullscreen;
const fullScreenChange = () => {
	isFullScreen = !!(document.fullscreenElement			||
										document.mozFullScreenElement		||
										document.webkitFullscreenElement);
	isFullScreen && autoLock && !isLocked && requestPointerLock();
};

aE(document, 'fullscreenchange', fullScreenChange);
aE(document, 'mozfullscreenchange', fullScreenChange);
aE(document, 'webkitfullscreenchange', fullScreenChange);

const requestFullScreen = () => {
	if(document.documentElement.mozRequestFullScreen) document.documentElement.mozRequestFullScreen();
	else if(document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	else document.documentElement.requestFullscreen();
};

const cancelFullScreen = () => {
	if(document.mozCancelFullScreen) document.mozCancelFullScreen();
	else if(document.webkitCancelFullScreen) document.webkitCancelFullScreen();
	else document.cancelFullScreen();
};

/* Mouse events handling */
const onButton = (e) => {
	if(e.target === settings || e.target.parentNode === settings || e.target.parentNode.parentNode === settings) return;
	if(e.target === fork || e.target.parentNode === fork) return;
	if(autoFullscreen && !isFullScreen) return requestFullScreen();
	if(autoLock && !isLocked) return requestPointerLock();
	if(!isEnabled) return;
	const state = e.type === 'mousedown';
	switch(e.button) {
		case 0:
			State.primary = state;
		break;
		case 2:
			State.secondary = state;
		break;
	}
};

aE(window, 'mousedown', onButton);
aE(window, 'mouseup', onButton);
aE(window, 'contextmenu', (e) => e.preventDefault());

aE(window, 'mousemove', (e) => {
	State.mouseX = e.clientX / window.innerWidth * 2 - 1;
	State.mouseY = (window.innerHeight - e.clientY) / window.innerHeight * 2 - 1;
	State.movementX = !isEnabled || !isLocked ? 0 : (e.movementX || e.mozMovementX || e.webkitMovementX || 0);
	State.movementY = !isEnabled || !isLocked ? 0 : (e.movementY || e.mozMovementY || e.webkitMovementY || 0);
});

/* Electron */
const electron = window.process && window.process.type;

/* Keyboard events handling */
const onKey = (e) => {
	if(!isEnabled || e.repeat) return;
	const state = e.type === 'keydown';
	switch(e.keyCode) {
		case 87:
			State.forward = state;
		break;
		case 83:
			State.backward = state;
		break;
		case 65:
			State.left = state;
		break;
		case 68:
			State.right = state;
		break;
		case 16:
			e.preventDefault();
			State.run = state;
		break;
		case 32:
			e.preventDefault();
			if(state) {
				State.flight = !State.flight;
			}
		break;
		case 79:
			if(state) {
				State.fastTime = !State.fastTime;
			}
		break;
		case 70:
			if(state) {
				State.nightVision = !State.nightVision;
			}
		break;
		case 80:
			if(state) {
				State.screenshot = {};
			}
		break;
		case 76:
			if(state) {
				State.screenshot = {gif:true};
			}
		break;
	}
};

aE(window, 'keydown', onKey);
aE(window, 'keyup', onKey);

/* Settings Menu */
const settings = cE('settings');
['postprocessing', 'antialias', 'highDPI', 'debug', 'mute', 'fullscreen'].forEach((setting) => {
	if(setting === 'highDPI' && (window.devicePixelRatio || 1) < 2) return;
	if(setting === 'fullscreen' && electron) return;
	const input = cE('input', {
		type: 'checkbox',
		checked: localStorage.getItem(setting),
		onchange: () => {
			if(input.checked) localStorage.setItem(setting, 1);
			else localStorage.removeItem(setting);
			if(setting === 'mute') {
				Music.toggle();
			} else if(setting === 'fullscreen') {
				(autoFullscreen = input.checked) && !isFullScreen && requestFullScreen();
			} else window.location.reload();
		}
	})
	const label = cE('label', null, input);
	aC(label, tN(i18n[setting]));
	aC(settings, label);
});
const controls = new Controls();
aC(settings, cE('a', {
	text: i18n.controls,
	className: 'button dark first',
	onclick: () => controls.open()
}));
aC(document.body, settings);

/* Fork callout */
const fork = cE('fork', null, cE('a', {
	href: 'https://github.com/danielesteban/Procedural',
	target: '_blank',
	innerHTML: '<svg width="80" height="80" viewBox="0 0 250 250"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>'
}));
aC(document.body, fork);
