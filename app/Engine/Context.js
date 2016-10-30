import {cE, aC, aE} from './DOM';
import i18n from 'i18n';
import createHistory from 'history/createBrowserHistory';
import {saveAs} from 'file-saver';

/* Setup global GL context */
const hints = {
	antialias: !!localStorage.antialias
};
const canvas = cE('canvas');
aC(document.body, canvas);
export const GL = canvas.getContext('webgl', hints) || canvas.getContext('experimental-webgl', hints);
GL.enable(GL.DEPTH_TEST);
GL.depthFunc(GL.LESS);
GL.enable(GL.CULL_FACE);
GL.cullFace(GL.BACK);
GL.blendFuncSeparate(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
GL.blendEquation(GL.FUNC_ADD);
export const Anisotropic = GL.getExtension('EXT_texture_filter_anisotropic') || GL.getExtension('WEBKIT_EXT_texture_filter_anisotropic') || GL.getExtension('MOZ_EXT_texture_filter_anisotropic');
export const Derivatives = GL.getExtension('OES_standard_derivatives');

/* Clear utility */
GL.clearColor(0, 0, 0, 1);
export const Clear = () => GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

/* Screenshoot utility */
let takingScreenshot = false;
const screenshotRenderer = cE('canvas');
export const Screenshot = ({targetWidth, targetHeight, callback}) => {
	if(takingScreenshot) return;
	takingScreenshot = true;
	let renderer = canvas;
	if(targetWidth && targetHeight) {
		renderer = screenshotRenderer;
		renderer.width = targetWidth;
		renderer.height = targetHeight;
		const ctx = renderer.getContext('2d');
		const aspect = GL.drawingBufferWidth / GL.drawingBufferHeight;
		const targetAspect = targetWidth / targetHeight;
		let w, h;
		if(aspect < targetAspect) {
			w = targetWidth;
			h = GL.drawingBufferHeight * targetWidth / GL.drawingBufferWidth;
		} else {
			h = targetHeight;
			w = GL.drawingBufferWidth * targetHeight / GL.drawingBufferHeight;
		}
		const x = targetWidth * 0.5 - w * 0.5;
		const y = targetHeight * 0.5 - h * 0.5;
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, targetWidth, targetHeight);
		ctx.drawImage(canvas, x, y, w, h);
	}
	renderer.toBlob(function(blob) {
		if(!callback) saveAs(blob, `Screen Shot ${(new Date()).toString()}.png`);
		else callback(blob);
		takingScreenshot = false;
	});
};

/* Shader binding/caching utility */
let currentShader;
const maxVertexAttribs = GL.getParameter(GL.MAX_VERTEX_ATTRIBS);
export const UseShader = (shader) => {
	if(currentShader === shader) return;
	currentShader = shader;
	if(!shader) return;
	GL.useProgram(shader.program);
	if(shader.animation !== undefined && shader.uniforms.animation !== null) {
		GL.uniform1f(shader.uniforms.animation, shader.animation);
	}
	if(shader.modifier !== undefined && shader.uniforms.modifier !== null) {
		GL.uniform1f(shader.uniforms.modifier, shader.modifier);
	}
	if(shader.sunPosition !== undefined && shader.uniforms.sunPosition !== null) {
		GL.uniform3fv(shader.uniforms.sunPosition, shader.sunPosition);
	}
	for(let i=0; i<maxVertexAttribs; i++) GL.disableVertexAttribArray(i);
};

