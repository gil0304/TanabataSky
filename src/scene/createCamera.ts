import * as THREE from 'three';
import { CAMERA } from '../config/visualConfig';

export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    CAMERA.fov,
    window.innerWidth / window.innerHeight,
    CAMERA.near,
    CAMERA.far,
  );
  camera.position.set(CAMERA.basePosition.x, CAMERA.basePosition.y, CAMERA.basePosition.z);
  return camera;
}

const lookTarget = new THREE.Vector3();

/**
 * カメラの自動演出。
 * 周期の異なる正弦波を重ね、ループしているように見えない
 * ごくゆっくりとした浮遊感を作る。
 */
export function updateCamera(camera: THREE.PerspectiveCamera, time: number): void {
  const { basePosition, drift, breathing, lookAt, roll } = CAMERA;

  camera.position.x =
    basePosition.x +
    Math.sin(time * drift.xFreq1) * drift.xAmp +
    Math.sin(time * drift.xFreq2) * drift.xAmp * 0.4;
  camera.position.y =
    basePosition.y +
    Math.sin(time * drift.yFreq + 1.7) * drift.yAmp +
    Math.sin(time * breathing.freq) * breathing.amp;
  camera.position.z = basePosition.z + Math.sin(time * drift.zFreq + 0.8) * drift.zAmp;

  lookTarget.set(
    Math.sin(time * lookAt.xFreq) * lookAt.xAmp,
    Math.sin(time * lookAt.yFreq + 2.4) * lookAt.yAmp,
    lookAt.z,
  );
  camera.lookAt(lookTarget);

  // 視線軸まわりのごくわずかなロール
  camera.rotateZ(Math.sin(time * roll.freq) * roll.amp);
}
