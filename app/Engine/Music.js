import {cE, aC, aE} from './DOM';

class Music {
	constructor() {
		this.player = cE('audio');
		this.player.style.display = 'none';
		aC(document.body, this.player);
		this.next = this.next.bind(this);
		aE(this.player, 'ended', this.next);
		this.current = 1;
	}
	play() {
		if(this.current > MUSIC_TRACKS) return;
		const track = (this.current < 99 ? '0' : '') + (this.current < 9 ? '0' : '') + this.current;
		this.player.src = require('Music/' + track + '.ogg');
		this.player.play();
	}
	next() {
		++this.current > MUSIC_TRACKS && (this.current = 0);
		this.play();
	}
	reset() {
		this.player.pause();
		this.player.src = '';
		this.current = 1;
	}
	toggle() {
		if(!this.player.paused) this.player.pause()
		else if(!this.player.src) this.play();
		else this.player.play();
	}
}

export default new Music();
