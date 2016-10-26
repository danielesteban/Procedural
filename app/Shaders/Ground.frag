#extension GL_OES_standard_derivatives : enable

precision highp float;
varying vec3 fragNormal;
varying vec3 fragPosition;
uniform vec3 sunPosition;
uniform vec3 cameraPosition;

void main(void) {
	vec3 normal = normalize(fragNormal);
	vec3 direction = normalize(sunPosition);
	float diffuse = max(dot(normal, direction), 0.0);

	vec3 cameraDirection = normalize(cameraPosition - fragPosition);
  vec3 reflectDirection = reflect(-direction, normal);
	float specular = pow(max(dot(cameraDirection, reflectDirection), 0.0), 4.0);

	vec2 gridPosition = vec2(fragPosition.x * 2.0, fragPosition.z * 2.0);
	vec2 grid = abs(fract(gridPosition - 0.5) - 0.5) / fwidth(gridPosition);
	vec3 line = vec3(.05, .05, .05) * (1.0 - min(min(grid.x, grid.y), 1.0));

	vec3 color;
	if(fragPosition.y < 16.0) {
		color = vec3(.16, .32, .16);
	} else if(fragPosition.y >= 16.0 && fragPosition.y < 48.0) {
		float step = (fragPosition.y - 16.0) / 32.0;
		color = vec3(.16, .32, .16) * (1.0 - step) + vec3(.32, .32, .16) * step;
	} else if(fragPosition.y >= 48.0 && fragPosition.y < 80.0) {
		float step = (fragPosition.y - 48.0) / 32.0;
		color = vec3(.32, .32, .16) * (1.0 - step) + vec3(.64, .64, .64) * step;
	} else if(fragPosition.y >= 80.0 && fragPosition.y < 112.0) {
		float step = (fragPosition.y - 80.0) / 32.0;
		color = vec3(.64, .64, .64) * (1.0 - step) + vec3(.96, .96, .96) * step;
	} else {
		color = vec3(.96, .96, .96);
	}
	gl_FragColor = vec4((color + line) * (diffuse + specular), 1.0);
}
