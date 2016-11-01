import Mesh from 'Engine/Mesh';
import {Ground as Model, Deer as DeerModel, Flower as FlowerModel, Tree as TreeModel, Wolf as WolfModel} from 'Models';
import {Ground as Shader} from 'Shaders';
import {Ground as Texture} from 'Textures';
import {Animal, Flower, Tree} from 'Meshes';
import {vec3} from 'gl-matrix';

class Ground extends Mesh {
	static Animals = [
		{
			albedo: vec3.fromValues(0.32, 0.16, 0.08),
			model: new DeerModel(0.006)
		},
		{
			albedo: vec3.fromValues(0.32, 0.30, 0.28),
			model: new WolfModel(0.006)
		}
	];
	static Flowers = [
		new FlowerModel()
	];
	static Trees = [
		new TreeModel(1.5),
		new TreeModel(2.5),
		new TreeModel(3.5)
	];
	constructor(world, noise, chunk) {
		const origin = vec3.fromValues(chunk[0] * Model.size * Model.scale, 0, chunk[1] * Model.size * Model.scale);
		super(new Model(noise, chunk), Shader, origin, null, {mass: 0, friction: 1, group: Mesh.collisionFloor}, Texture);
		this.chunk = chunk;

		const getSpawnPoint = (minY, maxY) => {
			const x = Math.floor(Math.random() * (Model.size - 1)) + 1;
			const z = Math.floor(Math.random() * (Model.size - 1)) + 1;
			const p = this.model.heightMap[x + ':' + z];
			if(p.height < minY || p.height > maxY) return false;
			const offsetX = (Math.random() * 0.2 + 0.05) * (Math.random() >= 0.5 ? 1 : -1);
			const offsetZ = (Math.random() * 0.2 + 0.05) * (Math.random() >= 0.5 ? 1 : -1);
			const normal = vec3.clone(p.normal);
			let height = p.height;
			const pX = this.model.heightMap[Math.round(x + offsetX) + ':' + z];
			vec3.add(normal, normal, pX.normal);
			height += pX.height;
			const pZ = this.model.heightMap[x + ':' + Math.round(z + offsetZ)];
			vec3.add(normal, normal, pZ.normal);
			height += pZ.height;
			const offsetP = this.model.heightMap[Math.round(x + offsetX) + ':' + Math.round(z + offsetZ)];
			vec3.add(normal, normal, offsetP.normal);
			height += offsetP.height;
			vec3.normalize(normal, normal);
			height /= 4;
			const spawn = vec3.fromValues((x + offsetX - Model.size * 0.5) * Model.scale, height, (z + offsetZ - Model.size * 0.5) * Model.scale);
			vec3.add(spawn, spawn, origin);
			return {
				origin: spawn,
				normal: normal
			};
		};

		this.trees = [];
		for(let i=0; i<2; i++) {
			const spawn = getSpawnPoint(8, 40);
			if(!spawn) continue;
			this.trees.push(new Tree(Ground.Trees[Math.floor(Math.random() * Ground.Trees.length)], spawn.origin));
		}

		this.flowers = [];
		for(let i=0; i<32; i++) {
			const spawn = getSpawnPoint(2, 30);
			if(!spawn) continue;
			this.flowers.push(new Flower(Ground.Flowers[Math.floor(Math.random() * Ground.Flowers.length)], spawn.origin, spawn.normal));
		}

		this.animals = [];
		const bounds = {
			x: origin[0] - Model.size * 0.5 * Model.scale,
			z: origin[2] - Model.size * 0.5 * Model.scale,
			width: Model.size * Model.scale,
			length: Model.size * Model.scale
		};
		for(let i=0; i<3; i++) {
			const spawn = getSpawnPoint(1, 16);
			spawn && this.animals.push(new Animal(Ground.Animals[Math.floor(Math.random() * Ground.Animals.length)], spawn.origin, world, bounds));
		}
	}
	animate(delta, camera) {
		const distance = vec3.distance(camera, this.origin);
		this.renderAnimals = distance <= 250;
		this.renderFlowers = distance <= 150;
		this.renderAnimals && this.animals.forEach((mesh) => mesh.animate(delta));
	}
	destroy() {
		super.destroy();
		this.model.destroy();
		this.trees.concat(this.flowers).concat(this.animals).forEach((mesh) => mesh.destroy());
	}
	render(camera, shader) {
		super.render(camera, shader);
		let post = [...this.trees];
		this.renderAnimals && (post = post.concat(this.animals));
		this.renderFlowers && (post = post.concat(this.flowers));
		return post;
	}
};

export default Ground;
