import { ContactShadows, Environment, Lightformer, OrbitControls, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BREW_MS, CUP_LAND_MS } from '../data/brew'
import { ROASTED_BACK, ROASTED_FRONT, RoastedBean } from './Bean'
import { CUP_FLOOR, CoffeeCup, SAUCER_TOP, innerRadius } from './CoffeeCup'

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)
// Deterministic pseudo-random in [0, 1).
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453
  return x - Math.floor(x)
}

/** World height of the table top; the saucer stands on it. */
const TABLE_Y = -0.85
/** Height of the finished latte's surface inside the cup. */
const FULL_LEVEL = CUP_FLOOR + 0.9
const FOAM_HEIGHT = 0.13
const LAND_SECONDS = CUP_LAND_MS / 1000
const BREW_SECONDS = BREW_MS / 1000

const MILK = new THREE.Color('#f4ece1')
const LATTE = new THREE.Color('#b07a4a')
const ESPRESSO = new THREE.Color('#5b3019')

/** Blend milk → latte → espresso by the share of espresso in the cup. */
function liquidColor(espressoShare: number, out: THREE.Color) {
  return espressoShare < 0.5
    ? out.copy(MILK).lerp(LATTE, espressoShare * 2)
    : out.copy(LATTE).lerp(ESPRESSO, (espressoShare - 0.5) * 2)
}

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  return t
}

// --- textures ----------------------------------------------------------------

const woodTexture = (() => {
  const t = canvasTexture(1024, (ctx) => {
    // planks
    for (let p = 0; p < 4; p++) {
      ctx.fillStyle = `hsl(26, 42%, ${30 + hash(p) * 8}%)`
      ctx.fillRect(0, p * 256, 1024, 256)
    }
    ctx.fillStyle = 'rgba(0,0,0,.5)'
    for (let p = 1; p < 4; p++) ctx.fillRect(0, p * 256 - 1, 1024, 2)
    // grain
    for (let i = 0; i < 420; i++) {
      const y = hash(i * 3.1) * 1024
      ctx.strokeStyle = `rgba(${hash(i) > 0.5 ? '20,10,5' : '120,75,45'},${0.08 + hash(i * 7) * 0.18})`
      ctx.lineWidth = 0.5 + hash(i * 5) * 2.5
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= 1024; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 4 * hash(i * 9))
      ctx.stroke()
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 2)
  t.anisotropy = 8
  return t
})()

// Table fades out toward its edges so it melts into the page background.
const tableFade = canvasTexture(256, (ctx) => {
  const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128)
  g.addColorStop(0, '#fff')
  g.addColorStop(1, '#000')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
}, false)

const steamTexture = canvasTexture(128, (ctx) => {
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,0.9)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
}, false)

// Sphere UVs run top pole (v = 1) to equator (v = 0.5): cream centre fading to a latte ring.
const foamTexture = (() => {
  const c = document.createElement('canvas')
  c.width = 8
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, '#fdf7ee')
  g.addColorStop(0.7, '#f3e3cc')
  g.addColorStop(1, '#c99b6a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 8, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
})()

// Cappuccino heart seen from above: golden crema, a soft white milk heart, and a pale foam rim.
// The top of the canvas is the far side of the cup, so the heart reads upright to the viewer.
const artTexture = canvasTexture(512, (ctx) => {
  const crema = ctx.createRadialGradient(256, 256, 30, 256, 256, 256)
  crema.addColorStop(0, '#c98d55')
  crema.addColorStop(0.75, '#a86a3a')
  crema.addColorStop(0.93, '#8a5329')
  crema.addColorStop(1, '#e9d6bd') // thin foam ring where the drink meets the cup
  ctx.fillStyle = crema
  ctx.fillRect(0, 0, 512, 512)

  const heart = (scale: number) => {
    ctx.save()
    ctx.translate(256, 262)
    ctx.scale(scale, scale)
    ctx.beginPath()
    ctx.moveTo(0, 150)
    ctx.bezierCurveTo(-120, 70, -170, -10, -140, -80)
    ctx.bezierCurveTo(-110, -150, -25, -150, 0, -82)
    ctx.bezierCurveTo(25, -150, 110, -150, 140, -80)
    ctx.bezierCurveTo(170, -10, 120, 70, 0, 150)
    ctx.closePath()
    ctx.restore()
  }

  // milk heart with soft, slightly feathered edges
  ctx.shadowColor = 'rgba(255,248,236,0.9)'
  ctx.shadowBlur = 18
  ctx.fillStyle = '#fbf4e8'
  heart(1)
  ctx.fill()
  ctx.shadowBlur = 0

  // faint crema blush inside, the way milk folds over the espresso as it is poured
  ctx.fillStyle = 'rgba(201,141,85,0.12)'
  heart(0.55)
  ctx.fill()

  // the thin tail left as the pitcher lifts away through the point of the heart
  ctx.strokeStyle = 'rgba(251,244,232,0.85)'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(256, 380)
  ctx.lineTo(256, 438)
  ctx.stroke()
})

