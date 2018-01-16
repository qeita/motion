'use strict';

( () => {
  let camera, scene, plane, text, renderer;

  window.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
  }, false);


  function init(){
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 100);
    
    // シーン作成
    scene = new THREE.Scene();

    let dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 5, 5).normalize();
    scene.add(dirLight);

    let pointLight = new THREE.PointLight(0xffffff, 0.6);
    pointLight.position.set(0, 100, 50);
    scene.add(pointLight);

    plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300, 1, 1), new THREE.MeshPhongMaterial({color: 0xffffff}));
    scene.add(plane);

    // ローディングしてフォント読み込み・メッシュ作成
    let loader = new THREE.FontLoader();
    loader.load('./assets/fonts/helvetiker_bold.typeface.json', (font) => {
      let xMid, yMid;

      let textShape = new THREE.BufferGeometry();
      let color = 0xcccccc;
    //   let mat = new THREE.MeshPhongMaterial({
    //     color: color,
    //     side: THREE.DoubleSide
    //   });
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
        vertexShader: document.getElementById('vs').textContent,
        fragmentShader: document.getElementById('fs').textContent,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })

      let message = 'A';
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
    });

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      resize();
    }, false);

    window.addEventListener('click', () => {
      text.material.uniforms.size.value += Math.random() * 10;
      setTimeout(function(){
        text.material.uniforms.size.value = 1.0;
      }, 1000);
    }, false);
  }

  function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate(){
    if(text){
      text.material.uniforms.time.value += 0.1;
    }
    requestAnimationFrame(animate);
    render();
  }

  function render(){
    renderer.render(scene, camera);
  }

})();