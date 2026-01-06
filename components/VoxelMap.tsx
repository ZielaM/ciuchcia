import { useRef, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useLayout } from "./LayoutContext";

export function VoxelMap({ maxBranchLength = 0 }: { maxBranchLength?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const { trackLength } = useLayout();

    const { positions, colors } = useMemo(() => {
        const tempPositions: [number, number, number][] = [];
        const tempColors: Float32Array[] = [];

        // Z Range: From a bit before 0 to end of track + padding
        const startZ = -30;
        const endZ = trackLength + 30;

        // X Range: Covers the viewport width roughly
        const startX = -30;
        const endX = 30;

        // 1. Generate Main Track Ground
        for (let z = startZ; z < endZ; z++) {
            for (let x = startX; x < endX; x++) {
                tempPositions.push([x, 0, z]);
                const color = new THREE.Color().setHSL(0.3, 0.8, Math.random() * 0.2 + 0.3);
                tempColors.push(Float32Array.from(color.toArray()));
            }
        }

        // 2. Generate Branch Ground (Big Rectangle)
        if (maxBranchLength > 0) {
            // Start from existing X end, go to maxBranchLength + padding
            const branchStartX = endX;
            const branchEndX = endX + maxBranchLength + 20; // +20 buffer

            // Cover all Z? Or just where branches are? 
            // "Big Rectangle" strategy -> Cover everything Z to be safe and simple.
            for (let z = startZ; z < endZ; z++) {
                for (let x = branchStartX; x < branchEndX; x++) {
                    tempPositions.push([x, 0, z]);
                    // Slightly different shade for branch area?
                    const color = new THREE.Color().setHSL(0.32, 0.7, Math.random() * 0.2 + 0.3);
                    tempColors.push(Float32Array.from(color.toArray()));
                }
            }
        }

        return { positions: tempPositions, colors: tempColors };
    }, [trackLength, maxBranchLength]);

    useLayoutEffect(() => {
        if (!meshRef.current) return;
        const tempObject = new THREE.Object3D();

        positions.forEach((pos, i) => {
            tempObject.position.set(pos[0], pos[1], pos[2]);
            tempObject.updateMatrix();
            meshRef.current!.setMatrixAt(i, tempObject.matrix);

            meshRef.current!.setColorAt(i, new THREE.Color().fromArray(colors[i]));
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [positions, colors]);

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial />
        </instancedMesh>
    )
};