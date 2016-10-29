import {GL, BindModel, BindTexture, UseShader, Debug, Screenshot} from './Context';
import {State as Input} from './Input';
import Camera from './Camera';
import Mesh from './Mesh';
import {AskForChrome} from 'Dialogs';
import {Skybox, Stars} from 'Meshes';
import {vec3} from 'gl-matrix';
import Ammo from 'ammo.js';

class Level {
	constructor({layers, models}) {
		if(!window.chrome && !(window.process && window.process.type)) new AskForChrome();

		this.layers = layers || [];
		this.models = models || {};

		/* The skybox+stars */
		this.skybox = new Skybox();
		this.stars = new Stars();
		this.layers.push([this.skybox, this.stars]);

		/* Physics world setup */
		this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
		this.broadphase = new Ammo.btDbvtBroadphase();
		this.solver = new Ammo.btSequentialImpulseConstraintSolver();
		const world = this.world = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
		const gravity = new Ammo.btVector3(0, -10, 0);
		this.world.setGravity(gravity);
		Ammo.destroy(gravity);

		/* Add all rigid bodies and constraints to the world */
		this.layers.forEach((layer) => layer.forEach((mesh) => {
			mesh.body && world.addRigidBody(mesh.body, mesh.collisionGroup, Mesh.collisionAll);
			mesh.constraint && world.addConstraint(mesh.constraint);
		}));

		/* Camera controller */
		this.camera = new Camera(this);
	}
	destroy() {
		/* Dereference allocated memory */
		Ammo.destroy(this.world);
		Ammo.destroy(this.solver);
		Ammo.destroy(this.broadphase);
		Ammo.destroy(this.dispatcher);
		Ammo.destroy(this.collisionConfiguration);
		this.layers.forEach((layer) => layer.forEach((mesh) => mesh.destroy()));
		for(let i in this.models) this.models[i].destroy();
		this.camera.destroy();
		BindTexture(null);
		BindModel(null);
		UseShader(null);
	}
	animate(delta) {
		/* Step the physics simulation */
		this.world.stepSimulation(delta, 10, 1 / 60);

		/* Animate all meshes */
		this.layers.forEach((layer) => layer.forEach((mesh) => mesh.animate && mesh.animate(delta)));

		/* Update all transforms */
		this.layers.forEach((layer) => layer.forEach((mesh) => mesh.updateTransform && mesh.updateTransform()));

		/* Process input */
		this.camera.processInput(delta);
	}
	render() {
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
				const post = mesh.render(camera);
				post && postLayer.push(Array.isArray(post) ? post : [post]);
				rendered++;
			}));

			/* Render the post layer */
			for(let j=0; j<2; j++) {
				postLayer.forEach((layer) => layer.forEach((mesh) => {
					if((j === 0 && !mesh.blending) || (j === 1 && mesh.blending)) {
						loaded++;
						if(!this.camera.inFustrum(mesh)) return;
						mesh.render(camera);
						rendered++;
					}
				}));
			}
		});

		/* Take screenshot (if requested) */
		if(Input.screenshot) {
			Screenshot(Input.screenshot);
			Input.screenshot = false;
		}

		Debug && Debug.updateMeshes(rendered, loaded);
	}
}

export default Level;
