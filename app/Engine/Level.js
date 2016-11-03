import {GL, BindModel, BindTexture, Debug, Screenshot, UseShader} from './Context';
import {State as Input} from './Input';
import Camera from './Camera';
import Mesh from './Mesh';
import {AskForChrome} from 'Dialogs';
import {Skybox, Stars} from 'Meshes';
import {vec3} from 'gl-matrix';

class Level {
	constructor({layers, models}) {
		if(!window.chrome && !(window.process && window.process.type)) new AskForChrome();

		this.layers = layers || [];
		this.models = models || {};

		/* The skybox+stars */
		this.skybox = new Skybox();
		this.stars = new Stars();
		this.layers.push([this.skybox, this.stars]);

		/* Camera controller */
		this.camera = new Camera(this);
	}
	destroy() {
		/* Dereference allocated memory */
		this.layers.forEach((layer) => layer.forEach((mesh) => mesh.destroy && mesh.destroy()));
		for(let i in this.models) this.models[i].destroy();
		this.camera.destroy();
		BindTexture(null);
		BindModel(null);
		UseShader(null);
	}
	animate(delta) {
		/* Animate all meshes */
		this.layers.forEach((layer) => layer.forEach((mesh) => mesh.animate && mesh.animate(delta, this.camera.position)));

		/* Process input */
		this.camera.processInput(delta);
	}
	render(shader) {
		const cameras = [];
		if(this.camera.VRDisplay) {
			const eyePosition = vec3.create();
			for(let eye=0; eye<2; eye++) {
				cameras.push({
					transform: this.camera.VRTransforms[eye],
					position: this.camera.VRPositions[eye],
					direction: this.camera.front,
					translation: this.camera.VRPositions[eye],
					viewport: {
						x: eye === 0 ? 0 : GL.drawingBufferWidth * 0.5,
						y: 0,
						w: GL.drawingBufferWidth * 0.5,
						h: GL.drawingBufferHeight
					}
				});
			}
		} else {
			cameras.push({
				transform: this.camera.transform,
				position: this.camera.position,
				direction: this.camera.front,
				translation: this.camera.position,
				viewport: {
					x: 0,
					y: 0,
					w: GL.drawingBufferWidth,
					h: GL.drawingBufferHeight
				}
			});
		}

		let rendered = 0;
		let loaded = 0;
		cameras.forEach((camera) => {
			GL.viewport(camera.viewport.x, camera.viewport.y, camera.viewport.w, camera.viewport.h);

			/* Render all the meshes */
			const postLayer = [];
			this.layers.forEach((layer) => layer.forEach((mesh, i) => {
				loaded++;
				if(!this.camera.inFustrum(mesh)) return;
				const post = mesh.render(camera, shader);
				post && postLayer.push(Array.isArray(post) ? post : [post]);
				rendered++;
			}));

			/* Render the post layer */
			const blending = [];
			postLayer.forEach((layer) => layer.forEach((mesh) => {
				if(mesh.blending) {
					return blending.push({
						distance: vec3.distance(camera.translation, mesh.origin),
						mesh
					});
				}
				loaded++;
				if(!this.camera.inFustrum(mesh)) return;
				mesh.render(camera, shader);
				rendered++;
			}));
			/* Sort the blending layer */
			blending.sort((a, b) => {
				return b.distance - a.distance;
			});
			/* Render blending layer */
			blending.forEach(({mesh}) => {
				loaded++;
				if(!this.camera.inFustrum(mesh)) return;
				mesh.render(camera, shader);
				rendered++;
			});
		});

		/* Take screenshot (if requested) */
		if(Input.screenshot) {
			Input.screenshot = Screenshot(Input.screenshot);
		}

		Debug && Debug.updateMeshes(rendered, loaded);
	}
}

export default Level;
