import Mesh from 'Engine/Mesh';
import {Cloud as Model} from 'Models';
import {Cloud as Shader} from 'Shaders';
import {vec3, mat4} from 'gl-matrix';

class Cloud extends Mesh {
	constructor(origin, anchor, radius) {
		const initialOrigin = vec3.clone(origin);
		vec3.add(origin, anchor.position, origin);
		super(new Model(), Shader, origin);
		this.initialOrigin = initialOrigin;
		this.anchor = anchor;
		this.radius = radius;
		this.animation = vec3.fromValues(
			(Math.floor(Math.random() * 5) + 1) * (Math.random() >= 0.5 ? -1 : 1),
			0,
			(Math.floor(Math.random() * 5) + 1) * (Math.random() >= 0.5 ? -1 : 1),
		);
		vec3.normalize(this.animation, this.animation);
	}
	destroy() {
		super.destroy();
		this.model.destroy();
	}
	animate(delta) {
		vec3.scaleAndAdd(this.origin, this.origin, this.animation, delta);
		const anchor = vec3.fromValues(this.anchor.position[0], this.origin[1], this.anchor.position[2]);
		if(vec3.distance(this.origin, anchor) > this.radius) {
			const offset = vec3.sub(vec3.create(), this.origin, anchor);
			vec3.normalize(offset, offset);
			vec3.scaleAndAdd(this.origin, anchor, offset, -this.radius);
		}
		mat4.fromTranslation(this.transform, this.origin);
	}
	reset() {
		vec3.add(this.origin, this.anchor.position, this.initialOrigin);
		mat4.fromTranslation(this.transform, this.origin);
	}
};

export default Cloud;
