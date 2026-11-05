import { Environment, Lightformer } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'

const lathe = (pts: [number, number][], seg = 96) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg)

const matteBlack = new THREE.MeshStandardMaterial({ color: '#1d1916', roughness: 0.55, metalness: 0.25 })
const ceramic = new THREE.MeshStandardMaterial({ color: '#f4ece2', roughness: 0.75 })
const terracotta = new THREE.MeshStandardMaterial({ color: '#c0623b', roughness: 0.8 })
const wood = new THREE.MeshStandardMaterial({ color: '#a3714c', roughness: 0.7 })
const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.04, transmission: 1, thickness: 0.1, ior: 1.45, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
// Opaque so it shows through the glass carafe (transmission only refracts opaque objects).
const coffee = new THREE.MeshPhysicalMaterial({ color: '#3a1d0e', roughness: 0.15, clearcoat: 1 })
const water = new THREE.MeshPhysicalMaterial({ color: '#e9f3f7', roughness: 0, transmission: 0.7, transparent: true, opacity: 0.75 })

// Kettle: round-shouldered body, flat lid, gooseneck spout.
const kettleBody = lathe([[0, 0], [0.66, 0], [0.74, 0.12], [0.76, 0.55], [0.66, 0.95], [0.42, 1.08], [0, 1.08]])
const kettleLid = lathe([[0, 0], [0.44, 0], [0.42, 0.06], [0.25, 0.1], [0, 0.11]])
const SPOUT = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.62, 0.22, 0),
  new THREE.Vector3(1.0, 0.25, 0),
  new THREE.Vector3(1.12, 0.75, 0),
  new THREE.Vector3(1.3, 1.25, 0),
  new THREE.Vector3(1.62, 1.36, 0),
])
const spoutGeo = new THREE.TubeGeometry(SPOUT, 64, 0.055, 16, false)
const handleGeo = new THREE.TorusGeometry(0.42, 0.06, 16, 48, Math.PI * 1.15)

// Pour-over dripper (ribbed cone with a flat rim) and a round glass carafe.
const dripperGeo = lathe([[0.16, 0], [0.22, 0.04], [0.62, 0.62], [0.74, 0.66], [0.74, 0.7], [0.6, 0.7], [0.2, 0.08], [0.12, 0.06]])
const carafeGeo = lathe([[0, 0], [0.6, 0], [0.7, 0.12], [0.72, 0.55], [0.6, 0.95], [0.32, 1.18], [0.3, 1.4], [0.34, 1.44]])
const vaseGeo = lathe([[0, 0], [0.26, 0], [0.34, 0.25], [0.3, 0.55], [0.12, 0.8], [0.1, 1.0], [0.15, 1.05]])
const cupGeo = lathe([[0, 0], [0.3, 0], [0.34, 0.06], [0.38, 0.42], [0.34, 0.42], [0.3, 0.08], [0, 0.08]])

/** Coffee in the carafe: a solid that fills to `level` (0–1). */
function CarafeCoffee({ level }: { level: MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    const h = Math.max(0.001, level.current * 0.7)
    ref.current!.scale.y = h
    ref.current!.visible = level.current > 0.01
  })
  // a unit-height lathe that follows the carafe's inner wall up to 0.7
  const geo = useMemo(() => lathe([[0, 0], [0.57, 0], [0.66, 0.15], [0.68, 0.7 / 0.7 * 0.55], [0.66, 1], [0, 1]].map(([x, y]) => [x, y] as [number, number])), [])
  return <mesh ref={ref} geometry={geo} material={coffee} position-y={0.03} />
}

