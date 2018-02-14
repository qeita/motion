'use strict';

/**
 * @class
 */
class CoreGL{
  /**
   * @constructor
   * @param {object} params - パラメータ {vs: [VSパス], fs: [FSパス], callback: [コールバック]}
   */
  constructor(params){
    // 初期化
    let canvas, scenePrg, postPrg;

    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl = canvas.getContext('webgl');

    if(gl === null){
      console.log('webgl unsupported');
    }

    // 拡張機能を有効化
    let ext = getWebGLExtensions();
    let mat = new matIV();
    let qtn = new qtnIV();
    let camera = new InteractionCamera(qtn);
    camera.update();

    let callback = params.callback;

    // シェーダ読み込み完了後の確認
    let loadCheck = () => {
      if(scenePrg != null && postPrg != null){
        if(callback){
          callback({
            canvas: canvas,
            gl: gl,
            ext: ext,
            mat: mat,
            qtn: qtn,
            camera: camera,
            scenePrg: scenePrg,
            postPrg: postPrg
          });
        }        
      }
    };

    // シェーダファイル読み込み
    let loadShader = () => {
      if(params.shader.scene.vs && params.shader.scene.fs){
        loadShaderSource(
          params.shader.scene.vs,
          params.shader.scene.fs,
          (shader) => {
            let vs = createShader(shader.vs, gl.VERTEX_SHADER);
            let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
            let prg = createProgram(vs, fs);
            if(prg === null){ return; }
            scenePrg = new ProgramParameter(prg);
            loadCheck();
          }
        );
      }

      if(params.shader.post.vs && params.shader.post.fs){
        loadShaderSource(
          params.shader.post.vs,
          params.shader.post.fs,
          (shader) => {
            let vs = createShader(shader.vs, gl.VERTEX_SHADER);
            let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
            let prg = createProgram(vs, fs);
            if(prg === null){ return; }
            postPrg = new ProgramParameter(prg);
            loadCheck();
          }
        );  
      }else{
        postPrg = false;
      }
    };

    if(params.tex.length > 0){
      // 読み込むテクスチャの数に応じて変更
      createTexture(params.tex[0], (texture0) => {
        // createTexture(params.tex[1], (texture1) => {
        //   createTexture(params.tex[2], (texture2) => {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
            // gl.activeTexture(gl.TEXTURE1);
            // gl.bindTexture(gl.TEXTURE_2D, texture1);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // gl.activeTexture(gl.TEXTURE2);
            // gl.bindTexture(gl.TEXTURE_2D, texture2);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            loadShader();
        //   });
        // });
      });
    }else{
      loadShader();
    }
  }
}