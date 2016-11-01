precision mediump float;

attribute vec3 position;
varying vec2 fragUV;

void main(void) {
	gl_Position = vec4(position, 1.0);
	fragUV = (position.xy + 1.0) * 0.5;
}
