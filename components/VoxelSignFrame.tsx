import React from "react";
import * as THREE from "three";

interface VoxelSignFrameProps {
    width: number;
    height: number;
}

const FRAME_THICKNESS = 0.3;
const FRAME_DEPTH = 0.3;
const WOOD_COLOR = "#8B5A2B"; // Classic Wood Brown
const BG_COLOR = "#FFFFFF";

export function VoxelSignFrame({ width, height }: VoxelSignFrameProps) {
    // Horizontal Bars (Top & Bottom)
    // Span full width including corners.
    const hWidth = width + (FRAME_THICKNESS * 2);

    // Vertical Bars (Left & Right)
    const vHeight = height;

    return (
        <group>
            {/* BACKGROUND PLANE */}
            <mesh position={[0, 0, -0.05]}>
                <boxGeometry args={[width, height, 0.1]} />
                <meshStandardMaterial color={BG_COLOR} />
            </mesh>

            {/* WOOD MATERIAL */}
            <meshStandardMaterial
                attach="material"
                color={WOOD_COLOR}
                roughness={0.9}
                metalness={0.0}
            />

            {/* TOP BAR */}
            <mesh position={[0, height / 2 + FRAME_THICKNESS / 2, 0]}>
                <boxGeometry args={[hWidth, FRAME_THICKNESS, FRAME_DEPTH]} />
                <meshStandardMaterial color={WOOD_COLOR} roughness={0.8} />
            </mesh>

            {/* BOTTOM BAR */}
            <mesh position={[0, -height / 2 - FRAME_THICKNESS / 2, 0]}>
                <boxGeometry args={[hWidth, FRAME_THICKNESS, FRAME_DEPTH]} />
                <meshStandardMaterial color={WOOD_COLOR} roughness={0.8} />
            </mesh>

            {/* LEFT BAR */}
            <mesh position={[-width / 2 - FRAME_THICKNESS / 2, 0, 0]}>
                <boxGeometry args={[FRAME_THICKNESS, vHeight, FRAME_DEPTH]} />
                <meshStandardMaterial color={WOOD_COLOR} roughness={0.8} />
            </mesh>

            {/* RIGHT BAR */}
            <mesh position={[width / 2 + FRAME_THICKNESS / 2, 0, 0]}>
                <boxGeometry args={[FRAME_THICKNESS, vHeight, FRAME_DEPTH]} />
                <meshStandardMaterial color={WOOD_COLOR} roughness={0.8} />
            </mesh>
        </group>
    );
}