export function PourScene({ progress }: { progress: MutableRefObject<number> }) {
  const scene = useRef<THREE.Group>(null)
  const kettle = useRef<THREE.Group>(null)
  const tip = useRef<THREE.Object3D>(null)
  const stream = useRef<THREE.Mesh>(null)
  const drips = useRef<THREE.InstancedMesh>(null)
  const level = useRef(0)
  const eased = useRef(0)
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(0, 2.15, 0), mid: new THREE.Vector3(), dir: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), q: new THREE.Quaternion(), m: new THREE.Matrix4() }), [])

  useFrame(({ clock }, dt) => {
    eased.current = THREE.MathUtils.damp(eased.current, progress.current, 5, dt)
    const p = eased.current
    const tilt = THREE.MathUtils.smoothstep(p, 0.05, 0.3)
    const pouring = THREE.MathUtils.smoothstep(p, 0.22, 0.32) * (1 - THREE.MathUtils.smoothstep(p, 0.92, 1))
    level.current = THREE.MathUtils.smoothstep(p, 0.3, 0.95)

    // the kettle lifts and tips forward over the dripper
    kettle.current!.position.set(-1.75 + tilt * 0.2, 2.3 + tilt * 0.3, 0)
    kettle.current!.rotation.z = -tilt * 0.58

    // water stream: from the spout tip down into the dripper, with a slight wobble
    tip.current!.getWorldPosition(v.a)
    scene.current!.worldToLocal(v.a)
    v.b.set(Math.sin(clock.elapsedTime * 6) * 0.015, 2.1, 0)
    v.dir.subVectors(v.b, v.a)
    const len = v.dir.length()
    v.mid.addVectors(v.a, v.b).multiplyScalar(0.5)
    stream.current!.position.copy(v.mid)
    stream.current!.quaternion.setFromUnitVectors(v.up, v.dir.normalize())
    stream.current!.scale.set(pouring, len, pouring)
    stream.current!.visible = pouring > 0.02

    // coffee drips from the dripper into the carafe while brewing
    const t = clock.elapsedTime
    for (let i = 0; i < 6; i++) {
      const life = (t * 1.6 + i / 6) % 1
      v.m.makeScale(pouring, pouring, pouring)
      v.m.setPosition(0, 1.55 - life * (1.2 - level.current * 0.45), 0)
      drips.current!.setMatrixAt(i, v.m)
    }
    drips.current!.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 6, 5]} intensity={2} color="#fff1e4" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -2]} intensity={0.7} color="#e59b73" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} color="#fff3e8" position={[0, 5, 3]} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} />
        <Lightformer form="circle" intensity={1} color="#c0623b" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={4} />
      </Environment>

      <group ref={scene} position={[0.2, -1.6, 0]}>
        {/* wooden counter */}
        <mesh material={wood} position={[0, -0.12, 0]} receiveShadow><boxGeometry args={[16, 0.24, 2.6]} /></mesh>

        {/* carafe with coffee, dripper on top */}
        <mesh geometry={carafeGeo} material={glass} castShadow />
        <CarafeCoffee level={level} />
        <group position-y={1.42}>
          <mesh geometry={dripperGeo} material={ceramic} castShadow />
        </group>
        <instancedMesh ref={drips} args={[undefined, undefined, 6]} material={coffee}><sphereGeometry args={[0.035, 12, 8]} /></instancedMesh>

        {/* kettle */}
        <group ref={kettle} scale={0.78}>
          <mesh geometry={kettleBody} material={matteBlack} castShadow />
          <mesh geometry={kettleLid} material={matteBlack} position-y={1.07} />
          <mesh material={matteBlack} position-y={1.22}><sphereGeometry args={[0.08, 24, 12]} /></mesh>
          <mesh geometry={spoutGeo} material={matteBlack} castShadow />
          <mesh geometry={handleGeo} material={matteBlack} position={[-0.72, 0.55, 0]} rotation-z={Math.PI * 0.42} castShadow />
          <object3D ref={tip} position={[1.66, 1.36, 0]} />
        </group>
        <mesh ref={stream} material={water}><cylinderGeometry args={[0.025, 0.02, 1, 12, 1, true]} /></mesh>

        {/* terracotta vase with a dried stem, and a ceramic cup */}
        <group position={[2.5, 0, -0.5]}>
          <mesh geometry={vaseGeo} material={terracotta} castShadow />
          <mesh material={wood} position={[0.08, 1.5, 0]} rotation-z={-0.15}><cylinderGeometry args={[0.012, 0.012, 1.1, 6]} /></mesh>
          <mesh material={terracotta} position={[0.18, 2.02, 0]}><sphereGeometry args={[0.09, 16, 12]} /></mesh>
        </group>
        <group position={[1.55, 0, 0.55]}>
          <mesh geometry={cupGeo} material={ceramic} castShadow />
          <mesh material={ceramic} position={[0.42, 0.24, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.1, 0.03, 12, 24]} /></mesh>
        </group>
      </group>
    </>
  )
}
