import { useEffect, useState } from 'react'
import * as THREE from 'three'

const v = (x: number, y: number) => new THREE.Vector2(x, y)

// Cross-section of the cup, spun around the y axis: foot → outer wall → rim → inner wall → inner floor.
const OUTER_WALL: [number, number][] = [[0.84, 0.04], [0.9, 0.15], [1.0, 0.5], [1.08, 0.9], [1.13, 1.25], [1.15, 1.32]]
const INNER_WALL: [number, number][] = [[0.6, 0.14], [0.82, 0.2], [0.93, 0.5], [1.0, 0.9], [1.05, 1.25]]

const cupProfile = [
  v(0, 0), v(0.78, 0),
  ...OUTER_WALL.map(([x, y]) => v(x, y)),
  v(1.12, 1.36), v(1.08, 1.33),
  ...[...INNER_WALL].reverse().map(([x, y]) => v(x, y)),
  v(0, 0.14),
]
const saucerProfile = [
  v(0, 0), v(1.25, 0), v(1.75, 0.1), v(1.9, 0.18), v(1.93, 0.21),
  v(1.88, 0.21), v(1.7, 0.14), v(1.2, 0.06), v(0, 0.06),
]

/** Height of the saucer's top surface; the cup stands on it. */
export const SAUCER_TOP = 0.06
/** Lowest liquid level (the cup's inner floor). */
export const CUP_FLOOR = 0.15

/** Radius of the inside of the cup at height `y`, so liquid and foam fit the wall. */
export function innerRadius(y: number) {
  if (y <= INNER_WALL[0][1]) return INNER_WALL[0][0]
  for (let i = 1; i < INNER_WALL.length; i++) {
    const [r1, y1] = INNER_WALL[i]
    if (y <= y1) {
      const [r0, y0] = INNER_WALL[i - 1]
      return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0)
    }
  }
  return INNER_WALL[INNER_WALL.length - 1][0]
}

const ceramic = new THREE.MeshPhysicalMaterial({ color: '#4a2c1c', roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 })
const gold = new THREE.MeshStandardMaterial({ color: '#d9b48a', metalness: 0.6, roughness: 0.3 })

/** Draws the café's name onto a transparent canvas used as the cup's printed label. */
async function makeLabelTexture() {
  await Promise.all([
    document.fonts.load('500 96px "Playfair Display"'),
    document.fonts.load('500 30px "Inter"'),
  ]).catch(() => undefined)

  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 288
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#d9b48a'
  ctx.textAlign = 'center'

  // bean mark
  ctx.save()
  ctx.translate(512, 58)
  ctx.rotate(0.6)
  ctx.beginPath()
  ctx.ellipse(0, 0, 20, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#2a1810'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(-4, -26)
  ctx.bezierCurveTo(8, -10, -8, 10, 4, 26)
  ctx.stroke()
  ctx.restore()

  ctx.font = '500 96px "Playfair Display", Georgia, serif'
  ctx.letterSpacing = '14px'
  ctx.fillText('SIP & SOUL', 519, 190)
  ctx.font = '500 30px "Inter", sans-serif'
  ctx.letterSpacing = '22px'
  ctx.fillText('CAFÉ', 523, 252)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function Label() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let disposed = false
    makeLabelTexture().then((t) => (disposed ? t.dispose() : setTexture(t)))
    return () => {
      disposed = true
    }
  }, [])

  if (!texture) return null
  // A thin tapered band hugging the outer wall between y = 0.5 and y = 1.05, centred on the front (+z).
  return (
    <mesh position-y={0.775}>
      <cylinderGeometry args={[1.112, 1.012, 0.55, 64, 1, true, -0.95, 1.9]} />
      <meshStandardMaterial map={texture} transparent roughness={0.4} metalness={0.3} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  )
}

/** Saucer, cup, handle and printed label. Liquid is drawn separately by the scene. */
export function CoffeeCup() {
  return (
    <group>
      <mesh material={ceramic} castShadow receiveShadow>
        <latheGeometry args={[saucerProfile, 96]} />
      </mesh>
      <mesh material={gold} position-y={0.205} rotation-x={Math.PI / 2}>
        <torusGeometry args={[1.905, 0.014, 8, 128]} />
      </mesh>

      <group position-y={SAUCER_TOP}>
        <mesh material={ceramic} castShadow>
          <latheGeometry args={[cupProfile, 96]} />
        </mesh>
        <mesh material={gold} position-y={1.345} rotation-x={Math.PI / 2}>
          <torusGeometry args={[1.13, 0.02, 12, 128]} />
        </mesh>
        <mesh material={ceramic} position={[1.12, 0.78, 0]} rotation-z={-Math.PI * 0.625} castShadow>
          <torusGeometry args={[0.3, 0.065, 20, 48, Math.PI * 1.25]} />
        </mesh>
        <Label />
      </group>
    </group>
  )
}
