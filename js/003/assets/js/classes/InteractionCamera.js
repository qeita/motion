'use strict';

/**
 * @class
 */
class InteractionCamera{
  /**
   * @constructor
   */
  constructor(qtn){
    this.q = qtn;
    this.qtn = this.q.identity(this.q.create());
    this.dragging = false;
    this.prevMouse = [0, 0];
    this.rotationScale = Math.min(window.innerWidth, window.innerHeight);
    this.rotation = 0.0;
    this.rotateAxis = [0.0, 0.0, 0.0];
    this.rotatePower = 1.5;
    this.rotateAttenuation = 0.9;
    this.scale = 1.0;
    this.scalePower = 0.0;
    this.scaleAttenuation = 0.8;
    this.scaleMin = 0.5;
    this.scaleMax = 1.5;
    this.startEvent = this.startEvent.bind(this);
    this.moveEvent = this.moveEvent.bind(this);
    this.endEvent = this.endEvent.bind(this);
    this.wheelEvent = this.wheelEvent.bind(this);
  }

  startEvent(e){
    this.dragging = true;
    this.prevMouse = [e.clientX, e.clientY];
  }

  moveEvent(e){
    if(this.dragging !== true) return;
    let x = this.prevMouse[0] - e.clientX;
    let y = this.prevMouse[1] - e.clientY;
    this.rotation = Math.sqrt(x * x + y * y) / this.rotationScale * this.rotatePower;
    this.rotateAxis[0] = y;
    this.rotateAxis[1] = x;
    this.prevMouse = [e.clientX, e.clientY];
  }

  endEvent(){
    this.dragging = false;
  }

  wheelEvent(e){
    let w = e.wheelDelta;
    if(w > 0){
      this.scalePower = -0.05;
    }else if(w < 0){
      this.scalePower = 0.05;
    }
  }

  update(){
    this.scalePower *= this.scaleAttenuation;
    this.scale = Math.max(this.scaleMin, Math.min(this.scaleMax, this.scale + this.scalePower));
    if(this.rotation === 0.0) return;
    this.rotation *= this.rotateAttenuation;
    let q = this.q.identity(this.q.create());
    this.q.rotate(this.rotation, this.rotateAxis, q);
    this.q.multiply(this.qtn, q, this.qtn);
  }
}