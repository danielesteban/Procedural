attribute vec3 position;
attribute vec3 normal;
varying vec3 fragNormal;
varying vec2 fragUV;
varying vec3 fragPosition;
uniform mat4 transform;
uniform mat4 modelTransform;
uniform mat3 normalTransform;
uniform vec3 scale;

void main(void) {
	gl_Position = transform * vec4(position, 1.0);
	fragNormal = normalTransform * normal;
	vec3 uv = position * scale;
	fragUV = vec2(uv.x + uv.y, uv.z + uv.y);
	fragPosition = vec3(modelTransform * vec4(position, 1.0));
}
