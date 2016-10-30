precision highp float;
varying vec2 fragUV;
uniform sampler2D texture;
uniform float modifier;

const float LOG2 = 1.442695;
const float DENSITY = 0.01;

void main(void) {
	float z = gl_FragCoord.z / gl_FragCoord.w;
	float factor = exp2( -DENSITY * DENSITY * z * z * LOG2 );
	factor = clamp(factor, 0.0, 1.0);
	vec4 color = texture2D(texture, fragUV);
	gl_FragColor = vec4(color.rgb * modifier, color.a * factor);
}
