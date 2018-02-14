'use strict';

/**
 * XHRでシェーダのソースコードを外部ファイルから取得、コールバック
 * @param {string} vsPath - 頂点シェーダの記述されたファイルパス
 * @param {string} fsPath - フラグメントシェーダの記述されたファイルパス
 * @param {function} callback - コールバック関数
 */
function loadShaderSource(vsPath, fsPath, callback){
  let vs, fs;
  xhr(vsPath, true);
  xhr(fsPath, false);
  function xhr(source, isVertex){
    let xml = new XMLHttpRequest();
    xml.open('GET', source, true);
    xml.setRequestHeader('Pragma', 'no-cache');
    xml.setRequestHeader('Cache-Control', 'no-cache');
    xml.onload = () => {
      if(isVertex){
        vs = xml.responseText;
      }else{
        fs = xml.responseText;
      }
      if(vs != null && fs != null){
        console.log('loaded', vsPath, fsPath);
        callback({vs: vs, fs: fs});
      }
    };
    xml.send();
  }
}