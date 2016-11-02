import {GL, BindTexture, Debug, ResizeEvent, Screenshot} from 'Engine/Context';
import FrameBuffer from 'Engine/FrameBuffer';
import Level from 'Engine/Level';
import Mesh from 'Engine/Mesh';
import Music from 'Engine/Music';
import {State as Input} from 'Engine/Input';
import {Cloud, Ground, FrameBuffer as FrameBufferMesh} from 'Meshes';
import {Ground as GroundModel} from 'Models';
import {Blur as BlurShader, Cloud as CloudShader, Depth as DepthShader, Ground as GroundShader, Animal as AnimalShader, Flower as FlowerShader, PostProcessing as PostProcessingShader, Tree as TreeShader, Skybox as SkyboxShader} from 'Shaders';
import {Fur as FurTexture} from 'Textures';
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
		date = new Date(Date.UTC(2016, 5, 20));

	return function(accumulator) {
		const time = accumulator % 1080;
		date.setUTCHours(3 + (time / 60));
		date.setUTCMinutes(time % 60);

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
			intensity: Math.min(Math.max(position[1] + 0.2, 0), 1)
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
		AnimalShader.sunPosition = vec3.create();
		FlowerShader.sunPosition = vec3.create();
		TreeShader.sunPosition = vec3.create();
		this.time = 0;

		GroundShader.animation = 0;
		!localStorage.mute && Music.play();

		/* Post-Processing */
		if(localStorage.postprocessing) {
			this.postprocessing = {
				mesh: new FrameBufferMesh()
			};
			PostProcessingShader.animation = 0;
			PostProcessingShader.nightVision = 0;
			this.onResize = this.onResize.bind(this);
			window.addEventListener(ResizeEvent, this.onResize);
			this.onResize();
		}
	}
	onResize() {
		/* Post-Processing */
		this.postprocessing.framebuffer && this.postprocessing.framebuffer.destroy();
		this.postprocessing.framebuffer = new FrameBuffer(GL.drawingBufferWidth, GL.drawingBufferHeight);
		this.postprocessing.depthbuffer && this.postprocessing.depthbuffer.destroy();
		this.postprocessing.depthbuffer = new FrameBuffer(GL.drawingBufferWidth, GL.drawingBufferHeight, true);

		this.postprocessing.blurResolution = vec2.fromValues(GL.drawingBufferWidth, GL.drawingBufferHeight);
		this.postprocessing.blurEffect && this.postprocessing.blurEffect.destroy();
		this.postprocessing.blurEffect = new FrameBuffer(this.postprocessing.blurResolution[0], this.postprocessing.blurResolution[1]);
		this.postprocessing.blurEffectAux && this.postprocessing.blurEffectAux.destroy();
		this.postprocessing.blurEffectAux = new FrameBuffer(this.postprocessing.blurResolution[0], this.postprocessing.blurResolution[1]);
	}
	destroy() {
		super.destroy();
		window.removeEventListener(ResizeEvent, this.onResize);
		Music.reset();
	}
	getTime(date) {
		const hours = date.getUTCHours() + 3;
		const minutes = date.getUTCMinutes();
		return (hours < 10 ? '0' : '') + (hours > 12 ? hours % 12 : hours) + ':' + (minutes < 10 ? '0' : '') + minutes + (hours > 12 ? 'PM' : 'AM');
	}
	processQueue(iteration) {
		if(!this.queue.length || iteration >= 2) return;
		const chunk = this.queue.shift();
		const chunkID = chunk[0] + ':' + chunk[1];
		delete this.queued[chunkID];
		const mesh = new Ground(this.world, this.noise, chunk);
		this.chunks.push(mesh);
		this.world.addRigidBody(mesh.body, mesh.collisionGroup, Mesh.collisionAll);
		this.queue.length && this.processQueue((iteration || 0) + 1);
	}
	animate(delta) {
		super.animate(delta);

		/* Day/Night cycle */
		this.time += delta * (Input.fastTime ? 100 : 5);
		const sun = CalcSun(this.time);
		CloudShader.modifier = GroundShader.modifier = AnimalShader.modifier = FlowerShader.modifier = PostProcessingShader.modifier = TreeShader.modifier = sun.intensity;
		vec3.copy(SkyboxShader.sunPosition, sun.position);
		vec3.copy(GroundShader.sunPosition, sun.position);
		vec3.copy(AnimalShader.sunPosition, sun.position);
		vec3.copy(FlowerShader.sunPosition, sun.position);
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

		if(this.postprocessing) {
			PostProcessingShader.animation += delta;
			if(Input.nightVision && PostProcessingShader.nightVision < 1.0) {
				PostProcessingShader.nightVision += Math.min(1.0 - PostProcessingShader.nightVision, delta);
			}
			if(!Input.nightVision && PostProcessingShader.nightVision > 0.0) {
				PostProcessingShader.nightVision -= Math.min(PostProcessingShader.nightVision, delta * 4.0);
			}
		}

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
	render() {
		if(!this.postprocessing) return super.render();

		const screenshot = Input.screenshot;
		Input.screenshot = false;

		/* Render depth texture */
		GL.bindFramebuffer(GL.FRAMEBUFFER, this.postprocessing.depthbuffer.buffer);
		GL.colorMask(false, false, false, false);
		GL.clear(GL.DEPTH_BUFFER_BIT);
		super.render(DepthShader);
		GL.colorMask(true, true, true, true);

		/* Render color texture */
		GL.bindFramebuffer(GL.FRAMEBUFFER, this.postprocessing.framebuffer.buffer);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
		super.render();

		GL.viewport(0, 0, this.postprocessing.framebuffer.buffer.width, this.postprocessing.framebuffer.buffer.height);
		GL.disable(GL.DEPTH_TEST);

		/* Render blur texture */
		const iterations = 4;
		for(let i=0; i<iterations; i++) {
			const radius = iterations - i - 1;
			GL.bindFramebuffer(GL.FRAMEBUFFER, this.postprocessing.blurEffectAux.buffer);
			GL.clear(GL.COLOR_BUFFER_BIT);
			this.postprocessing.mesh.render([
				{
					id: 'Color',
					buffer: i === 0 ? this.postprocessing.framebuffer.texture : this.postprocessing.blurEffect.texture,
				}
			], BlurShader, () => {
				GL.uniform2fv(BlurShader.uniforms.resolution, this.postprocessing.blurResolution);
				GL.uniform2fv(BlurShader.uniforms.direction, vec2.fromValues(radius, 0));
			});
			GL.bindFramebuffer(GL.FRAMEBUFFER, this.postprocessing.blurEffect.buffer);
			GL.clear(GL.COLOR_BUFFER_BIT);
			this.postprocessing.mesh.render([
				{
					id: 'Color',
					buffer: this.postprocessing.blurEffectAux.texture,
				}
			], BlurShader, () => {
				GL.uniform2fv(BlurShader.uniforms.resolution, this.postprocessing.blurResolution);
				GL.uniform2fv(BlurShader.uniforms.direction, vec2.fromValues(0, radius));
			});
			GL.bindFramebuffer(GL.FRAMEBUFFER, null);
		}

		/* Render final composite */
		this.postprocessing.mesh.render([
			{
				id: 'Blur',
				buffer: this.postprocessing.blurEffect.texture,
			},
			{
				id: 'Color',
				buffer: this.postprocessing.framebuffer.texture,
			},
			{
				id: 'Depth',
				buffer: this.postprocessing.depthbuffer.depth
			},
			{
				id: 'Noise',
				buffer: FurTexture.buffers[0]
			}
		], PostProcessingShader, () => {
			GL.uniform1f(PostProcessingShader.uniforms.nightVision, PostProcessingShader.nightVision);
		});
		GL.bindTexture(GL.TEXTURE_2D, null);

		GL.enable(GL.DEPTH_TEST);

		screenshot && (Input.screenshot = Screenshot(screenshot));
	}
};

export default Main;
