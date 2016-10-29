@import ./Lighting;

uniform vec3 albedo;

void main(void) {
	gl_FragColor = vec4(albedo * sunLight(), 1.0);
}
