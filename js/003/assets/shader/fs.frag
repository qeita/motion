precision mediump float;

uniform vec2 resolution;
uniform float time;

const float r = 0.6;

float orb(vec2 p, vec2 offset){
  float f = length(p - offset);
  return 0.05 / f;
}


void main(){
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution)/min(resolution.x, resolution.y);

  gl_FragColor = vec4(vec3( orb(p, vec2(cos(time) * r, sin(time) * r)) ), 1.0);
}