import * as THREE from 'three';
import { COLORS, CONSTELLATIONS, SHOOTING_STAR } from '../config/visualConfig';
import { createGlowTexture } from './createGlowTexture';

const { randFloat, smoothstep } = THREE.MathUtils;

const Z_AXIS = new THREE.Vector3(0, 0, 1);
const VEGA_POSITION = new THREE.Vector3(
  CONSTELLATIONS.lyra.x,
  CONSTELLATIONS.lyra.y,
  CONSTELLATIONS.z,
);
const ALTAIR_POSITION = new THREE.Vector3(
  CONSTELLATIONS.aquila.x,
  CONSTELLATIONS.aquila.y,
  CONSTELLATIONS.z,
);

/**
 * 流れ星1本。発光点（Sprite）と、加算合成で先端から尾へ
 * 減衰するグラデーションを持つ細いLineで構成する。
 * 使い回すためプールで管理される。
 */
class ShootingStar {
  readonly object = new THREE.Group();
  active = false;

  private readonly head: THREE.Sprite;
  private readonly headMaterial: THREE.SpriteMaterial;
  private readonly trailMaterial: THREE.LineBasicMaterial;
  private readonly trailPositionAttr: THREE.BufferAttribute;
  private readonly origin = new THREE.Vector3();
  private readonly direction = new THREE.Vector3();
  private readonly headPosition = new THREE.Vector3();
  private speed = 0;
  private life = 1;
  private trailMaxLen = 0;
  private startTime = 0;

  constructor(texture: THREE.Texture) {
    this.headMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: COLORS.shootingStar,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.head = new THREE.Sprite(this.headMaterial);
    this.head.frustumCulled = false;

    const count = SHOOTING_STAR.trailPoints;
    const geometry = new THREE.BufferGeometry();
    this.trailPositionAttr = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
    this.trailPositionAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', this.trailPositionAttr);

    // 先端ほど明るく、尾に向かって黒（加算合成では不可視）へ落ちるグラデーション
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color(COLORS.shootingStar);
    for (let i = 0; i < count; i++) {
      const f = 1 - i / (count - 1);
      const fade = f * f;
      colors[i * 3 + 0] = color.r * fade;
      colors[i * 3 + 1] = color.g * fade;
      colors[i * 3 + 2] = color.b * fade;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.trailMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const trail = new THREE.Line(geometry, this.trailMaterial);
    trail.frustumCulled = false;

    this.object.add(this.head, trail);
    this.object.visible = false;
  }

  launch(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    life: number,
    time: number,
  ): void {
    this.origin.copy(origin);
    this.direction.copy(direction).normalize();
    this.speed = speed;
    this.life = life;
    this.trailMaxLen = speed * SHOOTING_STAR.trailLenFactor;
    this.startTime = time;
    this.active = true;
    this.object.visible = true;
    this.head.scale.setScalar(SHOOTING_STAR.headSize * randFloat(0.85, 1.2));
    this.update(time);
  }

  update(time: number): void {
    const cfg = SHOOTING_STAR;
    const u = (time - this.startTime) / this.life;

    // 残光まで含めて消えたらプールへ戻す
    if (u >= 1 + cfg.afterglowRatio) {
      this.active = false;
      this.object.visible = false;
      return;
    }

    const travel = Math.min(u, 1) * this.life * this.speed;
    this.headPosition.copy(this.direction).multiplyScalar(travel).add(this.origin);
    this.head.position.copy(this.headPosition);

    // 出現直後に一瞬だけ強く光り、その後フェードアウトする
    const fadeIn = smoothstep(u, 0, 0.12);
    const flash = Math.exp(-(((u - 0.15) / 0.09) ** 2)) * 0.7;
    const headFade = 1 - smoothstep(u, 0.65, 0.98);
    this.headMaterial.opacity = u < 1 ? Math.min(1, fadeIn * headFade * (0.8 + flash)) : 0;

    // 尾は本体より少し長く残って残光になる
    this.trailMaterial.opacity = 0.75 * fadeIn * (1 - smoothstep(u, 0.75, 1 + cfg.afterglowRatio));

    const shrink = u > 1 ? 1 - ((u - 1) / cfg.afterglowRatio) * 0.4 : 1;
    const len = this.trailMaxLen * smoothstep(u, 0, 0.3) * shrink;

    const positions = this.trailPositionAttr.array as Float32Array;
    const count = cfg.trailPoints;
    for (let i = 0; i < count; i++) {
      const back = (len * i) / (count - 1);
      positions[i * 3 + 0] = this.headPosition.x - this.direction.x * back;
      positions[i * 3 + 1] = this.headPosition.y - this.direction.y * back;
      positions[i * 3 + 2] = this.headPosition.z - this.direction.z * back;
    }
    this.trailPositionAttr.needsUpdate = true;
  }
}

/**
 * 流れ星の発生管理。
 * 6〜15秒のランダム間隔で流し、たまに短い間隔で2つ流す。
 * まれにベガとアルタイルの間を横切る軌道を選ぶ。
 */
export class ShootingStarManager {
  readonly object = new THREE.Group();

