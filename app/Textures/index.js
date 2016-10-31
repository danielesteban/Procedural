import {GL, Anisotropic, BindTexture} from 'Engine/Context';

/* Texture loaded event */
export const LoadedEvent = 'TextureLoaded';
const onLoad = document.createEvent('Event');
onLoad.initEvent(LoadedEvent, true, true);
let loading = 0;

let Loader = () => {
	const bar = document.createElement('div');
	bar.style.position = 'absolute';
	bar.style.top = bar.style.left = '50%';
	bar.style.width = '512px';
	bar.style.marginLeft = '-256px';
	bar.style.marginTop = '-3px';
	bar.style.border = '1px solid #1a1a1a';
	const progress = document.createElement('div');
	progress.style.height = '6px';
	progress.style.backgroundColor = '#448844';
	progress.style.width = '0%';
	bar.appendChild(progress);
	document.body.appendChild(bar);
	const count = loading;
	return () => {
		progress.style.width = (count - loading) * 100 / count + '%';
		if(loading === 0) {
			window.setTimeout(() => document.body.removeChild(bar), 0);
		}
	}
};

class Texture {
	constructor(id, textures, clamp) {
		this.id = id
		this.buffers = [];
		this.textures = (textures || [id]);
		this.textures.forEach((texture, i) => {
			const image = new Image();
			this.buffers.push(GL.createTexture());
			image.onload = () => {
				this.onLoad(image, i, clamp);
			};
			image.src = require('./' + texture + '.png');
			loading++;
		});
	}
	onLoad(image, index, clamp) {
		BindTexture(null);
		GL.bindTexture(GL.TEXTURE_2D, this.buffers[index]);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
		if(clamp) {
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		}
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
		GL.generateMipmap(GL.TEXTURE_2D);
		if(Anisotropic) {
			GL.texParameterf(GL.TEXTURE_2D, Anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, GL.getParameter(Anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
		}
		onLoad.data = this.id + ':' + index;
		window.dispatchEvent(onLoad);
		if(--loading === 0) {
			onLoad.data = 'all';
			window.dispatchEvent(onLoad);
		}
		Loader();
	}
}

export const Flower = new Texture('Flower', ['Allium', 'Tulip'], true);
export const Fur = new Texture('Fur');
export const Ground = new Texture('Ground', ['Water', 'Sand', 'Grass', 'Stone', 'Snow']);

Loader = Loader();
