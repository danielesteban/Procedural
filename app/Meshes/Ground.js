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
	constructor(noise, chunk) {
		const origin = vec3.fromValues(chunk[0] * Model.size * Model.scale, 0, chunk[1] * Model.size * Model.scale);
		super(new Model(noise, chunk), Shader, origin, null, Texture);
		this.chunk = chunk;

		const getSpawnPoint = (minY, maxY) => {
			const x = (Math.floor(Math.random() * (Model.size - 1)) + 1 + Math.random() - 0.5 - Model.size * 0.5) * Model.scale;
			const z = (Math.floor(Math.random() * (Model.size - 1)) + 1 + Math.random() - 0.5 - Model.size * 0.5) * Model.scale;
			const hit = this.model.testPoint(x, z);
			if(!hit) return;
			const {height, normal} = hit;
			if(height < minY || height > maxY) return false;
			const spawn = vec3.fromValues(x, height, z);
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
			spawn && this.animals.push(new Animal(Ground.Animals[Math.floor(Math.random() * Ground.Animals.length)], spawn.origin, this, bounds));
		}
	}
	animate(delta, camera) {
		const distance = vec3.distance(camera, this.origin);
		this.renderAnimals = distance <= 250;
		this.renderFlowers = distance <= 150;
		this.renderAnimals && this.animals.forEach((mesh) => mesh.animate(delta));
	}
	destroy() {
		this.model.destroy();
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
