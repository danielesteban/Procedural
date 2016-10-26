import Dialog from 'Engine/Dialog';
import {cE, aC, aE} from 'Engine/DOM';
import i18n from 'i18n';

class Error extends Dialog {
	constructor(error, dismiss, onDismiss, title) {
		super(title || i18n.error);
		this.onDismiss = onDismiss;
		aC(this.container, this.text = cE('p', error));
		aC(this.container, this.button = cE('button', {
			text: dismiss || i18n.ok,
			type: 'submit',
			onclick: this.close
		}));
		window.setTimeout(() => this.open(), 0);
	}
	close() {
		super.close();
		this.onDismiss && this.onDismiss();
	}
}

export default Error;
