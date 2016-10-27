import Mesh from 'Engine/Mesh';
import {Ground as Model, Tree as TreeModel} from 'Models';
import {Ground as Shader} from 'Shaders';
import {Ground as Texture} from 'Textures';
import {Tree} from 'Meshes';
import {vec3} from 'gl-matrix';

class Ground extends Mesh {
	static Trees = [
		new TreeModel(2),
		new TreeModel(3),
		new TreeModel(4)
	];
	constructor(noise, chunk) {
		const origin = vec3.fromValues(chunk[0] * Model.size * Model.scale, 0, chunk[1] * Model.size * Model.scale);
		super(new Model(noise, chunk), Shader, origin, null, {mass: 0, friction: 1, group: Mesh.collisionFloor}, Texture);
		this.chunk = chunk;
		this.trees = [];
		for(let i=0; i<2; i++) {
			const x = Math.floor(Math.random() * (Model.size + 1));
			const z = Math.floor(Math.random() * (Model.size + 1));
			const y = this.model.heightMap[x + ':' + z];
			if(y < 16 || y > 48) continue;
			const tree = vec3.fromValues((x - Model.size * 0.5) * Model.scale, y, (z - Model.size * 0.5) * Model.scale);
			vec3.add(tree, tree, origin);
			this.trees.push(new Tree(Ground.Trees[Math.floor(Math.random() * 3)], tree));
		}
	}
	render(camera) {
		super.render(camera);
		return this.trees;
	}
	destroy() {
		super.destroy();
		this.model.destroy();
	}
};

export default Ground;
