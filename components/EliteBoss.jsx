'use client';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Lightweight Floor 5 elite: one low-poly mesh group and one ground telegraph.
// The AoE targets the player's position at wind-up; movement can escape the radius.
export default function EliteBoss({ floor = 5, playerPos = { x: 0, z: 0 }, enabled = true }) {
  const root = useRef(null);
  const ring = useRef(null);
  const ringMat = useRef(null);
  const phase = useRef('idle');
  const timer = useRef(2.2);
  const target = useRef(new THREE.Vector3());
  const lastDamageAt = useRef(0);

  useEffect(() => {
    phase.current = 'idle';
    timer.current = 2.2;
    if (ring.current) ring.current.visible = false;
  }, [floor, enabled]);

  useFrame((_, dt) => {
    if (!enabled || floor !== 5) {
      if (ring.current) ring.current.visible = false;
      return;
    }
    const step = Math.min(dt, 0.05);
    if (root.current) root.current.rotation.y += step * 0.22;

    timer.current -= step;
    if (phase.current === 'idle' && timer.current <= 0) {
      target.current.set(
        THREE.MathUtils.clamp(Number(playerPos.x) || 0, -3.4, 2.2),
        0.025,
        THREE.MathUtils.clamp(Number(playerPos.z) || 0, -0.2, 3)
      );
      phase.current = 'warning';
      timer.current = 1.05;
      if (ring.current) {
        ring.current.position.set(target.current.x, 0.028, target.current.z);
        ring.current.scale.setScalar(1);
        ring.current.visible = true;
      }
    } else if (phase.current === 'warning') {
      if (ringMat.current) {
        ringMat.current.opacity = 0.22 + (Math.sin(performance.now() * 0.018) + 1) * 0.17;
      }
      if (ring.current) {
        const pulse = 1 + (1.05 - Math.max(0, timer.current)) * 0.13;
        ring.current.scale.setScalar(pulse);
      }
      if (timer.current <= 0) {
        phase.current = 'idle';
        timer.current = 3.15;
        if (ring.current) ring.current.visible = false;
        const now = performance.now();
        if (now - lastDamageAt.current > 800) {
          lastDamageAt.current = now;
          window.dispatchEvent(new CustomEvent('whiskay:boss-aoe', {
            detail: { x: target.current.x, z: target.current.z, radius: 1.65, damage: 18 }
          }));
        }
      }
    }
  });

  if (floor !== 5) return null;
  return (
    <group>
      <group ref={root} position={[1.85, 0, -1.5]}>
        <mesh castShadow position={[0, 1.05, 0]}>
          <icosahedronGeometry args={[1.08, 1]} />
          <meshToonMaterial color="#8f244e" emissive="#5d092b" emissiveIntensity={1.1} />
        </mesh>
        <mesh position={[0, 1.32, 0.55]}>
          <octahedronGeometry args={[0.36, 0]} />
          <meshBasicMaterial color="#ffdc91" />
        </mesh>
        <mesh position={[-0.62, 1.72, 0]} rotation={[0, 0, 0.42]}>
          <coneGeometry args={[0.23, 0.9, 5]} />
          <meshToonMaterial color="#d8a0ff" />
        </mesh>
        <mesh position={[0.62, 1.72, 0]} rotation={[0, 0, -0.42]}>
          <coneGeometry args={[0.23, 0.9, 5]} />
          <meshToonMaterial color="#d8a0ff" />
        </mesh>
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[1.22, 1.58, 32]} />
        <meshBasicMaterial ref={ringMat} color="#ff315c" transparent opacity={0.42} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
