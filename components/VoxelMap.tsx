"use client";

import { useRef, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";

export function VoxelMap() {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const { positions, colors } = useMemo(() => {
        const tempPositions: [number, number, number][] = [];
        const tempColors: Float32Array[] = [];
        for (let x = -10; x < 10; x++) {
            for (let z = -10; z < 10; z++) {
                const y = Math.floor(Math.random() * 2);
                tempPositions.push([x, y, z]);
                const color = new THREE.Color().setHSL(0.3, 0.8, Math.random() * 0.2 + 0.4);
                tempColors.push(Float32Array.from(color.toArray()));
            }
        }
        return { positions: tempPositions, colors: tempColors };
    }, []);

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