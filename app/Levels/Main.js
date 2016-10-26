import Level from 'Engine/Level';
import Mesh from 'Engine/Mesh';
import {Cloud, Ground} from 'Meshes';
import {Ground as GroundModel} from 'Models';
import {Cloud as CloudShader, Ground as GroundShader, Skybox as SkyboxShader} from 'Shaders';
import {vec2, vec3} from 'gl-matrix';
import {Noise} from 'noisejs';

class ChunksLayer {
	constructor() {
		this.layer =[];
		this.index = {};
	}
	test(id) {
		return this.index[id] !== undefined;
	}
	get(id) {
		return this.test(id) ? this.layer[this.index[id]] : false;
	}
	push(mesh) {
		this.layer.push(mesh);
		this.index[mesh.chunk[0] + ':' + mesh.chunk[1]] = this.layer.length - 1;
	}
}

class Main extends Level {
	constructor() {
		/* Chunks layer */
		const chunks = new ChunksLayer();

		/* Clouds */
		const clouds = [];

		super({layers: [clouds, chunks.layer]});

		this.renderRadius = 14;
		this.noise = new Noise(Math.random());
		this.chunk = vec2.create();
		this.chunks = chunks;
		this.clouds = clouds;
		this.queue = {};

		const cloudsY = 256;
		const cloudsRadius = 1800;
		for(let z=-cloudsRadius; z<cloudsRadius; z+=600)
		for(let x=-cloudsRadius; x<cloudsRadius; x+=600) {
			this.clouds.push(new Cloud(vec3.fromValues(
				x + Math.floor(Math.random() * 300) - 150,
				cloudsY + Math.floor(Math.random() * 100),
				z + Math.floor(Math.random() * 300) - 150
			), this.camera, cloudsRadius));
		}

		/* Day/Night cycle config */
		SkyboxShader.sunPosition = vec3.create();
		GroundShader.sunPosition = vec3.create();
		this.timeStep = 0.001;
		const fullCycle = (1 / (this.timeStep / 60)) * (1000 / 60);
		this.sunLight = (((new Date()) * 1) % fullCycle) / fullCycle;
	}
	animate(delta) {
		super.animate(delta);

		/* Day/Night cycle */
		this.sunLight += delta * this.timeStep;
		this.sunLight > 1 && (this.sunLight %= 1);
		const easedSunLight = Mesh.easeInOut(this.sunLight, 1);
		const sunLight = (easedSunLight > 0.5 ? easedSunLight - 0.5 : 0.5 - easedSunLight) * 2;
		CloudShader.modifier = Math.min(1, sunLight + 0.1);
		this.stars.modifier = sunLight <= 0.25 ? (1 - sunLight * 4) : 0;
		const sunPos = (easedSunLight > 0.5 ? easedSunLight - 0.5 : easedSunLight + 0.5) * 2 - 1;

		SkyboxShader.sunPosition[1] = GroundShader.sunPosition[1] = sunLight - 0.125;
		SkyboxShader.sunPosition[0] = GroundShader.sunPosition[0] = sunPos * -1;
		SkyboxShader.sunPosition[2] = GroundShader.sunPosition[2] = sunPos;

		/* Test if we are in a new chunk */
		const currentChunk = vec2.fromValues(
			Math.floor((this.camera.position[0] / GroundModel.scale + GroundModel.size * 0.5) / GroundModel.size),
			Math.floor((this.camera.position[2] / GroundModel.scale + GroundModel.size * 0.5) / GroundModel.size)
		);
		if(vec2.exactEquals(this.chunk, currentChunk)) return;
		this.chunk = currentChunk;

		/* De-spawn far away chunks */
		this.chunks.index = {};
		let l = this.chunks.layer.length;
		for(let i=0; i<l; i++) {
			const mesh = this.chunks.layer[i];
			if(vec2.distance(this.chunk, mesh.chunk) > this.renderRadius) {
				this.world.removeRigidBody(mesh.body);
				mesh.destroy();
				this.chunks.layer.splice(i, 1);
				i--;
				l--;
			} else {
				this.chunks.index[mesh.chunk[0] + ':' + mesh.chunk[1]] = i;
			}
		}

		/* Spawn new chunks */
		const spawn = [];
		for(let z=this.chunk[1] - this.renderRadius; z<this.chunk[1] + this.renderRadius; z++)
		for(let x=this.chunk[0] - this.renderRadius; x<this.chunk[0] + this.renderRadius; x++) {
			const chunk = vec2.fromValues(x, z);
			const chunkID = x + ':' + z;
			const distance = vec2.distance(this.chunk, chunk);
			if(this.chunks.test(chunkID) || this.queue[chunkID] || distance > this.renderRadius) continue;
			spawn.push({chunk, distance});
			this.queue[chunkID] = true;
		}

		/* Sort queued chunks by proximity to the camera */
		spawn.sort((a, b) => {
			return a.distance - b.distance;
		});

		const queuedSpawn = () => {
			if(!spawn.length) return;
			const {chunk} = spawn.shift();
			const chunkID = chunk[0] + ':' + chunk[1];
			delete this.queue[chunkID];
			if(this.chunks.test(chunkID)) return;
			const mesh = new Ground(this.noise, chunk);
			this.chunks.push(mesh);
			this.world.addRigidBody(mesh.body, mesh.collisionGroup, Mesh.collisionAll);
			window.setTimeout(queuedSpawn, 0);
		};
		window.setTimeout(queuedSpawn, 0);
	}
};

export default Main;
