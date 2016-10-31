precision highp float;
varying vec3 fragNormal;
varying vec3 fragPosition;
uniform vec3 sunPosition;
uniform vec3 cameraPosition;
uniform float modifier;
uniform float animation;

float sunLight() {
	vec3 normal = normalize(fragNormal);
	vec3 direction = normalize(sunPosition);
	float diffuse = max(dot(normal, direction), 0.0);

	vec3 viewDirection = normalize(cameraPosition - fragPosition);
	vec3 halfwayDir = normalize(direction + viewDirection);
	float specular = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

	return max(0.1, (diffuse + min(diffuse, specular)) * modifier);
}
