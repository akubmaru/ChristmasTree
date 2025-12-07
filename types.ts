import * as THREE from 'three';

export enum TreeMode {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  id: number;
  scatterPosition: THREE.Vector3;
  treePosition: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color: THREE.Color;
  speed: number; // For animation variation
  phase: number; // For floating animation offset
}

export interface DualPosition {
    scatter: THREE.Vector3;
    tree: THREE.Vector3;
}