let earth;
let scene, camera, renderer;
let inertialScroll = 0; // 慣性スクロールの値
let inertialScrollPercent = 0; // 慣性スクロールのパーセント値(0~100)

const easeOutQuad = (x) => {
  let t = x;
  const b = 0;
  const c = 1;
  const d = 1;
  return -c * (t /= d) * (t - 2) + b;
};

/** xとyの線形補完 */
const lerp = (x, y, a) => {
  return x + (y - x) * easeOutQuad(a);
};

/** パーセントのスケール */
const scalePercent = (start, end) => {
  return (inertialScrollPercent - start) / (end - start);
};

const animationScripts = [
  {
    start: 0,
    end: 25,
    func: () => {
      camera.position.z = lerp(50, 30, scalePercent(0, 25)); // カメラを近づける
    },
  },
  {
    start: 25,
    end: 50,
    func: () => {
      earth.rotation.y = lerp(0, Math.PI, scalePercent(25, 50)); // 球体を横に回転させる
    },
  },
  {
    start: 50,
    end: 75,
    func: () => {
      earth.rotation.y = lerp(Math.PI, 2 * Math.PI, scalePercent(50, 75)); // 球体を横に回転させる
    },
  },
  {
    start: 75,
    end: 100,
    func: () => {
      camera.position.z = lerp(30, 50, scalePercent(75, 100)); // カメラを引く
    },
  },
];

const playScrollAnimations = () => {
  animationScripts.forEach((item) => {
    if (
      inertialScrollPercent >= item.start &&
      inertialScrollPercent < item.end
    ) {
      item.func();
    }
  });
};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const init = () => {
  const element = document.getElementById("bg");
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.rotation.set(0, 0, 0);
  camera.position.set(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  element.appendChild(renderer.domElement);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  scene.add(dirLight);

  const ambLight = new THREE.AmbientLight(0x333333);
  scene.add(ambLight);

  const geometry = new THREE.SphereBufferGeometry(10, 30, 30);
  geometry.scale(-1, 1, 1);
  const texture = new THREE.TextureLoader().load("https://threejs-earth.s3.ap-northeast-1.amazonaws.com/earth.jpeg");
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: texture,
  });
  earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  render();
  window.addEventListener('resize', onWindowResize, false);
};

/** 慣性スクロールのためにスクロール値を取得する */
const setScrollPercent = () => {
  inertialScroll +=
    ((document.documentElement.scrollTop || document.body.scrollTop) -
      inertialScroll) *
    0.08;
  // 慣性スクロールでのパーセント
  inertialScrollPercent = (
    (inertialScroll /
      ((document.documentElement.scrollHeight || document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100
  ).toFixed(2);
};

const render = () => {
  renderer.render(scene, camera);
  setScrollPercent();
  playScrollAnimations();
  requestAnimationFrame(render);
};

const text = () => {
  const textElement = document.querySelector('.text');
  const chars = Array.from(textElement.textContent);
  textElement.innerHTML = chars.map(char => `<span>${char}</span>`).join('');
};

window.addEventListener("load", () => {
  init();
  text();
});
