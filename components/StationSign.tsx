
import * as THREE from "three";
import { Html, Text } from "@react-three/drei";
import type { StationData } from "../app/page";
import { VoxelSignFrame } from "./VoxelSignFrame";

interface StationSignProps {
    position: THREE.Vector3;
    label: string;
    description?: string;
    width?: number; // Calculated available width from LayoutContext
    subChapters?: StationData[];
    onEnter?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    onReturn?: () => void;
    currentSubIndex?: number;
}

export function StationSign({ position, label, description, width = 4, subChapters, onEnter, onNext, onPrev, onReturn, currentSubIndex }: StationSignProps) {
    // Fixed rotation:
    // X: -90 deg (flat)
    const fixedRotation = new THREE.Euler(-Math.PI / 2, 0, 0);

    // Dynamic Sizing for Voxel Frame
    const frameWidth = width;

    // Heuristic for Height (Z-Length) [WOODEN FRAME TIGHT FIT]
    // 1. Line Height: fontSize 0.35 * 1.2 = 0.42 units.
    // 2. Chars/Line: width * 6.0 gives conservative wrapping estimate.

    // We want the frame to hug the text tight.
    const charsPerLine = Math.floor((width - 1.0) * 6.0);
    const descLines = description ? Math.ceil(description.length / Math.max(1, charsPerLine)) : 0;

    // Base: 1.8 (Title + Pad). Line: 0.42 (Text).
    const calculatedHeight = 1.8 + (descLines * 0.42);
    // Min Height: 4.0 (Restored as requested) - Ensures consistent look for short signs.
    const frameHeight = Math.max(4.0, calculatedHeight);

    // 3D Text Configuration
    const PADDING = 0.5;
    const textBoxWidth = frameWidth - PADDING * 2;

    // Color Palette based on User's White BG preference:
    // BG is White (#FFFFFF). Text should be Black/Dark.
    const TITLE_COLOR = "#D4AF37"; // Gold Title still? Or Dark? Let's go Dark Brown/Gold.
    const DESC_COLOR = "#3E2723"; // Dark Brown

    // Determine if we are in "Main Mode" (Enter button) or "Branch Mode" (Nav buttons)
    const isBranchMode = !!onNext || !!onPrev;

    return (
        <group position={position} rotation={fixedRotation}>

            {/* 3D Voxel Frame (Background & Edges) */}
            {/* Center of HTML is Y=1.5. Center of Frame Geometry is (0,0) + curve offset. */}
            <group position={[0, 1.0, 0]}>
                <VoxelSignFrame key={`${frameWidth}-${frameHeight}`} width={frameWidth} height={frameHeight} />
            </group>

            {/* 3D TEXT LAYERS (Part of the substrate) */}
            {/* Z Position: Background is at 0.1. We place text at 0.15 (very close) */}
            <group position={[0, 1.5, 0.15]}>
                {/* TITLE */}
                <Text
                    position={[0, (frameHeight / 2) - 1.5, 0]}
                    anchorY="top"
                    textAlign="center"
                    fontSize={0.8}
                    maxWidth={textBoxWidth}
                    color={TITLE_COLOR}
                    font="/fonts/vt323.ttf"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {label}
                </Text>

                {/* DESCRIPTION */}
                {description && (
                    <Text
                        position={[0, (frameHeight / 2) - 2.5, 0]}
                        anchorY="top"
                        textAlign="center"
                        fontSize={0.35}
                        maxWidth={textBoxWidth}
                        color={DESC_COLOR}
                        font="/fonts/vt323.ttf"
                        lineHeight={1.2}
                    >
                        {description}
                    </Text>
                )}
            </group>

            {/* BUTTONS (HTML Overlay for Interaction) */}
            {/* Positioned lower, where the buttons usually are */}
            {/* Z slightly higher to float above any extrusion */}
            <Html
                portal={{ current: document.getElementById('ui-portal') as HTMLElement }}
                transform
                occlude
                position={[0, 1.5 - (frameHeight / 2) + 1.0, 0.2]} // Near Bottom
                style={{
                    width: `${frameWidth * 42}px`,
                    display: 'flex',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-vt323)',
                    userSelect: 'none',
                    pointerEvents: 'none', // Allow clicks to pass through container
                }}
            >
                {/* Pointer events auto on buttons only */}
                <div style={{ pointerEvents: 'auto' }}>
                    {/* MAIN MODE: Enter Review */}
                    {!isBranchMode && subChapters && subChapters.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEnter) onEnter();
                            }}
                            className="px-6 py-2 bg-amber-600 text-amber-100 border-2 border-amber-900 hover:bg-amber-500 active:translate-y-1 transition-all uppercase text-2xl font-bold cursor-pointer shadow-md"
                        >
                            Czytaj Dalej ➡️
                        </button>
                    )}

                    {/* BRANCH MODE: Navigation */}
                    {isBranchMode && (
                        <div className="flex gap-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onPrev) onPrev();
                                }}
                                className="px-4 py-2 bg-amber-200 text-amber-900 border-2 border-amber-800 hover:bg-amber-100 active:translate-y-1 transition-all uppercase text-xl font-bold cursor-pointer"
                            >
                                ⬅️ {currentSubIndex === 0 ? "Powrót" : "Cofnij"}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onNext) onNext();
                                    if (onReturn) onReturn();
                                }}
                                className={`px-4 py-2 border-2 active:translate-y-1 transition-all uppercase text-xl font-bold cursor-pointer ${onReturn
                                    ? "bg-red-600 text-red-100 border-red-900 hover:bg-red-500" // Red for Return
                                    : "bg-amber-600 text-amber-100 border-amber-900 hover:bg-amber-500"
                                    }`}
                            >
                                {onReturn ? "Powrót ↩️" : "Dalej ➡️"}
                            </button>
                        </div>
                    )}
                </div>
            </Html>
        </group>
    );
}