@import ./Lighting;

uniform sampler2D texture;
uniform sampler2D secondaryTexture;

const vec3 sand = vec3(.96, .64, .38);
const vec3 grass = vec3(.16, .32, .16);
const vec3 dirt = vec3(.32, .32, .16);
const vec3 stone = vec3(.64, .64, .48);
const vec3 snow = vec3(.96, .96, .96);

void main(void) {
	vec3 color = vec3(texture2D(texture, vec2(fragPosition.x * 0.25, fragPosition.z * 0.25)));
	float step;
	if(fragPosition.y < 0.2) {
		step = fragPosition.y / 0.2;
		color *= sand * step;
		color += mix(vec3(texture2D(secondaryTexture, vec2(fragPosition.x * 0.125 + animation, fragPosition.z * 0.125 + animation))), vec3(texture2D(secondaryTexture, vec2(fragPosition.x * 0.25 - animation, fragPosition.z * 0.25 - animation))), 0.5) * (1.0 - step);
	} else if(fragPosition.y >= 0.2 && fragPosition.y < 1.0) {
		step = (fragPosition.y - 0.2) / 0.8;
		color *= sand * (1.0 - step) + grass * step;
	} else if(fragPosition.y >= 1.0 && fragPosition.y < 16.0) {
		color *= grass;
	} else if(fragPosition.y >= 16.0 && fragPosition.y < 32.0) {
		step = (fragPosition.y - 16.0) / 16.0;
		color *= grass * (1.0 - step) + dirt * step;
	} else if(fragPosition.y >= 32.0 && fragPosition.y < 64.0) {
		step = (fragPosition.y - 32.0) / 32.0;
		color *= dirt * (1.0 - step) + stone * step;
	} else if(fragPosition.y >= 64.0 && fragPosition.y < 96.0) {
		step = (fragPosition.y - 64.0) / 32.0;
		color *= stone * (1.0 - step) + snow * step;
	} else {
		color *= snow;
	}

	gl_FragColor = vec4(color * sunLight(), 1.0);
}
