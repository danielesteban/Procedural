import Mesh from 'Engine/Mesh';
import {Tree as Shader} from 'Shaders';
import {glMatrix, vec3, quat} from 'gl-matrix';

class Tree extends Mesh {
	constructor(model, origin) {
		origin && (origin[1] += model.bounds.length * .3);
		const rotation = quat.setAxisAngle(quat.create(), vec3.fromValues(1, 0, 0), glMatrix.toRadian(-90 + Math.floor(Math.random() * 31) - 15));
		super(model, Shader, origin, rotation);
	}
};

export default Tree;
