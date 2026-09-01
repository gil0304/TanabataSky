/**
 * Tanabata Sky 演出調整用の定数。
 *
 * 演出の調整はすべてこのファイルの数値で行う。
 * 画面上に設定UIは一切存在しない（作らない）。
 */

/** 色彩定義 */
export const COLORS = {
  /** 夜空グラデーション（天頂・中間・地平近く） */
  skyTop: 0x02030e,
  skyMiddle: 0x0a1130,
  skyBottom: 0x141a44,

  /** 通常星 */
  starWhite: 0xffffff,
  starBlue: 0xbfd4ff,
  starYellow: 0xfff1c8,

  /** 天の川 */
  milkyWayWhite: 0xffffff,
  milkyWayBlue: 0xa9c6ff,
  milkyWayPurple: 0xc4b2f0,
  milkyWayGold: 0xf5e6c4,

  /** 流れ星（白〜青白） */
  shootingStar: 0xd8e8ff,

  /** 星座線（白〜青白） */
  constellationLine: 0xaac2ff,
} as const;

/** レンダラー設定 */
export const RENDERER = {
  maxPixelRatio: 2,
} as const;

/** 背景星 */
export const STAR_FIELD = {
  /** 星の数（1500〜3000目安） */
  count: 2400,
  /** 配置する球殻の半径範囲 */
  radiusMin: 170,
  radiusMax: 420,
  /** 星のサイズ範囲 */
  sizeMin: 0.9,
  sizeMax: 2.4,
  /** 少し明るく大きい星の割合とサイズ上限 */
  brightRatio: 0.06,
  brightSizeMax: 3.6,
  /** 瞬く星の割合 */
  twinkleRatio: 0.4,
  /** 瞬きの深さ（明るさの減衰量） */
  twinkleAmountMin: 0.2,
  twinkleAmountMax: 0.55,
  /** 瞬きの速さ */
  twinkleSpeedMin: 0.25,
  twinkleSpeedMax: 1.1,
} as const;

/** 天の川 */
export const MILKY_WAY = {
  /** 天の川の星数（3000〜8000目安） */
  starCount: 6000,
  /** 帯の全長 */
  length: 280,
  /** 帯の幅（ガウス分布の標準偏差） */
  widthSigma: 9,
  /** 奥行き方向の広がり */
  depthSigma: 22,
  /** 帯の中心のz位置 */
  zCenter: -45,
  /** 帯を斜めに横切らせる回転角（ラジアン）。実際の夏の空と同じ左上→右下 */
  tiltZ: -0.5,
  /** 帯の緩やかな曲がり */
  curveAmplitude: 10,
  curveFrequency: 0.016,
  /** 帯に沿った星のごく遅い流れ（unit/秒） */
  driftSpeed: 0.5,
  /** 星のゆらぎの振幅 */
  wobbleAmplitude: 0.3,
  /** 星のサイズ範囲 */
  sizeMin: 0.25,
  sizeMax: 1.1,
  brightRatio: 0.05,
  brightSizeMax: 1.8,
  /** 淡い光の雲（ヘイズ）の数と見た目 */
  hazeCount: 16,
  hazeSizeMin: 30,
  hazeSizeMax: 85,
  hazeOpacityMin: 0.02,
  hazeOpacityMax: 0.05,
} as const;

/** 星座（こと座・わし座）の配置と見た目 */
export const CONSTELLATIONS = {
  /** 星座を置く平面のz位置 */
  z: -30,
  /** 星ごとの奥行きの揺らぎ */
  depthJitter: 1.2,
  /** 星のサイズの基準倍率 */
  starBaseSize: 1.3,
  /** 星座線の透明度 */
  lineOpacity: 0.38,
  /** ベガ・アルタイルの明滅 */
  mainPulseSpeed: 0.45,
  mainPulseAmount: 0.3,
  /** ベガ・アルタイルの周囲の淡い光 */
  haloSize: 11,
  haloOpacity: 0.3,
  /**
   * 天の川を挟んで向かい合う配置（ベガ／アルタイルが原点）。
   * 実際の夏の夜空と同じく、ベガが右上（西側）、アルタイルが左下（東側）。
   * scaleは「度」からワールド座標への倍率。
   */
  lyra: { x: 26, y: 15, scale: 1.7 },
  aquila: { x: -24, y: -11, scale: 1.05 },
} as const;

/** 流れ星 */
export const SHOOTING_STAR = {
  /** 同時に存在できる最大数（使い回しプール） */
  poolSize: 3,
  /** 起動後に最初の1つが流れるまでの秒数 */
  firstDelay: 4,
  /** 発生間隔（6〜15秒、ランダム） */
  minInterval: 6,
  maxInterval: 15,
  /** たまに短い間隔で2つ流れる確率と遅延 */
  doubleChance: 0.18,
  doubleDelayMin: 0.4,
  doubleDelayMax: 1.4,
  /** ベガとアルタイルの間を横切る軌道になる確率 */
  crossChance: 0.2,
  /** 移動速度（unit/秒） */
  speedMin: 45,
  speedMax: 70,
  /** 寿命（秒） */
  lifeMin: 1.2,
  lifeMax: 2.0,
  /** 消えた後に尾の残光が残る時間（寿命に対する比率） */
  afterglowRatio: 0.45,
  /** 発光点の大きさ */
  headSize: 2.6,
  /** 尾の長さ = 速度 × この係数（秒） */
  trailLenFactor: 0.32,
  /** 尾を構成する頂点数 */
  trailPoints: 24,
  /** 出現位置の範囲 */
  spawnYMin: 6,
  spawnYMax: 36,
  zMin: -48,
  zMax: -16,
} as const;

/** カメラの自動演出（ごくゆっくり・酔わない振幅） */
export const CAMERA = {
  fov: 55,
  near: 0.1,
  far: 2000,
  basePosition: { x: 0, y: 0, z: 52 },
  /** 左右・上下・前後のドリフト */
  drift: {
    xAmp: 3.2,
    xFreq1: 0.021,
    xFreq2: 0.0077,
    yAmp: 1.6,
    yFreq: 0.017,
    zAmp: 2.4,
    zFreq: 0.013,
  },
  /** 呼吸のような浮遊感 */
  breathing: { amp: 0.35, freq: 0.11 },
  /** 視線のゆっくりした揺れ */
  lookAt: { xAmp: 3.5, xFreq: 0.009, yAmp: 2.2, yFreq: 0.012, z: -30 },
  /** ごくわずかなロール */
  roll: { amp: 0.012, freq: 0.006 },
} as const;
