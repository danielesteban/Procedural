import Model from 'Engine/Model';
import Ammo from 'ammo.js';

class Flower extends Model {
	constructor() {
		const width = 0.2;
		const height = 0.4;
		const uvW = [0.25, 0.75];
		const uvH = [0.0, 1.0];

		const position = new Float32Array([
			-width,		-height,		0,
			width,		-height,		0,
			width,		height,			0,
			-width,		height,			0,

			width,		-height,		0,
			-width,		-height,		0,
			-width,		height,			0,
			width,		height,			0,

			0,		-height,		-width,
			0,		-height,		width,
			0,		height,			width,
			0,		height,			-width,

			0,		-height,		width,
			0,		-height,		-width,
			0,		height,			-width,
			0,		height,			width
		]);

		const uv = new Float32Array([
			uvW[0],		uvH[1],
			uvW[1],		uvH[1],
			uvW[1],		uvH[0],
			uvW[0],		uvH[0],

			uvW[0],		uvH[1],
			uvW[1],		uvH[1],
			uvW[1],		uvH[0],
			uvW[0],		uvH[0],

			uvW[0],		uvH[1],
			uvW[1],		uvH[1],
			uvW[1],		uvH[0],
			uvW[0],		uvH[0],

			uvW[0],		uvH[1],
			uvW[1],		uvH[1],
			uvW[1],		uvH[0],
			uvW[0],		uvH[0]
		]);

		const indices = new Uint16Array([
			0,1,2,			2,3,0,
			4,5,6,			6,7,4,
			8,9,10,			10,11,8,
			12,13,14,		14,15,12
		]);

		const bounds = {
			width: width * 2,
			height: height * 2,
			length: width * 2
		};

		super({position, uv, indices, bounds});
	}
};

export default Flower;
