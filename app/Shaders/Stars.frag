precision mediump float;

varying float fragAlpha;
uniform float modifier;

void main(void) {
	float alpha = fragAlpha * modifier;
	gl_FragColor = vec4(vec3(0.9) * alpha, alpha);
}
