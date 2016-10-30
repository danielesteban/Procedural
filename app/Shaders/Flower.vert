attribute vec3 position;
attribute vec2 uv;
varying vec2 fragUV;
uniform mat4 transform;

void main(void) {
	gl_Position = transform * vec4(position, 1.0);
	fragUV = uv;
}
