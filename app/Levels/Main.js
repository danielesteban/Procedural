import {Debug} from 'Engine/Context';
import Level from 'Engine/Level';
import Mesh from 'Engine/Mesh';
import {Cloud, Ground} from 'Meshes';
import {Ground as GroundModel} from 'Models';
import {Cloud as CloudShader, Ground as GroundShader, Deer as DeerShader, Skybox as SkyboxShader, Tree as TreeShader} from 'Shaders';
import {glMatrix, vec2, vec3} from 'gl-matrix';
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

const CalcSun = (function() {
	const J1970 = 2440588,
		J2000 = 2451545,
		M0 = glMatrix.toRadian(357.5291),
		M1 = glMatrix.toRadian(0.98560028),
		C1 = glMatrix.toRadian(1.9148),
		C2 = glMatrix.toRadian(0.0200),
		C3 = glMatrix.toRadian(0.0003),
		P = glMatrix.toRadian(102.9372),
		e = glMatrix.toRadian(23.45),
		th0 = glMatrix.toRadian(280.1600),
		th1 = glMatrix.toRadian(360.9856235),
		DAY_MS = 1000 * 60 * 60 * 24,
		lat = glMatrix.toRadian(40.4381307),
		lng = glMatrix.toRadian(-3.819966),
		date = new Date(2016, 5, 20, 6);

	return function(accumulator) {
		const time = accumulator % 1020;
		date.setHours(6 + (time / 60));
		date.setMinutes(time % 60);

		const julianDate = date.getTime() / DAY_MS - 0.5 + J1970,
			solarMeanAnomaly = M0 + M1 * (julianDate - J2000),
			equationOfCenter = C1 * Math.sin(solarMeanAnomaly) + C2 * Math.sin(2 * solarMeanAnomaly) + C3 * Math.sin(3 * solarMeanAnomaly),
			eclipticLongitude = solarMeanAnomaly + P + equationOfCenter + Math.PI,
			sunDeclination = Math.asin(Math.sin(eclipticLongitude) * Math.sin(e)),
			rightAscension = Math.atan2(Math.sin(eclipticLongitude) * Math.cos(e), Math.cos(eclipticLongitude)),
			siderealTime = th0 + th1 * (julianDate - J2000) + lng,
			H = siderealTime - rightAscension,
			azimuth = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(sunDeclination) * Math.cos(lat)) + Math.PI / 2,
			inclination = Math.asin(Math.sin(lat) * Math.sin(sunDeclination) + Math.cos(lat) * Math.cos(sunDeclination) * Math.cos(H)),
			position = vec3.fromValues(
				Math.cos(azimuth) * Math.cos(inclination),
				Math.sin(inclination),
				Math.sin(azimuth) * Math.cos(inclination)
			);

		return {
			position,
			date,
			intensity: Math.min(Math.max(position[1] + 0.1, 0), 1)
		};
	}
})();

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
		this.queued = {};
		this.queue = [];

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
		DeerShader.sunPosition = vec3.create();
		TreeShader.sunPosition = vec3.create();
		this.time = 60;
		this.timeStep = 10;

		GroundShader.animation = 0;
	}
	animate(delta) {
		super.animate(delta);

		/* Day/Night cycle */
		this.time += delta * this.timeStep;
		const sun = CalcSun(this.time);
		CloudShader.modifier = GroundShader.modifier = DeerShader.modifier = TreeShader.modifier = sun.intensity;
		vec3.copy(SkyboxShader.sunPosition, sun.position);
		vec3.copy(GroundShader.sunPosition, sun.position);
		vec3.copy(DeerShader.sunPosition, sun.position);
		vec3.copy(TreeShader.sunPosition, sun.position);
		this.stars.modifier = sun.intensity <= 0.25 ? (1 - sun.intensity * 4) : 0;

		/* Debug clock */
		if(Debug) {
			const time = this.getTime(sun.date);
			if(this.lastTimeUpdate !== time) {
				Debug.updateTime(this.lastTimeUpdate = time);
			}
		}

		/* Water */
		(GroundShader.animation += delta * 0.1) > 1.0 && (GroundShader.animation %= 1);

		/* Test if we are in a new chunk */
		const currentChunk = vec2.fromValues(
			Math.floor((this.camera.position[0] / GroundModel.scale + GroundModel.size * 0.5) / GroundModel.size),
			Math.floor((this.camera.position[2] / GroundModel.scale + GroundModel.size * 0.5) / GroundModel.size)
		);
		if(vec2.exactEquals(this.chunk, currentChunk)) return this.processQueue();
		this.chunk = currentChunk;

		/* De-spawn far away chunks */
		this.chunks.index = {};
		let l = this.chunks.layer.length;
		for(let i=0; i<l; i++) {
			const mesh = this.chunks.layer[i];
			if(vec2.distance(this.chunk, mesh.chunk) > this.renderRadius * 1.25) {
				this.world.removeRigidBody(mesh.body);
				mesh.destroy();
				this.chunks.layer.splice(i, 1);
				i--;
				l--;
			} else {
				this.chunks.index[mesh.chunk[0] + ':' + mesh.chunk[1]] = i;
			}
		}

		/* Queue near chunks */
		for(let z=this.chunk[1] - this.renderRadius; z<this.chunk[1] + this.renderRadius; z++)
		for(let x=this.chunk[0] - this.renderRadius; x<this.chunk[0] + this.renderRadius; x++) {
			const chunk = vec2.fromValues(x, z);
			const chunkID = x + ':' + z;
			if(this.chunks.test(chunkID) || this.queued[chunkID] || vec2.distance(this.chunk, chunk) > this.renderRadius) continue;
			this.queued[chunkID] = true;
			this.queue.push(chunk);
		}

		/* Sort queued chunks by proximity to the camera */
		this.queue.sort((a, b) => {
			return vec2.distance(this.chunk, a) - vec2.distance(this.chunk, b);
		});

		this.processQueue();
	}
	processQueue(iteration) {
		if(!this.queue.length || iteration >= 2) return;
		const chunk = this.queue.shift();
		const chunkID = chunk[0] + ':' + chunk[1];
		delete this.queued[chunkID];
		const mesh = new Ground(this.noise, chunk);
		this.chunks.push(mesh);
		this.world.addRigidBody(mesh.body, mesh.collisionGroup, Mesh.collisionAll);
		this.queue.length && this.processQueue((iteration || 0) + 1);
	}
	getTime(date) {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		return (hours < 10 ? '0' : '') + (hours > 12 ? hours % 12 : hours) + ':' + (minutes < 10 ? '0' : '') + minutes + (hours > 12 ? 'PM' : 'AM');
	}
};

export default Main;
