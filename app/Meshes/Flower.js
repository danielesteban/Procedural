import Mesh from 'Engine/Mesh';
import {Flower as Shader} from 'Shaders';
import {Allium as AlliumTexture, Tulip as TulipTexture} from 'Textures';
import {glMatrix, vec3, quat} from 'gl-matrix';

class Flower extends Mesh {
	constructor(model, origin) {
		if(origin) {
			origin[0] += (Math.floor(Math.random() * 3) - 1) * 0.2;
			origin[1] += model.bounds.height * .5;
			origin[2] += (Math.floor(Math.random() * 3) - 1) * 0.2;
		}
		const rotation = quat.setAxisAngle(quat.create(), vec3.fromValues(0, 1, 0), Math.random() * Math.PI);
		quat.rotateX(rotation, rotation, glMatrix.toRadian(Math.floor(Math.random() * 31) - 15));
		quat.rotateZ(rotation, rotation, glMatrix.toRadian(Math.floor(Math.random() * 31) - 15));
		super(model, Shader, origin, rotation, null, Math.random() >= 0.5 ? AlliumTexture : TulipTexture);
		this.blending = this.disableCulling = this.disableDepthMask = true;
	}
};

export default Flower;
