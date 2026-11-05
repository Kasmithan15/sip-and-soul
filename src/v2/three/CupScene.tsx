import { Environment, Lightformer } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'

const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)
const porcelain = new THREE.MeshPhysicalMaterial({ color: '#fbf7f2', roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.25 })
const coffee = new THREE.MeshPhysicalMaterial({ color: '#3b1c0c', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 })
const crema = new THREE.MeshPhysicalMaterial({ color: '#a8673a', roughness: 0.35, clearcoat: 0.6 })

// White ceramic cup: outer wall, rim, inner wall; and a shallow saucer.
const cupGeo = lathe([[0, 0], [0.7, 0], [0.78, 0.06], [0.92, 0.5], [1.02, 1.0], [1.06, 1.28], [1.04, 1.32], [0.98, 1.28], [0.94, 1.0], [0.84, 0.5], [0.66, 0.14], [0, 0.14]])
const saucerGeo = lathe([[0, 0], [1.2, 0], [1.75, 0.1], [1.86, 0.18], [1.82, 0.2], [1.62, 0.13], [1.1, 0.06], [0, 0.06]])
const innerR = (y: number) => (y < 0.5 ? 0.66 + ((y - 0.14) / 0.36) * 0.18 : y < 1 ? 0.84 + ((y - 0.5) / 0.5) * 0.1 : 0.94 + ((y - 1) / 0.28) * 0.04)

/** A narrowing helix: one strand of the swirling coffee funnel. */
function helix(phase: number, turns: number) {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= 120; i++) {
    const t = i / 120
    const r = 0.08 + Math.pow(t, 1.6) * 1.5
    const a = phase + t * turns * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(a) * r, t * 3.6, Math.sin(a) * r))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.05, 10, false)
}

export function CupScene({ progress }: { progress: MutableRefObject<number> }) {
  const funnel = useRef<THREE.Group>(null)
  const liquid = useRef<THREE.Mesh>(null)
  const cup = useRef<THREE.Group>(null)
  const eased = useRef(0)
  const strands = useMemo(() => Array.from({ length: 7 }, (_, i) => helix((i / 7) * Math.PI * 2, 1.6 + (i % 3) * 0.25)), [])
  const core = useMemo(() => lathe([[0.07, 0], [0.1, 0.6], [0.22, 1.6], [0.5, 2.8], [0.9, 3.6], [0, 3.6]]), [])

  useFrame(({ clock, pointer }, dt) => {
    eased.current = THREE.MathUtils.damp(eased.current, progress.current, 5, dt)
    const p = eased.current
    const flow = THREE.MathUtils.smoothstep(p, 0.05, 0.45)
    const drain = 1 - THREE.MathUtils.smoothstep(p, 0.8, 1)
    // the funnel descends into the cup, swirling, then thins out once the cup is full
    funnel.current!.position.y = 1.0 + (1 - flow) * 4.5
    funnel.current!.rotation.y = clock.elapsedTime * 1.6
    funnel.current!.scale.set(drain, 1, drain)
    funnel.current!.visible = drain > 0.02
    const level = 0.16 + THREE.MathUtils.smoothstep(p, 0.3, 0.85) * 1.0
    liquid.current!.position.y = level
    const r = innerR(level)
    liquid.current!.scale.set(r, 1, r)
    liquid.current!.visible = level > 0.2
    cup.current!.rotation.y = THREE.MathUtils.damp(cup.current!.rotation.y, -0.5 + pointer.x * 0.3, 3, dt)
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 7, 5]} intensity={2.2} color="#fff3e8" castShadow />
      <directionalLight position={[-5, 2, -3]} intensity={0.8} color="#e59b73" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.4} color="#fff6ee" position={[0, 5, 4]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[5, 2, 0]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} />
        <Lightformer form="circle" intensity={1.2} color="#c0623b" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={4} />
      </Environment>
      <group position={[0, -1.7, 0]}>
        <group ref={cup}>
          <mesh geometry={saucerGeo} material={porcelain} receiveShadow />
          <group position-y={0.06}>
            <mesh geometry={cupGeo} material={porcelain} castShadow />
            <mesh material={porcelain} position={[1.12, 0.78, 0]} rotation-z={-0.15}><torusGeometry args={[0.3, 0.075, 16, 40, Math.PI * 1.25]} /></mesh>
            <mesh ref={liquid} rotation-x={-Math.PI / 2} material={crema}><circleGeometry args={[1, 64]} /></mesh>
          </group>
        </group>
        <group ref={funnel}>
          <mesh geometry={core} material={coffee} />
          {strands.map((g, i) => <mesh key={i} geometry={g} material={coffee} />)}
        </group>
      </group>
    </>
  )
}
