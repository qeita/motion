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
    let canvas, scenePrg;

    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl = canvas.getContext('webgl');

    if(gl === null){
      console.log('webgl unsupported');
    }

    // 拡張機能を有効化
    let ext = getWebGLExtensions();
    let callback = params.callback;

    loadShaderSource(
      params.vs,
      params.fs,
      (shader) => {
        let vs = createShader(shader.vs, gl.VERTEX_SHADER);
        let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
        let prg = createProgram(vs, fs);
        if(prg === null){ return; }
        scenePrg = new ProgramParameter(prg);
        if(callback){
          callback({
            canvas: canvas,
            gl: gl,
            ext: ext,
            prg: scenePrg
          });
        }
      }
    )
  }
}