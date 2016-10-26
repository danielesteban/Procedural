import {PixelRatio} from 'Engine/Context';
import Model from 'Engine/Model';
import {vec3} from 'gl-matrix';

class PointCloud extends Model {
	constructor(count, radius, size, alpha) {
		const attributes = 3 + (size ? 1 : 0) + (alpha ? 1 : 0);
		const vertices = new Float32Array(count * attributes);
		const stride = Float32Array.BYTES_PER_ELEMENT * attributes;
		for(let i=0; i<count; i++) {
			var pos = vec3.fromValues(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
			vec3.normalize(pos, pos);
			radius && vec3.scale(pos, pos, radius * (1 + Math.random() * 0.25));

			var vertex = i * attributes;
			vertices[vertex] = pos[0];																							// x
			vertices[vertex + 1] = pos[1];																					// y
			vertices[vertex + 2] = pos[2];																					// z
			size && (vertices[vertex + 3] = 1 + Math.random() * 0.25 * PixelRatio);	// size
			alpha && (vertices[vertex + 4] = 0.2 + Math.random() * 0.6);						// alpha
		}
		super({points: {vertices, count, stride}});
	}
};

export default PointCloud;
