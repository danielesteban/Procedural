import {cE, aC, aE, tN} from './DOM';
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
	flight: 0,
	fastTime: 0,
	screenshot: 0
};
const resetState = () => {
	const persist = [
		'fastTime'
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
	settings.style.display = isLocked ? 'none' : '';
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
		case 32:
			e.preventDefault();
			State.flight = state;
		break;
		case 79:
			if(state) {
				State.fastTime = !State.fastTime;
			}
		break;
		case 80:
			State.screenshot = state ? {} : false;
		break;
	}
};

aE(window, 'keydown', onKey);
aE(window, 'keyup', onKey);

/* Settings Menu */
const settings = cE('settings');
['antialias', 'highDPI', 'debug', 'fullscreen'].forEach((setting) => {
	if(setting === 'highDPI' && (window.devicePixelRatio || 1) < 2) return;
	if(setting === 'fullscreen' && electron) return;
	const input = cE('input', {
		type: 'checkbox',
		checked: localStorage.getItem(setting),
		onchange: () => {
			if(input.checked) localStorage.setItem(setting, 1);
			else localStorage.removeItem(setting);
			if(setting === 'fullscreen') {
				(autoFullscreen = input.checked) && !isFullScreen && requestFullScreen();
			} else window.location.reload();
		}
	})
	const label = cE('label', null, input);
	aC(label, tN(i18n[setting]));
	aC(settings, label);
});
aC(document.body, settings);
