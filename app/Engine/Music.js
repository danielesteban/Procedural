import {cE, aC, aE} from './DOM';

class Music {
	static Tracks = 8;
	constructor() {
		this.player = cE('audio');
		this.player.style.display = 'none';
		aC(document.body, this.player);
		this.next = this.next.bind(this);
		aE(this.player, 'ended', this.next);
	}
	reset() {
		this.pause();
		this.player.src = '';
		this.current = 1;
	}
	play() {
		this.reset();
		const track = (this.current < 99 ? '0' : '') + (this.current < 9 ? '0' : '') + this.current;
		this.player.src = require('Music/' + track + '.ogg');
		this.player.play();
	}
	pause() {
		this.player.pause();
	}
	next() {
		++this.current > Music.Tracks && (this.current = 0);
		this.play();
	}
}

export default new Music();
