import {GL, BindTexture, DepthTexture} from './Context';

class Framebuffer {
	constructor(width, height, depth) {
		/* Frame buffer */
		this.buffer = GL.createFramebuffer();
		GL.bindFramebuffer(GL.FRAMEBUFFER, this.buffer);
		this.buffer.width = width;
    this.buffer.height = height;

		/* Color texture */
		this.texture = GL.createTexture();
		BindTexture(null);
		GL.bindTexture(GL.TEXTURE_2D, this.texture);
		GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.buffer.width, this.buffer.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
		GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
		GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.texture, 0);
		GL.bindTexture(GL.TEXTURE_2D, null);

		if(depth) {
			/* Depth texture */
			this.depth = GL.createTexture();
			BindTexture(null);
			GL.bindTexture(GL.TEXTURE_2D, this.depth);
			GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_COMPONENT, this.buffer.width, this.buffer.height, 0, GL.DEPTH_COMPONENT, GL.UNSIGNED_SHORT, null);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
			GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, this.depth, 0);
			GL.bindTexture(GL.TEXTURE_2D, null);
		} else {
			/* Render buffer */
			this.renderbuffer = GL.createRenderbuffer();
			GL.bindRenderbuffer(GL.RENDERBUFFER, this.renderbuffer);
			GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH_COMPONENT16, this.buffer.width, this.buffer.height);
			GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.RENDERBUFFER, this.renderbuffer);
			GL.bindRenderbuffer(GL.RENDERBUFFER, null);
		}

    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
	}
	destroy() {
		GL.deleteFramebuffer(this.buffer);
		GL.deleteTexture(this.texture);
		this.depth && GL.deleteTexture(this.depth);
		this.renderbuffer && GL.deleteRenderbuffer(this.renderbuffer);
	}
};

export default Framebuffer;
