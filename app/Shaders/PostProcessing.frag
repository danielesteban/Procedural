precision highp float;

varying vec2 fragUV;
uniform sampler2D textureBlur;
uniform sampler2D textureColor;
uniform sampler2D textureDepth;

const float zNear = 0.1;
const float zFar = 2000.0;

float linearDepth(float depth) {
  return 2.0 * zNear * zFar / (zFar + zNear - (2.0 * depth - 1.0) * (zFar - zNear));
}

const float LOG2 = 1.442695;
const float DENSITY = 0.01;

void main(void) {
	vec4 color = texture2D(textureColor, fragUV);
	vec4 blur = texture2D(textureBlur, fragUV);
	float depth = texture2D(textureDepth, fragUV).r;
	float z = linearDepth(depth);
	float factor = clamp(exp2(-DENSITY * DENSITY * z * z * LOG2), 0.0, 1.0);
	gl_FragColor = mix(blur, color, factor);
}