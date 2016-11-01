precision mediump float;

attribute vec3 position;
attribute float size;
attribute float alpha;
varying float fragAlpha;
uniform mat4 transform;

void main(void) {
	gl_Position = transform * vec4(position, 1.0);
	gl_PointSize = size;
	fragAlpha = alpha;
}
