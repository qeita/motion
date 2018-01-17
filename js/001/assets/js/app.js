'use strict';

( () => {
  let controls, camera, scene, renderer, raycaster;

  let plane, text, textFont;
  // let charArray = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let charArray = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよわをん'.split('');
  let charIndex = 0;


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
    // loader.load('./assets/fonts/helvetiker_bold.typeface.json', (font) => {
    loader.load('./assets/fonts/M+1c_heavy_Regular.json', (font) => {
      let xMid, yMid;

      let textShape = new THREE.BufferGeometry();
      // let color = 0xcccccc;
      // let mat = new THREE.MeshPhongMaterial({
      //   color: color,
      //   side: THREE.DoubleSide
      // });
      let mat = new THREE.ShaderMaterial({
        uniforms: {
          time: {
            type: 'f',
            value: 0.0
          },
          size: {
            type: 'f',
            value: 0.0
          },
          resolution: {value: new THREE.Vector2()}
        },
        vertexShader: document.getElementById('vs-text').textContent,
        fragmentShader: document.getElementById('fs-text').textContent,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      let message = charArray[charIndex];
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
      textFont = font;
    });

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      resize();
    }, false);



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

    window.addEventListener('keydown', (e) => {
      // console.log(e.keyCode);
      switch(e.keyCode){
        case 37:
          changeChar(false);          
          break;
        case 39:
          changeChar(true);
          break;
      }
      addForce();
    }, false);
  }

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
      if(charIndex >= charArray.length -1){
        charIndex = 0;
      }else{
        charIndex++;
      }
    }else{
      if(charIndex <= 0){
        charIndex = charArray.length -1;
      }else{
        charIndex--;
      }      
    }
    text.geometry = null;

    let textShape = new THREE.BufferGeometry();
    let geo = new THREE.ShapeGeometry(textFont.generateShapes(charArray[charIndex], 100, 2));
    geo.computeBoundingBox();

    let xMid =  -0.5 * (geo.boundingBox.max.x - geo.boundingBox.min.x);
    let yMid =  -0.5 * (geo.boundingBox.max.y - geo.boundingBox.min.y);
    geo.translate(xMid, yMid, 5);
    textShape.fromGeometry(geo);
    text.geometry = textShape;
  }


  function addForce(){
    text.material.uniforms.size.value += Math.random() * 10.0 - 5.0;
    setTimeout(function(){
      text.material.uniforms.size.value = 0.0;
    }, 1000);    
  }

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