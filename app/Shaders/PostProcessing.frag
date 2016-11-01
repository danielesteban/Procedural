precision mediump float;

varying vec2 fragUV;
uniform sampler2D textureBlur;
uniform sampler2D textureColor;
uniform sampler2D textureDepth;
uniform float modifier;

const float zNear = 0.1;
const float zFar = 2000.0;

const float LOG2 = 1.442695;

float linearDepth(float depth) {
	return 2.0 * zNear * zFar / (zFar + zNear - (2.0 * depth - 1.0) * (zFar - zNear));
}

void main(void) {
	vec3 color = vec3(texture2D(textureColor, fragUV));
	vec3 blur = vec3(texture2D(textureBlur, fragUV));
	float depth = texture2D(textureDepth, fragUV).r;
	float z = linearDepth(depth);
	float density = modifier * 0.006;
	float factor = clamp(exp2(-density * density * z * z * LOG2), 0.0, 1.0);
	gl_FragColor = vec4(mix(blur, color, factor), 1.0);
}
