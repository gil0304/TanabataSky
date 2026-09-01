import * as THREE from 'three';
import { COLORS, CONSTELLATIONS, RENDERER } from '../config/visualConfig';
import { CONSTELLATION_DATA } from '../data/constellations';
import { createGlowTexture } from './createGlowTexture';

const { randFloat } = THREE.MathUtils;

export interface ConstellationsUnit {
  object: THREE.Group;
  update: (time: number) => void;
  setPixelRatio: (ratio: number) => void;
}

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uPulseSpeed;
uniform float uPulseAmount;
attribute float aSize;
attribute vec3 aColor;
attribute float aMain;
attribute float aPhase;
varying vec3 vColor;
varying float vBrightness;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // ベガ・アルタイルは一定間隔でほんの少し強く輝く
  float pulse = 1.0 + aMain * uPulseAmount * (0.5 + 0.5 * sin(uTime * uPulseSpeed + aPhase));
  // その他の星はごく浅い瞬き
  float twinkle = 1.0 - (1.0 - aMain) * 0.15 * (0.5 + 0.5 * sin(uTime * 0.5 + aPhase * 7.0));

  vColor = aColor;
  vBrightness = pulse * twinkle;

  gl_PointSize = aSize * pulse * uPixelRatio * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
varying vec3 vColor;
varying float vBrightness;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.08, d);
  float glow = exp(-d * 4.0) * 0.5;
  gl_FragColor = vec4(vColor, (core + glow) * vBrightness);
}
`;

interface Halo {
  material: THREE.SpriteMaterial;
  baseOpacity: number;
  phase: number;
}

/**
 * こと座（織姫・ベガ）とわし座（彦星・アルタイル）。
 * 天の川を挟んで向かい合うように配置する。
 * 星座線は幻想的な演出として、細く淡く表示する。
 */
export function createConstellations(): ConstellationsUnit {
  const cfg = CONSTELLATIONS;
  const layouts = { lyra: cfg.lyra, aquila: cfg.aquila } as const;

  const group = new THREE.Group();

  const starPositions: number[] = [];
  const starSizes: number[] = [];
  const starColors: number[] = [];
  const starMains: number[] = [];
  const starPhases: number[] = [];
  const linePositions: number[] = [];

  const halos: Halo[] = [];
  const haloTexture = createGlowTexture(256);
  const color = new THREE.Color();

  for (const constellation of CONSTELLATION_DATA) {
    const layout = layouts[constellation.name];
    const worldPositions: THREE.Vector3[] = [];

    for (const star of constellation.stars) {
      const position = new THREE.Vector3(
        layout.x + star.x * layout.scale,
        layout.y + star.y * layout.scale,
        cfg.z + randFloat(-cfg.depthJitter, cfg.depthJitter),
      );
      worldPositions.push(position);

      starPositions.push(position.x, position.y, position.z);
      starSizes.push(star.size * cfg.starBaseSize);
      color.set(star.color);
      starColors.push(color.r, color.g, color.b);
      starMains.push(star.id ? 1 : 0);
      const phase = Math.random() * Math.PI * 2;
      starPhases.push(phase);

      // ベガ・アルタイルの周囲に淡いハローを添える
      if (star.id) {
        const haloMaterial = new THREE.SpriteMaterial({
          map: haloTexture,
          color: star.color,
          transparent: true,
          opacity: cfg.haloOpacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const halo = new THREE.Sprite(haloMaterial);
        halo.scale.setScalar(cfg.haloSize);
        halo.position.copy(position);
        group.add(halo);
        halos.push({ material: haloMaterial, baseOpacity: cfg.haloOpacity, phase });
      }
    }

    for (const [a, b] of constellation.lines) {
      const pa = worldPositions[a];
      const pb = worldPositions[b];
      linePositions.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
    }
  }

  // --- 星 ---
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starPositions), 3));
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(starSizes), 1));
  starGeometry.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(starColors), 3));
  starGeometry.setAttribute('aMain', new THREE.BufferAttribute(new Float32Array(starMains), 1));
  starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(starPhases), 1));

  const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, RENDERER.maxPixelRatio) },
      uPulseSpeed: { value: cfg.mainPulseSpeed },
      uPulseAmount: { value: cfg.mainPulseAmount },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.frustumCulled = false;
  group.add(stars);

  // --- 星座線（細く、淡く、少しだけ発光して見えるように加算合成） ---
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    color: COLORS.constellationLine,
    transparent: true,
    opacity: cfg.lineOpacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(lines);

  return {
    object: group,
    update: (time) => {
      starMaterial.uniforms.uTime.value = time;
      for (const halo of halos) {
        halo.material.opacity =
          halo.baseOpacity * (0.75 + 0.25 * Math.sin(time * cfg.mainPulseSpeed + halo.phase));
      }
    },
    setPixelRatio: (ratio) => {
      starMaterial.uniforms.uPixelRatio.value = ratio;
    },
  };
}
