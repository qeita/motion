precision mediump float;


// 擬似ディスプレースメントマップ
// refer: https://qiita.com/7CIT/items/5ad7bb806b9e6432c3f6

uniform vec2 resolution;
uniform sampler2D textureUnit0;
uniform sampler2D textureUnit1;

varying vec2 vTexCoord;
varying float vTime;

const float r = 0.6;

float orb(vec2 p, vec2 offset){
  float f = length(p - offset);
  return 0.05 / f;
}


void main(){
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution)/min(resolution.x, resolution.y);

  vec4 samplerColor0 = texture2D(textureUnit0, vTexCoord);
  // vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);

  // vec4 dest = samplerColor0 * cos(vTime * 0.6) + samplerColor1 * sin(vTime * 0.6);
  // gl_FragColor = dest + vec4(vec3( orb(p, vec2(cos(vTime) * r, sin(vTime) * r)) ), 1.0);

  float r = samplerColor0.r + 0.05 * sin(vTime + samplerColor0.r/0.01);
  float g = samplerColor0.g + 0.05 * cos(vTime + samplerColor0.g/0.01);
  float b = samplerColor0.b + 0.05 * sin(vTime + samplerColor0.b/0.01);

  // p *= 4.0;
  // float l = mod(floor(p.x) + floor(p.y), 2.0);
  float l = sin(length(p) * 30.0 - vTime * 5.0);
  p += l * 0.1;
  p *= 4.0;

  float m = mod(floor(p.x) + floor(p.y), 2.0);

  // gl_FragColor = samplerColor0;
  // gl_FragColor = vec4(vec3(r, g, b) + vec3(l) * 0.2, 1.0);
  gl_FragColor = vec4(vec3(r, g, b) + vec3(m) * 0.2, 1.0);

  // gl_FragColor = vec4(vec3(r, g, b), 1.0);
}