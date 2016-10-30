import {GL, UseShader, BindModel, BindTexture} from './Context';
import {vec3, mat4, mat3, quat} from 'gl-matrix';
import Ammo from 'ammo.js';

class Mesh {
	/* Collision groups */
	static collisionStatic = 1 << 0;
	static collisionDynamic = 1 << 1;
	static collisionFloor = 1 << 2;
	static collisionAll = Mesh.collisionStatic | Mesh.collisionDynamic | Mesh.collisionFloor;

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

	constructor(model, shader, origin, rotation, physics, texture) {
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

		if(physics && model.collision) {
			const physicsOrigin = new Ammo.btVector3(origin[0], origin[1], origin[2]);
			const physicsRotation = new Ammo.btQuaternion(rotation[0], rotation[1], rotation[2], rotation[3]);
			const localInertia = new Ammo.btVector3(0, 0, 0);
			if(physics.mass !== 0) model.collision.calculateLocalInertia(physics.mass, localInertia);
			this.physicsTransform = new Ammo.btTransform();
			this.physicsTransform.setIdentity();
			this.physicsTransform.setOrigin(physicsOrigin);
			this.physicsTransform.setRotation(physicsRotation);
			this.motionState = new Ammo.btDefaultMotionState(this.physicsTransform);
			const bodyInfo = new Ammo.btRigidBodyConstructionInfo(
				physics.mass,
				this.motionState,
				model.collision,
				localInertia
			);
			bodyInfo.set_m_friction(physics.friction || 0.5);
			bodyInfo.set_m_restitution(physics.restitution || 0);
			this.body = new Ammo.btRigidBody(bodyInfo);
			if(physics.kinematic) {
				const CF_KINEMATIC_OBJECT = 2;
				this.body.setCollisionFlags(this.body.getCollisionFlags() | CF_KINEMATIC_OBJECT);
				const DISABLE_DEACTIVATION = 4;
				this.body.setActivationState(DISABLE_DEACTIVATION);
			} else if(physics.mass === 0) {
				const CF_STATIC_OBJECT = 1;
				this.body.setCollisionFlags(this.body.getCollisionFlags() | CF_STATIC_OBJECT);
			}
			Ammo.destroy(bodyInfo);
			Ammo.destroy(localInertia);
			Ammo.destroy(physicsRotation);
			Ammo.destroy(physicsOrigin);
			this.collisionGroup = physics.group || (physics.mass === 0 ? Mesh.collisionStatic : Mesh.collisionDynamic);
		}
	}
	destroy() {
		if(this.body) {
			Ammo.destroy(this.body);
			Ammo.destroy(this.motionState);
			Ammo.destroy(this.physicsTransform);
		}
		if(this.constraint) {
			Ammo.destroy(this.constraint);
		}
	}
	render(camera) {
		UseShader(this.shader);
		mat4.multiply(this.cameraTransform, camera.transform, this.transform);
		GL.uniformMatrix4fv(this.shader.uniforms.transform, false, this.cameraTransform);
		if(this.shader.uniforms.modelTransform !== null) {
			GL.uniformMatrix4fv(this.shader.uniforms.modelTransform, false, this.transform);
		}
		if(this.shader.uniforms.normalTransform !== null) {
			GL.uniformMatrix3fv(this.shader.uniforms.normalTransform, false, this.normalTransform);
		}
		if(this.shader.uniforms.cameraPosition !== null) {
			GL.uniform3fv(this.shader.uniforms.cameraPosition, camera.position);
		}
		if(this.shader.uniforms.cameraDirection !== null) {
			GL.uniform3fv(this.shader.uniforms.cameraDirection, camera.direction);
		}
		if(this.albedo !== undefined && this.shader.uniforms.albedo !== null) {
			GL.uniform3fv(this.shader.uniforms.albedo, this.albedo);
		}
		if(this.alpha !== undefined && this.shader.uniforms.alpha !== null) {
			GL.uniform1f(this.shader.uniforms.alpha, this.alpha);
		}
		if(this.modifier !== undefined && this.shader.uniforms.modifier !== null) {
			GL.uniform1f(this.shader.uniforms.modifier, this.modifier);
		}
		if(this.model.scale !== undefined && this.shader.uniforms.scale !== null) {
			GL.uniform3fv(this.shader.uniforms.scale, this.model.scale);
		}
		BindModel(this.model);
		this.texture !== undefined && BindTexture(this.texture);
		this.culling !== undefined && GL.cullFace(this.culling);
		this.depthFunc && GL.depthFunc(this.depthFunc);
		this.blending && GL.enable(GL.BLEND);
		this.disableCulling && GL.disable(GL.CULL_FACE);
		if(this.model.points !== undefined) {
			GL.drawArrays(GL.POINTS, 0, this.count || this.model.count);
		} else {
			GL.drawElements(GL.TRIANGLES, this.count || this.model.count, GL.UNSIGNED_SHORT, 0);
		}
		this.disableCulling && GL.enable(GL.CULL_FACE);
		this.blending && GL.disable(GL.BLEND);
		this.depthFunc && GL.depthFunc(GL.LESS);
		this.culling !== undefined && GL.cullFace(GL.BACK);
	}
	updateTransform(force) {
		if(this.body && this.body.isActive()) {
			this.motionState.getWorldTransform(this.physicsTransform);
			const p = this.physicsTransform.getOrigin();
			const q = this.physicsTransform.getRotation();
			this.origin[0] = p.x();
			this.origin[1] = p.y();
			this.origin[2] = p.z();
			this.rotation[0] = q.x();
			this.rotation[1] = q.y();
			this.rotation[2] = q.z();
			this.rotation[3] = q.w();
		} else if(!force) {
			return;
		}
		if(this.model.scale) {
			mat4.fromRotationTranslationScale(this.transform, this.rotation, this.origin, this.model.scale);
		} else {
			mat4.fromRotationTranslation(this.transform, this.rotation, this.origin);
		}
		mat3.normalFromMat4(this.normalTransform, this.transform);
		this.updateBounds();
	}
	reset(origin, rotation) {
		this.origin = origin || this.initialOrigin;
		this.rotation = rotation || this.initialRotation;
		this.physicsTransform.setIdentity();
		const physicsOrigin = this.physicsTransform.getOrigin();
		physicsOrigin.setValue(this.origin[0], this.origin[1], this.origin[2]);
		this.physicsTransform.setOrigin(physicsOrigin);
		const physicsRotation = this.physicsTransform.getRotation();
		physicsRotation.setValue(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
		this.physicsTransform.setRotation(physicsRotation);
		this.body.setWorldTransform(this.physicsTransform);
		this.motionState.setWorldTransform(this.physicsTransform);
		const zero = new Ammo.btVector3(0, 0, 0);
		this.body.setLinearVelocity(zero);
		this.body.setAngularVelocity(zero);
		Ammo.destroy(zero);
		this.body.activate();
		this.updateTransform();
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
