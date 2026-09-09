import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * BottleModel - The 3D perfume bottle with glass and liquid
 */
function BottleModel({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const bottleRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const { viewport } = useThree();

  // Handle mouse movement for parallax tilt (disabled if reduced motion)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouseX(x * 0.08);
      setMouseY(y * 0.08);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  // Animation loop
  useFrame(() => {
    if (bottleRef.current) {
      // Auto-rotation (slower if reduced motion, or none)
      const rotationSpeed = prefersReducedMotion ? 0 : 0.002;
      bottleRef.current.rotation.z += rotationSpeed;

      // Smooth cursor-follow (only if not reduced motion)
      if (!prefersReducedMotion) {
        bottleRef.current.rotation.x += (mouseY - bottleRef.current.rotation.x) * 0.05;
        bottleRef.current.rotation.y += (mouseX - bottleRef.current.rotation.y) * 0.05;
      }
    }

    // Liquid wobble (disabled if reduced motion)
    if (liquidRef.current && !prefersReducedMotion) {
      liquidRef.current.position.y = Math.sin(Date.now() * 0.0001) * 0.02;
    }
  });

  return (
    <group ref={bottleRef} position={[0, 0, 0]} scale={1.2}>
      {/* Bottle body - cylinder with tapered neck */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 1.8, 32]} />
        <MeshTransmissionMaterial
          transmission={0.95}
          thickness={0.8}
          roughness={0.1}
          chromaticAberration={0.04}
          anisotropy={0.3}
        />
      </mesh>

      {/* Bottle neck */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.12, 0.25, 0.6, 16]} />
        <MeshTransmissionMaterial
          transmission={0.95}
          thickness={0.6}
          roughness={0.1}
          chromaticAberration={0.04}
          anisotropy={0.3}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.3, 16]} />
        <meshStandardMaterial 
          color="#D4A574"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Liquid inside bottle - with amber color */}
      <mesh ref={liquidRef} position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.38, 0.43, 1.2, 32]} />
        <meshStandardMaterial
          color="#C9956D"
          emissive="#8B6F47"
          emissiveIntensity={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Subtle label indicator */}
      <mesh position={[0.42, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.3, 0.8]} />
        <meshStandardMaterial
          color="#F4EFE7"
          emissive="#B4763B"
          emissiveIntensity={0.05}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

/**
 * FallbackBottle - Static placeholder for reduced-motion or loading
 */
function FallbackBottle() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-b from-stone-100 to-stone-50 rounded-sm">
      <div className="text-center">
        <div className="w-24 h-32 mx-auto mb-4 bg-gradient-to-b from-amber-50 to-amber-100 rounded-sm border border-stone-300 shadow-lg" />
        <p className="text-xs text-stone-500 font-mono">Zyence Eau de Parfum</p>
      </div>
    </div>
  );
}

/**
 * BottleScene - Canvas component with the 3D bottle
 * Shows R3F scene if JavaScript and WebGL are available, falls back to static image
 */
export function BottleScene() {
  const [mounted, setMounted] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    
    // Check WebGL support
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
    if (!gl) {
      setIsWebGLSupported(false);
    }
  }, []);

  // Server-side rendering safety & fallback for no WebGL or reduced motion preference
  if (!mounted || !isWebGLSupported) {
    return <FallbackBottle />;
  }

  return (
    <div className="w-full h-full rounded-sm overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100">
      <Suspense fallback={<FallbackBottle />}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          style={{ background: "linear-gradient(to bottom, #FAF8F3, #F4EFE7)" }}
          dpr={[1, 2]}
          performance={{ current: 1 }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={45} />
          <Suspense fallback={null}>
            <Environment preset="studio" blur={0.4} />
          </Suspense>
          <BottleModel prefersReducedMotion={prefersReducedMotion} />
          <ambientLight intensity={1.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, 5]} intensity={0.4} color="#B4763B" />
        </Canvas>
      </Suspense>
    </div>
  );
}
