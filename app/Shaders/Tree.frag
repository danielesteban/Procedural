#extension GL_OES_standard_derivatives : enable

precision highp float;
varying vec3 fragNormal;
varying vec3 fragPosition;
uniform vec3 sunPosition;
uniform vec3 cameraPosition;
uniform float modifier;
uniform float animation;

void main(void) {
	vec2 gridPosition = vec2(fragPosition.y * 0.5, 0);
	vec2 grid = abs(fract(gridPosition - 0.5) - 0.5) / fwidth(gridPosition);
	float circle = length(gridPosition);
	circle = abs(fract(circle - 0.5) - 0.5) / fwidth(circle);

	vec3 color = vec3(.08, .16, .08) + vec3(.08, .16, .08) * (1.0 - min(min(circle * 1.5, min(grid.x, grid.y)), 1.0));

	vec3 normal = normalize(fragNormal);
	vec3 direction = normalize(sunPosition);
	float diffuse = max(dot(normal, direction), 0.0);

	vec3 cameraDirection = normalize(cameraPosition - fragPosition);
  vec3 reflectDirection = reflect(-direction, normal);
	float specular = pow(max(dot(cameraDirection, reflectDirection), 0.0), 4.0);

	gl_FragColor = vec4(color * max(0.15, (diffuse + specular) * modifier), 1.0);
}
