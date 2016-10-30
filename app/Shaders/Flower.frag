@import ./Lighting;

varying vec2 fragUV;
uniform sampler2D texture;

const float LOG2 = 1.442695;
const float DENSITY = 0.01;

void main(void) {
	vec4 color = texture2D(texture, fragUV);
	float z = gl_FragCoord.z / gl_FragCoord.w;
	float alpha = exp2( -DENSITY * DENSITY * z * z * LOG2 );
	alpha = color.a * clamp(alpha, 0.0, 1.0);
	gl_FragColor = vec4(color.rgb * alpha * sunLight(), alpha);
}