// --- geometry ----------------------------------------------------------------

const domeGeometry = new THREE.SphereGeometry(1, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2)
// Same dome with UVs projected straight down, so the latte art lies flat on the foam.
const artGeometry = (() => {
  const g = domeGeometry.clone()
  const pos = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) * 0.5 + 0.5, 0.5 - pos.getZ(i) * 0.5)
  uv.needsUpdate = true
  return g
})()

// --- table beans -------------------------------------------------------------

const BEAN_SIZE = 0.2

/** A few beans resting on the table around the saucer. */
const tableBeans = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * Math.PI * 2 + hash(i + 1) * 0.4,
  radius: 2.4 + hash(i + 50) * 1.4,
  turn: hash(i + 7) * Math.PI * 2,
  scale: BEAN_SIZE * (0.85 + hash(i + 3) * 0.3),
}))

function TableBeans() {
  return (
    <>
      {tableBeans.map((b, i) => {
        // some lie crease-up on their rounded backs, the rest crease-down, each with a slight lean
        const creaseUp = i % 3 !== 0
        const rest = (creaseUp ? ROASTED_BACK : ROASTED_FRONT) * b.scale
        return (
          <group
            key={i}
            position={[Math.cos(b.angle) * b.radius, TABLE_Y + rest, Math.sin(b.angle) * b.radius]}
            rotation-y={b.turn}
          >
            <group rotation={[creaseUp ? -Math.PI / 2 : Math.PI / 2, (hash(i + 21) - 0.5) * 0.3, 0]}>
              <RoastedBean scale={b.scale} shade={i} />
            </group>
          </group>
        )
      })}
    </>
  )
}

// --- swirl pour --------------------------------------------------------------

/** Espresso, milk and caramel streams that spiral down into the cup together. */
const streams = [
  { color: '#5b3019', thickness: 0.085, phase: 0 },
  { color: '#f4ece1', thickness: 0.08, phase: (Math.PI * 2) / 3 },
  { color: '#c47a2c', thickness: 0.055, phase: (Math.PI * 4) / 3 },
]
const STREAM_RINGS = 140
const STREAM_SIDES = 14
const DROPLETS_PER_STREAM = 6
const RIPPLE_COUNT = 3

/** Helix from high above and wide of the cup, curling inward and down into the middle of the drink (cup space). */
function streamCurve(phase: number) {
  const points = Array.from({ length: 80 }, (_, k) => {
    const s = k / 79
    const angle = phase + s * Math.PI * 2.6
    const r = THREE.MathUtils.lerp(1.9, 0.12, Math.pow(s, 0.75))
    const y = THREE.MathUtils.lerp(3.4, FULL_LEVEL - 0.1, s * s * (3 - 2 * s))
    return new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r)
  })
  return new THREE.CatmullRomCurve3(points)
}

