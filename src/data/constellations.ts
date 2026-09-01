/**
 * こと座（Lyra）とわし座（Aquila）の実データによる再現。
 *
 * 座標はJ2000の赤経・赤緯を、各星座の主星（ベガ／アルタイル）を
 * 原点とする平面に投影したもの（単位: 度）。
 *   x = (RA0 - RA) × cos(Dec0)  … 実際の空の見え方（北が上・東が左）
 *   y = Dec - Dec0
 *
 * サイズは実視等級から、色はスペクトル型から決めている。
 * 星座線はStellarium modern（+ こと座は伝統的なα-ε-ζ三角形）に基づく。
 */

export interface ConstellationStarData {
  /** 星座ローカル座標（度） */
  x: number;
  y: number;
  /** 描画サイズ（実視等級から換算） */
  size: number;
  /** 星の色（スペクトル型に基づく） */
  color: number;
  /** ベガ／アルタイルの識別 */
  id?: 'vega' | 'altair';
}

export interface ConstellationData {
  /** 内部識別用（画面には一切表示しない） */
  name: 'lyra' | 'aquila';
  stars: ConstellationStarData[];
  /** stars のインデックスペアで星座線を定義 */
  lines: [number, number][];
}

/** 実視等級から描画サイズへ換算する */
function sizeFromMagnitude(magnitude: number): number {
  return 3.4 * 10 ** (-0.13 * magnitude);
}

/** こと座 — 織姫（ベガ）。原点: ベガ (RA 279.235°, Dec +38.784°) */
export const LYRA: ConstellationData = {
  name: 'lyra',
  stars: [
    // 主要6星（三角形 + 平行四辺形）
    { x: 0.0, y: 0.0, size: sizeFromMagnitude(0.03), color: 0xcae2ff, id: 'vega' }, // α Lyr ベガ 0.03等 A0V
    { x: -1.44, y: 0.83, size: sizeFromMagnitude(3.9), color: 0xeef2ff }, // ε Lyr 3.9等(合成) A系 ダブルダブル
    { x: -1.53, y: -1.18, size: sizeFromMagnitude(4.36), color: 0xf0f2ff }, // ζ1 Lyr 4.36等 Am
    { x: -2.56, y: -5.42, size: sizeFromMagnitude(3.52), color: 0xd6e2ff }, // β Lyr シェリアク 3.52等 B8II
    { x: -4.29, y: -6.09, size: sizeFromMagnitude(3.25), color: 0xdae4ff }, // γ Lyr スラファト 3.25等 B9III
    { x: -3.42, y: -1.89, size: sizeFromMagnitude(4.3), color: 0xffc494 }, // δ2 Lyr 4.30等 M4II 赤色巨星
    // その他の構成星（線は結ばない）
    { x: -3.27, y: -1.81, size: sizeFromMagnitude(5.58), color: 0xc9dcff }, // δ1 Lyr 5.58等 B2.5V
    { x: -7.18, y: 0.36, size: sizeFromMagnitude(4.39), color: 0xcaddff }, // η Lyr アラドファル 4.39等 B2.5IV
    { x: -7.69, y: -0.65, size: sizeFromMagnitude(4.36), color: 0xffe2b8 }, // θ Lyr 4.36等 K0II
    { x: 3.33, y: -2.72, size: sizeFromMagnitude(4.33), color: 0xffdcab }, // κ Lyr 4.33等 K2III
    { x: -4.5, y: -6.64, size: sizeFromMagnitude(4.93), color: 0xffd8a6 }, // λ Lyr 4.93等 K3
    { x: -5.92, y: -2.68, size: sizeFromMagnitude(5.25), color: 0xcedfff }, // ι Lyr 5.25等 B6V
    { x: 2.48, y: 0.72, size: sizeFromMagnitude(5.11), color: 0xe6edff }, // μ Lyr 5.11等 A3IV
    { x: -3.59, y: 5.16, size: sizeFromMagnitude(4.0), color: 0xffbe8c }, // R Lyr 4.0等 M5III 変光星
  ],
  lines: [
    // ベガ・ε・ζの小三角形（伝統的図形）
    [0, 1], // ベガ - ε
    [1, 2], // ε - ζ
    [0, 2], // ベガ - ζ
    // 平行四辺形（ζ-β-γ-δ2-ζ）
    [2, 3], // ζ - β
    [3, 4], // β - γ
    [4, 5], // γ - δ2
    [5, 2], // δ2 - ζ
  ],
};

/** わし座 — 彦星（アルタイル）。原点: アルタイル (RA 297.696°, Dec +8.868°) */
export const AQUILA: ConstellationData = {
  name: 'aquila',
  stars: [
    // 図形を構成する10星
    { x: 0.0, y: 0.0, size: sizeFromMagnitude(0.76), color: 0xfff3d8, id: 'altair' }, // α Aql アルタイル 0.76等 A7V
    { x: 1.12, y: 1.75, size: sizeFromMagnitude(2.72), color: 0xffd39e }, // γ Aql タラゼド 2.72等 K3II
    { x: -1.12, y: -2.46, size: sizeFromMagnitude(3.71), color: 0xfff0c8 }, // β Aql アルシャイン 3.71等 G8IV
    { x: 11.21, y: 5.0, size: sizeFromMagnitude(2.99), color: 0xd9e6ff }, // ζ Aql オカブ 2.99等 A0Vn
    { x: 12.64, y: 6.2, size: sizeFromMagnitude(4.02), color: 0xffdfb2 }, // ε Aql 4.02等 K1III
    { x: 6.25, y: -5.75, size: sizeFromMagnitude(3.36), color: 0xfbf5e4 }, // δ Aql 3.36等 F0IV
    { x: 11.0, y: -13.75, size: sizeFromMagnitude(3.43), color: 0xd7e4ff }, // λ Aql 3.43等 B9V
    { x: -5.07, y: -9.69, size: sizeFromMagnitude(3.24), color: 0xdce7ff }, // θ Aql 3.24等 B9.5III
    { x: -0.42, y: -7.86, size: sizeFromMagnitude(3.87), color: 0xfff2cd }, // η Aql 3.87等 F6-G4 セファイド変光星
    { x: 3.47, y: -10.16, size: sizeFromMagnitude(4.36), color: 0xd2e1ff }, // ι Aql 4.36等 B5III
    // その他の構成星（線は結ばない）
    { x: 4.13, y: -1.49, size: sizeFromMagnitude(4.45), color: 0xffddb0 }, // μ Aql 4.45等 K3III
    { x: 5.99, y: -8.53, size: sizeFromMagnitude(4.66), color: 0xf8f2e0 }, // ν Aql 4.66等 F系
    { x: 12.13, y: -14.61, size: sizeFromMagnitude(4.02), color: 0xffdfb3 }, // 12 Aql 4.02等 K1III
  ],
  lines: [
    // 頭部（β-α-γ）
    [2, 0], // β - アルタイル
    [0, 1], // アルタイル - γ
    // 胴体（α-δ）と尾（δ-η-θ）
    [0, 5], // アルタイル - δ
    [5, 8], // δ - η
    [8, 7], // η - θ
    // 右翼（δ-ζ-ε）
    [5, 3], // δ - ζ
    [3, 4], // ζ - ε
    // 左翼（δ-λ）
    [5, 6], // δ - λ
  ],
};

export const CONSTELLATION_DATA: ConstellationData[] = [LYRA, AQUILA];
