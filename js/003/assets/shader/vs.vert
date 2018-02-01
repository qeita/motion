attribute vec3 position;
attribute vec4 color;

uniform vec2 mouse;
varying vec4 vColor;

void main(){
  float f = length(mouse);
  gl_Position = vec4(position * f, 1.0);

  vColor = color;

  gl_PointSize = 8.0;
}