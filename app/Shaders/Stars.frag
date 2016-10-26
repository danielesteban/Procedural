precision highp float;
varying float fragAlpha;
uniform float modifier;

void main(void) {
	gl_FragColor = vec4(vec3(0.9), fragAlpha * modifier);
}
