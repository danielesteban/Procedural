import {GL, UseShader} from 'Engine/Context';
import Mesh from 'Engine/Mesh';
import {Skybox as Model} from 'Models';
import {Skybox as Shader} from 'Shaders';
import {vec3, mat4} from 'gl-matrix';

class Skybox extends Mesh {
	constructor() {
		super(new Model(), Shader);
		this.depthFunc = GL.LEQUAL;
	}
	destroy() {
		super.destroy();
		this.model.destroy();
	}
	render(camera, shader) {
		if(shader) return;
		mat4.fromTranslation(this.transform, camera.translation);
		super.render(camera);
	}
};

export default Skybox;
