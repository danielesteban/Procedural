precision highp float;
varying vec3 fragColor;
uniform float modifier;

void main(void) {
	gl_FragColor = vec4(fragColor * modifier, 1.0);
}
