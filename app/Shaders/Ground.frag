precision highp float;
varying vec3 fragNormal;
varying vec3 fragPosition;
uniform sampler2D texture;
uniform vec3 sunPosition;
uniform vec3 cameraPosition;
uniform float modifier;

const vec3 sand = vec3(.76, .70, .50);
const vec3 grass = vec3(.16, .32, .16);
const vec3 dirt = vec3(.32, .32, .16);
const vec3 stone = vec3(.64, .64, .48);
const vec3 snow = vec3(.96, .96, .96);

void main(void) {
	vec3 color = vec3(texture2D(texture, vec2(fragPosition.x * 0.5, fragPosition.z * 0.5)));
	float step;
	if(fragPosition.y < 3.0) {
		step = fragPosition.y / 3.0;
		color *= sand * (1.0 - step) + grass * step;
	} else if(fragPosition.y >= 3.0 && fragPosition.y < 16.0) {
		color *= grass;
	} else if(fragPosition.y >= 16.0 && fragPosition.y < 48.0) {
		step = (fragPosition.y - 16.0) / 32.0;
		color *= grass * (1.0 - step) + dirt * step;
	} else if(fragPosition.y >= 48.0 && fragPosition.y < 80.0) {
		step = (fragPosition.y - 48.0) / 32.0;
		color *= dirt * (1.0 - step) + stone * step;
	} else if(fragPosition.y >= 80.0 && fragPosition.y < 112.0) {
		step = (fragPosition.y - 80.0) / 32.0;
		color *= stone * (1.0 - step) + snow * step;
	} else {
		color *= snow;
	}

	vec3 normal = normalize(fragNormal);
	vec3 direction = normalize(sunPosition);
	float diffuse = max(dot(normal, direction), 0.0);

	vec3 cameraDirection = normalize(cameraPosition - fragPosition);
  vec3 reflectDirection = reflect(-direction, normal);
	float specular = pow(max(dot(cameraDirection, reflectDirection), 0.0), 4.0);

	gl_FragColor = vec4(color * (diffuse + specular) * max(0.1, modifier), 1.0);
}
