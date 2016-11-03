import {GL, UseShader} from 'Engine/Context';
import Mesh from 'Engine/Mesh';
import {Flower as Shader} from 'Shaders';
import {Flower as Texture} from 'Textures';
import {glMatrix, vec3, quat} from 'gl-matrix';

class Flower extends Mesh {
	constructor(model, origin, normal) {
		origin && (origin[1] += model.bounds.height * .5);
		const rotation = quat.setAxisAngle(quat.create(), vec3.fromValues(0, 1, 0), Math.random() * Math.PI);
		quat.rotateX(rotation, rotation, glMatrix.toRadian(Math.floor(Math.random() * 31) - 15));
		quat.rotateZ(rotation, rotation, glMatrix.toRadian(Math.floor(Math.random() * 31) - 15));
		super(model, Shader, origin, rotation, Texture);
		this.blending = this.disableDepthMask = true;
		this.flower = Math.random() >= 0.5 ? 1 : 2;
		this.groundNormal = normal;
	}
	render(camera, shader) {
		if(!shader) {
			UseShader(this.shader);
			GL.uniform1f(this.shader.uniforms.texture, this.flower);
			GL.uniform3fv(this.shader.uniforms.groundNormal, this.groundNormal);
		}
		super.render(camera);
	}
};

export default Flower;
