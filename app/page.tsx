"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VoxelMap } from "../components/VoxelMap";

export default function Home() {
  return (
    <main className="w-full h-full">
      <Canvas camera={{ position: [5, 10, 20], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <VoxelMap />

        <OrbitControls />
      </Canvas>
    </main>
  )
}