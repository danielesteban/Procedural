import Mesh from 'Engine/Mesh';
import {Animal as Shader} from 'Shaders';
import {Fur as Texture} from 'Textures';
import {glMatrix, vec3, mat3, mat4, quat} from 'gl-matrix';

class Animal extends Mesh {
	constructor({model, albedo}, origin, ground, bounds) {
		super(model, Shader, origin, null, Texture);
		this.albedo = vec3.clone(albedo);
		this.albedo[0] += (Math.floor(Math.random() * 3) - 1) * 0.05;
		this.albedo[1] += (Math.floor(Math.random() * 3) - 1) * 0.05;
		this.albedo[2] += (Math.floor(Math.random() * 3) - 1) * 0.05;
		this.ground = ground;
		this.animationBounds = bounds;
		this.tilt = 0;
		this.pitch = 0;
		this.speed = Math.floor(Math.random() * 2) + 1;
		this.resetAnimation();
	}
	resetAnimation() {
		if(Math.abs(this.pitch) <= 0.01 && Math.random() <= 0.3) {
			this.animation = {chill: Math.floor(Math.random() * 10) + 1};
			this.speed = Math.floor(Math.random() * 2) + 1;
			return;
		}

		const destination = {
			x: this.animationBounds.x + Math.floor(Math.random() * this.animationBounds.width),
			z: this.animationBounds.z + Math.floor(Math.random() * this.animationBounds.length)
		};
		const dx = destination.x - this.origin[0];
		const dz = destination.z - this.origin[2];
		const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2));
		const tilt = Math.atan2(dz, dx);
		const direction = vec3.fromValues(Math.cos(tilt), 0, Math.sin(tilt));
		this.animation = {
			destination, direction, distance,
			tilt
		};
	}
	animate(delta) {
		if(this.animation.chill !== undefined) {
			return ((this.animation.chill -= delta) <= 0) && this.resetAnimation();
		}

		let done = false;
		const step = delta * this.speed;
		const prevY = this.origin[1];
		if((this.animation.distance -= step) <= 0) {
			this.origin[0] = this.animation.destination.x;
			this.origin[2] = this.animation.destination.z;
			done = true;
		} else {
			vec3.scaleAndAdd(this.origin, this.origin, this.animation.direction, step);
		}

		const hit = this.ground.model.testPoint(this.origin[0] - this.ground.origin[0], this.origin[2] - this.ground.origin[2]);
		if(hit) {
			hit.height < 0.01 && (hit.height = this.model.bounds.height * -0.5);
			const yDiff = hit.height - this.origin[1];
			this.origin[1] += Math.min(Math.max(yDiff, -step), step);
		}

		let tiltDiff = this.animation.tilt - this.tilt;
		while(tiltDiff < -Math.PI) tiltDiff += Math.PI * 2;
		while(tiltDiff > Math.PI) tiltDiff -= Math.PI * 2;
		this.tilt += Math.min(Math.max(tiltDiff, -step), step);
		quat.rotateY(this.rotation, this.initialRotation, Math.PI * 0.5 - this.tilt);
		const pitchDiff = Math.atan2(prevY - this.origin[1], step) - this.pitch;
		this.pitch += Math.min(Math.max(pitchDiff, step * -0.75), step * 0.75);
		quat.rotateX(this.rotation, this.rotation, this.pitch);

		mat4.fromRotationTranslationScale(this.transform, this.rotation, this.origin, this.model.scale);
		mat3.normalFromMat4(this.normalTransform, this.transform);

		this.updateBounds();

		done && this.resetAnimation();
	}
};

export default Animal;
