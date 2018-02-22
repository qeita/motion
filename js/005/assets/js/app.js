'use strict';

( () => {
  let controls, camera, scene, renderer, raycaster;

  let plane;
  let stats, gui;

  let cameraConfig, cConfig;
  let uniformConfig, uConfig;


  window.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
  }, false);


  function init(){

    // dat.guiの設定値
    cameraConfig = function(){
      this.posX = 0;
      this.posY = -7;
      this.posZ = 3;
    };

    uniformConfig = function(){
      this.volumeX = 0.3;
      this.volumeY = 0.3;
      this.volumeZ = 0.3;
      this.timeX = 0.3;
      this.timeY = 0.3;
      this.timeZ = 1.0;
    };
  
    cConfig = new cameraConfig();
    uConfig = new uniformConfig();


    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(cConfig.posX, cConfig.posY, cConfig.posZ);

    // シーン作成
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableKeys = false;

    let dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 5, 5).normalize();
    scene.add(dirLight);

    let pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(0, 100, 50);
    scene.add(pointLight);

    let geo = new THREE.BufferGeometry();

    let size = 0.1;

    let positions = [];
    let index = [];

    let num = 60;
    let x = -size * num/2;
    let y = size * num/2;

    let i = 0;

    for(let r = 0; r < num; r++){
      for(let c = 0; c < num; c++){
        positions.push(
          x + size * c      , y - size * (r + 1), 0.0,
          x + size * (c + 1), y - size * (r + 1), 0.0,
          x + size * (c + 1), y - size * r      , 0.0,
          x + size * c      , y - size * r      , 0.0,          
        );

        index.push(
          0 + 4 * i, 1 + 4 * i, 2 + 4 * i, 2 + 4 * i, 3 + 4 * i, 0 + 4 * i
        );

        i++;
      }  
    }

    // console.log(positions);
    // console.log(index);

    let vertices = new Float32Array(positions);
    let indices = new Uint16Array(index);

    geo.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));


    // let mat = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    //   wireframe: true,
    //   transparent: true,
    //   depthWrite: false,
    //   blending: THREE.AdditiveBlending
    // });    
    // plane = new THREE.Mesh(geo, mat);
    // scene.add(plane);

    let mat = new THREE.ShaderMaterial({
      uniforms: {
        time: {
          type: 'f',
          value: 0.0
        },
        split: {
          type: 'f',
          value: num
        },
        volumeX: {
          type: 'f',
          value: uConfig.volumeX
        },
        volumeY: {
          type: 'f',
          value: uConfig.volumeY
        },
        volumeZ: {
          type: 'f',
          value: uConfig.volumeZ
        },
        timeX: {
          type: 'f',
          value: uConfig.timeX
        },
        timeY: {
          type: 'f',
          value: uConfig.timeY
        },
        timeZ: {
          type: 'f',
          value: uConfig.timeZ
        },
        resolution: {value: new THREE.Vector2()},
        mouse: {value: new THREE.Vector2()}
      },
      side: THREE.DoubleSide,
      vertexShader: document.getElementById('vs-plane').textContent,
      fragmentShader: document.getElementById('fs-plane').textContent,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    plane = new THREE.Mesh(geo, mat);

    plane.material.uniforms.resolution.value.x = window.innerWidth;
    plane.material.uniforms.resolution.value.y = window.innerHeight;
    // console.log(plane.material.uniforms.resolution.value.x);
    // console.log(plane.material.uniforms.resolution.value.y);

    scene.add(plane);

    camera.lookAt(plane);


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
    let c = gui.addFolder('Camera Position');
    let cX = c.add(cConfig, 'posX',  -30, 30);
    let cY = c.add(cConfig, 'posY',  -30, 30);
    let cZ = c.add(cConfig, 'posZ',  -30, 30);

    let u = gui.addFolder('Uniform Value');
    let uX = u.add(uConfig, 'volumeX',  0, 1);
    let uY = u.add(uConfig, 'volumeY',  0, 1);
    let uZ = u.add(uConfig, 'volumeZ',  0, 1);
    let tX = u.add(uConfig, 'timeX',  0, 1);
    let tY = u.add(uConfig, 'timeY',  0, 1);
    let tZ = u.add(uConfig, 'timeZ',  0, 1);


    cX.onChange( (value) => {
      camera.position.set(cConfig.posX, cConfig.posY, cConfig.posZ);
    });
    cY.onChange( (value) => {
      camera.position.set(cConfig.posX, cConfig.posY, cConfig.posZ);
    });
    cZ.onChange( (value) => {
      camera.position.set(cConfig.posX, cConfig.posY, cConfig.posZ);
    });

    uX.onChange( (value) => {
      plane.material.uniforms.volumeX.value = value;
    });
    uY.onChange( (value) => {
      plane.material.uniforms.volumeY.value = value;
    });
    uZ.onChange( (value) => {
      plane.material.uniforms.volumeZ.value = value;
    });    
    tX.onChange( (value) => {
      plane.material.uniforms.timeX.value = value;
    });
    tY.onChange( (value) => {
      plane.material.uniforms.timeY.value = value;
    });
    tZ.onChange( (value) => {
      plane.material.uniforms.timeZ.value = value;
    });  

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
    // raycaster = new THREE.Raycaster();
    // renderer.domElement.addEventListener('click', (e) => {
    //   let mouse = new THREE.Vector2();
    //   mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    //   mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    //   raycaster.setFromCamera(mouse, camera);
    //   let intersect = raycaster.intersectObject(box);
    //   if(intersect.length > 0){
    //     clearTimeout(wTimer);
    //     addForce();

    //     wTimer = setTimeout( () => {
    //       moveVertex();
    //     }, 4000);
    //   }
    // });

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
    }, false);

    // window.addEventListener('mousemove', (e) => {
    //   plane.material.uniforms.mouse.value.x = e.pageX;
    //   plane.material.uniforms.mouse.value.y = e.pageY;
    // }, false);


  }

  /**
   * レンダラーリサイズ
   */
  function resize(){
    plane.material.uniforms.resolution.value.x = window.innerWidth;
    plane.material.uniforms.resolution.value.y = window.innerHeight;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }


  /**
   * アニメーション + uniform変数の更新
   */
  function animate(){
    plane.material.uniforms.time.value += 0.1;

    controls.update();
    stats.update();

    requestAnimationFrame(animate);
    render();
  }

  function render(){
    renderer.render(scene, camera);
  }

})();