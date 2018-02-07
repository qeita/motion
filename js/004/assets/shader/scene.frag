precision highp float;

varying vec4 vColor;


float orb(vec2 p, vec2 offset){
  float f = length(p - offset);
  return 0.05 / f;
}


void main(){
  // vec2 p = (gl_FragCoord.xy * 2.0 - resolution)/min(resolution.x, resolution.y);

  gl_FragColor = vColor;
}