import Model from 'Engine/Model';

class FrameBuffer extends Model {
	constructor(width, height, uvW, uvH) {
		const position = new Float32Array([
			-1.0,		-1.0,		1.0,
			1.0,		-1.0,		1.0,
			1.0,		1.0,		1.0,
			-1.0,		1.0,		1.0
		]);

		const indices = new Uint16Array([
			0,1,2,			2,3,0
		]);

		const bounds = false;

		super({position, indices, bounds});
	}
};

export default FrameBuffer;
