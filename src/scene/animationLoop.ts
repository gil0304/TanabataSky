import * as THREE from 'three';

export type Updatable = (time: number, delta: number) => void;

/**
 * アニメーションループを開始する。
 * 毎フレーム、各updatableに経過時間を渡してからレンダリングする。
 */
export function startAnimationLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  updatables: Updatable[],
): void {
  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    // タブ非表示からの復帰などで巨大なdeltaが入らないようにする
    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.elapsedTime;

    for (const update of updatables) {
      update(time, delta);
    }

    renderer.render(scene, camera);
  });
}
