import Error from './Error';
import {cE, aC, rC, aE} from 'Engine/DOM';
import i18n from 'i18n';
import Logo from 'chrome.png';

class AskForChrome extends Error {
	static link = 'https://www.google.com/chrome/browser/desktop/index.html';
	constructor() {
		super('', null, null, i18n.worksBetterWithChrome);
		aC(this.container, 'askForChrome');
		aC(this.text, cE('a', {
			href: AskForChrome.link,
			target: '_blank'
		}, cE('img', {
			src: Logo
		})));
		rC(this.container, this.button);
		this.button = this.button.cloneNode();
		this.button.innerText = i18n.askForChrome;
		aE(this.button, 'click', (e) => window.open(AskForChrome.link, '_blank'));
		aC(this.container, this.button);
	}
}

export default AskForChrome;
