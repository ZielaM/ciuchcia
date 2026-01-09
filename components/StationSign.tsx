
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

    // Dynamic Sizing based on Text Content
    const CHAR_WIDTH = 0.5;

    // #3 Responsive Margins: 
    // If available width is small (< 10), use smaller padding (1.5). Else 3.0.
    const PADDING_X = width < 10 ? 1.5 : 3.0;

    // 1. Calculate desired width from Label
    const labelWidth = (label.length * CHAR_WIDTH) + PADDING_X;

    // 2. Calculate desired width from Description
    const hasLongDesc = description && description.length > 30;
    const descTargetWidth = hasLongDesc ? width : 0;

    // 3. Final Frame Width
    const calculatedWidth = Math.max(labelWidth, descTargetWidth);
    const frameWidth = Math.max(6, Math.min(width, calculatedWidth));

    // Heuristic for Height (Z-Length) [TUNED]
    // 1. Line Height: 0.42 units.
    // 2. Chars/Line: (FrameWidth - Padding) * Density. 
    // Increased density to 6.5 to slow down vertical growth.
    const charsPerLine = Math.floor((frameWidth - 1.0) * 6.5);
    const descLines = description ? Math.ceil(description.length / Math.max(1, charsPerLine)) : 0;

    // Base: 1.8. Line: 0.42. Min: 4.0.
    const calculatedHeight = 1.8 + (descLines * 0.42);
    const frameHeight = Math.max(4.0, calculatedHeight);

    // 3D Text Configuration
    const PADDING = 0.5;
    const textBoxWidth = frameWidth - PADDING * 2;

    // Color Palette based on User's White BG preference:
    // BG is White (#FFFFFF). Text should be Black/Dark.
    const TITLE_COLOR = "#D4AF37"; // Gold Title still? Or Dark? Let's go Dark Brown/Gold.
    const DESC_COLOR = "#3E2723"; // Dark Brown

    // Determine if we are in "Main Mode" (Enter button) or "Branch Mode" (Nav buttons)
    const isBranchMode = onNext || onPrev;

    return (
        <group position={position} rotation={fixedRotation}>
            {/* ANCHOR BOTTOM SHIFT: 
                Shift everything up by Half Height. 
                Result: Local (0,0,0) is the Bottom Center of the sign.
                Growth extends +Y (Backwards along track).
            */}
            <group position={[0, frameHeight / 2, 0]}>

                {/* 3D Voxel Frame (Center of this group is Center of Sign) */}
                <group position={[0, 0, 0]}>
                    <VoxelSignFrame key={`${frameWidth}-${frameHeight}`} width={frameWidth} height={frameHeight} />
                </group>

                {/* 3D TEXT LAYERS */}
                <group position={[0, 0.5, 0.15]}>
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

                {/* BUTTONS */}
                <Html
                    portal={{ current: document.getElementById('ui-portal') as HTMLElement }}
                    transform
                    occlude
                    position={[0, -(frameHeight / 2) - 1.2, 0.2]} // Moved Below Frame (-H/2 - Offset)
                    style={{
                        width: `${frameWidth * 42}px`,
                        display: 'flex',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-vt323)',
                        userSelect: 'none',
                        pointerEvents: 'none',
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
                                className="px-6 py-2 bg-amber-400 text-amber-950 border-4 border-amber-950 shadow-[4px_4px_0px_#451a03] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#451a03] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase text-2xl font-bold font-pixel cursor-pointer"
                            >
                                Czytaj Dalej ➡️
                            </button>
                        )}

                        {/* BRANCH MODE: Navigation */}
                        {isBranchMode && (
                            <div className="flex gap-4">
                                {!(currentSubIndex === 0 && onReturn) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onPrev) onPrev();
                                        }}
                                        className="px-4 py-2 bg-stone-200 text-stone-900 border-4 border-stone-800 shadow-[4px_4px_0px_#1c1917] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1c1917] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase text-xl font-bold font-pixel cursor-pointer"
                                    >
                                        ⬅️ {currentSubIndex === 0 ? "Powrót" : "Cofnij"}
                                    </button>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onNext) onNext();
                                        if (onReturn) onReturn();
                                    }}
                                    className={`px-4 py-2 border-4 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase text-xl font-bold font-pixel cursor-pointer ${onReturn
                                        ? "bg-red-500 text-white border-red-950 shadow-[4px_4px_0px_#450a0a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#450a0a]"
                                        : "bg-amber-400 text-amber-950 border-amber-950 shadow-[4px_4px_0px_#451a03] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#451a03]"
                                        }`}
                                >
                                    {onReturn ? "Powrót ↩️" : "Dalej ➡️"}
                                </button>
                            </div>
                        )}
                    </div>
                </Html>
            </group>
        </group>
    );
}