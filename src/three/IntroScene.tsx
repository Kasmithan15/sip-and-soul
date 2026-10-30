import { Environment, Lightformer } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Bean } from './Bean'

// Deterministic scatter of small background beans on a shell around the hero bean.
const smallBeans = Array.from({ length: 26 }, (_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / 26)
  const theta = Math.PI * (1 + Math.sqrt(5)) * i
  const radius = 4.5 + (i % 4)
  return {
    position: new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi) * 0.7,
      radius * Math.sin(phi) * Math.sin(theta) - 3,
    ),
    spin: 0.2 + (i % 5) * 0.12,
    scale: 0.25 + (i % 3) * 0.08,
  }
})

/** A big glossy bean turning slowly among tumbling smaller beans; the camera follows the pointer a little. */
export function IntroScene() {
  const bean = useRef<THREE.Group>(null)
  const scatter = useRef<THREE.Group>(null)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime

    const g = bean.current!
    g.scale.setScalar(Math.min(1, state.viewport.width / 3.6))
    // full turns around its long axis while tipping forward and back, so every side shows
    g.rotation.y = t * 0.9
    g.rotation.x = Math.sin(t * 0.6) * 0.45
    g.rotation.z = -0.25 + Math.sin(t * 0.45) * 0.15
    g.position.y = Math.sin(t * 1.2) * 0.12

    scatter.current!.children.forEach((child, i) => {
      child.rotation.x += dt * smallBeans[i].spin
      child.rotation.y += dt * smallBeans[i].spin * 0.7
    })

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, state.pointer.x * 0.6, 3, dt)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, state.pointer.y * 0.4, 3, dt)
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#ffe2c0" />
      <directionalLight position={[-4, -2, -3]} intensity={0.8} color="#d9b48a" />

      {/* Studio reflections built from light panels, so the glossy beans read as solid 3D shapes. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#ffe4c4" position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#d9b48a" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={2} color="#fff2e0" position={[4, 1, 4]} scale={2} />
      </Environment>

      <group ref={bean}>
        <Bean scale={0.9} />
      </group>

      <group ref={scatter}>
        {smallBeans.map((b, i) => (
          <group key={i} position={b.position}>
            <Bean scale={b.scale} />
          </group>
        ))}
      </group>
    </>
  )
}
