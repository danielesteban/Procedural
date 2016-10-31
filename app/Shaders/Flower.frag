@import ./Lighting;

varying vec2 fragUV;
uniform float texture;
uniform sampler2D textureAllium;
uniform sampler2D textureTulip;

const float LOG2 = 1.442695;
const float DENSITY = 0.01;

void main(void) {
	vec4 color = texture == 1.0 ? texture2D(textureAllium, fragUV) : texture2D(textureTulip, fragUV);
	float z = gl_FragCoord.z / gl_FragCoord.w;
	float alpha = exp2( -DENSITY * DENSITY * z * z * LOG2 );
	alpha = color.a * clamp(alpha, 0.0, 1.0);
	gl_FragColor = vec4(color.rgb * alpha * sunLight(), alpha);
}
