"use client";

import { ParticleBackground } from "@/components/ParticleBackground";
import { Reveal } from "./Reveal";
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
    <group ref={group} position={[0, -0.5, 0]}>
      <primitive object={cloned} />
    </group>
  );
}

export function EditorialStory() {

  return (
    <section 
      className="bg-[#F1F6F9] py-16 md:py-24 border-t"
      style={{ 
        borderColor: "var(--pl-border)",
        fontFamily: "var(--pl-font-body)" 
      }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* Left Column: Cinematic Visual */}
          <div className="relative overflow-hidden rounded-xl bg-[#14274E] h-[400px] sm:h-[480px] lg:col-span-6 flex items-center justify-center">
            {/* Soft background particles */}
            <ParticleBackground count={40} />
            
            <div className="relative z-10 w-full h-full">
              <Canvas
                camera={{ position: [0, 1.2, 8], fov: 32 }}
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
                dpr={[1, 2]}
              >
                <Environment preset="warehouse" background={false} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[-4, 6, 3]} intensity={2} />
                <directionalLight position={[4, 3, 2]} intensity={1} color="#dde8ff" />
                <ContactShadows position={[0, -1.35, 0]} opacity={0.4} scale={6} blur={3} far={2} color="#000022" />
                <Suspense fallback={null}>
                  <VialModel />
                </Suspense>
                <OrbitControls enablePan={false} minDistance={3} maxDistance={12} minPolarAngle={Math.PI * 0.05} maxPolarAngle={Math.PI * 0.85} />
              </Canvas>
            </div>
            
            {/* Subtle glow border */}
            <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
          </div>

          {/* Right Column: Editorial Text */}
          <div className="flex flex-col items-start lg:col-span-6">
            <Reveal delay={100}>
              <span 
                className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--pl-slate)" }}
              >
                Our Philosophy
              </span>
            </Reveal>

            <Reveal delay={200}>
              <h2 
                className="text-4xl sm:text-5xl font-medium tracking-tight mb-6"
                style={{ 
                  color: "var(--pl-navy)", 
                  fontFamily: "var(--pl-font-display)",
                  lineHeight: 1.1 
                }}
              >
                Transparency Built<br />Into Every Batch.
              </h2>
            </Reveal>

            <Reveal delay={300}>
              <p 
                className="text-base leading-relaxed mb-6"
                style={{ color: "var(--pl-text-secondary)" }}
              >
                Every product includes supporting documentation, verified analytical testing, 
                and clearly identified CAS numbers so researchers know exactly what they’re receiving.
              </p>
            </Reveal>

            {/* Supporting blockquote style */}
            <Reveal delay={400}>
              <div 
                className="border-l-2 pl-4 py-1 italic mb-6"
                style={{ 
                  borderColor: "var(--pl-navy)",
                  fontFamily: "var(--pl-font-display)",
                  color: "var(--pl-navy)" 
                }}
              >
                &ldquo;Documentation is not an extra. It is part of the process.&rdquo;
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
