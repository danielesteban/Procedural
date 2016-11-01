precision mediump float;

varying vec2 fragUV;
uniform sampler2D textureBlur;
uniform sampler2D textureColor;
uniform sampler2D textureDepth;
uniform sampler2D textureNoise;
uniform float animation;
uniform float nightVision;
uniform float modifier;

const float zNear = 0.1;
const float zFar = 2000.0;

const float LOG2 = 1.442695;

float linearDepth(float depth) {
	return 2.0 * zNear * zFar / (zFar + zNear - (2.0 * depth - 1.0) * (zFar - zNear));
}

void main(void) {
	vec2 uv = fragUV.st;
	vec3 noise;

	if(nightVision == 1.0) {
		vec2 offset = vec2(0.4*sin(animation * 50.0), 0.4*cos(animation * 50.0));
		noise = texture2D(textureNoise, (uv * 3.5) + offset).rgb;
		uv += (noise.xy*0.005) - 0.0025;
	}

	vec3 color = texture2D(textureColor, uv).rgb;
	vec3 blur = texture2D(textureBlur, uv).rgb;
	float depth = texture2D(textureDepth, uv).r;
	float z = linearDepth(depth);
	float density = modifier * 0.006;
	float factor = clamp(exp2(-density * density * z * z * LOG2), 0.0, 1.0);
	vec3 composite = mix(blur, color, factor);

	if(nightVision == 1.0) {
		float lum = dot(vec3(0.30, 0.59, 0.11), composite);
		if(lum < 0.3) composite *= 6.0;
		composite = (composite + (noise*0.2)) * vec3(0.1, 0.95, 0.2);
		float distL = distance(vec2(fragUV.s * 2.0, fragUV.t), vec2(0.5, 0.5));
		float distR = distance(vec2(fragUV.s * 2.0, fragUV.t), vec2(1.5, 0.5));
		const float inner = 0.40;
		const float outer = 0.46;
		composite *= smoothstep(outer, inner, distL) + smoothstep(outer, inner, distR);
	}

	gl_FragColor = vec4(composite, 1.0);
}
