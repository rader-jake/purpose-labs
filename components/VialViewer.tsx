'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Label Texture ───────────────────────────────────────────────── */
function useLabel() {
  return useMemo(() => {
    if (typeof window === 'undefined') return null
    const W = 2048
    const H = 700
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Fully transparent background (clear = transparent on the vial)
    ctx.clearRect(0, 0, W, H)

    const navy = '#1A2F6B'
    const cx = W / 2

    // ── PL Monogram ──
    ctx.save()
    ctx.fillStyle = navy
    ctx.font = 'bold 100px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('P', cx - 26, 100)
    ctx.globalAlpha = 0.8
    ctx.fillText('L', cx + 26, 100)
    ctx.globalAlpha = 1
    // Thin rule under monogram
    ctx.strokeStyle = navy
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - 90, 158)
    ctx.lineTo(cx + 90, 158)
    ctx.stroke()
    ctx.restore()

    // ── GLP-3RT ──
    ctx.save()
    ctx.fillStyle = navy
    ctx.font = 'bold 200px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GLP-3RT', cx, 340)
    ctx.restore()

    // ── 10 MG pill box ──
    const pillW = 260
    const pillH = 64
    const pillX = cx - pillW / 2
    const pillY = 480
    const r = pillH / 2
    ctx.save()
    ctx.strokeStyle = navy
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(pillX + r, pillY)
    ctx.lineTo(pillX + pillW - r, pillY)
    ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, r)
    ctx.lineTo(pillX + r, pillY + pillH)
    ctx.arcTo(pillX, pillY + pillH, pillX, pillY, r)
    ctx.closePath()
    ctx.stroke()
    ctx.fillStyle = navy
    ctx.font = 'bold 42px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('10 MG', cx, pillY + pillH / 2)
    ctx.restore()

    // ── RESEARCH USE ONLY ──
    ctx.save()
    ctx.fillStyle = navy
    ctx.font = '500 28px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('R E S E A R C H   U S E   O N L Y', cx, 600)
    ctx.restore()

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [])
}

/* ─── Vial Model ──────────────────────────────────────────────────── */
function VialModel() {
  const groupRef = useRef<THREE.Group>(null)
  const label = useLabel() as THREE.CanvasTexture | null
  const { scene } = useGLTF('/3d/vial.glb')

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4
    }
  })

  // Apply label texture to the label/body mesh if it exists
  useMemo(() => {
    if (!label) return
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name.toLowerCase()
        // Apply label to any mesh that looks like the body/label surface
        if (name.includes('label') || name.includes('body') || name.includes('glass') || name.includes('vial')) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                mat.map = label
                mat.needsUpdate = true
              }
            })
          } else if (child.material instanceof THREE.MeshStandardMaterial || child.material instanceof THREE.MeshPhysicalMaterial) {
            child.material.map = label
            child.material.needsUpdate = true
          }
        }
      }
    })
  }, [scene, label])

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]}>
      <primitive object={scene} />
    </group>
  )
}

/* ─── Scene ───────────────────────────────────────────────────────── */
export default function VialViewer() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3
        }}
        style={{ background: '#0D1B3E' }}
        shadows
      >
        <Environment preset="studio" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 3, -3]} intensity={0.6} color="#ddeeff" />
        <directionalLight position={[0, 5, -7]} intensity={1.0} color="#ffffff" />
        <pointLight position={[0, 8, 2]} intensity={0.7} color="#fffaf0" />

        <Suspense fallback={null}>
          <VialModel />
        </Suspense>

        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
        />
      </Canvas>
    </div>
  )
}
