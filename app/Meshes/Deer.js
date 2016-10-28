import Mesh from 'Engine/Mesh';
import {Deer as Shader} from 'Shaders';
import {glMatrix, vec3, quat} from 'gl-matrix';

class Deer extends Mesh {
	constructor(model, origin) {
		const rotation = quat.setAxisAngle(quat.create(), vec3.fromValues(0, 1, 0), glMatrix.toRadian(Math.floor(Math.random() * 361) - 180));
		quat.rotateX(rotation, rotation, glMatrix.toRadian(Math.floor(Math.random() * 31) - 15));
		super(model, Shader, origin, rotation);
		this.albedo = vec3.fromValues(
			.32 + (Math.floor(Math.random() * 3) - 1) * 0.05,
			.16 + (Math.floor(Math.random() * 3) - 1) * 0.05,
			.08 + (Math.floor(Math.random() * 3) - 1) * 0.05
		);
	}
};

export default Deer;
