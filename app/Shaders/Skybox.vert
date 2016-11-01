precision mediump float;

attribute vec3 position;
varying vec3 fragPosition;
uniform mat4 transform;

void main(void) {
	vec4 pos = transform * vec4(position, 1.0);
	gl_Position = pos.xyww;
	fragPosition = position;
}
