import Model from 'Engine/Model';
import {Noise} from 'noisejs';
import {vec2} from 'gl-matrix';

class Cloud extends Model {
	constructor() {
		const noise = new Noise(Math.random());

		const cols = 16 + Math.floor(Math.random() * 16);
		const rows = 16 + Math.floor(Math.random() * 16);

		const width = cols / 4;
		const height = 2.5;
		const length = rows / 4;

		const bitmap = {};
		for(let z=0; z<rows; z++)
		for(let x=0; x<cols; x++) {
			if(vec2.distance(vec2.fromValues(x, z), vec2.fromValues(cols * 0.5, rows * 0.5)) <= Math.max(cols * 0.5, rows * 0.5)) {
				bitmap[x + ':' + z] = noise.simplex2(z / 4 * rows, x / 4 * cols) < 0;
			}
		}

		let vertices = [];
		let colors = [];
		const index = [];
		let vertex = 0;
		let offset = 0;
		for(let z=-1; z<=rows; z++)
		for(let x=-1; x<=cols; x++) {
			let vX = x * width * 2 - width * cols * 0.5;
			let vZ = z * length * 2 - length * rows * 0.5;
			let faces = 0;
			const p = bitmap[x + ':' + z];
			const pX = bitmap[(x + 1) + ':' + z];
			const pZ = bitmap[x + ':' + (z + 1)];
			if(p) {
				vertices = vertices.concat([
					/* Bottom */
					vX - width,	 -height,	vZ - length,
					vX + width,		-height,	vZ - length,
					vX + width,		-height,	vZ + length,
					vX - width,	 -height,	vZ + length
				]);
				colors = colors.concat([
					/* Bottom */
					0.8,		0.8,		0.8,
					0.8,		0.8,		0.8,
					0.8,		0.8,		0.8,
					0.8,		0.8,		0.8
				]);
				faces++;

				if(!pX) {
					/* Right */
					vertices = vertices.concat([
						vX + width,		-height,	vZ + length,
						vX + width,		-height,	vZ - length,
						vX + width,		height,	 vZ - length,
						vX + width,		height,	 vZ + length
					]);
					colors = colors.concat([
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9
					]);
					faces++;
				}

				if(!pZ) {
					/* Front */
					vertices = vertices.concat([
						vX - width,	 -height,	vZ + length,
						vX + width,		-height,	vZ + length,
						vX + width,		height,	 vZ + length,
						vX - width,	 height,	 vZ + length
					]);
					colors = colors.concat([
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9
					]);
					faces++;
				}

				vertices = vertices.concat([
					/* Top */
					vX - width,	 height,	 vZ + length,
					vX + width,		height,	 vZ + length,
					vX + width,		height,	 vZ - length,
					vX - width,	 height,	 vZ - length
				]);
				colors = colors.concat([
					/* Top */
					1.0,		1.0,		1.0,
					1.0,		1.0,		1.0,
					1.0,		1.0,		1.0,
					1.0,		1.0,		1.0
				]);
				faces++;
			} else {
				if(pX) {
					vX += width * 2;
					/* Left */
					vertices = vertices.concat([
						vX - width,	 -height,	vZ - length,
						vX - width,	 -height,	vZ + length,
						vX - width,	 height,	 vZ + length,
						vX - width,	 height,	 vZ - length
					]);
					colors = colors.concat([
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9
					]);
					faces++;
					vX -= width * 2;
				}

				if(pZ) {
					vZ += length * 2;
					/* Back */
					vertices = vertices.concat([
						vX + width,		-height,	vZ - length,
						vX - width,	 -height,	vZ - length,
						vX - width,	 height,	vZ - length,
						vX + width,		height,	 vZ - length
					]);
					colors = colors.concat([
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9,
						0.9,		0.9,		0.9
					]);
					faces++;
				}
			}
			for(let i=0; i<faces; i++) {
				[0,1,2,		2,3,0].forEach((v) => {
					index[vertex++] = offset + v;
				});
				offset += 4;
			}
		}

		const position = new Float32Array(vertices);
		const color = new Float32Array(colors);
		const indices = new Uint16Array(index);
		// const bounds = {
		// 	width: width * cols,
		// 	height: height,
		// 	length: length * rows
		// };
		const bounds = false;

		super({position, color, indices, bounds});
	}
};

export default Cloud;
