precision mediump float;

attribute vec3 position;
attribute vec3 normal;
varying vec3 fragNormal;
varying vec3 fragPosition;
uniform mat4 transform;
uniform mat4 modelTransform;
uniform mat3 normalTransform;

void main(void) {
	gl_Position = transform * vec4(position, 1.0);
	fragNormal = normalTransform * normal;
	fragPosition = vec3(modelTransform * vec4(position, 1.0));
}
