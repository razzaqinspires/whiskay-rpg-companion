'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
/** Lightweight optional bloom. Enabled only for High quality; no extra npm dependency. */
export default function NextGenPostFX({ enabled = false }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef(null);
  useEffect(() => {
    if (!enabled) { composerRef.current?.dispose?.(); composerRef.current = null; return; }
    const composer = new EffectComposer(gl);
    composer.setPixelRatio(Math.min(gl.getPixelRatio(), 1.25));
    composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.24, 0.28, 0.88));
    composerRef.current = composer;
    return () => { composer.dispose(); composerRef.current = null; };
  }, [enabled, gl, scene, camera]);
  useEffect(() => { if (composerRef.current) composerRef.current.setSize(size.width, size.height); }, [size.width, size.height]);
  useFrame((state, delta) => { if (composerRef.current) composerRef.current.render(Math.min(delta, 0.05)); else state.gl.render(state.scene, state.camera); }, 1);
  return null;
}
