"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function VialModel() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/3d/vial_new.glb");

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.25;
  });

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0.95, 0.98, 1.0),
      transmission: 0.95, roughness: 0.05, metalness: 0.0,
      ior: 1.5, thickness: 2.0, envMapIntensity: 1.0,
      transparent: true, side: THREE.DoubleSide, depthWrite: false,
    });
    const metalMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.60, 0.60, 0.62), metalness: 0.0, roughness: 1.0 });
    const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.04, 0.04, 0.04), roughness: 0.9, metalness: 0.0 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.22, 0.22, 0.24), roughness: 0.9, metalness: 0.0 });

    c.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      let obj: THREE.Object3D = child;
      while (obj.parent && obj.parent.type !== "Scene") obj = obj.parent;
      const n = obj.name.toLowerCase();
      if (n === "glass") child.material = glassMat;
      else if (n === "metal") child.material = metalMat;
      else if (n === "cap") child.material = capMat;
      else if (n === "robber") child.material = rubberMat;
      else if (n === "label") {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat) { mat.transparent = true; mat.alphaTest = 0.05; mat.needsUpdate = true; }
        child.renderOrder = 1;
      }
    });
    return c;
  }, [scene]);

  return (
    <group ref={group} position={[0, -1.2, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

export function VialViewer() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 32 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <Environment preset="warehouse" background={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[-4, 6, 3]} intensity={2} />
      <directionalLight position={[4, 3, 2]} intensity={1} color="#dde8ff" />
      <ContactShadows position={[0, -1.35, 0]} opacity={0.4} scale={6} blur={3} far={2} color="#000022" />
      <Suspense fallback={null}>
        <VialModel />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI * 0.05} maxPolarAngle={Math.PI * 0.85} />
    </Canvas>
  );
}
