import {GL} from 'Engine/Context';

class Shader {
	constructor(vertex, fragment, attributes, uniforms) {
		fragment = fragment || vertex;
		this.vertex = GL.createShader(GL.VERTEX_SHADER);
		GL.shaderSource(this.vertex, require('./' + vertex + '.vert'));
		GL.compileShader(this.vertex);
		if(!GL.getShaderParameter(this.vertex, GL.COMPILE_STATUS)) {
			console.log(`${vertex} vertex: ` + GL.getShaderInfoLog(this.vertex));
			return;
		}

		this.fragment = GL.createShader(GL.FRAGMENT_SHADER);
		GL.shaderSource(this.fragment, require('./' + fragment + '.frag'));
		GL.compileShader(this.fragment);
		if(!GL.getShaderParameter(this.fragment, GL.COMPILE_STATUS)) {
			console.log(`${fragment} fragment: ` + GL.getShaderInfoLog(this.fragment));
			return;
		}

		this.program = GL.createProgram();
		GL.attachShader(this.program, this.vertex);
		GL.attachShader(this.program, this.fragment);
		GL.linkProgram(this.program);
		if(!GL.getProgramParameter(this.program, GL.LINK_STATUS)) {
			console.log(`Error linking the shader: ${vertex} + ${fragment}`);
			return;
		}

		this.attributes = {
			position: GL.getAttribLocation(this.program, "position"),
			normal: GL.getAttribLocation(this.program, "normal"),
			uv: GL.getAttribLocation(this.program, "uv"),
			color: GL.getAttribLocation(this.program, "color"),
			shadow: GL.getAttribLocation(this.program, "shadow"),
			bone: GL.getAttribLocation(this.program, "bone"),
			size: GL.getAttribLocation(this.program, "size"),
			alpha: GL.getAttribLocation(this.program, "alpha")
		};

		attributes && attributes.forEach((attribute) => (this.attributes[attribute] = GL.getAttribLocation(this.program, attribute)));

		this.uniforms = {
			transform: GL.getUniformLocation(this.program, "transform"),
			modelTransform: GL.getUniformLocation(this.program, "modelTransform"),
			normalTransform: GL.getUniformLocation(this.program, "normalTransform"),
			albedo: GL.getUniformLocation(this.program, "albedo"),
			alpha: GL.getUniformLocation(this.program, "alpha"),
			animation: GL.getUniformLocation(this.program, "animation"),
			modifier: GL.getUniformLocation(this.program, "modifier"),
			scale: GL.getUniformLocation(this.program, "scale"),
			texture: GL.getUniformLocation(this.program, "texture"),
			secondaryTexture: GL.getUniformLocation(this.program, "secondaryTexture"),
			cameraPosition: GL.getUniformLocation(this.program, "cameraPosition"),
			cameraDirection: GL.getUniformLocation(this.program, "cameraDirection"),
			sunPosition: GL.getUniformLocation(this.program, "sunPosition")
		};

		uniforms && uniforms.forEach((uniform) => (this.uniforms[uniform] = GL.getUniformLocation(this.program, uniform)));
	}
}

export const Animal = new Shader('Animal');
export const Blur = new Shader('PostProcessing', 'Blur', null, ['textureColor', 'resolution', 'direction']);
export const Cloud = new Shader('Cloud');
export const Depth = new Shader('Depth');
export const Flower = new Shader('Flower', null, null, ['textureAllium', 'textureTulip', 'groundNormal']);
export const Ground = new Shader('Ground', null, null, ['textureWater', 'textureSand', 'textureGrass', 'textureStone', 'textureSnow']);
export const PostProcessing = new Shader('PostProcessing', null, null, ['textureBlur', 'textureColor', 'textureDepth', 'textureNoise', 'nightVision']);
export const Skybox = new Shader('Skybox');
export const Stars = new Shader('Stars');
export const Tree = new Shader('Ground', 'Tree');
