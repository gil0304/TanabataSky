import * as THREE from 'three';
import { RENDERER } from '../config/visualConfig';

export function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDERER.maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
}