/** A tube whose rings are rebuilt every frame, so the stream can stretch, thin and wobble like a real pour. */
function createStreamGeometry() {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((STREAM_RINGS + 1) * (STREAM_SIDES + 1) * 3), 3))
  const index: number[] = []
  for (let i = 0; i < STREAM_RINGS; i++) {
    for (let j = 0; j < STREAM_SIDES; j++) {
      const a = i * (STREAM_SIDES + 1) + j
      const b = a + STREAM_SIDES + 1
      index.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  g.setIndex(index)
  return g
}

const UP = new THREE.Vector3(0, 1, 0)
const SIDE = new THREE.Vector3(1, 0, 0)
const _point = new THREE.Vector3()
const _tangent = new THREE.Vector3()
const _normal = new THREE.Vector3()
const _binormal = new THREE.Vector3()

/**
 * Lays the stream along its curve between `tail` and `head` (0..1 along the curve). It is thickest where it
 * leaves the source and thins as it falls, bulges travel down it like a real pour, the leading end is a
 * rounded drop, and the trailing end thins to nothing.
 */
function shapeStream(
  geometry: THREE.BufferGeometry,
  curve: THREE.CatmullRomCurve3,
  tail: number,
  head: number,
  thickness: number,
  t: number,
  seed: number,
) {
  const pos = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i <= STREAM_RINGS; i++) {
    const along = i / STREAM_RINGS
    const s = tail + (head - tail) * along
    curve.getPointAt(s, _point)
    curve.getTangentAt(s, _tangent)
    _normal.crossVectors(_tangent, UP)
    if (_normal.lengthSq() < 1e-6) _normal.crossVectors(_tangent, SIDE)
    _normal.normalize()
    _binormal.crossVectors(_tangent, _normal).normalize()

    const thinTail = smoothstep(0, 0.12, along)
    const roundHead = along > 0.94 ? Math.sqrt(Math.max(0, 1 - ((along - 0.94) / 0.06) ** 2)) : 1
    const falling = 1.15 - 0.55 * s
    const pulse = 1 + 0.18 * Math.sin(s * 42 - t * 16 + seed) + 0.08 * Math.sin(s * 97 - t * 27 + seed * 2)
    const r = thickness * thinTail * roundHead * falling * pulse

    for (let j = 0; j <= STREAM_SIDES; j++) {
      const a = (j / STREAM_SIDES) * Math.PI * 2
      // slightly uneven cross-section so it never looks like a perfect pipe
      const wobble = 1 + 0.07 * Math.sin(a * 3 + t * 9 + seed + s * 20)
      const c = Math.cos(a) * r * wobble
      const sn = Math.sin(a) * r * wobble
      pos.setXYZ(
        i * (STREAM_SIDES + 1) + j,
        _point.x + _normal.x * c + _binormal.x * sn,
        _point.y + _normal.y * c + _binormal.y * sn,
        _point.z + _normal.z * c + _binormal.z * sn,
      )
    }
  }
  pos.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
}

// Creamy streaks across the liquid; spun fast while pouring, then slowing to a stop as it settles.
const swirlTexture = canvasTexture(512, (ctx) => {
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 512, 512)
  ctx.translate(256, 256)
  for (let arm = 0; arm < 3; arm++) {
    ctx.rotate((Math.PI * 2) / 3)
    ctx.strokeStyle = 'rgba(120,70,35,.45)'
    ctx.lineWidth = 14
    ctx.beginPath()
    for (let k = 0; k <= 60; k++) {
      const a = (k / 60) * Math.PI * 2.2
      const r = 20 + (k / 60) * 230
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    ctx.stroke()
  }
})

// --- scene -------------------------------------------------------------------

interface CoffeeSceneProps {
  /** Starts the cup's entrance, then the pour. */
  show: boolean
  interactive: boolean
}

