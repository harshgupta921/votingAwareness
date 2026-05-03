'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  Sphere, 
  MeshDistortMaterial, 
  PerspectiveCamera, 
  Points,
  PointMaterial,
  Environment,
  ContactShadows,
  MeshWobbleMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

function Particles({ count = 2000, isDark }: { count?: number; isDark: boolean }) {
  const points = useRef<THREE.Points>(null!);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    points.current.rotation.y += 0.0003;
    points.current.rotation.x += 0.0001;
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={isDark ? "#818cf8" : "#6366f1"}
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={isDark ? 0.4 : 0.5}
      />
    </Points>
  );
}

interface FloatingBlobProps {
  position: [number, number, number];
  size: number;
  color: string;
  speed: number;
  distort: number;
  isDark: boolean;
}

function FloatingBlob({ position, size, color, speed, distort, isDark }: FloatingBlobProps) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  const time = useRef(0);
  
  useFrame((state, delta) => {
    if (!mesh.current) return;
    time.current += delta;
    const t = time.current;
    mesh.current.position.y += Math.sin(t * speed) * 0.003;
    mesh.current.rotation.z += 0.001;
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <Sphere ref={mesh} args={[size, 100, 100]} position={position}>
        <MeshDistortMaterial
          color={color}
          speed={speed * 2}
          distort={distort}
          roughness={isDark ? 0.2 : 0.1}
          metalness={isDark ? 0.8 : 0.4}
          transparent
          opacity={isDark ? 0.7 : 0.6}
        />
      </Sphere>
    </Float>
  );
}

function InteractiveCamera() {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();

  useFrame(() => {
    camera.position.lerp(vec.set(mouse.x * 1.5, mouse.y * 1.5, 10), 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene({ isDark }: { isDark: boolean }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      <InteractiveCamera />
      
      <ambientLight intensity={isDark ? 0.4 : 0.6} />
      <directionalLight position={[10, 10, 5]} intensity={isDark ? 1.5 : 1} color="#ffffff" />
      <pointLight position={[-10, 5, 10]} intensity={isDark ? 2 : 1.5} color="#818cf8" />
      <pointLight position={[10, -5, 5]} intensity={isDark ? 2 : 1.5} color="#ec4899" />
      <pointLight position={[0, -10, 0]} intensity={1} color="#f59e0b" />

      <Particles count={isDark ? 2500 : 1200} isDark={isDark} />

      {/* Hero Blobs - Organic Mesh Gradient feel */}
      <FloatingBlob 
        position={[-6, 3, -5]} 
        size={3.5} 
        color={isDark ? '#4338ca' : '#818cf8'} 
        speed={0.5} 
        distort={0.4} 
        isDark={isDark} 
      />
      <FloatingBlob 
        position={[6, -4, -6]} 
        size={4.5} 
        color={isDark ? '#be185d' : '#f472b6'} 
        speed={0.4} 
        distort={0.3} 
        isDark={isDark} 
      />
      <FloatingBlob 
        position={[4, 5, -8]} 
        size={2.8} 
        color={isDark ? '#7c3aed' : '#a78bfa'} 
        speed={0.6} 
        distort={0.5} 
        isDark={isDark} 
      />
      <FloatingBlob 
        position={[-3, -6, -4]} 
        size={2} 
        color={isDark ? '#0ea5e9' : '#38bdf8'} 
        speed={0.7} 
        distort={0.6} 
        isDark={isDark} 
      />
      
      <Environment preset="city" />
      <ContactShadows position={[0, -6, 0]} opacity={0.3} scale={30} blur={2.5} far={6} />
    </>
  );
}

export default function AnimatedBackground() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  if (!mounted) {
    return <div className="fixed inset-0 z-[-1] bg-[#f8fafc] dark:bg-[#030712]" />;
  }

  return (
    <div className="fixed inset-0 z-[-1] bg-[#f8fafc] dark:bg-[#030712] transition-colors duration-1000 overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        <Canvas 
          shadows 
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Scene isDark={isDark} />
        </Canvas>
      </div>
      
      {/* Premium Glass Overlay */}
      <div className="absolute inset-0 pointer-events-none transition-colors duration-1000 bg-white/2 dark:bg-black/5" />
      
      {/* Mesh Gradient Effect - Overlaying colors for smoother transitions */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 bg-blue-500/5 blur-[100px] rounded-full" />
      </div>
      
      {/* Subtle Noise/Grain */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      
      {/* Radial Mask to focus attention */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(248, 250, 252, 0.2) 100%)' }} />
      {isDark && (
        <div className="absolute inset-0 pointer-events-none" 
             style={{ background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(3, 7, 18, 0.4) 100%)' }} />
      )}

      {/* Subtle Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
    </div>
  );
}

