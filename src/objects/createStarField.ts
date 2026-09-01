import * as THREE from 'three';
import { COLORS, RENDERER, STAR_FIELD } from '../config/visualConfig';

const { randFloat } = THREE.MathUtils;

export interface StarFieldUnit {
  object: THREE.Points;
  update: (time: number) => void;
  setPixelRatio: (ratio: number) => void;
}

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
attribute float aSize;
attribute vec3 aColor;
attribute float aPhase;
attribute float aSpeed;
attribute float aTwinkleAmount;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // 一部の星だけがゆっくり瞬く
  float twinkle = 1.0 - aTwinkleAmount * (0.5 + 0.5 * sin(uTime * aSpeed + aPhase));

  vColor = aColor;
  vAlpha = twinkle;
  gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.08, d);
  float glow = exp(-d * 5.0) * 0.4;
  gl_FragColor = vec4(vColor, (core + glow) * vAlpha);
}
`;

/**
 * 背景の星空。球殻状にランダム配置したPointsで描画する。
 */
export function createStarField(): StarFieldUnit {
  const cfg = STAR_FIELD;

  const positions = new Float32Array(cfg.count * 3);
  const sizes = new Float32Array(cfg.count);
  const colors = new Float32Array(cfg.count * 3);
  const phases = new Float32Array(cfg.count);
  const speeds = new Float32Array(cfg.count);
  const twinkleAmounts = new Float32Array(cfg.count);

  const direction = new THREE.Vector3();
  const color = new THREE.Color();

  for (let i = 0; i < cfg.count; i++) {
    direction.randomDirection();
    const radius = randFloat(cfg.radiusMin, cfg.radiusMax);
    positions[i * 3 + 0] = direction.x * radius;
    positions[i * 3 + 1] = direction.y * radius;
    positions[i * 3 + 2] = direction.z * radius;

    // 大半は遠くの小さな星、一部だけ近くで少し明るい星
    const isBright = Math.random() < cfg.brightRatio;
    sizes[i] = isBright
      ? randFloat(cfg.sizeMax, cfg.brightSizeMax)
      : randFloat(cfg.sizeMin, cfg.sizeMax);

    // 白／青白／淡い黄色
    const roll = Math.random();
    color.set(roll < 0.6 ? COLORS.starWhite : roll < 0.85 ? COLORS.starBlue : COLORS.starYellow);
    color.multiplyScalar(randFloat(0.75, 1.0));
    colors[i * 3 + 0] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    const twinkles = Math.random() < cfg.twinkleRatio;
    twinkleAmounts[i] = twinkles ? randFloat(cfg.twinkleAmountMin, cfg.twinkleAmountMax) : 0;
    speeds[i] = randFloat(cfg.twinkleSpeedMin, cfg.twinkleSpeedMax);
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute('aTwinkleAmount', new THREE.BufferAttribute(twinkleAmounts, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, RENDERER.maxPixelRatio) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  return {
    object: points,
    update: (time) => {
      material.uniforms.uTime.value = time;
    },
    setPixelRatio: (ratio) => {
      material.uniforms.uPixelRatio.value = ratio;
    },
  };
}
