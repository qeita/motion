precision highp float;

uniform vec2 resolution;
uniform sampler2D textureUnit0;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform float fadeValue;
uniform float slideValue;

varying vec4 vColor;
varying vec2 vTex;


float orb(vec2 p, vec2 offset){
  float f = length(p - offset);
  return 0.05 / f;
}


void main(){
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution)/min(resolution.x, resolution.y);

  vec4 samplerColor0 = texture2D(textureUnit0, vTex);
  vec4 samplerColor1 = texture2D(textureUnit1, vTex);
  vec4 samplerColor2 = texture2D(textureUnit2, vTex);

  gl_FragColor = (samplerColor0 * (1.0 - slideValue)) + (samplerColor1 * slideValue) + (samplerColor2 * fadeValue);
}