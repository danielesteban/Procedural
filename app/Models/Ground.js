import Model from 'Engine/Model';
import {vec3} from 'gl-matrix';
import Ammo from 'ammo.js';

class Ground extends Model {
	static size = 16;
	static scale = 3;
	constructor(noise, chunk) {
		const position = new Float32Array(Math.pow(Ground.size + 1, 2) * 3);
		const normal = new Float32Array(Math.pow(Ground.size + 1, 2) * 3);
		const indices = new Uint16Array(Math.pow(Ground.size, 2) * 3 * 2);

		let maxHeight = 0;
		const offset = [
			(chunk[0] * Ground.size - Ground.size * 0.5) * Ground.scale,
			(chunk[1] * Ground.size - Ground.size * 0.5) * Ground.scale
		];
		const getVertex = (x, z) => {
			const cX = offset[0] + x * Ground.scale;
			const cZ = offset[1] + z * Ground.scale;
			const altitude = Math.floor(Math.abs(noise.perlin2(cZ / 512, cX / 512)) * 128);
			const height = Math.min(128, Math.floor(Math.abs(noise.simplex2(cX / 256, cZ / 256)) * altitude)) * Ground.scale;
			maxHeight = Math.max(maxHeight, height);
			return vec3.fromValues(
				(x - Ground.size * 0.5) * Ground.scale,
				height,
				(z - Ground.size * 0.5) * Ground.scale
			);
		};

		let vertex = 0;
		for(let z=0;z<=Ground.size;z++)
		for(let x=0;x<=Ground.size;x++) {
			const v = getVertex(x, z);
			position[vertex++] = v[0];
			position[vertex++] = v[1];
			position[vertex++] = v[2];
		}

		let index = 0;
		const normals = [];
		const u = vec3.create();
		const v = vec3.create();
		const physicsMesh = new Ammo.btTriangleMesh(false, false);
		for(let z=0;z<Ground.size;z++)
		for(let x=0;x<Ground.size;x++) {
			const p1 = (z + 1) * (Ground.size + 1) + x;
			let p2 = (z + 1) * (Ground.size + 1) + (x + 1);
			let p3 = z * (Ground.size + 1) + x + 1;

			for(let t=0; t<2; t++) {
				indices[index++] = p1;
				indices[index++] = p2;
				indices[index++] = p3;

				const v1 = vec3.fromValues(position[p1 * 3], position[p1 * 3 + 1], position[p1 * 3 + 2]);
				const v2 = vec3.fromValues(position[p2 * 3], position[p2 * 3 + 1], position[p2 * 3 + 2]);
				const v3 = vec3.fromValues(position[p3 * 3], position[p3 * 3 + 1], position[p3 * 3 + 2]);

				physicsMesh.addTriangle(
					new Ammo.btVector3(v1[0], v1[1], v1[2]),
					new Ammo.btVector3(v2[0], v2[1], v2[2]),
					new Ammo.btVector3(v3[0], v3[1], v3[2]),
					false
				);

				vec3.subtract(u, v2, v1);
				vec3.subtract(v, v3, v1);
				const n = vec3.cross(vec3.create(), u, v);
				if(!normals[p1]) normals[p1] = [];
				normals[p1].push(n);
				if(!normals[p2]) normals[p2] = [];
				normals[p2].push(n);
				if(!normals[p3]) normals[p3] = [];
				normals[p3].push(n);

				p2 = p3;
				p3 = z * (Ground.size + 1) + x;
			}
		}

		/* Include neighbors into existing normals */
		const isNeighbor = (x, z) => (x < 0 || x > Ground.size || z < 0 || z > Ground.size);
		for(let z=-1;z<Ground.size+1;z++)
		for(let x=-1;x<Ground.size+1;x++) {
			if(z > 0 && z < Ground.size && x === 0) x = Ground.size;
			const p1 = [x, z + 1];
			let p2 = [x + 1, z + 1];
			let p3 = [x + 1, z];
			const v1 = getVertex(p1[0], p1[1]);
			let v2 = getVertex(p2[0], p2[1]);
			let v3 = getVertex(p3[0], p3[1]);
			for(let t=0; t<2; t++) {
				/* Kinda copypasta! */
				vec3.subtract(u, v2, v1);
				vec3.subtract(v, v3, v1);
				const n = vec3.cross(vec3.create(), u, v);
				!isNeighbor(p1[0], p1[1]) && normals[p1[1] * (Ground.size + 1) + p1[0]].push(n);
				!isNeighbor(p2[0], p2[1]) && normals[p2[1] * (Ground.size + 1) + p2[0]].push(n);
				!isNeighbor(p3[0], p3[1]) && normals[p3[1] * (Ground.size + 1) + p3[0]].push(n);

				p2 = p3;
				p3 = [x, z];
				v2 = v3;
				v3 = getVertex(p3[0], p3[1]);
			}
		}

		normals.forEach((normals, i) => {
			const sum = vec3.create();
			normals.forEach((vnormal) => {
				vec3.add(sum, sum, vnormal);
			});
			vec3.scale(sum, sum, 1 / normals.length);
			vec3.normalize(sum, sum);
			normal[i * 3] = sum[0];
			normal[i * 3 + 1] = sum[1];
			normal[i * 3 + 2] = sum[2];
		});

		const bounds = {
			width: Ground.size * Ground.scale,
			height: maxHeight,
			length: Ground.size * Ground.scale
		};

		const collision = new Ammo.btBvhTriangleMeshShape(physicsMesh, true, true);

		super({position, normal, indices, bounds}, collision);
		this.physicsMesh = physicsMesh;
	}
};

export default Ground;
