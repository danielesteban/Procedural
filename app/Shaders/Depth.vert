precision mediump float;

attribute vec3 position;
uniform mat4 transform;

void main(void) {
	gl_Position = transform * vec4(position, 1.0);
}
