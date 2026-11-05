import { Environment, Lightformer } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { RoastedBean } from '../../three/Bean'

// Matte ceramic-black body, brushed steel burrs, clear glass hopper.
const matteBlack = new THREE.MeshStandardMaterial({ color: '#1b1714', roughness: 0.62, metalness: 0.15 })
const satinBlack = new THREE.MeshStandardMaterial({ color: '#2a2420', roughness: 0.4, metalness: 0.35 })
const steel = new THREE.MeshStandardMaterial({ color: '#c9c4bf', roughness: 0.32, metalness: 0.95 })
const darkSteel = new THREE.MeshStandardMaterial({ color: '#8d8782', roughness: 0.4, metalness: 0.9 })
const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 1, thickness: 0.15, ior: 1.45, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
const terracotta = new THREE.MeshStandardMaterial({ color: '#c0623b', roughness: 0.7 })

const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)

// Body: slightly tapered column with a soft shoulder.
const bodyGeo = lathe([[0, 0], [0.92, 0], [0.95, 0.06], [0.9, 1.5], [0.86, 1.68], [0.8, 1.72], [0, 1.72]])
const baseGeo = lathe([[0, 0], [1.12, 0], [1.16, 0.06], [1.14, 0.3], [1.06, 0.36], [0, 0.36]])
// Glass hopper: a wide funnel narrowing into the burrs.
const hopperGeo = lathe([[0.36, 0], [0.42, 0.18], [0.92, 1.25], [0.95, 1.36], [0.91, 1.36], [0.88, 1.27], [0.38, 0.2], [0.32, 0.02]])
const lidGeo = lathe([[0, 0], [0.98, 0], [1.0, 0.04], [0.97, 0.13], [0.6, 0.16], [0, 0.16]])

/** One burr: a steel disc with radial cutting teeth. */
function Burr({ flip }: { flip?: boolean }) {
  const teeth = useMemo(() => Array.from({ length: 22 }, (_, i) => (i / 22) * Math.PI * 2), [])
  return (
    <group rotation-x={flip ? Math.PI : 0}>
      <mesh material={steel} castShadow><cylinderGeometry args={[0.64, 0.64, 0.07, 64]} /></mesh>
      <mesh material={darkSteel} position-y={0.04}><cylinderGeometry args={[0.2, 0.26, 0.05, 32]} /></mesh>
      {teeth.map((a, i) => (
        <mesh key={i} material={steel} position={[Math.cos(a) * 0.43, 0.055, Math.sin(a) * 0.43]} rotation={[0, -a + 0.5, 0]} castShadow>
          <boxGeometry args={[0.36, 0.04, 0.035]} />
        </mesh>
      ))}
    </group>
  )
}

// Where beans settle in the hopper (relative to the hopper's base), computed once.
const PILE = (() => {
  const out: { p: [number, number, number]; r: [number, number, number]; s: number; shade: number; delay: number }[] = []
  let seed = 3
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 38; i++) {
    const y = 0.22 + Math.pow(i / 38, 0.8) * 0.75
    const rMax = 0.36 + (y / 1.25) * 0.5
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * rMax * 0.82
    out.push({ p: [Math.cos(a) * r, y, Math.sin(a) * r], r: [rnd() * 6, rnd() * 6, rnd() * 6], s: 0.1 + rnd() * 0.025, shade: i, delay: 0.25 + i * 0.045 + rnd() * 0.15 })
  }
  return out
})()

/** Beans drop from above the frame into the hopper once, when the page opens. */
function FallingBeans({ animate }: { animate: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const t0 = useRef<number | null>(null)
  useFrame(({ clock }) => {
    if (t0.current === null) t0.current = clock.elapsedTime
    const t = clock.elapsedTime - t0.current
    PILE.forEach((b, i) => {
      const g = refs.current[i]
      if (!g) return
      if (!animate) { g.position.set(...b.p); return }
      const k = Math.min(1, Math.max(0, (t - b.delay) / 0.75))
      // ease-in fall, like a bean dropping under gravity
      const fall = k < 1 ? k * k : 1
      g.position.set(b.p[0], b.p[1] + (1 - fall) * 6, b.p[2])
      g.rotation.set(b.r[0] + (1 - fall) * 4, b.r[1], b.r[2] + (1 - fall) * 3)
      g.visible = t > b.delay - 0.05
    })
  })
  return (
    <>
      {PILE.map((b, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el }} position={b.p} rotation={b.r}>
          <RoastedBean scale={b.s} shade={b.shade} />
        </group>
      ))}
    </>
  )
}

