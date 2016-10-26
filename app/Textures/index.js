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
	constructor(id, cubemap) {
		this.id = id
		this.buffer = GL.createTexture();
		cubemap && (this.cubemap = true);
		loading++;
	}
	onLoad(image, secondary, clamp) {
		BindTexture(null);
		const target = this.cubemap ? GL.TEXTURE_CUBE_MAP : GL.TEXTURE_2D;
		GL.bindTexture(target, secondary ? this.secondary : this.buffer);
		if(this.cubemap) {
			image.forEach(function(side, i) {
				GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, side);
			});
		} else {
			GL.texImage2D(target, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
		}
		if(this.cubemap || clamp) {
			GL.texParameteri(target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
			GL.texParameteri(target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		}
		GL.texParameteri(target, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
		GL.texParameteri(target, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
		GL.generateMipmap(target);
		if(Anisotropic) {
			GL.texParameterf(target, Anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, GL.getParameter(Anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
		}
		onLoad.data = this.id + (secondary ? 'Secondary' : '');
		window.dispatchEvent(onLoad);
		if(--loading === 0) {
			onLoad.data = 'all';
			window.dispatchEvent(onLoad);
		}
		Loader();
	}
}

class ImageTexture extends Texture {
	constructor(id) {
		super(id);
		const image = this.image = new Image();
		image.onload = () => {
			this.onLoad(image);
		};
		image.src = require('./' + id + '.jpg');
	}
}

class CubemapTexture extends Texture {
	constructor(cubemapID, images) {
		super(cubemapID, true);
		let count = images.length;
		const textures = [];
		images.forEach((id, i) => {
			const image = new Image();
			image.onload = () => {
				textures[i] = image;
				onLoad.data = cubemapID + ':' + id;
				window.dispatchEvent(onLoad);
				loading--;
				Loader();
				if(--count === 0) this.onLoad(textures);
			};
			image.src = require('./' + id + '.jpg');
			loading++;
		});
	}
}

class AtlasTexture extends Texture {
	constructor(atlasID, primary, secondary) {
		super(atlasID);
		this.secondary = GL.createTexture();
		loading++;

		let count = primary.length + secondary.length;
		const primaryTextures = [];
		const secondaryTextures = [];
		primary.concat(secondary).forEach((id, i) => {
			const image = new Image();
			image.onload = () => {
				const texture = {id, image};
				if(i < primary.length) {
					primaryTextures[i] = texture;
				} else {
					secondaryTextures[i - primary.length] = texture;
				}
				onLoad.data = atlasID + ':' + id;
				window.dispatchEvent(onLoad);
				loading--;
				Loader();
				if(--count === 0) this.pack(primaryTextures, secondaryTextures);
			};
			image.src = require('./' + id + '.png');
			loading++;
		});
	}
	pack(primaryTextures, secondaryTextures) {
		const size = 512;
		const margin = 6;
		const renderer = document.createElement('canvas');
		const ctx = renderer.getContext('2d');
		this.uvs = [];
		this.index = {};
		this.textures = primaryTextures;
		this.secondaryTextures = secondaryTextures;
		for(let j=0; j<2; j++) {
			const textures = j == 0 ? primaryTextures : secondaryTextures;
			const stride = Math.ceil(textures.length * 0.5);
			const width = Math.pow(2, Math.ceil(Math.log(stride * size) / Math.log(2)));
			const height = size * (textures.length > 1 ? 2 : 1);
			const uSize = (size - margin * 2) / width;
			const vSize = (size - margin * 2) / height;
			renderer.width = width;
			renderer.height = height;
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, renderer.width, renderer.height);
			let y = margin;
			let vStart = j + margin / height;
			textures.forEach((texture, i) => {
				const x = margin + (i % stride) * size;
				const uStart = x / width;
				if(i === stride) {
					y = size + margin;
					vStart = j + y / height;
				}
				ctx.drawImage(texture.image, x, y, size - margin * 2, size - margin * 2);
				this.uvs.push({
					u: {start: uStart, end: uStart + uSize},
					v: {start: vStart, end: vStart + vSize}
				});
				this.index[texture.id] = this.uvs.length - 1;
			});
			this.onLoad(renderer, j !== 0, true);
		}
	}
}

Loader = Loader();

//DEBUG: no textures yet.. kick the loader
Loader();
window.setTimeout(() => {
	onLoad.data = 'all';
	window.dispatchEvent(onLoad);
}, 0);
