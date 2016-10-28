#extension GL_OES_standard_derivatives : enable

@import ./Lighting;

void main(void) {
	vec2 gridPosition = vec2(fragPosition.y * 0.5, 0);
	vec2 grid = abs(fract(gridPosition - 0.5) - 0.5) / fwidth(gridPosition);
	float circle = length(gridPosition);
	circle = abs(fract(circle - 0.5) - 0.5) / fwidth(circle);

	vec3 color = vec3(.08, .16, .08) + vec3(.08, .16, .08) * (1.0 - min(min(circle * 1.5, min(grid.x, grid.y)), 1.0));
	gl_FragColor = vec4(color * sunLight(), 1.0);
}
