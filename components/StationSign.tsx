
import * as THREE from "three";
import { Html, Text } from "@react-three/drei";
import type { StationData } from "../data/stationData";
import { VoxelSignFrame } from "./VoxelSignFrame";

/**
 * Props for the StationSign component.
 * @property position Vector3 position of the sign.
 * @property label Title text displayed on the sign.
 * @property description Detailed description text.
 * @property width Width of the sign frame (defaults to 4).
 * @property subChapters Optional list of sub-sections (branches).
 * @property onEnter Callback when entering a branch.
 * @property onNext Callback for navigating to next sub-chapter.
 * @property onPrev Callback for navigating to previous sub-chapter.
 * @property onReturn Callback for returning to main track.
 * @property currentSubIndex Index of the current sub-chapter being displayed.
 */
interface StationSignProps {
    position: THREE.Vector3;
    label: string;
    description?: string;
    width?: number;
    subChapters?: StationData[];
    onEnter?: () => void;
    onNext?: () => void;
    onPrev?: () => void;
    onReturn?: () => void;
    currentSubIndex?: number;
}

export function StationSign({ position, label, description, width = 4, subChapters, onEnter, onNext, onPrev, onReturn, currentSubIndex }: StationSignProps) {
    // Rotation: -90 degrees around X-axis to lie flat relative to track orientation
    const fixedRotation = new THREE.Euler(-Math.PI / 2, 0, 0);

    // Content Metrics

    // Final Frame Width
    const frameWidth = width;

    // Layout configuration
    const PADDING = 0.5;
    const textBoxWidth = frameWidth - PADDING * 2;
    const TITLE_SIZE = 0.8;

    // Height Calculation based on content
    const titleCharsPerLine = Math.floor(textBoxWidth * 2.2);
    const titleLines = Math.ceil(label.length / Math.max(1, titleCharsPerLine));
    const titleHeight = titleLines * TITLE_SIZE;

    const charsPerLine = Math.floor(textBoxWidth * 6.5);
    const descLines = description ? Math.ceil(description.length / Math.max(1, charsPerLine)) : 0;
    const descHeight = descLines * 0.42;

    // Total Height: Margins + Title + Gap + Desc + Margin
    const verticalContent = 1.0 + titleHeight + 0.5 + descHeight + 1.0;
    const frameHeight = Math.max(4.0, verticalContent);

    // Layout Offsets (Anchor Top)
    const titleY = (frameHeight / 2) - 1.0;
    const descY = titleY - titleHeight - 0.2;

    // Color Palette
    // BG is White (#FFFFFF). Text should be Black/Dark.
    const TITLE_COLOR = "#D4AF37"; // Dark Brown/Gold
    const DESC_COLOR = "#3E2723"; // Dark Brown

    // Determine if we are in "Main Mode" (Enter button) or "Branch Mode" (Nav buttons)
    const isBranchMode = !!(onNext || onPrev);

    return (
        <group position={position} rotation={fixedRotation}>
            {/* 
              Shift everything up by Half Height so local (0,0,0) is bottom center.
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
                        position={[0, titleY, 0]}
                        anchorY="top"
                        textAlign="center"
                        fontSize={TITLE_SIZE}
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
                            position={[0, descY, 0]}
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
                    // No occlusion to ensure buttons are always visible/clickable
                    position={[0, -(frameHeight / 2) - 1.2, 0.2]}
                    style={{
                        width: `${frameWidth * 42}px`,
                        display: 'flex',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-vt323)',
                        userSelect: 'none',
                        pointerEvents: 'none',
                        background: 'transparent', // Explicit transparent
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