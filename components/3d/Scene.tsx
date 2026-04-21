"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// --- Node positions (pre-computed, no runtime cost) ---
const NODE_POSITIONS = [
  [0, 0, 0],
  [2.5, 1.2, 0.8],
  [-2.2, 0.8, -0.5],
  [1.5, -1.5, 1.2],
  [-1.8, -1.0, 1.0],
  [3.0, -0.5, -1.0],
  [-0.5, 2.0, -1.2],
  [0.8, -2.2, -0.8],
] as const;

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 2], [1, 5], [1, 6],
  [2, 4], [2, 6],
  [3, 4], [3, 7],
  [4, 7],
  [5, 6], [5, 7],
  [6, 7],
];

const EDGE_COUNT = EDGES.length;

const NODE_COLORS = [
  "#ffffff",
  "#e8ff47",
  "#e8ff47",
  "#00FF94",
  "#FF6B00",
  "#e8ff47",
  "#e8ff47",
  "#ffffff",
];

// Pre-allocate line geometry buffers
function NetworkLines() {
  const linesRef = useRef<THREE.LineSegments>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(EDGE_COUNT * 6);

    NODE_POSITIONS.forEach(([x1, y1, z1], i) => {
      NODE_POSITIONS.forEach(([x2, y2, z2], j) => {
        if (i < j) {
          const idx = EDGES.findIndex(
            ([a, b]) => (a === i && b === j) || (a === j && b === i)
          );
          if (idx !== -1) {
            const base = idx * 6;
            positions[base] = x1;
            positions[base + 1] = y1;
            positions[base + 2] = z1;
            positions[base + 3] = x2;
            positions[base + 4] = y2;
            positions[base + 5] = z2;
          }
        }
      });
    });

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const t = state.clock.elapsedTime * 0.15;
    const mat = linesRef.current.material as THREE.LineBasicMaterial;
    // Subtle breathing — very gentle
    mat.opacity = 0.08 + Math.sin(t * 1.5) * 0.04;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        color="#e8ff47"
        transparent
        opacity={0.1}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// Single floating node — no glow shell, just a soft core
function Node({
  position,
  color,
  delay,
  speed,
}: {
  position: readonly [number, number, number];
  color: string;
  delay: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed + delay;
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.rotation.x = t * 0.25;
    // Gentle pulse — no harsh flicker
    const pulse = 0.88 + Math.sin(t * 1.2) * 0.12;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <Float
      speed={speed * 1.2}
      rotationIntensity={0.08}
      floatIntensity={0.5}
      floatingRange={[-0.12, 0.12]}
    >
      <group position={position}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.11, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.45}
            roughness={0.25}
            metalness={0.75}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Central hub — understated, not screaming for attention
function CentralHub() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current || !ringRef.current) return;
    const t = state.clock.elapsedTime * 0.22;
    meshRef.current.rotation.y = t;
    meshRef.current.rotation.z = t * 0.35;
    const s = 0.9 + Math.sin(t * 1.2) * 0.1;
    meshRef.current.scale.setScalar(s);
    ringRef.current.rotation.x = t * 0.7;
    ringRef.current.rotation.y = t * 0.45;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#e8ff47"
          emissiveIntensity={0.65}
          roughness={0.05}
          metalness={1}
        />
      </mesh>
      {/* Orbit ring — slightly more visible at hero scale */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.52, 0.012, 8, 80]} />
        <meshBasicMaterial color="#e8ff47" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 60 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.06} />
      <pointLight position={[4, 4, 4]} intensity={0.35} color="#e8ff47" />
      <pointLight position={[-4, -4, -4]} intensity={0.2} color="#e8ff47" />

      <CentralHub />
      <NetworkLines />

      {NODE_POSITIONS.slice(1).map((pos, i) => (
        <Node
          key={i}
          position={pos}
          color={NODE_COLORS[i + 1]}
          delay={i * 0.7}
          speed={0.3 + i * 0.04}
        />
      ))}
    </Canvas>
  );
}
