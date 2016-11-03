import {GL, UseShader, BindModel, BindTexture} from './Context';
import {vec3, mat4, mat3, quat} from 'gl-matrix';

class Mesh {
	/* Easing functions */
	static easeLinear = (t, c) => (c * t);
	static easeIn = (t, c) => (c * t * t);
	static easeOut = (t, c) => (-c * t * (t - 2));
	static easeInOut = (t, c) => {
		t /= 0.5;
		if(t < 1) return c / 2 * t * t;
		t--;
		return -c / 2 * (t * (t - 2) - 1);
	}

	constructor(model, shader, origin, rotation, texture) {
		this.model = model;
		this.shader = shader;
		this.texture = texture;

		this.origin = origin = origin || vec3.create();
		this.initialOrigin = vec3.clone(this.origin);
		this.rotation = rotation = rotation || quat.create();
		this.initialRotation = quat.clone(this.rotation);
		this.transform = mat4.create();
		if(model.scale) {
			mat4.fromRotationTranslationScale(this.transform, rotation, origin, model.scale);
		} else {
			mat4.fromRotationTranslation(this.transform, rotation, origin);
		}
		this.updateBounds();

		this.normalTransform = mat3.create();
		mat3.normalFromMat4(this.normalTransform, this.transform);
		this.cameraTransform = mat4.create();
	}
	render(camera, shader) {
		shader = shader || this.shader;
		UseShader(shader);
		if(camera) {
			mat4.multiply(this.cameraTransform, camera.transform, this.transform);
			GL.uniformMatrix4fv(shader.uniforms.transform, false, this.cameraTransform);
		}
		if(shader.uniforms.modelTransform !== null) {
			GL.uniformMatrix4fv(shader.uniforms.modelTransform, false, this.transform);
		}
		if(shader.uniforms.normalTransform !== null) {
			GL.uniformMatrix3fv(shader.uniforms.normalTransform, false, this.normalTransform);
		}
		if(camera && shader.uniforms.cameraPosition !== null) {
			GL.uniform3fv(shader.uniforms.cameraPosition, camera.position);
		}
		if(camera && shader.uniforms.cameraDirection !== null) {
			GL.uniform3fv(shader.uniforms.cameraDirection, camera.direction);
		}
		if(this.albedo !== undefined && shader.uniforms.albedo !== null) {
			GL.uniform3fv(shader.uniforms.albedo, this.albedo);
		}
		if(this.alpha !== undefined && shader.uniforms.alpha !== null) {
			GL.uniform1f(shader.uniforms.alpha, this.alpha);
		}
		if(this.modifier !== undefined && shader.uniforms.modifier !== null) {
			GL.uniform1f(shader.uniforms.modifier, this.modifier);
		}
		if(this.model.scale !== undefined && shader.uniforms.scale !== null) {
			GL.uniform3fv(shader.uniforms.scale, this.model.scale);
		}
		BindModel(this.model);
		this.texture !== undefined && BindTexture(this.texture);
		this.culling !== undefined && GL.cullFace(this.culling);
		this.depthFunc && GL.depthFunc(this.depthFunc);
		this.blending && GL.enable(GL.BLEND);
		this.disableCulling && GL.disable(GL.CULL_FACE);
		this.disableDepthMask && GL.depthMask(false);
		if(this.model.points !== undefined) {
			GL.drawArrays(GL.POINTS, 0, this.count || this.model.count);
		} else {
			GL.drawElements(GL.TRIANGLES, this.count || this.model.count, GL.UNSIGNED_SHORT, 0);
		}
		this.disableDepthMask && GL.depthMask(true);
		this.disableCulling && GL.enable(GL.CULL_FACE);
		this.blending && GL.disable(GL.BLEND);
		this.depthFunc && GL.depthFunc(GL.LESS);
		this.culling !== undefined && GL.cullFace(GL.BACK);
	}
	updateBounds() {
		if(!this.model.bounds) return;

		const bounds = [
			this.origin
		];
		for(let i=0; i<8; i++) {
			const corner = vec3.fromValues(
				this.model.bounds.width * (i % 2 == 0 ? -0.5 : 0.5),
				this.model.bounds.height * (i < 4 ? -0.5 : 0.5),
				this.model.bounds.length * (i % 4 < 2 ? -0.5 : 0.5)
			);
			vec3.transformQuat(corner, corner, this.rotation);
			vec3.add(corner, this.origin, corner);
			bounds.push(corner);
		}

		this.bounds = bounds;
	}
};

export default Mesh;
