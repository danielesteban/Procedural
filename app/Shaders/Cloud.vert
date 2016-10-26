attribute vec3 position;
attribute vec3 color;
varying vec3 fragColor;
uniform mat4 transform;

void main(void) {
	gl_Position = transform * vec4(position, 1.0);
	fragColor = color;
}
