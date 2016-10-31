import Model from 'Engine/Model';
import {vec3} from 'gl-matrix';
import Ammo from 'ammo.js';

class Ground extends Model {
	static size = 16;
	static scale = 2;
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
			let factor = Math.abs(noise.simplex2(cX / 1024, cZ / 1024)) * 128 + 256;
			let altitude = Math.abs(noise.perlin2(cX / factor, cZ / factor)) * 512;
			altitude > 32 && (altitude = Math.floor(altitude / 2) * 2);
			altitude > 64 && (altitude = Math.ceil(altitude / 4) * 4);
			const height = Math.min(Math.max(Math.abs(noise.simplex2(cX / 512, cZ / 512) * altitude) - 3, 0), 256);
			maxHeight = Math.max(maxHeight, height);
			return vec3.fromValues(
				(x - Ground.size * 0.5) * Ground.scale,
				height,
				(z - Ground.size * 0.5) * Ground.scale
			);
		};

		let vertex = 0;
		const heightMap = {};
		for(let z=0;z<=Ground.size;z++)
		for(let x=0;x<=Ground.size;x++) {
			const v = getVertex(x, z);
			position[vertex++] = v[0];
			position[vertex++] = v[1];
			position[vertex++] = v[2];
			heightMap[x + ':' + z] = {height: v[1]};
		}

		let index = 0;
		const normals = [];
		const u = vec3.create();
		const v = vec3.create();
		const physicsMesh = new Ammo.btTriangleMesh();
		const t1 = new Ammo.btVector3();
		const t2 = new Ammo.btVector3();
		const t3 = new Ammo.btVector3();

		for(let z=0;z<Ground.size;z++)
		for(let x=0;x<Ground.size;x++) {
			const p1 = (z + 1) * (Ground.size + 1) + x;
			let p2 = (z + 1) * (Ground.size + 1) + (x + 1);
			let p3 = z * (Ground.size + 1) + x + 1;

			const v1 = vec3.fromValues(position[p1 * 3], position[p1 * 3 + 1], position[p1 * 3 + 2]);
			let v2 = vec3.fromValues(position[p2 * 3], position[p2 * 3 + 1], position[p2 * 3 + 2]);
			let v3 = vec3.create();

			t1.setValue(v1[0], v1[1], v1[2]);

			for(let t=0; t<2; t++) {
				indices[index++] = p1;
				indices[index++] = p2;
				indices[index++] = p3;

				v3[0] = position[p3 * 3];
				v3[1] = position[p3 * 3 + 1];
				v3[2] = position[p3 * 3 + 2];

				vec3.subtract(u, v2, v1);
				vec3.subtract(v, v3, v1);
				const n = vec3.cross(vec3.create(), u, v);
				vec3.normalize(n, n);
				if(!normals[p1]) normals[p1] = [];
				normals[p1].push(n);
				if(!normals[p2]) normals[p2] = [];
				normals[p2].push(n);
				if(!normals[p3]) normals[p3] = [];
				normals[p3].push(n);

				t2.setValue(v2[0], v2[1], v2[2]);
				t3.setValue(v3[0], v3[1], v3[2]);
				physicsMesh.addTriangle(
					t1, t2, t3
				);

				p2 = p3;
				vec3.copy(v2, v3);
				p3 = z * (Ground.size + 1) + x;
			}
		}
		Ammo.destroy(t1);
		Ammo.destroy(t2);
		Ammo.destroy(t3);

		/* Include neighbors into existing normals */
		const isNeighbor = (x, z) => (x < 0 || x > Ground.size || z < 0 || z > Ground.size);
		for(let z=-1;z<Ground.size+1;z++)
		for(let x=-1;x<Ground.size+1;x++) {
			if(x === 0 && z > -1 && z < Ground.size) x = Ground.size;
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
				vec3.normalize(n, n);
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
			normals.forEach((vnormal) => vec3.add(sum, sum, vnormal));
			vec3.normalize(sum, sum);
			normal[i * 3] = sum[0];
			normal[i * 3 + 1] = sum[1];
			normal[i * 3 + 2] = sum[2];
			heightMap[i % (Ground.size + 1) + ':' + Math.floor(i / (Ground.size + 1))].normal = sum;
		});

		const bounds = {
			width: Ground.size * Ground.scale,
			height: maxHeight,
			length: Ground.size * Ground.scale
		};

		const collision = new Ammo.btBvhTriangleMeshShape(physicsMesh, true, true);

		super({position, normal, indices, bounds}, collision);
		this.physicsMesh = physicsMesh;
		this.heightMap = heightMap;
	}
};

export default Ground;
