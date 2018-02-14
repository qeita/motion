'use strict';


let gl;

( () => {
  let canvas, ext;
  let mat, qtn, camera, scenePrg, postPrg, fBuffer;

  let run, startTime, nowTime;

  let resolution = [];
  let mouse = [0.0, 0.0];
  let usePostProcess = false; // ポストプロセスを使用

  let stats, gui;

  let fadeImage = function(){
    this.fadeValue = 0.0;
    this.slideValue = 0;0;
    this.animMount = 0.1;
    this.isAnim = false;
  };

  let config = new fadeImage();


  window.addEventListener('DOMContentLoaded', () => {
    init();
  }, false);


  /**
   * WebGL初期設定
   */
  function init(){
    new CoreGL({
      tex: [
        './assets/img/lenna.jpg',
        './assets/img/sample.jpg',
        './assets/img/effect.png',
      ],
      shader: {
        scene: {
          vs: './assets/shader/scene.vert',
          fs: './assets/shader/scene.frag'  
        },
        post: {
          vs: './assets/shader/post.vert',
          fs: './assets/shader/post.frag'
        }
      },
      callback: (res) => {
        canvas = res.canvas;
        gl = res.gl;
        ext = res.ext;
        mat = res.mat;
        qtn = res.qtn;
        camera = res.camera;
        scenePrg = res.scenePrg;
        postPrg = res.postPrg;
        setup();
        attachEv();
      }
    });
  }

  /**
   * 頂点情報、描画処理
   */
  function setup(texture){
    resolution = [canvas.width, canvas.height];

    scenePrg.attLocation[0] = gl.getAttribLocation(scenePrg.program, 'position');
    scenePrg.attStride[0] = 3;
    scenePrg.attLocation[1] = gl.getAttribLocation(scenePrg.program, 'color');
    scenePrg.attStride[1] = 4;
    scenePrg.attLocation[2] = gl.getAttribLocation(scenePrg.program, 'texCoord');
    scenePrg.attStride[2] = 2;


    scenePrg.uniLocation[0] = gl.getUniformLocation(scenePrg.program, 'mvpMatrix');
    scenePrg.uniType[0] = 'uniformMatrix4fv';
    scenePrg.uniLocation[1] = gl.getUniformLocation(scenePrg.program, 'resolution');
    scenePrg.uniType[1] = 'uniform2fv';
    // scenePrg.uniLocation[2] = gl.getUniformLocation(scenePrg.program, 'time');
    // scenePrg.uniType[2] = 'uniform1f';

    scenePrg.uniLocation[2] = gl.getUniformLocation(scenePrg.program, 'textureUnit0');
    scenePrg.uniType[2] = 'uniform1i';
    scenePrg.uniLocation[3] = gl.getUniformLocation(scenePrg.program, 'textureUnit1');
    scenePrg.uniType[3] = 'uniform1i';
    scenePrg.uniLocation[4] = gl.getUniformLocation(scenePrg.program, 'textureUnit2');
    scenePrg.uniType[4] = 'uniform1i';
    scenePrg.uniLocation[5] = gl.getUniformLocation(scenePrg.program, 'fadeValue');
    scenePrg.uniType[5] = 'uniform1f';
    scenePrg.uniLocation[6] = gl.getUniformLocation(scenePrg.program, 'slideValue');
    scenePrg.uniType[6] = 'uniform1f';

    if(postPrg){
      postPrg.attLocation[0] = gl.getAttribLocation(postPrg.program, 'position');
      postPrg.attStride[0] = 3;
  
      postPrg.uniLocation[0] = gl.getUniformLocation(postPrg.program, 'resolution');
      postPrg.uniType[0] = 'uniform2fv';
      postPrg.uniLocation[1] = gl.getUniformLocation(postPrg.program, 'texture');
      postPrg.uniType[1] = 'uniform1i';
      postPrg.uniLocation[2] = gl.getUniformLocation(postPrg.program, 'time');
      postPrg.uniType[2] = 'uniform1f';  
    }


    let position = [
     -1.0,  1.0,  0.0,
      1.0,  1.0,  0.0,
     -1.0, -1.0,  0.0,
      1.0, -1.0,  0.0,
    ];

    let color = [
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      1.0, 1.0, 1.0, 0.0,
    ];

    let texCoord = [
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      1.0,  1.0
    ];

    let VBO = [
      createVbo(position),
      createVbo(color),
      createVbo(texCoord)
    ];

    let postVBO = [
      createVbo(position)
    ];

    let index = [
      0, 1, 2, 2, 3, 1
    ];

    let IBO = createIbo(index);

    if(usePostProcess && postPrg){
      fBuffer = createFramebuffer(window.innerWidth, window.innerHeight);
      gl.bindTexture(gl.TEXTURE_2D, fBuffer.texture);
    }

    // 行列関連変数の宣言・初期化
    let mMatrix = mat.identity(mat.create());
    let vMatrix = mat.identity(mat.create());
    let pMatrix = mat.identity(mat.create());
    let vpMatrix = mat.identity(mat.create());
    let mvpMatrix = mat.identity(mat.create());
    let qtnMatrix = mat.identity(mat.create());

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    startTime = Date.now();
    nowTime = 0;
    run = true;

    /**
     * Stats.js 初期設定
     */
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    /**
     * datGUI 初期設定
     */
    gui = new dat.GUI();
    gui.add(config, 'fadeValue', 0, 120);
    gui.add(config, 'slideValue', 0, 1);
    gui.add(config, 'animMount', 0, 1);

    render();

    function render(){
      nowTime = (Date.now() - startTime) / 1000;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // ポストプロセスを行わない場合、以下行をコメントアウト
      if(usePostProcess && postPrg){
        gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer.framebuffer);
      }

      gl.useProgram(scenePrg.program);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // カメラ関連パラメータ
      let cameraPosition = [0.0, 0.0, 2.0];
      let centerPoint = [0.0, 0.0, 0.0];
      let cameraUpDirection = [0.0, 1.0, 0.0];
      let fovy = 60 * camera.scale;
      let aspect = window.innerWidth / window.innerHeight;
      let near = 0.1;
      let far = 10.0;

      mat.lookAt(cameraPosition, centerPoint, cameraUpDirection, vMatrix);
      mat.perspective(fovy, aspect, near, far, pMatrix);
      mat.multiply(pMatrix, vMatrix, vpMatrix);

      camera.update();
      mat.identity(qtnMatrix);
      qtn.toMatIV(camera.qtn, qtnMatrix);
      mat.multiply(vpMatrix, qtnMatrix, vpMatrix);

      // setAttribute(VBO, scenePrg.attLocation, scenePrg.attStride);
      setAttribute(VBO, scenePrg.attLocation, scenePrg.attStride, IBO);
      // gl.drawArrays(gl.POINTS, 0, position.length / 3);

      mat.identity(mMatrix);
      // mat.rotate(mMatrix, nowTime * 0.2, [0.0, 1.0, 0.0], mMatrix);
      mat.multiply(vpMatrix, mMatrix, mvpMatrix);

      gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], false, mvpMatrix);
      gl[scenePrg.uniType[1]](scenePrg.uniLocation[1], resolution);
      // gl[scenePrg.uniType[2]](scenePrg.uniLocation[2], nowTime);
      gl[scenePrg.uniType[2]](scenePrg.uniLocation[2], 0);
      gl[scenePrg.uniType[3]](scenePrg.uniLocation[3], 1);
      gl[scenePrg.uniType[4]](scenePrg.uniLocation[4], 2);
      gl[scenePrg.uniType[5]](scenePrg.uniLocation[5], config.fadeValue);
      gl[scenePrg.uniType[6]](scenePrg.uniLocation[6], config.slideValue);

      gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
      // フレームバッファに対する描画ここまで

      // フレームバッファに焼いた描画結果をもってポストプロセス
      if(usePostProcess && postPrg){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(postPrg.program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        setAttribute(postVBO, postPrg.attLocation, postPrg.attStride, IBO);

        gl[postPrg.uniType[0]](postPrg.uniLocation[0], resolution);
        gl[postPrg.uniType[1]](postPrg.uniLocation[1], 0);
        gl[postPrg.uniType[2]](postPrg.uniLocation[2], nowTime);
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
      }

      stats.update();

      gl.flush();
      if(run){requestAnimationFrame(render);}
    }
  }



  /**
   * イベントをアタッチ
   */
  function attachEv(){
    /**
     * リサイズイベント
     */
    window.addEventListener('resize', () => {
      resize();
    }, false);

    /**
     * キーダウンイベント
     */
    window.addEventListener('keydown', (e) => {
      run = e.keyCode !== 27;
    }, false);

    /**
     * マウス移動
     */
    // window.addEventListener('mousemove', (e) => {
    //   let x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
    //   let y = (e.clientY / window.innerHeight) * 2.0 - 1.0;
    //   mouse = [x, -y];
    // }, false);

    function setAnim(){
      if(config.isAnim) return;
      config.isAnim = true;

      let isUp = true;
      let slideType = 1;

      if(config.slideValue >= 1.0){
        slideType = 0;
      }
      
      let fadeAnim = () => {
        if(slideType === 1){
          config.slideValue += config.animMount * 0.1;
          if(config.slideValue >= 1.0){
            config.slideValue = 1.0;
          }
        }else{
          config.slideValue -= config.animMount * 0.1;
          if(config.slideValue <= 0.0){
            config.slideValue = 0.0;
          }
        }

        if(isUp){
          setTimeout( () => {
            config.fadeValue += config.animMount;
            if(config.fadeValue > 20.0){
              isUp = false;
            }
            fadeAnim();
          }, 1000 / 60);  
        }else{
          setTimeout( () => {
            config.fadeValue -= config.animMount;
            if(config.fadeValue <= 0.0){
              config.isAnim = false;
              config.fadeValue = 0.0;
            }else{
              fadeAnim();
            }
          }, 1000 / 60);  
        }
      };

      fadeAnim();
    }

    canvas.addEventListener('click', () => {
      setAnim();
    }, false);

    /**
     * カメラ関連イベント
     */
    // let ua = window.navigator.userAgent.toLowerCase();
    // if(ua.indexOf('iphone') > 0 || ua.indexOf('ipad') > 0 || ua.indexOf('android') > 0){
    //   canvas.addEventListener('touchstart', camera.startEvent, false);
    //   canvas.addEventListener('touchmove', camera.moveEvent, false);
    //   canvas.addEventListener('touchend', camera.endEvent, false);
    // }else{
    //   canvas.addEventListener('mousedown', camera.startEvent, false);
    //   canvas.addEventListener('mousemove', camera.moveEvent, false);
    //   canvas.addEventListener('mouseup', camera.endEvent, false);
    //   canvas.addEventListener('wheel', camera.wheelEvent, false);
    // }
  }

  /**
   * レンダラーリサイズ
   */
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resolution = [canvas.width, canvas.height];

    if(usePostProcess && postPrg){
      fBuffer = createFramebuffer(canvas.width, canvas.height);
      gl.bindTexture(gl.TEXTURE_2D, fBuffer.texture);
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
  }

})();