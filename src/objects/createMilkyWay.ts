import * as THREE from 'three';
import { COLORS, MILKY_WAY, RENDERER } from '../config/visualConfig';
import { createGlowTexture } from './createGlowTexture';

const { randFloat } = THREE.MathUtils;

export interface MilkyWayUnit {
  object: THREE.Group;
  update: (time: number) => void;
  setPixelRatio: (ratio: number) => void;
}

/** Box-Muller法による標準正規分布乱数 */
function gaussianRandom(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uLength;
uniform float uDriftSpeed;
uniform float uCurveAmplitude;
uniform float uCurveFrequency;
uniform float uWobbleAmplitude;
attribute float aSize;
attribute vec3 aColor;
attribute float aBrightness;
attribute float aPhase;
varying vec3 vColor;
varying float vBrightness;

void main() {
  // 帯に沿ってごくゆっくり流れる（端でループ。端は画面外なので目立たない）
  float halfLen = uLength * 0.5;
  float x = mod(position.x + uTime * uDriftSpeed + halfLen, uLength) - halfLen;

  // 緩やかな曲線 + 星ごとの微かなゆらぎ
  float y = position.y
    + sin(x * uCurveFrequency + 1.0) * uCurveAmplitude
    + sin(uTime * 0.13 + aPhase) * uWobbleAmplitude;
  float z = position.z + cos(uTime * 0.11 + aPhase * 1.7) * uWobbleAmplitude;

  vec4 mvPosition = modelViewMatrix * vec4(x, y, z, 1.0);

  float shimmer = 0.9 + 0.1 * sin(uTime * 0.7 + aPhase * 13.0);
  vColor = aColor;
  vBrightness = aBrightness * shimmer;

  gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
varying vec3 vColor;
varying float vBrightness;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(vColor, core * vBrightness);
}
`;

function pickMilkyWayColor(target: THREE.Color): void {
  const roll = Math.random();
  if (roll < 0.45) target.set(COLORS.milkyWayWhite);
  else if (roll < 0.7) target.set(COLORS.milkyWayBlue);
  else if (roll < 0.88) target.set(COLORS.milkyWayPurple);
  else target.set(COLORS.milkyWayGold);
}

/**
 * 天の川。画面を斜めに横切る帯状の星群 + 淡い光の雲（ヘイズ）。
 * 中央の密度が高く、外側に向かって薄くなるガウス分布で配置する。
 */
export function createMilkyWay(): MilkyWayUnit {
  const cfg = MILKY_WAY;

  const group = new THREE.Group();
  group.rotation.z = cfg.tiltZ;
  group.position.z = cfg.zCenter;

  // --- 星群 ---
  const positions = new Float32Array(cfg.starCount * 3);
  const sizes = new Float32Array(cfg.starCount);
  const colors = new Float32Array(cfg.starCount * 3);
  const brightness = new Float32Array(cfg.starCount);
  const phases = new Float32Array(cfg.starCount);

  const color = new THREE.Color();

  for (let i = 0; i < cfg.starCount; i++) {
    // 帯に沿って一様、幅・奥行きはガウス分布（中央ほど濃い）
    positions[i * 3 + 0] = randFloat(-cfg.length / 2, cfg.length / 2);
    positions[i * 3 + 1] = gaussianRandom() * cfg.widthSigma;
    positions[i * 3 + 2] = gaussianRandom() * cfg.depthSigma;

    const isBright = Math.random() < cfg.brightRatio;
    sizes[i] = isBright
      ? randFloat(cfg.sizeMax, cfg.brightSizeMax)
      : randFloat(cfg.sizeMin, cfg.sizeMax);
    brightness[i] = isBright ? randFloat(0.85, 1.0) : randFloat(0.25, 0.75);

    pickMilkyWayColor(color);
    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aBrightness', new THREE.BufferAttribute(brightness, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, RENDERER.maxPixelRatio) },
      uLength: { value: cfg.length },
      uDriftSpeed: { value: cfg.driftSpeed },
      uCurveAmplitude: { value: cfg.curveAmplitude },
      uCurveFrequency: { value: cfg.curveFrequency },
      uWobbleAmplitude: { value: cfg.wobbleAmplitude },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  group.add(points);

  // --- 淡い光の雲（ヘイズ） ---
  const hazeTexture = createGlowTexture(256);
  const hazeColors = [
    COLORS.milkyWayBlue,
    COLORS.milkyWayPurple,
    COLORS.milkyWayGold,
    COLORS.milkyWayWhite,
  ];

  for (let i = 0; i < cfg.hazeCount; i++) {
    const x = randFloat(-cfg.length * 0.4, cfg.length * 0.4);
    const y =
      Math.sin(x * cfg.curveFrequency + 1.0) * cfg.curveAmplitude +
      gaussianRandom() * cfg.widthSigma * 1.2;
    const z = gaussianRandom() * cfg.depthSigma * 0.5;

    const hazeMaterial = new THREE.SpriteMaterial({
      map: hazeTexture,
      color: hazeColors[i % hazeColors.length],
      transparent: true,
      opacity: randFloat(cfg.hazeOpacityMin, cfg.hazeOpacityMax),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      rotation: cfg.tiltZ, // 帯の傾きに沿って伸ばす
    });
    const haze = new THREE.Sprite(hazeMaterial);
    const size = randFloat(cfg.hazeSizeMin, cfg.hazeSizeMax);
    haze.scale.set(size * randFloat(1.2, 2.2), size, 1);
    haze.position.set(x, y, z);
    group.add(haze);
  }

  return {
    object: group,
    update: (time) => {
      material.uniforms.uTime.value = time;
    },
    setPixelRatio: (ratio) => {
      material.uniforms.uPixelRatio.value = ratio;
    },
  };
}
