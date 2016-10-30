attribute vec3 position;
attribute vec2 uv;
varying vec3 fragNormal;
varying vec2 fragUV;
varying vec3 fragPosition;
uniform mat4 transform;
uniform mat4 modelTransform;
uniform vec3 groundNormal;

void main(void) {
	gl_Position = transform * vec4(position, 1.0);
	fragNormal = groundNormal;
	fragUV = uv;
	fragPosition = vec3(modelTransform * vec4(position, 1.0));
}
