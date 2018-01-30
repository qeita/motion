'use strict';

( () => {
  let controls, camera, scene, renderer, raycaster;

  let box;
  let wTimer = null;
  let timer = null;
  let morphType = 0;


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
     * 平面メッシュ描画
     */
    let mat = new THREE.ShaderMaterial({
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
      vertexShader: document.getElementById('vs-plane').textContent,
      fragmentShader: document.getElementById('fs-plane').textContent,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    box = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100, 50, 50, 50), mat);
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
          changeModel();
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
     * 自動で頂点切り替え
     */
    let changeModel = () => {
      wTimer = setTimeout( () => {
        addForce();
        changeModel();
      }, 3000);  
    };

    changeModel();
  }

  /**
   * レンダラーリサイズ
   */
  function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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