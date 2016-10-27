precision highp float;
varying vec3 fragColor;
uniform float modifier;

void main(void) {
	gl_FragColor = vec4(fragColor * max(0.1, modifier), 1.0);
}
