@import ./Lighting;

uniform sampler2D textureWater;
uniform sampler2D textureSand;
uniform sampler2D textureGrass;
uniform sampler2D textureStone;
uniform sampler2D textureSnow;

const vec3 grass = vec3(.16, .32, .16);
const vec3 dirt = vec3(.32, .32, .16);

void main(void) {
	vec2 fragUV = vec2(fragPosition.x * 0.5, fragPosition.z * 0.5);
	vec3 color;
	float step;
	if(fragPosition.y < 0.2) {
		step = fragPosition.y / 0.2;
		color = vec3(texture2D(textureSand, fragUV)) * step;
		color += mix(vec3(texture2D(textureWater, vec2(fragPosition.x * 0.25 + animation, fragPosition.z * 0.25 + animation))), vec3(texture2D(textureWater, vec2(fragPosition.x * 0.5 - animation, fragPosition.z * 0.5 - animation))), 0.5) * (1.0 - step);
	} else if(fragPosition.y >= 0.2 && fragPosition.y < 1.0) {
		step = (fragPosition.y - 0.2) / 0.8;
		color = vec3(texture2D(textureSand, fragUV)) * (1.0 - step);
		color += vec3(texture2D(textureGrass, fragUV)) * grass * step;
	} else if(fragPosition.y >= 1.0 && fragPosition.y < 16.0) {
		color = vec3(texture2D(textureGrass, fragUV)) * grass;
	} else if(fragPosition.y >= 16.0 && fragPosition.y < 48.0) {
		step = (fragPosition.y - 16.0) / 32.0;
		color = vec3(texture2D(textureGrass, fragUV)) * (grass * (1.0 - step) + dirt * step);
	} else if(fragPosition.y >= 48.0 && fragPosition.y < 80.0) {
		step = (fragPosition.y - 48.0) / 32.0;
		color = vec3(texture2D(textureGrass, fragUV)) * dirt * (1.0 - step);
		color += vec3(texture2D(textureStone, fragUV)) * step;
	} else if(fragPosition.y >= 80.0 && fragPosition.y < 112.0) {
		step = (fragPosition.y - 80.0) / 32.0;
		color = vec3(texture2D(textureStone, fragUV)) * (1.0 - step);
		color += vec3(texture2D(textureSnow, fragUV)) * step;
	} else {
		color = vec3(texture2D(textureSnow, fragUV));
	}

	gl_FragColor = vec4(color * sunLight(), 1.0);
}
