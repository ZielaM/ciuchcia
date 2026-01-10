import React, { useMemo } from "react";
import * as THREE from "three";


// --- VOXEL TREE COMPONENT ---
export function VoxelTree({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Trunk */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.4, 1, 0.4]} />
                <meshStandardMaterial color="#5d4037" />
            </mesh>
            {/* Leaves Blocks (Pyramid-ish) */}
            <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[1.2, 0.6, 1.2]} />
                <meshStandardMaterial color="#2e7d32" />
            </mesh>
            <mesh position={[0, 1.8, 0]}>
                <boxGeometry args={[0.8, 0.6, 0.8]} />
                <meshStandardMaterial color="#388e3c" />
            </mesh>
            <mesh position={[0, 2.3, 0]}>
                <boxGeometry args={[0.4, 0.5, 0.4]} />
                <meshStandardMaterial color="#66bb6a" />
            </mesh>
        </group>
    );
}

// --- SCENERY MANAGER ---
interface SceneryProps {
    curve?: THREE.CatmullRomCurve3;
    count?: number;
}

export function Scenery({ curve, count = 40 }: SceneryProps) {
    const trees = useMemo(() => {
        if (!curve) return [];
        const temp = [];
        // Basic bounds from curve points (simplified for now since track is linear -10 to 50)
        // We will scatter randomly in a bounding box, but filter out those too close to the curve.

        for (let i = 0; i < count; i++) {
            // Random position in the map area
            // eslint-disable-next-line react-hooks/purity
            const x = Math.random() * 60 - 10; // -10 to 50
            // eslint-disable-next-line react-hooks/purity
            const z = Math.random() * 20 - 2;  // -2 to 18 (assuming map width)

            // Only keeping trees that are "safe" distance from track (Z=8 is track line approximately)
            // User set track at Z=8. 
            // Let's assume a "safe zone" of +/- 3 units around Z=8.
            if (z > 5 && z < 11) continue;

            temp.push(new THREE.Vector3(x, 0, z));
        }
        return temp;
    }, [curve, count]);

    return (
        <group>
            {trees.map((pos, i) => (
                <VoxelTree key={i} position={[pos.x, pos.y, pos.z]} />
            ))}
        </group>
    );
}
