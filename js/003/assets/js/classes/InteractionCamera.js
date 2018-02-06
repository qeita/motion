'use strict';

/**
 * @class
 */
class InteractionCamera{
  /**
   * @constructor
   */
  constructor(qtn){
    let ua = window.navigator.userAgent.toLowerCase();
    if(ua.indexOf('iphone') > 0 || ua.indexOf('ipad') > 0 || ua.indexOf('android') > 0){
      this.device = 'other';
    }else{
      this.device = 'pc';
    }

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

    // マルチタッチの際、面積を保存
    this.touchstart_area = 0;
    this.touchmove_area = 0;

    this.startEvent = this.startEvent.bind(this);
    this.moveEvent = this.moveEvent.bind(this);
    this.endEvent = this.endEvent.bind(this);
    this.wheelEvent = this.wheelEvent.bind(this);
  }

  getPosition(e){
    if(this.device === 'pc'){
      return [e.clientX, e.clientY];
    }else{
      return [e.touches[0].pageX, e.touches[0].pageY];
    }
  }

  startEvent(e){
    this.dragging = true;
    this.prevMouse = this.getPosition(e);

    if(this.device === 'other' && e.touches.length > 1){
      let w = Math.abs(e.touches[1].pageX - e.touches[0].pageX);
      let h = Math.abs(e.touches[1].pageY - e.touches[0].pageY);
      this.touchstart_area = w * h;
    }
  }

  moveEvent(e){
    if(this.dragging !== true) return;
    let x = this.prevMouse[0] - this.getPosition(e)[0];
    let y = this.prevMouse[1] - this.getPosition(e)[1];
    this.rotation = Math.sqrt(x * x + y * y) / this.rotationScale * this.rotatePower;
    this.rotateAxis[0] = y;
    this.rotateAxis[1] = x;
    this.prevMouse = this.getPosition(e);

    if(this.device === 'other' && e.touches.length > 1){
      let w = Math.abs(e.touches[1].pageX - e.touches[0].pageX);
      let h = Math.abs(e.touches[1].pageY - e.touches[0].pageY);
      this.touchmove_area = w * h;

      let area = this.touchstart_area - this.touchmove_area;
      if(area < 0){
        this.scalePower -= 0.02; // 拡大
      }else{
        this.scalePower += 0.02; // 縮小
      }
    }
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