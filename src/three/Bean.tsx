import * as THREE from 'three'

const shellMaterial = new THREE.MeshPhysicalMaterial({
  color: '#6b3a1e',
  roughness: 0.32,
  clearcoat: 0.8,
  clearcoatRoughness: 0.25,
})

const capMaterial = new THREE.MeshStandardMaterial({ color: '#b98250', roughness: 0.8 })

/**
 * Shapes a point on a unit sphere into a roasted bean: slightly tapered ends, a flattish
 * front (+z) with a groove running down the middle (x = 0), and a domed back.
 */
function beanShape(v: THREE.Vector3) {
  const taper = 1 - 0.12 * v.y * v.y
  v.x *= taper
  v.z *= taper
  if (v.z > 0) {
    v.z *= 0.5
    // groove along the crease, fading out toward the tips
    v.z -= 0.22 * Math.exp(-((v.x / 0.16) ** 2)) * (1 - v.y * v.y)
  }
  return v
}

function shaped(geometry: THREE.BufferGeometry) {
  const pos = geometry.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    beanShape(v.fromBufferAttribute(pos, i))
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

/** Mirror across x = 0, flipping triangle winding so faces still point outward. */
function mirroredX(geometry: THREE.BufferGeometry) {
  const g = geometry.clone()
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setX(i, -pos.getX(i))
  const index = g.index!
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i + 1)
    index.setX(i + 1, index.getX(i + 2))
    index.setX(i + 2, a)
  }
  g.computeVertexNormals()
  return g
}

// Right half: the +x side of a unit sphere (phi from π/2 to 3π/2).
const rightShell = shaped(new THREE.SphereGeometry(1, 64, 64, Math.PI / 2, Math.PI))
// The flat face where the bean splits: a disc in the x = 0 plane facing −x, shaped to match the shell's edge.
const rightCap = (() => {
  const disc = new THREE.CircleGeometry(1, 64)
  const pos = disc.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, 0, pos.getY(i), pos.getX(i))
  return shaped(disc)
})()
const leftShell = mirroredX(rightShell)
const leftCap = mirroredX(rightCap)

/** Overall proportions of a roasted bean: narrow, tall, with a deep domed back. */
export const BEAN_SCALE: [number, number, number] = [0.72, 1, 0.75]

/** One half of a coffee bean, split along the crease (the x = 0 plane). */
function BeanHalf({ side }: { side: 'left' | 'right' }) {
  const right = side === 'right'
  return (
    <>
      <mesh geometry={right ? rightShell : leftShell} material={shellMaterial} castShadow />
      <mesh geometry={right ? rightCap : leftCap} material={capMaterial} />
    </>
  )
}

/** A closed bean: both halves, the grooved face toward +z. */
export function Bean(props: { scale?: number }) {
  const s = props.scale ?? 1
  return (
    <group scale={[BEAN_SCALE[0] * s, BEAN_SCALE[1] * s, BEAN_SCALE[2] * s]}>
      <group position-x={0.008}>
        <BeanHalf side="right" />
      </group>
      <group position-x={-0.008}>
        <BeanHalf side="left" />
      </group>
    </group>
  )
}

// --- whole roasted bean (home page) -------------------------------------------

/** Half the thickness of a roasted bean below and above its middle, for resting it on a surface. */
export const ROASTED_BACK = 0.8
export const ROASTED_FRONT = 0.42

/**
 * One-piece roasted bean: a slim oval with a flatter front cut by the classic S-shaped crease,
 * and a rounded back. Unit size: 1 tall (y), 0.68 wide (x).
 */
const roastedGeometry = (() => {
  const g = new THREE.SphereGeometry(1, 72, 72)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    const y = pos.getY(i)
    let z = pos.getZ(i)
    const taper = 1 - 0.1 * y * y
    x *= 0.68 * taper
    if (z > 0) {
      z *= ROASTED_FRONT * taper
      // the crease snakes from one tip to the other
      const creaseX = 0.13 * Math.sin(y * Math.PI) * taper
      const ends = Math.sqrt(Math.max(0, 1 - y * y))
      z -= 0.2 * Math.exp(-(((x - creaseX) / 0.09) ** 2)) * ends
    } else {
      z *= ROASTED_BACK * taper
    }
    pos.setXYZ(i, x, y, z)
  }
  g.computeVertexNormals()
  return g
})()

// A few roast shades so a scatter of beans doesn't look copy-pasted.
const roastedMaterials = ['#5e3219', '#6b3a1e', '#4f2a15', '#74421f'].map(
  (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.3 }),
)

/** A whole roasted bean with its crease facing +z. */
export function RoastedBean({ scale = 1, shade = 0 }: { scale?: number; shade?: number }) {
  return (
    <mesh
      geometry={roastedGeometry}
      material={roastedMaterials[shade % roastedMaterials.length]}
      scale={scale}
      castShadow
    />
  )
}
