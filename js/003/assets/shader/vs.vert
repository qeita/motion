attribute vec3 position;
attribute vec2 texCoord;

uniform float time;
uniform mat4 mvpMatrix;

varying vec2 vTexCoord;
varying float vTime;
// uniform vec2 mouse;

float rand(vec2 co){
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}


void main(){
  // float f = length(mouse);
  vTexCoord = texCoord;
  vTime = time;
  gl_Position = mvpMatrix * vec4(position, 1.0);
}