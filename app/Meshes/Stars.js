import Mesh from 'Engine/Mesh';
import {PointCloud as Model} from 'Models';
import {Stars as Shader} from 'Shaders';
import {glMatrix, vec3, mat4, quat} from 'gl-matrix';

class Stars extends Mesh {
	constructor() {
		super(new Model(16384, 1024, true, true), Shader);
		this.blending = true;
		this.modifier = 1;
		this.animation = {
			angle: 0,
			speed: 0.25,
			vector: vec3.fromValues(0, .5, .75)
		};
	}
	destroy() {
		super.destroy();
		this.model.destroy();
	}
	animate(delta) {
		if(this.modifier === 0) return;
		this.animation.angle += this.animation.speed * delta;
		if(this.animation.angle >= 360) this.animation.angle -= 360;
		quat.setAxisAngle(quat.identity(this.rotation), this.animation.vector, glMatrix.toRadian(this.animation.angle));
	}
	render(camera, shader) {
		if(shader) return;
		if(this.modifier === 0) return;
		mat4.fromRotationTranslation(this.transform, this.rotation, camera.translation);
		super.render(camera);
	}
};

export default Stars;
