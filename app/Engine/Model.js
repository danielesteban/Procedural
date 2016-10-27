import {GL, BindModel} from './Context';
import {vec3} from 'gl-matrix';
import Ammo from 'ammo.js';

class Model {
	constructor(vertex, collision) {
		BindModel(null);
		const {position, normal, uv, color, shadow, bone, indices, points, scale, bounds} = vertex;

		scale && (this.scale = scale);
		if(collision) {
			if(collision === 'auto') this.genCollisionMesh(position, indices);
			else this.collision = collision;
		}

		if(position) {
			this.position = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, this.position);
			GL.bufferData(GL.ARRAY_BUFFER, position, GL.STATIC_DRAW);

			if(bounds !== undefined) this.bounds = bounds;
			else {
				let min = vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
				let max = vec3.fromValues(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
				for(let i=0; i<position.length; i+=3) {
					var vertex = vec3.fromValues(position[i], position[i + 1], position[i +2]);
					vec3.min(min, min, vertex);
					vec3.max(max, max, vertex);
				}
				this.bounds = {
					width: (max[0] - min[0]) * (scale ? scale[0] : 1),
					height: (max[1] - min[1]) * (scale ? scale[1] : 1),
					length: (max[2] - min[2]) * (scale ? scale[2] : 1)
				};
			}
		}

		if(normal) {
			this.normal = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, this.normal);
			GL.bufferData(GL.ARRAY_BUFFER, normal, GL.STATIC_DRAW);
		}

		if(uv) {
			this.uv = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, this.uv);
			GL.bufferData(GL.ARRAY_BUFFER, uv, GL.STATIC_DRAW);
		}

		if(color) {
			this.color = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, this.color);
			GL.bufferData(GL.ARRAY_BUFFER, color, GL.STATIC_DRAW);
		}

		if(shadow) {
			this.shadow = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, this.shadow);
			GL.bufferData(GL.ARRAY_BUFFER, shadow, GL.STATIC_DRAW);
		}

		if(bone) {
			this.bone = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, this.bone);
			GL.bufferData(GL.ARRAY_BUFFER, bone, GL.STATIC_DRAW);
		}

		if(indices) {
			this.indices = GL.createBuffer();
			GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indices);
			GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indices, GL.STATIC_DRAW);
			this.count = indices.length;
		}

		if(points) {
			this.points = GL.createBuffer();
			GL.bindBuffer(GL.ARRAY_BUFFER, this.points);
			GL.bufferData(GL.ARRAY_BUFFER, points.vertices, GL.STATIC_DRAW);
			this.count = points.count;
			this.stride = points.stride;
		}
	}
	genCollisionMesh(position, indices) {
		if(!position || !indices || !indices.length) return;

		this.collision && Ammo.destroy(this.collision);
		this.physicsMesh && Ammo.destroy(this.physicsMesh);

		this.physicsMesh = new Ammo.btTriangleMesh();
		const p1 = new Ammo.btVector3();
		const p2 = new Ammo.btVector3();
		const p3 = new Ammo.btVector3();
		for(let i=0; i<indices.length; i+=3) {
			p1.setValue(position[indices[i] * 3], position[indices[i] * 3 + 1], position[indices[i] * 3 + 2]);
			p2.setValue(position[indices[i + 1] * 3], position[indices[i + 1] * 3 + 1], position[indices[i + 1] * 3 + 2]);
			p3.setValue(position[indices[i + 2] * 3], position[indices[i + 2] * 3 + 1], position[indices[i + 2] * 3 + 2]);
			this.physicsMesh.addTriangle(
				p1, p2, p3
			);
		}
		Ammo.destroy(p1);
		Ammo.destroy(p2);
		Ammo.destroy(p3);

		this.collision = new Ammo.btBvhTriangleMeshShape(this.physicsMesh, true, true);
		if(this.scale) {
			const physicsScale = new Ammo.btVector3(this.scale[0], this.scale[1], this.scale[2]);
			this.collision.setLocalScaling(physicsScale);
			Ammo.destroy(physicsScale);
		}
	}
	destroy() {
		this.position && GL.deleteBuffer(this.position);
		this.normal && GL.deleteBuffer(this.normal);
		this.uv && GL.deleteBuffer(this.uv);
		this.color && GL.deleteBuffer(this.color);
		this.shadow && GL.deleteBuffer(this.shadow);
		this.bone && GL.deleteBuffer(this.bone);
		this.indices && GL.deleteBuffer(this.indices);
		this.points && GL.deleteBuffer(this.points);
		this.physicsMesh && Ammo.destroy(this.physicsMesh);
		this.collision && Ammo.destroy(this.collision);
		console.log(this.physicsMesh);
	}
};

export default Model;
