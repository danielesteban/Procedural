import Dialog from 'Engine/Dialog';
import {cE, aC, aE} from 'Engine/DOM';
import i18n from 'i18n';

class Controls extends Dialog {
	constructor() {
		super(i18n.controls);
		aC(this.container, 'controls');
		let col = cE('col', {className: 'left'});
		const action = (name, keys, width) => {
			const row = cE('row', null, cE('label', name));
			(Array.isArray(keys) ? keys : [keys]).forEach((key) => {
				aC(row, key = cE('key', key));
				width && (key.style.width = width + 'px');
			});
			aC(col, row);
		};

		aC(this.container, col);
		action(i18n.controlsScreenshot, 'P');
		action(i18n.controlsGIF, 'L');
		action(i18n.controlsFastTime, 'O');
		col = cE('col');
		action(i18n.controlsMove, ['W', 'A', 'S', 'D']);
		action(i18n.controlsFlight, 'SPACEBAR', 215);
		action(i18n.controlsNightVision, 'F');
		aC(this.container, col);
	}
}

export default Controls;
