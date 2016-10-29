import Mesh from 'Engine/Mesh';
import {Ground as Model, Deer as DeerModel, Tree as TreeModel} from 'Models';
import {Ground as Shader} from 'Shaders';
import {Ground as Texture} from 'Textures';
import {Deer, Tree} from 'Meshes';
import {vec3} from 'gl-matrix';

class Ground extends Mesh {
	static Trees = [
		new TreeModel(2),
		new TreeModel(3),
		new TreeModel(4)
	];
	static Deers = [
		new DeerModel(0.01)
	];
	constructor(world, noise, chunk) {
		const origin = vec3.fromValues(chunk[0] * Model.size * Model.scale, 0, chunk[1] * Model.size * Model.scale);
		super(new Model(noise, chunk), Shader, origin, null, {mass: 0, friction: 1, group: Mesh.collisionFloor}, Texture);
		this.chunk = chunk;

		const getSpawnPoint = (minY, maxY) => {
			const x = Math.floor(Math.random() * (Model.size + 1));
			const z = Math.floor(Math.random() * (Model.size + 1));
			const y = this.model.heightMap[x + ':' + z];
			if(y < minY || y > maxY) return false;
			const floor = vec3.fromValues((x - Model.size * 0.5) * Model.scale, y, (z - Model.size * 0.5) * Model.scale);
			vec3.add(floor, floor, origin);
			return floor;
		};

		this.trees = [];
		for(let i=0; i<2; i++) {
			const spawn = getSpawnPoint(16, 48);
			if(!spawn) continue;
			this.trees.push(new Tree(Ground.Trees[Math.floor(Math.random() * 3)], spawn));
		}
		this.deers = [];
		const bounds = {
			x: origin[0] - Model.size * 0.5 * Model.scale,
			z: origin[2] - Model.size * 0.5 * Model.scale,
			width: Model.size * Model.scale,
			length: Model.size * Model.scale
		};
		if(!this.trees.length) {
			const spawn = getSpawnPoint(1, 16);
			spawn && this.deers.push(new Deer(Ground.Deers[0], spawn, world, bounds));
		}
	}
	animate(delta) {
		this.deers.forEach((mesh) => mesh.animate(delta));
	}
	destroy() {
		super.destroy();
		this.model.destroy();
		this.trees.concat(this.deers).forEach((mesh) => mesh.destroy());
	}
	render(camera) {
		super.render(camera);
		return this.trees.concat(this.deers);
	}
};

export default Ground;
