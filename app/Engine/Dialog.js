import {cE, aC, rC, aE, rE} from './DOM';
import {Capture} from './Input';

class Dialog {
	constructor(title) {
		this.overlay = cE('overlay');
		this.container = cE('dialog');
		aC(this.container, this.header = cE('header', title));
		this.close = this.close.bind(this);
		this.keydown = this.keydown.bind(this);
		this.opened = false;
		aC(this.overlay, this.container);
	}
	open() {
		if(this.opened) return;
		this.opened = true;
		const isFirst = !document.body.getElementsByTagName('overlay').length;
		aC(document.body, this.overlay);
		!this.modal && aE(this.overlay, 'click', (e) => e.target === this.overlay && this.close());
		isFirst && Capture({enabled: false, lock: false});
		aE(window, 'keydown', this.keydown);
		window.setTimeout(() => {
			aC(this.overlay, 'open');
		}, 0);
	}
	close() {
		if(!this.opened || this.closing) return;
		this.closing = true;
		rC(this.overlay, 'open');
		!this.modal && rE(this.overlay, 'click', this.close);
		rE(window, 'keydown', this.keydown);
		const transitionend = () => {
			rE(this.overlay, 'transitionend', transitionend);
			rC(document.body, this.overlay);
			const isLast = !document.body.getElementsByTagName('overlay').length;
			isLast && Capture({enabled: true, lock: true});
			this.opened = this.closing = false;
		};
		aE(this.overlay, 'transitionend', transitionend);
	}
	keydown(e) {
		/* Close with escape */
		!this.modal && !e.repeat && e.keyCode === 27 && this.close();
	}
}

export default Dialog;
