'use strict';

/**
 * @class
 */
class ProgramParameter{
  /**
   * @constructor
   * @param {WebGLProgram} program - プログラムオブジェクト 
   */
  constructor(program){
    /**
     * @type {WebGLProgram} プログラムオブジェクト
     */
    this.program = program;

    /**
     * @type {Array} attribute location を格納する配列
     */
    this.attLocation = [];

    /**
     * @type {Array} attribute stride を格納する配列
     */
    this.attStride = [];

    /**
     * @type {Array} uniform location を格納する配列
     */
    this.uniLocation = [];

    /**
     * @type {Array} uniform 変数タイプを格納する配列
     */
    this.uniType = [];
  }
}