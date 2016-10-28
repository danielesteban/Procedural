import Mesh from 'Engine/Mesh';
import {Deer as Shader} from 'Shaders';
import {glMatrix, vec3, mat4, quat} from 'gl-matrix';

class Deer extends Mesh {
	constructor(model, origin) {
		const rotation = quat.setAxisAngle(quat.create(), vec3.fromValues(0, 1, 0), glMatrix.toRadian(Math.floor(Math.random() * 361) - 180));
		quat.rotateX(rotation, rotation, glMatrix.toRadian(Math.floor(Math.random() * -21)));
		super(model, Shader, origin, rotation);
		this.albedo = vec3.fromValues(
			.32 + (Math.floor(Math.random() * 3) - 1) * 0.05,
			.16 + (Math.floor(Math.random() * 3) - 1) * 0.05,
			.08 + (Math.floor(Math.random() * 3) - 1) * 0.05
		);
		this.animation = Math.floor(Math.random() * 6);
		this.animationStep = Math.random();
	}
	animate(delta) {
		const step = this.animation === 0 || this.animation === 5 ? 0.6 : 1.2;
		if((this.animationStep += delta * step) > 1) {
			this.animationStep = 0;
			++this.animation > 5 && (this.animation = 0);
		}
		let easedAnimation
		switch(this.animation) {
			case 0:
				easedAnimation = Mesh.easeInOut(this.animationStep, 20) * -1 + 10;
				quat.rotateX(this.rotation, this.initialRotation, glMatrix.toRadian(easedAnimation));
			break;
			case 1:
				easedAnimation = Mesh.easeOut(this.animationStep, 10);
				quat.rotateX(this.rotation, this.initialRotation, glMatrix.toRadian(-10));
				quat.rotateY(this.rotation, this.rotation, glMatrix.toRadian(easedAnimation));
			break;
			case 2:
				easedAnimation = Mesh.easeIn(this.animationStep, 10);
				quat.rotateX(this.rotation, this.initialRotation, glMatrix.toRadian(-10));
				quat.rotateY(this.rotation, this.rotation, glMatrix.toRadian(10 - easedAnimation));
			break;
			case 3:
				easedAnimation = Mesh.easeOut(this.animationStep, 10) * -1;
				quat.rotateX(this.rotation, this.initialRotation, glMatrix.toRadian(-10));
				quat.rotateY(this.rotation, this.rotation, glMatrix.toRadian(easedAnimation));
			break;
			case 4:
				easedAnimation = Mesh.easeIn(this.animationStep, 10) * -1;
				quat.rotateX(this.rotation, this.initialRotation, glMatrix.toRadian(-10));
				quat.rotateY(this.rotation, this.rotation, glMatrix.toRadian(-10 - easedAnimation));
			break;
			case 5:
				easedAnimation = Mesh.easeInOut(this.animationStep, 20) * -1 + 10;
				quat.rotateX(this.rotation, this.initialRotation, glMatrix.toRadian(easedAnimation * -1));
			break;
		}
		mat4.fromRotationTranslationScale(this.transform, this.rotation, this.origin, this.model.scale);
	}
};

export default Deer;
