
import React from 'react';
import * as THREE from 'three';

export function BufferStop({ position, rotation }: { position: THREE.Vector3, rotation?: THREE.Euler }) {
    // Determine material colors (Dark Wood/Rusty Metal)
    const woodColor = "#3E2723"; // Dark Brown
    const metalColor = "#424242"; // Dark Grey
    const bumperColor = "#8D6E63"; // Lighter Wood for impact beam
    const redSignal = "#D32F2F"; // Red signal/warning paint

    // Gauge is 0.7.
    // Rails are at +/- 0.35.
    // We place posts centered on rails: +/- 0.35

    return (
        <group position={position} rotation={rotation}>
            <group position={[0, 0, 0]}>

                {/* 1. Vertical Posts (Left & Right) - On Rails */}
                <mesh position={[-0.35, 0.5, 0]}>
                    <boxGeometry args={[0.3, 1.0, 0.3]} />
                    <meshStandardMaterial color={woodColor} />
                </mesh>
                <mesh position={[0.35, 0.5, 0]}>
                    <boxGeometry args={[0.3, 1.0, 0.3]} />
                    <meshStandardMaterial color={woodColor} />
                </mesh>

                {/* 2. Main Horizontal Bumper Beam */}
                <mesh position={[0, 0.8, 0.2]}>
                    <boxGeometry args={[1.4, 0.5, 0.3]} />
                    <meshStandardMaterial color={bumperColor} />
                </mesh>

                {/* 3. Red Warning Lights/Paint on Bumper */}
                <mesh position={[-0.4, 0.8, 0.36]}>
                    <planeGeometry args={[0.25, 0.25]} />
                    <meshStandardMaterial color={redSignal} emissive={redSignal} emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[0.4, 0.8, 0.36]}>
                    <planeGeometry args={[0.25, 0.25]} />
                    <meshStandardMaterial color={redSignal} emissive={redSignal} emissiveIntensity={0.5} />
                </mesh>

                {/* 4. Diagonal Supports (Backwards) */}
                <group position={[0, 0, -0.4]}>
                    <mesh position={[-0.35, 0.4, 0]} rotation={[Math.PI / 4, 0, 0]}>
                        <boxGeometry args={[0.2, 1.1, 0.2]} />
                        <meshStandardMaterial color={metalColor} />
                    </mesh>
                    <mesh position={[0.35, 0.4, 0]} rotation={[Math.PI / 4, 0, 0]}>
                        <boxGeometry args={[0.2, 1.1, 0.2]} />
                        <meshStandardMaterial color={metalColor} />
                    </mesh>
                </group>

            </group>
        </group>
    );
}
