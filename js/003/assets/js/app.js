'use strict';

let gl;

( () => {
  let canvas, ext;

  let run, startTime, nowTime;

  let resolution = [];
  let mouse = [0.0, 0.0];
  let scenePrg;


  window.addEventListener('DOMContentLoaded', () => {
    init();
  }, false);


  /**
   * WebGL初期設定
   */
  function init(){
    new CoreGL({
      vs: './assets/shader/vs.vert',
      fs: './assets/shader/fs.frag',
      callback: (res) => {
        canvas = res.canvas;
        gl = res.gl;
        ext = res.ext;
        scenePrg = res.prg;
        setup();
      }
    });
    attachEv();
  }

  /**
   * 頂点情報、描画処理
   */
  function setup(texture){
    resolution = [canvas.width, canvas.height];

    scenePrg.attLocation[0] = gl.getAttribLocation(scenePrg.program, 'position');
    scenePrg.attStride[0] = 3;
    // scenePrg.attLocation[1] = gl.getAttribLocation(scenePrg.program, 'color');
    // scenePrg.attStride[1] = 4;

    scenePrg.uniLocation[0] = gl.getUniformLocation(scenePrg.program, 'resolution');
    scenePrg.uniType[0] = 'uniform2fv';
    scenePrg.uniLocation[1] = gl.getUniformLocation(scenePrg.program, 'time');
    scenePrg.uniType[1] = 'uniform1f';
    // scenePrg.uniLocation[2] = gl.getUniformLocation(scenePrg.program, 'mouse');
    // scenePrg.uniType[2] = 'uniform2fv';

    let position = [
      1.0,  1.0,  0.0,
     -1.0,  1.0,  0.0,
     -1.0, -1.0,  0.0,
      1.0, -1.0,  0.0,
    ];

    // let color = [
    //   1.0, 1.0, 1.0, 1.0,
    //   1.0, 0.0, 0.0, 1.0,
    //   0.0, 1.0, 0.0, 1.0,
    //   0.0, 0.0, 1.0, 1.0,
    // ];

    let VBO = [
      createVbo(position),
      // createVbo(color)
    ];

    let index = [
      0, 1, 2, 2, 3, 0
    ];

    let IBO = createIbo(index);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    startTime = Date.now();
    nowTime = 0;
    run = true;

    render();

    function render(){
      nowTime = (Date.now() - startTime) / 1000;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(scenePrg.program);

      gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], resolution);
      gl[scenePrg.uniType[1]](scenePrg.uniLocation[1], nowTime);
      // gl[scenePrg.uniType[2]](scenePrg.uniLocation[2], mouse);

      // setAttribute(VBO, scenePrg.attLocation, scenePrg.attStride);
      setAttribute(VBO, scenePrg.attLocation, scenePrg.attStride, IBO);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // gl.drawArrays(gl.POINTS, 0, position.length / 3);
      gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
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
    window.addEventListener('mousemove', (e) => {
      let x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
      let y = (e.clientY / window.innerHeight) * 2.0 - 1.0;
      mouse = [x, -y];
    }, false);
  }

  /**
   * レンダラーリサイズ
   */
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resolution = [canvas.width, canvas.height];

    gl.viewport(0, 0, canvas.width, canvas.height);
  }

})();