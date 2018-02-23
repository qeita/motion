precision mediump float;

// ref: http://nogson2.hatenablog.com/entry/2018/01/19/002342

uniform vec2 resolution;
uniform sampler2D textureUnit0;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform float time;
uniform float slideValue;
uniform float shakeLength;
uniform float shakeWidth;
uniform float speed;

varying vec4 vColor;
varying vec2 vTex;


float orb(vec2 p, vec2 offset){
  float f = length(p - offset);
  return 0.05 / f;
}


void main(){

  float offsetX = sin(gl_FragCoord.x * shakeLength + time * speed) * shakeWidth;
  float offsetY = cos(gl_FragCoord.y * shakeLength + time * speed) * shakeWidth;

  vec2 p = (gl_FragCoord.xy * 2.0 - resolution)/min(resolution.x, resolution.y);

  vec4 samplerColor0 = texture2D(textureUnit0, vec2(vTex.x + offsetX, vTex.y + offsetY));
  vec4 samplerColor1 = texture2D(textureUnit1, vec2(vTex.x + offsetX, vTex.y + offsetY));
  vec4 samplerColor2 = texture2D(textureUnit2, vTex);

  gl_FragColor = samplerColor0 * (1.0 - slideValue) + samplerColor1 * slideValue;
}