  private readonly pool: ShootingStar[] = [];
  private nextSpawnTime: number = SHOOTING_STAR.firstDelay;
  private secondSpawnTime: number | null = null;
  private readonly spawnOrigin = new THREE.Vector3();
  private readonly spawnDirection = new THREE.Vector3();

  constructor() {
    const texture = createGlowTexture();
    for (let i = 0; i < SHOOTING_STAR.poolSize; i++) {
      const star = new ShootingStar(texture);
      this.pool.push(star);
      this.object.add(star.object);
    }
  }

  update = (time: number): void => {
    if (time >= this.nextSpawnTime) {
      this.spawn(time);
      this.scheduleNext(time);
    }
    if (this.secondSpawnTime !== null && time >= this.secondSpawnTime) {
      this.spawn(time);
      this.secondSpawnTime = null;
    }
    for (const star of this.pool) {
      if (star.active) star.update(time);
    }
  };

  private scheduleNext(time: number): void {
    const cfg = SHOOTING_STAR;
    this.nextSpawnTime = time + randFloat(cfg.minInterval, cfg.maxInterval);
    // たまに短い間隔で2つ流れる
    if (Math.random() < cfg.doubleChance) {
      this.secondSpawnTime = time + randFloat(cfg.doubleDelayMin, cfg.doubleDelayMax);
    }
  }

  private spawn(time: number): void {
    const star = this.pool.find((s) => !s.active);
    if (!star) return;

    const cfg = SHOOTING_STAR;
    const speed = randFloat(cfg.speedMin, cfg.speedMax);
    const life = randFloat(cfg.lifeMin, cfg.lifeMax);

    if (Math.random() < cfg.crossChance) {
      // ベガとアルタイルの間を横切る軌道
      this.spawnDirection.copy(ALTAIR_POSITION).sub(VEGA_POSITION).normalize();
      this.spawnDirection.applyAxisAngle(Z_AXIS, randFloat(-0.18, 0.18));
      if (Math.random() < 0.35) this.spawnDirection.multiplyScalar(-1);

      this.spawnOrigin.lerpVectors(VEGA_POSITION, ALTAIR_POSITION, randFloat(0.35, 0.65));
      this.spawnOrigin.x += randFloat(-4, 4);
      this.spawnOrigin.y += randFloat(-3, 3);
      this.spawnOrigin.z += randFloat(-4, 2);
      // 中間点が軌道の中央になるよう出発点を戻す
      this.spawnOrigin.addScaledVector(this.spawnDirection, -speed * life * 0.5);
    } else {
      // 画面の端から端へ斜めに流れる通常軌道
      const goingRight = Math.random() < 0.5;
      const angle = randFloat(0.32, 0.66);
      this.spawnDirection.set(
        Math.cos(angle) * (goingRight ? 1 : -1),
        -Math.sin(angle),
        0,
      );
      this.spawnOrigin.set(
        goingRight ? randFloat(-85, -10) : randFloat(10, 85),
        randFloat(cfg.spawnYMin, cfg.spawnYMax),
        randFloat(cfg.zMin, cfg.zMax),
      );
    }

    star.launch(this.spawnOrigin, this.spawnDirection, speed, life, time);
  }
}
