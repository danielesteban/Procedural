import {GL, BindModel, BindTexture, UseShader} from 'Engine/Context';
import Mesh from 'Engine/Mesh';
import {FrameBuffer as Model} from 'Models';

class FrameBuffer extends Mesh {
	static Model = new Model();
	constructor() {
		super(FrameBuffer.Model);
	}
	render(textures, shader, preRender) {
		UseShader(shader);
		BindModel(null);
		BindTexture(null);
		textures.forEach((texture, i) => {
			GL.activeTexture(GL['TEXTURE' + i]);
			GL.bindTexture(GL.TEXTURE_2D, texture.buffer);
			GL.uniform1i(shader.uniforms['texture' + texture.id], i);
		});
		preRender && preRender();
		super.render(null, shader);
	}
};

export default FrameBuffer;
