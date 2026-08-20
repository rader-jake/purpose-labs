'use client'

import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

function Vial() {
  const group = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/3d/vial_new.glb')
  const labelTexture = useLoader(THREE.TextureLoader, '/3d/label-glp3rt.png')

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.25
  })

  const cloned = useMemo(() => {
    const c = scene.clone(true)

    labelTexture.flipY = false
    labelTexture.colorSpace = THREE.SRGBColorSpace
    // UV covers 0-0.329 in U — scale texture to fill that strip
    labelTexture.wrapS = THREE.RepeatWrapping
    labelTexture.wrapT = THREE.RepeatWrapping
    labelTexture.repeat.set(1 / 0.329, 1)
    labelTexture.offset.set(0, 0)

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.95, 0.98, 1.0),
      transmission: 0.95,
      roughness: 0.05,
      metalness: 0.0,
      ior: 1.5,
      thickness: 2.0,
      envMapIntensity: 1.0,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    const metalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.95, 0.95, 0.95),
      roughness: 0.6,
      metalness: 0.0,
    })

    const capMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.04, 0.04, 0.04),
      roughness: 0.9,
      metalness: 0.0,
    })

    const rubberMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.22, 0.22, 0.24),
      roughness: 0.9,
      metalness: 0.0,
    })

    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTexture,
      transparent: true,
      alphaTest: 0.05,
      roughness: 0.4,
      metalness: 0.0,
      side: THREE.FrontSide,
    })

    c.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      let obj: THREE.Object3D = child
      while (obj.parent && obj.parent.type !== 'Scene') obj = obj.parent
      const nodeName = obj.name.toLowerCase()

      if (nodeName === 'glass') child.material = glassMat
      else if (nodeName === 'metal') child.material = metalMat
      else if (nodeName === 'cap') child.material = capMat
      else if (nodeName === 'robber') child.material = rubberMat
      else if (nodeName === 'label') {
        child.material = labelMat
        child.renderOrder = 1
      }
    })

    return c
  }, [scene, labelTexture])

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      <primitive object={cloned} />
    </group>
  )
}

export default function VialTestPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(ellipse at 50% 60%, #1a2f5e 0%, #0d1b3e 60%, #070f22 100%)' }}>
      <Canvas
        camera={{ position: [0, 1.2, 8], fov: 32 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <Environment preset="warehouse" background={false} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[-4, 6, 3]} intensity={2} />
        <directionalLight position={[4, 3, 2]} intensity={1} color="#dde8ff" />

        <ContactShadows position={[0, -1.35, 0]} opacity={0.5} scale={6} blur={3} far={2} color="#000022" />

        <Suspense fallback={null}>
          <Vial />
        </Suspense>

        <OrbitControls enablePan={false} minDistance={3} maxDistance={12} minPolarAngle={Math.PI * 0.05} maxPolarAngle={Math.PI * 0.85} target={[0, 0, 0]} />
      </Canvas>
    </div>
  )
}
