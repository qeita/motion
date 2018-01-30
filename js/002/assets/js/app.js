'use strict';

( () => {
  let controls, camera, scene, renderer, raycaster;

  let box;
  let wTimer = null;
  let timer = null;
  let morphType = 0;

  let geo = {};
  let mat = {};
  let meshType = 'box';


  window.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
  }, false);


  function init(){
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(300, 300, 300);

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
     * Box情報
     */
    geo.box = new THREE.BoxGeometry(100, 100, 100, 50, 50, 50);
    mat.box = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0.0
        },
        morphing: {
          type: 'f',
          value: 0.0
        },
        resolution: {value: new THREE.Vector2()}
      },
      vertexShader: document.getElementById('vs-box').textContent,
      fragmentShader: document.getElementById('fs-box').textContent,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    /**
     * Sphere情報
     */
    geo.sphere = new THREE.SphereGeometry(100, 32, 32);
    mat.sphere = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0.0
        },
        morphing: {
          type: 'f',
          value: 0.0
        },
        resolution: {value: new THREE.Vector2()}
      },
      vertexShader: document.getElementById('vs-sphere').textContent,
      fragmentShader: document.getElementById('fs-sphere').textContent,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });




    box = new THREE.Mesh(geo.box, mat.box);
    scene.add(box);

    camera.lookAt(box);

    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
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
     * イベント判定
     * ref: http://chibinowa.net/note/js/threejs-obj-mouse.html
     */
    raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener('click', (e) => {
      let mouse = new THREE.Vector2();
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera);
      let intersect = raycaster.intersectObject(box);
      if(intersect.length > 0){
        clearTimeout(wTimer);
        addForce();

        wTimer = setTimeout( () => {
          moveVertex();
        }, 4000);
      }
    });

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
      switch(e.keyCode){
        case 38:
          changeGeo('box');
          break;
        case 40:
          changeGeo('sphere');
          break;
      }
    }, false);

    /**
     * ボタンクリックイベント
     */    
    document.querySelector('.btn').addEventListener('click', (e) => {
      if(meshType === 'box'){
        changeGeo('sphere');
      }else{
        changeGeo('box');
      }
    }, false);

    /**
     * 自動で頂点切り替え
     */
    let moveVertex = () => {
      wTimer = setTimeout( () => {
        addForce();
        moveVertex();
      }, 3000);  
    };

    moveVertex();
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
   * メッシュ切替
   * @param {string} type - メッシュタイプ(box or sphere) 
   */
  function changeGeo(type){
    if(type === meshType) return;
    meshType = type;
    switch(type){
      case 'box':
        box.geometry = geo.box;
        box.material = mat.box;
        break;
      case 'sphere':
        box.geometry = geo.sphere;
        box.material = mat.sphere;
        break;
    }
  }

  function addForce(){
    clearTimeout(timer);
    if(morphType >= 2){
      morphType = 0;
    }else{
      morphType++;      
    }

    let morpAnim = () => {
      timer = setTimeout( () => {
        switch(morphType){
          case 0:
            box.material.uniforms.morphing.value -= 0.2;
            if(box.material.uniforms.morphing.value > 0.0){
              morpAnim();
            }else{
              box.material.uniforms.morphing.value = 0.0;
            }  
            break;

          case 1:
            box.material.uniforms.morphing.value += 0.1;
            if(box.material.uniforms.morphing.value < 1.0){
              morpAnim();
            }
            break;
        
          case 2:
            box.material.uniforms.morphing.value += 0.1;
            if(box.material.uniforms.morphing.value < 2.0){
              morpAnim();
            }
            break;
        }
      }, 1000/60);
    };

    morpAnim();
  }

  /**
   * アニメーション + uniform変数の更新
   */
  function animate(){
    box.material.uniforms.time.value += 0.1;

    controls.update();

    requestAnimationFrame(animate);
    render();
  }

  function render(){
    renderer.render(scene, camera);
  }

})();