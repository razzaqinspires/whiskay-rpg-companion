'use client';
import { useEffect, useRef } from 'react';
import { RigidBody, CapsuleCollider, CuboidCollider, useRapier } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';

export function PhysicsStage() {
  return <>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[45, .1, 45]} position={[0, -.1, 0]} friction={1.1}/></RigidBody>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[.4, 3, 45]} position={[-25, 3, 0]}/><CuboidCollider args={[.4, 3, 45]} position={[25, 3, 0]}/><CuboidCollider args={[25, 3, .4]} position={[0, 3, -25]}/><CuboidCollider args={[25, 3, .4]} position={[0, 3, 25]}/></RigidBody>
  </>;
}

export default function KinematicPlayer({ target, onPosition }) {
  const body = useRef(null), collider = useRef(null), controllerRef = useRef(null), verticalVelocity = useRef(0), lastSent = useRef({x: target.x, z: target.z});
  const targetRef = useRef(target);
  const { world } = useRapier();
  useEffect(() => { targetRef.current = target; }, [target.x, target.z]);
  useEffect(() => {
    const controller = world.createCharacterController(0.025);
    controller.setApplyImpulsesToDynamicBodies(false);
    controller.setCharacterMass(70);
    controller.enableAutostep(0.38, 0.2, true);
    controller.setMaxSlopeClimbAngle(Math.PI / 4);
    controller.setMinSlopeSlideAngle(Math.PI / 4);
    controllerRef.current = controller;
    return () => { world.removeCharacterController(controller); controllerRef.current = null; };
  }, [world]);
  useFrame((_, dt) => {
    const rb = body.current, shape = collider.current, controller = controllerRef.current;
    if (!rb || !shape || !controller) return;
    const current = rb.translation(), destination = targetRef.current;
    let dx = destination.x - current.x, dz = destination.z - current.z;
    const distance = Math.hypot(dx, dz), maxStep = 4.2 * Math.min(dt, .05);
    if (distance > maxStep && distance > 0) { dx = dx / distance * maxStep; dz = dz / distance * maxStep; }
    else { dx = distance ? dx : 0; dz = distance ? dz : 0; }
    if (controller.computedGrounded()) verticalVelocity.current = Math.max(0, verticalVelocity.current);
    else verticalVelocity.current -= 9.81 * Math.min(dt, .05);
    controller.computeColliderMovement(shape, { x: dx, y: verticalVelocity.current * Math.min(dt, .05), z: dz });
    const movement = controller.computedMovement();
    rb.setNextKinematicTranslation({ x: current.x + movement.x, y: current.y + movement.y, z: current.z + movement.z });
    if (Math.abs(current.x - lastSent.current.x) > .035 || Math.abs(current.z - lastSent.current.z) > .035) {
      lastSent.current = { x: current.x, z: current.z };
      onPosition?.({ x: current.x, z: current.z });
    }
  });
  return <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[target.x, .8, target.z]} enabledRotations={[false, false, false]}><CapsuleCollider ref={collider} args={[.42, .31]} position={[0, 0, 0]} friction={0}/></RigidBody>;
}