/** Ground coffee drifting down from between the burrs while the grinder is opened up. */
function Grounds({ progress }: { progress: MutableRefObject<number> }) {
  const N = 500
  const ref = useRef<THREE.Points>(null)
  const data = useMemo(() => {
    const pos = new Float32Array(N * 3), speed = new Float32Array(N), phase = new Float32Array(N)
    for (let i = 0; i < N; i++) { speed[i] = 0.4 + Math.random() * 0.8; phase[i] = Math.random() }
    return { pos, speed, phase }
  }, [])
  const mat = useMemo(() => new THREE.PointsMaterial({ color: '#4a2a17', size: 0.035, transparent: true, opacity: 0, depthWrite: false }), [])
  useFrame(({ clock }) => {
    const p = THREE.MathUtils.smoothstep(progress.current, 0.25, 0.6)
    mat.opacity = p * 0.95
    const t = clock.elapsedTime
    for (let i = 0; i < N; i++) {
      const life = (t * data.speed[i] * 0.35 + data.phase[i]) % 1
      const a = data.phase[i] * 50 + life * 2
      const spread = 0.55 + life * 0.9
      data.pos[i * 3] = Math.cos(a) * spread * (0.3 + data.phase[i])
      data.pos[i * 3 + 1] = 2.2 + p * 0.9 - life * 2.4
      data.pos[i * 3 + 2] = Math.sin(a) * spread * (0.3 + data.phase[i])
    }
    ref.current!.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={ref} material={mat}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[data.pos, 3]} /></bufferGeometry>
    </points>
  )
}

/** The grinder. `progress` (0→1, from scroll) separates it into an exploded view. */
export function GrinderScene({ progress, animateBeans }: { progress: MutableRefObject<number>; animateBeans: boolean }) {
  const root = useRef<THREE.Group>(null)
  const lowerBurr = useRef<THREE.Group>(null)
  const upperBurr = useRef<THREE.Group>(null)
  const hopper = useRef<THREE.Group>(null)
  const lid = useRef<THREE.Group>(null)
  const collar = useRef<THREE.Group>(null)
  const eased = useRef(0)

  useFrame(({ clock, pointer }, dt) => {
    eased.current = THREE.MathUtils.damp(eased.current, progress.current, 6, dt)
    const p = THREE.MathUtils.smoothstep(eased.current, 0.05, 0.75)
    collar.current!.position.y = 2.06 + p * 0.2
    lowerBurr.current!.position.y = 2.1 + p * 0.6
    upperBurr.current!.position.y = 2.22 + p * 1.15
    hopper.current!.position.y = 2.3 + p * 1.75
    lid.current!.position.y = 3.66 + p * 2.15
    lowerBurr.current!.rotation.y = clock.elapsedTime * (0.4 + p * 2.5)
    upperBurr.current!.rotation.y = -clock.elapsedTime * 0.2
    // turn to show the burrs side-on as it opens, and lean toward the pointer
    root.current!.rotation.y = THREE.MathUtils.damp(root.current!.rotation.y, -0.35 + pointer.x * 0.25 + p * 0.5, 3, dt)
    root.current!.rotation.x = THREE.MathUtils.damp(root.current!.rotation.x, -pointer.y * 0.06 + p * 0.12, 3, dt)
    // pull back a little as it opens so every part stays in frame
    root.current!.position.y = -2.0 - p * 0.35
    root.current!.scale.setScalar(1 - p * 0.2)
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 4]} intensity={2.2} color="#fff1e4" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -2]} intensity={0.9} color="#e59b73" />
      <Environment resolution={256}>
        {/* soft studio: a big warm softbox, a cool rim and a terracotta bounce */}
        <Lightformer form="rect" intensity={2.2} color="#fff3e8" position={[0, 5, 3]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} />
        <Lightformer form="circle" intensity={1.2} color="#c0623b" position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={4} />
      </Environment>

      <group ref={root} position={[0, -2.0, 0]}>
        <mesh geometry={baseGeo} material={matteBlack} castShadow receiveShadow />
        <mesh geometry={bodyGeo} material={matteBlack} position-y={0.34} castShadow />
        {/* front grounds chute and a terracotta dial, small details that make it read as a grinder */}
        <mesh material={satinBlack} position={[0, 0.95, 0.88]} rotation-x={0.5} castShadow><boxGeometry args={[0.34, 0.16, 0.3]} /></mesh>
        <mesh material={terracotta} position={[0.62, 1.55, 0.62]} rotation={[Math.PI / 2, 0, -Math.PI / 4]} castShadow><cylinderGeometry args={[0.16, 0.16, 0.12, 40]} /></mesh>
        <group ref={collar} position-y={2.06}>
          <mesh material={steel} castShadow><cylinderGeometry args={[0.84, 0.84, 0.16, 96, 1, true]} /></mesh>
          <mesh material={darkSteel} rotation-x={Math.PI / 2}><torusGeometry args={[0.84, 0.02, 12, 96]} /></mesh>
        </group>
        <group ref={lowerBurr}><Burr /></group>
        <group ref={upperBurr}><Burr flip /></group>
        <group ref={hopper}>
          <mesh geometry={hopperGeo} material={glass} />
          <FallingBeans animate={animateBeans} />
        </group>
        <group ref={lid}>
          <mesh geometry={lidGeo} material={matteBlack} castShadow />
          <mesh material={steel} position-y={0.22}><sphereGeometry args={[0.1, 32, 16]} /></mesh>
        </group>
        <Grounds progress={progress} />
      </group>
    </>
  )
}
