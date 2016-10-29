@import ./Lighting;

varying vec2 fragUV;
uniform vec3 albedo;
uniform sampler2D texture;

void main(void) {
	vec3 color = vec3(texture2D(texture, fragUV));
	gl_FragColor = vec4(color * albedo * sunLight(), 1.0);
}
