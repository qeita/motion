attribute vec3 position;

// uniform vec2 mouse;

void main(){
  // float f = length(mouse);
  gl_Position = vec4(position, 1.0);
}