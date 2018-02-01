'use strict';

( () => {
  let controls, camera, scene, renderer, raycaster;

  let plane, text;

  /**
   * 言語データ
   */
  let textFont = {
    ja: null,
    en: null
  };
  let fontSrc = {
    ja: './assets/fonts/M+1c_heavy_Regular.json',
    en: './assets/fonts/helvetiker_bold.typeface.json'
  };
  let charArray = {
    ja: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよわをん'.split(''),
    en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  };
  let charIndex = {
    ja: 0,
    en: 0
  };

  let charType = 'ja';

  let forceTimer = null;


  window.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
  }, false);


  function init(){
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 100);

    controls = new THREE.OrbitControls(camera);
    controls.enableKeys = false;

    // シーン作成
    scene = new THREE.Scene();

    let dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 5, 5).normalize();
    scene.add(dirLight);

    let pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(0, 100, 50);
    scene.add(pointLight);


    /**
     * 平面メッシュ描画
     */
    // plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300, 1, 1), new THREE.MeshPhongMaterial({color: 0xffffff}));
    let mat = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0.0
        },
        size: {
          type: 'f',
          value: 1.0
        },
        resolution: {value: new THREE.Vector2()}
      },
      vertexShader: document.getElementById('vs-plane').textContent,
      fragmentShader: document.getElementById('fs-plane').textContent,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300, 1, 1), mat);

    scene.add(plane);


    /**
     * テキストメッシュ描画
     * 日本語フォントは M+ FONTS よりtypeface.jsでコンバート
     * ref: http://mplus-fonts.osdn.jp/index.html
     */
    let loader = new THREE.FontLoader();

    loader.load('./assets/fonts/helvetiker_bold.typeface.json', (font) => {
      textFont.en = font;
    });

    loader.load('./assets/fonts/M+1c_heavy_Regular.json', (font) => {
      let xMid, yMid;

      let textShape = new THREE.BufferGeometry();
      let mat = new THREE.ShaderMaterial({
        uniforms: {
          time: {
            type: 'f',
            value: 0.0
          },
          size: {
            type: 'f',
            value: 1.0
          },
          resolution: {value: new THREE.Vector2()}
        },
        vertexShader: document.getElementById('vs-text').textContent,
        fragmentShader: document.getElementById('fs-text').textContent,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      let message = charArray[charType][charIndex[charType]];
      let shapes = font.generateShapes(message, 100, 2);
      let geo = new THREE.ShapeGeometry(shapes);
      geo.computeBoundingBox();

      xMid =  -0.5 * (geo.boundingBox.max.x - geo.boundingBox.min.x);
      yMid =  -0.5 * (geo.boundingBox.max.y - geo.boundingBox.min.y);
      geo.translate(xMid, yMid, 5);

      textShape.fromGeometry(geo);
      text = new THREE.Mesh(textShape, mat);
      text.scale.set(0.4, 0.4, 0.4);

      camera.lookAt(text.position);
      scene.add(text);
      textFont.ja = font;
    });

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    attachEv();
  }


  /**
   * イベントをアタッチ
   */
  function attachEv(){
    /**
     * テキストのイベント判定
     * ref: http://chibinowa.net/note/js/threejs-obj-mouse.html
     */
    raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener('click', (e) => {
      let mouse = new THREE.Vector2();
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera);
      let intersect = raycaster.intersectObject(text);
      if(intersect.length > 0){
        changeChar(true);
        addForce();
      }
    });

    /**
     * リサイズイベント
     */
    window.addEventListener('resize', () => {
      resize();
    }, false);    

    /**
     * キーイベント
     */    
    window.addEventListener('keydown', (e) => {
      // console.log(e.keyCode);
      switch(e.keyCode){
        case 37:
          changeChar(false);          
          break;
        case 38:
          changeCharType('ja');
          break;
        case 39:
          changeChar(true);
          break;
        case 40:
          changeCharType('en');
          break;
      }
      addForce();
    }, false);

  }

  /**
   * レンダラーリサイズ
   */
  function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * 文字種を変える
   * @param {boolean} isIncrement - 加算かどうか 
   */
  function changeChar(isIncrement){
    if(isIncrement){
      // 加算
      if(charIndex[charType] >= charArray[charType].length -1){
        charIndex[charType] = 0;
      }else{
        charIndex[charType] += 1;
      }
    }else{
      if(charIndex[charType] <= 0){
        charIndex[charType] = charArray[charType].length -1;
      }else{
        charIndex[charType] -= 1;
      }      
    }
    updateTextGeo();
  }

  /**
   * 言語切り替え
   * @param {string} lang - 選択言語(en/ja) 
   */
  function changeCharType(lang){
    charType = lang;
    updateTextGeo();
  }

  /**
   * 言語・文字種更新したらジオメトリ反映
   */
  function updateTextGeo(){
    text.geometry = null;

    let textShape = new THREE.BufferGeometry();
    let c = charArray[charType][charIndex[charType]];
    let geo = new THREE.ShapeGeometry(textFont[charType].generateShapes(c, 100, 2));
    geo.computeBoundingBox();

    let xMid =  -0.5 * (geo.boundingBox.max.x - geo.boundingBox.min.x);
    let yMid =  -0.5 * (geo.boundingBox.max.y - geo.boundingBox.min.y);
    geo.translate(xMid, yMid, 5);
    textShape.fromGeometry(geo);
    text.geometry = textShape;
  }


  function addForce(){
    clearTimeout(forceTimer);
    text.material.uniforms.size.value = 1.0;
    let _v = Math.random() * 15.0;
    let _isUp = false;

    let forceAnim = () => {
      forceTimer = setTimeout( () => {
        if(_isUp){
          text.material.uniforms.size.value *= 0.98;
          if(text.material.uniforms.size.value <= 1.0){
            text.material.uniforms.size.value = 1.0;
            clearTimeout(forceTimer);
            return;
          }else{
            forceAnim();
          }
        }else{
          text.material.uniforms.size.value *= 1.2;
          if(text.material.uniforms.size.value >= _v){
            _isUp = true;
          }
          forceAnim();
        }
      }, 1000/60);
    };
    forceAnim(); 
  }

  /**
   * アニメーション + uniform変数の更新
   */
  function animate(){
    plane.material.uniforms.time.value += 0.1;
    plane.material.uniforms.resolution.value.x = window.innerWidth;
    plane.material.uniforms.resolution.value.y = window.innerHeight;

    if(text){
      text.material.uniforms.time.value += 0.1;
      text.material.uniforms.resolution.value.x = window.innerWidth;
      text.material.uniforms.resolution.value.y = window.innerHeight;
    }
    controls.update();

    requestAnimationFrame(animate);
    render();
  }

  function render(){
    renderer.render(scene, camera);
  }

})();