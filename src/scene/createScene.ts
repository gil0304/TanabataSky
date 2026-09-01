import * as THREE from 'three';
import { COLORS } from '../config/visualConfig';

const SKY_VERTEX_SHADER = /* glsl */ `
varying vec3 vDirection;

void main() {
  vDirection = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uMiddle;
uniform vec3 uBottom;
varying vec3 vDirection;

void main() {
  // 深い紺〜黒に近い縦グラデーション
  float h = normalize(vDirection).y * 0.5 + 0.5;
  vec3 color = mix(uBottom, uMiddle, smoothstep(0.0, 0.55, h));
  color = mix(color, uTop, smoothstep(0.55, 1.0, h));
  gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * シーンと、深い紺色のグラデーション背景（スカイドーム）を作る。
 */
export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();

  const skyGeometry = new THREE.SphereGeometry(800, 48, 32);
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTop: { value: new THREE.Color(COLORS.skyTop) },
      uMiddle: { value: new THREE.Color(COLORS.skyMiddle) },
      uBottom: { value: new THREE.Color(COLORS.skyBottom) },
    },
    vertexShader: SKY_VERTEX_SHADER,
    fragmentShader: SKY_FRAGMENT_SHADER,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  return scene;
}
