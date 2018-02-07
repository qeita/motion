attribute vec3 position;
attribute vec4 color;

uniform float time;
uniform mat4 mvpMatrix;
varying vec4 vColor;


float rand(vec2 co){
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}


void main(){
  vColor = color;
  gl_Position = mvpMatrix * vec4(position, 1.0);
}