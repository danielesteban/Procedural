import Mesh from 'Engine/Mesh';
import {Ground as Model} from 'Models';
import {Ground as Shader} from 'Shaders';
import {Grass as Texture} from 'Textures';
import {vec3} from 'gl-matrix';

class Ground extends Mesh {
	constructor(noise, chunk) {
		const origin = vec3.fromValues(chunk[0] * Model.size * Model.scale, 0, chunk[1] * Model.size * Model.scale);
		super(new Model(noise, chunk), Shader, origin, null, {mass: 0, friction: 1, group: Mesh.collisionFloor}, Texture);
		this.chunk = chunk;
	}
	destroy() {
		super.destroy();
		this.model.destroy();
	}
};

export default Ground;
