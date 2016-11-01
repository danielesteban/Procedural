precision mediump float;

varying vec2 fragUV;
uniform sampler2D textureColor;
uniform vec2 resolution;
uniform vec2 direction;

void main(void) {
	vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(textureColor, fragUV) * 0.2270270270;
  color += texture2D(textureColor, fragUV + (off1 / resolution)) * 0.3162162162;
  color += texture2D(textureColor, fragUV - (off1 / resolution)) * 0.3162162162;
  color += texture2D(textureColor, fragUV + (off2 / resolution)) * 0.0702702703;
  color += texture2D(textureColor, fragUV - (off2 / resolution)) * 0.0702702703;
  gl_FragColor = color;
}