export function CoffeeScene({ show, interactive }: CoffeeSceneProps) {
  const cupGroup = useRef<THREE.Group>(null)
  const surface = useRef<THREE.Mesh>(null)
  const foam = useRef<THREE.Mesh>(null)
  const art = useRef<THREE.Mesh>(null)
  const pour = useRef<THREE.Group>(null)
  const steam = useRef<THREE.Group>(null)
  const startedAt = useRef<number | null>(null)
  const steamAmount = useRef(0)

  const droplets = useRef<THREE.Group>(null)
  const ripples = useRef<THREE.Group>(null)
  const streamCurves = useMemo(() => streams.map((st) => streamCurve(st.phase)), [])
  const streamGeometries = useMemo(() => streams.map(() => createStreamGeometry()), [])
  const surfaceMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: swirlTexture, color: ESPRESSO, roughness: 0.15, clearcoat: 1 }),
    [],
  )
  const artMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ map: artTexture, transparent: true, opacity: 0, roughness: 0.85 }),
    [],
  )

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (show && startedAt.current === null) startedAt.current = t
    const elapsed = startedAt.current === null ? 0 : t - startedAt.current

    // ----- cup drops onto the table with a spin, then sways gently -----
    const landing = Math.min(elapsed / LAND_SECONDS, 1)
    const e = easeOutBack(landing)
    const g = cupGroup.current!
    g.position.y = TABLE_Y + (1 - e) * 4
    g.scale.setScalar(Math.max(0.001, Math.min(landing * 1.5, 1)))
    g.rotation.y = (1 - e) * -Math.PI * 1.5 + Math.sin(t * 0.4) * 0.25

    // ----- one continuous brew: u runs 0 → 1 -----
    const u = clamp01((elapsed - LAND_SECONDS) / BREW_SECONDS)

    // The streams pour in head-first, their tails follow them down, and the whole pour spins as one.
    const head = smoothstep(0, 0.45, u)
    const tail = smoothstep(0.3, 0.75, u)
    const pouring = u > 0 && head - tail > 0.01
    const p = pour.current!
    p.visible = pouring
    p.rotation.y = -u * 5
    if (pouring) {
      streams.forEach((st, i) => shapeStream(streamGeometries[i], streamCurves[i], tail, head, st.thickness, t, i * 2.1))
    }

    // Droplets shake loose and fly alongside each stream.
    droplets.current!.children.forEach((drop, k) => {
      const i = k % streams.length
      const travel = (t * 0.7 + k * 0.37) % 1
      const s = tail + (head - tail) * travel
      drop.visible = pouring && travel > 0.15
      if (!drop.visible) return
      streamCurves[i].getPointAt(s, drop.position)
      const spread = 0.08 + 0.12 * travel
      drop.position.x += Math.cos(k * 2.3 + t * 3) * spread
      drop.position.z += Math.sin(k * 1.7 + t * 3) * spread
      drop.scale.setScalar(streams[i].thickness * (0.35 + 0.25 * Math.sin(t * 6 + k)))
    })

    // The cup fills as the streams land; espresso first, lightening to latte as the milk mixes in.
    const fill = smoothstep(0.25, 0.75, u)
    const level = CUP_FLOOR + (FULL_LEVEL - CUP_FLOOR) * fill
    const radius = innerRadius(level) - 0.01
    const foamAmount = smoothstep(0.65, 0.88, u)
    const artAmount = smoothstep(0.8, 1, u)
    const foamHeight = foamAmount * FOAM_HEIGHT
    const topY = level + foamHeight

    const s = surface.current!
    s.visible = fill > 0.005
    s.position.y = level
    s.scale.setScalar(radius)
    s.rotation.z += dt * 14 * Math.pow(1 - u, 2) // swirl, slowing as it settles
    liquidColor(1 - 0.5 * smoothstep(0.35, 0.8, u), surfaceMaterial.color)

    // Rings spread out across the surface where the pour lands.
    ripples.current!.children.forEach((ring, k) => {
      const phase = (t * 1.3 + k / RIPPLE_COUNT) % 1
      ring.visible = pouring && fill > 0.02
      ring.position.y = level + 0.004
      ring.scale.setScalar(0.08 + phase * radius * 0.9)
      ;((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.5
    })

    const f = foam.current!
    f.visible = foamAmount > 0.01
    f.position.y = level - 0.005
    f.scale.set(radius, Math.max(foamHeight, 0.001), radius)

    const ar = art.current!
    ar.visible = artAmount > 0.01 && f.visible
    ar.position.y = level - 0.004
    ar.scale.set(radius, Math.max(foamHeight, 0.001) + 0.003, radius)
    ar.rotation.y = (1 - artAmount) * 3
    artMaterial.opacity = artAmount

    // ----- steam over the hot drink -----
    steamAmount.current = THREE.MathUtils.damp(steamAmount.current, fill > 0.5 ? 1 : 0, 2, dt)
    steam.current!.children.forEach((child, i) => {
      const sprite = child as THREE.Sprite
      const phase = (t * 0.28 + i / 6) % 1
      sprite.position.set(Math.sin(t * 0.8 + i * 2) * 0.25, topY + 0.15 + phase * 1.8, Math.cos(t * 0.6 + i) * 0.15)
      sprite.scale.setScalar(0.4 + phase * 1.1)
      ;(sprite.material as THREE.SpriteMaterial).opacity = Math.sin(phase * Math.PI) * 0.15 * steamAmount.current
    })
  })

  return (
    <>
      {/* Soft studio reflections so the coffee, milk and caramel look wet and glossy. */}
      <Environment resolution={256} environmentIntensity={0.6}>
        <Lightformer form="rect" intensity={3} color="#fff1e0" position={[0, 5, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#ffd9b0" position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[4, 2, 4]} scale={2} />
      </Environment>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#ffeedd', '#6b4228', 0.7]} />
      <directionalLight position={[4, 6, 5]} intensity={3.2} color="#ffe6c8" castShadow />
      <directionalLight position={[-5, 3, -2]} intensity={0.9} color="#d9b48a" />
      <pointLight position={[0, 3, 2]} intensity={6} color="#ffb877" distance={8} />

      {/* Wooden table */}
      <mesh rotation-x={-Math.PI / 2} position-y={TABLE_Y - 0.001} receiveShadow>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial map={woodTexture} alphaMap={tableFade} transparent roughness={0.7} />
      </mesh>
      <ContactShadows position={[0, TABLE_Y + 0.002, 0]} opacity={0.6} scale={8} blur={2.4} far={3} color="#000000" />

      <Sparkles count={30} scale={[8, 5, 4]} position-y={1} size={2} speed={0.3} color="#d9b48a" opacity={0.5} />
      <TableBeans />

      <group ref={cupGroup}>
        <CoffeeCup />
        <group position-y={SAUCER_TOP}>
          <mesh ref={surface} material={surfaceMaterial} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[1, 64]} />
          </mesh>
          <mesh ref={foam} geometry={domeGeometry}>
            <meshStandardMaterial map={foamTexture} roughness={0.9} />
          </mesh>
          <mesh ref={art} geometry={artGeometry} material={artMaterial} />
          <group ref={steam}>
            {Array.from({ length: 6 }, (_, i) => (
              <sprite key={i}>
                <spriteMaterial map={steamTexture} transparent depthWrite={false} opacity={0} />
              </sprite>
            ))}
          </group>
          <group ref={pour} visible={false}>
            {streams.map((st, i) => (
              <mesh key={st.color} geometry={streamGeometries[i]} frustumCulled={false}>
                <meshPhysicalMaterial color={st.color} roughness={0.05} clearcoat={1} clearcoatRoughness={0.05} />
              </mesh>
            ))}
          </group>
          <group ref={droplets}>
            {Array.from({ length: streams.length * DROPLETS_PER_STREAM }, (_, k) => (
              <mesh key={k} visible={false}>
                <sphereGeometry args={[1, 12, 10]} />
                <meshPhysicalMaterial color={streams[k % streams.length].color} roughness={0.05} clearcoat={1} />
              </mesh>
            ))}
          </group>
          <group ref={ripples}>
            {Array.from({ length: RIPPLE_COUNT }, (_, k) => (
              <mesh key={k} rotation-x={-Math.PI / 2} visible={false}>
                <ringGeometry args={[0.92, 1, 48]} />
                <meshBasicMaterial color="#f6e7d2" transparent opacity={0} depthWrite={false} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      <OrbitControls
        enabled={interactive}
        enablePan={false}
        enableZoom={false}
        target={[0, -0.3, 0]}
        minPolarAngle={0.75}
        maxPolarAngle={1.25}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
        rotateSpeed={0.5}
      />
    </>
  )
}