/* Model binding/caching utility */
let currentModel;
export const BindModel = (model) => {
	if(currentModel === model) return;
	currentModel = model;
	if(!model) return;
	if(model.position) {
		GL.bindBuffer(GL.ARRAY_BUFFER, model.position);
		GL.vertexAttribPointer(currentShader.attributes.position, 3, GL.FLOAT, 0, 0, 0);
		GL.enableVertexAttribArray(currentShader.attributes.position);
	}
	if(model.normal && currentShader.attributes.normal !== -1) {
		GL.bindBuffer(GL.ARRAY_BUFFER, model.normal);
		GL.vertexAttribPointer(currentShader.attributes.normal, 3, GL.FLOAT, 0, 0, 0);
		GL.enableVertexAttribArray(currentShader.attributes.normal);
	}
	if(model.uv && currentShader.attributes.uv !== -1) {
		GL.bindBuffer(GL.ARRAY_BUFFER, model.uv);
		GL.vertexAttribPointer(currentShader.attributes.uv, 2, GL.FLOAT, 0, 0, 0);
		GL.enableVertexAttribArray(currentShader.attributes.uv);
	}
	if(model.color && currentShader.attributes.color !== -1) {
		GL.bindBuffer(GL.ARRAY_BUFFER, model.color);
		GL.vertexAttribPointer(currentShader.attributes.color, 3, GL.FLOAT, 0, 0, 0);
		GL.enableVertexAttribArray(currentShader.attributes.color);
	}
	if(model.shadow && currentShader.attributes.shadow !== -1) {
		GL.bindBuffer(GL.ARRAY_BUFFER, model.shadow);
		GL.vertexAttribPointer(currentShader.attributes.shadow, 1, GL.FLOAT, 0, 0, 0);
		GL.enableVertexAttribArray(currentShader.attributes.shadow);
	}
	if(model.bone && currentShader.attributes.bone !== -1) {
		GL.bindBuffer(GL.ARRAY_BUFFER, model.bone);
		GL.vertexAttribPointer(currentShader.attributes.bone, 1, GL.UNSIGNED_BYTE, 0, 0, 0);
		GL.enableVertexAttribArray(currentShader.attributes.bone);
	}
	if(model.points) {
		GL.bindBuffer(GL.ARRAY_BUFFER, model.points);
		GL.vertexAttribPointer(currentShader.attributes.position, 3, GL.FLOAT, false, model.stride, 0);
		GL.enableVertexAttribArray(currentShader.attributes.position);
		if(currentShader.attributes.size !== -1) {
			GL.vertexAttribPointer(currentShader.attributes.size, 1, GL.FLOAT, false, model.stride, Float32Array.BYTES_PER_ELEMENT * 3);
			GL.enableVertexAttribArray(currentShader.attributes.size);
		}
		if(currentShader.attributes.alpha !== -1) {
			GL.vertexAttribPointer(currentShader.attributes.alpha, 1, GL.FLOAT, false, model.stride, Float32Array.BYTES_PER_ELEMENT * 4);
			GL.enableVertexAttribArray(currentShader.attributes.alpha);
		}
	}
	if(model.indices) {
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, model.indices);
	}
};

/* Texture binding/caching utility */
let currentTexture;
export const BindTexture = (texture) => {
	if(currentTexture === texture) return;
	currentTexture = texture;
	if(!texture) return;
	GL.activeTexture(GL.TEXTURE0);
	GL.bindTexture(texture.cubemap ? GL.TEXTURE_CUBE_MAP : GL.TEXTURE_2D, texture.buffer);
	GL.uniform1i(currentShader.uniforms.texture, 0);
	if(texture.secondary) {
		GL.activeTexture(GL.TEXTURE1);
		GL.bindTexture(GL.TEXTURE_2D, texture.secondary);
		GL.uniform1i(currentShader.uniforms.secondaryTexture, 1);
	}
};

/* Context resize event & handler */
export const ResizeEvent = 'ContextResize';
const onResize = document.createEvent('Event');
onResize.initEvent(ResizeEvent, true, true);

export const PixelRatio = localStorage.highDPI && (window.devicePixelRatio || 1) > 1 ? 2 : 1;
const resize = () => {
	canvas.width = window.innerWidth * PixelRatio;
	canvas.height = window.innerHeight * PixelRatio;
	GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
	window.dispatchEvent(onResize);
};
aE(window, 'resize', resize);
resize();

/* Debug */
export const Debug = localStorage.debug ? (() => {
	const container = cE('debug');
	const rendererInfo = GL.getExtension('WEBGL_debug_renderer_info');
	if(rendererInfo != null) {
		aC(container, cE('div', GL.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)));
	}
	const position = cE('div');
	const extra = cE('div');
	const meshes = cE('div');
	const footer = cE('div');
	const time = cE('span');
	aC(container, position);
	aC(container, extra);
	aC(container, meshes);
	aC(footer, time);
	aC(footer, cE('span', VERSION));
	aC(container, footer);
	aC(document.body, container);
	return {
		updatePosition(pos) {
			position.innerText = 'x: ' + pos[0].toFixed(2) + ' | y: ' + pos[1].toFixed(2) + ' | z: ' + pos[2].toFixed(2);
		},
		updateMeshes(rendered, loaded) {
			meshes.innerText = i18n.renderedMeshes.replace(/{rendered}/, rendered).replace(/{loaded}/, loaded);
		},
		updateExtra(info) {
			extra.innerText = info;
		},
		updateTime(timestamp) {
			time.innerText = timestamp ? timestamp + ' | ' : '';
		},
		FPSMeter: new window.FPSMeter({
			graph: true,
			heat: true,
			left: 'auto',
			right: '5px',
			theme: 'transparent'
		})
	};
})() : null;

/* Browser history */
export const History = createHistory({
	basename: BASENAME
});
