import {GL, Debug, ResizeEvent} from './Context';
import {State as Input} from './Input';
import {glMatrix, vec3, mat4} from 'gl-matrix';
import Mesh from './Mesh';
import Ammo from 'ammo.js';

class Camera {
	constructor(level) {
		/* Camera */
		this.height = 2;
		this.cameraOffset = this.height * 0.375;
		this.fov = glMatrix.toRadian(75);
		this.tilt = glMatrix.toRadian(270);
		this.pitch = glMatrix.toRadian(-15);
		this.projection = mat4.create();
		this.position = vec3.fromValues(Math.floor(Math.random() * 1024) - 1024, this.height * 0.5 + this.cameraOffset, Math.floor(Math.random() * 1024) - 1024);
		this.front = vec3.create();
		this.right = vec3.create();
		this.up = vec3.create();
		this.worldFront = vec3.create();
		this.worldRight = vec3.create();
		this.worldUp = vec3.fromValues(0, 1, 0);
		this.transform = mat4.create();
		this.view = mat4.create();

		/* WebVR */
		if(navigator.getVRDisplays) {
			navigator.getVRDisplays().then((displays) => {
				if(!displays.length) return;
				this.VRDisplay = displays[0];
				this.VRView = mat4.create();
				this.VRProjections = [
					mat4.perspectiveFromFieldOfView(mat4.create(), this.VRDisplay.leftEyeParameters.fieldOfView, this.VRDisplay.depthNear, this.VRDisplay.depthFar),
					mat4.perspectiveFromFieldOfView(mat4.create(), this.VRDisplay.rightEyeParameters.fieldOfView, this.VRDisplay.depthNear, this.VRDisplay.depthFar)
				];
				this.VROffsets = [
					this.VRDisplay.leftEyeParameters.offset,
					this.VRDisplay.rightEyeParameters.offset
				];
				this.VRPositions = [
					vec3.create(),
					vec3.create()
				];
				this.VRTransforms = [
					mat4.create(),
					mat4.create()
				];
			});
		}

		this.onResize = this.onResize.bind(this);
		window.addEventListener(ResizeEvent, this.onResize);
		this.setAspect(GL.drawingBufferWidth / GL.drawingBufferHeight);
		this.updateVectors();

		this.level = level;
		Input.flight = true;
	}
	destroy() {
		window.removeEventListener(ResizeEvent, this.onResize);
	}
	onResize() {
		this.setAspect(GL.drawingBufferWidth / GL.drawingBufferHeight);
		this.updateTransform();
	}
	setAspect(aspect) {
		this.aspect = aspect;
		/* Camera projection */
		mat4.perspective(this.projection, this.fov, this.aspect, 0.01, 2000);
	}
	updateVectors() {
		const lookAt = vec3.fromValues(
			Math.cos(this.tilt) * Math.cos(this.pitch),
			Math.sin(this.pitch),
			Math.sin(this.tilt) * Math.cos(this.pitch)
		);

		vec3.normalize(this.front, lookAt);
		vec3.cross(this.right, this.front, this.worldUp);
		vec3.normalize(this.right, this.right);
		vec3.cross(this.up, this.right, this.front);
		vec3.normalize(this.up, this.up);

		vec3.normalize(this.worldFront, vec3.fromValues(lookAt[0], 0, lookAt[2]));
		vec3.cross(this.worldRight, this.worldFront, this.worldUp);
		vec3.normalize(this.worldRight, this.worldRight);

		this.updateTransform();
	}
	updateTransform() {
		if(this.VRDisplay) {
			const VRPosition = vec3.add(vec3.create(), this.position, this.VRDisplay.pose.position);
			mat4.fromRotationTranslation(this.VRView, this.VRDisplay.pose.orientation, VRPosition);
			for(let eye=0; eye<2; eye++) {
				mat4.translate(this.VRTransforms[eye], this.VRView, this.VROffsets[eye]);
				mat4.invert(this.VRTransforms[eye], this.VRTransforms[eye]);
				mat4.multiply(this.VRTransforms[eye], this.VRProjections[eye], this.VRTransforms[eye]);
				vec3.add(this.VRPositions[eye], VRPosition, this.VROffsets[eye]);
			}
		} else {
			const lookAt = vec3.add(vec3.create(), this.position, this.front);
			mat4.lookAt(this.view, this.position, lookAt, this.worldUp);
			mat4.multiply(this.transform, this.projection, this.view);
		}
		Debug && Debug.updatePosition([this.position[0], this.position[1] - this.cameraOffset - this.height * 0.5, this.position[2]]);
	}
	processInput(delta) {
		/* Movement */
		let updatePos = false;
		const speed = Input.flight ? 32 : (Input.run ? 12 : 6);
		const step = speed * delta;

		/* Keyboard */
		const keystroke = Input.forward || Input.backward || Input.left || Input.right;
		if(Input.flight || keystroke) {
			(Input.flight || Input.forward) && vec3.scaleAndAdd(this.position, this.position, this.worldFront, step);
			Input.backward && vec3.scaleAndAdd(this.position, this.position, this.worldFront, -step);
			Input.left && vec3.scaleAndAdd(this.position, this.position, this.worldRight, -step);
			Input.right && vec3.scaleAndAdd(this.position, this.position, this.worldRight, step);
			updatePos = true;
			keystroke && (Input.flight = false);
		}

		/* Pull to floor level */
		const floorY = this.getFloorY();
		const floorDiff = Math.max(floorY + (Input.flight ? 10 : 0), Input.flight ? 30 : 0) - this.position[1];
		if(Math.abs(floorDiff) > 0.0001) {
			this.position[1] += Math.min(Math.max(floorDiff, -step), floorY > this.position[1] + (Input.flight ? step * 4 : 0) ? floorDiff : step * 0.6);
			updatePos = true;
		}

		if(this.VRDisplay) {
			/* Hacky! */
			const q = this.VRDisplay.pose.orientation;
			this.tilt = -2 * Math.atan2(q[1], q[3]) - Math.PI * 0.5;
			this.pitch = 0;
			return this.updateVectors();
		}

		/* Mouse look */
		if(Input.movementX === 0 && Input.movementY === 0) {
			if(updatePos) return this.updateTransform();
			return;
		}

		const sensitivity = 0.0025;
		const maxTilt = glMatrix.toRadian(360);
		const maxPitch = glMatrix.toRadian(85);

		if(Input.movementX != 0) {
			this.tilt += Input.movementX * sensitivity;
			Input.movementX = 0;
			if(this.tilt < 0) this.tilt += maxTilt;
			if(this.tilt > maxTilt) this.tilt -= maxTilt;
		}

		if(Input.movementY != 0) {
			this.pitch += Input.movementY * -sensitivity;
			Input.movementY = 0;
			if(this.pitch > maxPitch) this.pitch = maxPitch;
			if(this.pitch < -maxPitch) this.pitch = -maxPitch;
		}

		this.updateVectors();
	}
	rayTest(fromX, fromY, fromZ, toX, toY, toZ, mask) {
		let result = false;
		const from = new Ammo.btVector3(this.position[0] + fromX, this.position[1] + fromY, this.position[2] + fromZ);
		const to = new Ammo.btVector3(this.position[0] + toX, this.position[1] + toY, this.position[2] + toZ);
		const rayResult = new Ammo.ClosestRayResultCallback(from, to);
		rayResult.set_m_collisionFilterMask(mask || (Mesh.collisionStatic | Mesh.collisionElevator));
		this.level.world.rayTest(from, to, rayResult);
		if(rayResult.hasHit()) {
			result = rayResult;
		}
		Ammo.destroy(to);
		Ammo.destroy(from);
		return result;
	}
	getFloorY(ceiling) {
		/* Get the closest floor plane at camera position */
		const ray = this.rayTest(
			0, this.height * 0.25 - this.cameraOffset, 0,		// from
			0, 200 * (ceiling ? 1 : -1), 0,									// to
			Mesh.collisionFloor
		);
		if(!ray) return (!ceiling ? this.getFloorY(true) : this.position[1]);
		const floorY = ray.get_m_hitPointWorld().y() + this.height * 0.5 + this.cameraOffset;
		Ammo.destroy(ray);
		return floorY;
	}
	inFustrum(mesh) {
		/* 2D Frustum culling */
		if(!mesh.bounds) return true;
		const origin = vec3.scaleAndAdd(vec3.create(), this.position, this.front, -8);
		for(let i=0; i<mesh.bounds.length; i++) {
			let angle = Math.atan2(mesh.bounds[i][2] - origin[2], mesh.bounds[i][0] - origin[0]) - this.tilt;
			while(angle > Math.PI) angle -= Math.PI * 2;
			while(angle < -Math.PI) angle += Math.PI * 2;
			if(Math.abs(angle) < Math.PI * 0.5) return true;
		}
	}
}

export default Camera;
