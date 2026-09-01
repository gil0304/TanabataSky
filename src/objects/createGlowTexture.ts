import * as THREE from 'three';

/**
 * 中心から外へ柔らかく減衰する円形グローのテクスチャを生成する。
 * 流れ星の発光点、天の川のヘイズ、主要星のハローで共用する。
 */
export function createGlowTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.45)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.12)');
  gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}
