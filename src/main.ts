import './styles.css';
import { createScene } from './scene/createScene';
import { createCamera, updateCamera } from './scene/createCamera';
import { createRenderer } from './scene/createRenderer';
import { startAnimationLoop } from './scene/animationLoop';
import { createStarField } from './objects/createStarField';
import { createMilkyWay } from './objects/createMilkyWay';
import { createConstellations } from './objects/createConstellations';
import { ShootingStarManager } from './objects/createShootingStar';
import { RENDERER } from './config/visualConfig';

// 画面はThree.jsのcanvasのみ。UI要素は一切作らない。
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer(canvas);

const starField = createStarField();
const milkyWay = createMilkyWay();
const constellations = createConstellations();
const shootingStars = new ShootingStarManager();

scene.add(starField.object, milkyWay.object, constellations.object, shootingStars.object);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  const pixelRatio = Math.min(window.devicePixelRatio, RENDERER.maxPixelRatio);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  starField.setPixelRatio(pixelRatio);
  milkyWay.setPixelRatio(pixelRatio);
  constellations.setPixelRatio(pixelRatio);
});

startAnimationLoop(renderer, scene, camera, [
  (time) => updateCamera(camera, time),
  starField.update,
  milkyWay.update,
  constellations.update,
  shootingStars.update,
]);
