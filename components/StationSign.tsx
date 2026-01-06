import { Html } from "@react-three/drei";
import * as THREE from "three";

import { StationData } from "../app/page";

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

    // Calculate pixel width based on 3D width unit
    // This is approximate but ensures responsive scaling matching the 3D void
    const pixelWidth = `${Math.max(100, width * 40)}px`; // Reduced multiplier to be safer inside the box

    // Determine if we are in "Main Mode" (Enter button) or "Branch Mode" (Nav buttons)
    // If onNext/onPrev are provided, we show nav buttons.
    const isBranchMode = !!onNext || !!onPrev;

    return (
        <group position={position} rotation={fixedRotation}>
            {/* HTML Overlay interacting with 3D world */}
            {/* Portaled to #ui-portal to escape ScrollControls, Fixed Position */}
            <Html
                portal={{ current: document.getElementById('ui-portal') as HTMLElement }}
                transform
                occlude
                position={[0, 2.5, 0.11]} // Centered on parent group (which is exactly at signX)
                style={{
                    width: pixelWidth,
                    height: 'auto', // Allow growing
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    border: '4px solid #3e2723',
                    padding: '20px',
                    fontFamily: 'var(--font-vt323)',
                    textAlign: 'center',
                    userSelect: 'none',
                }}
            >
                <h2 className="text-4xl text-amber-900 mb-2">{label}</h2>
                {description && <p className="text-xl text-stone-600 leading-tight">{description}</p>}

                {/* MAIN MODE: Enter Review */}
                {!isBranchMode && subChapters && subChapters.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onEnter) onEnter();
                        }}
                        className="mt-4 px-6 py-2 bg-amber-600 text-amber-100 border-2 border-amber-900 hover:bg-amber-500 active:translate-y-1 transition-all uppercase text-2xl font-bold cursor-pointer pointer-events-auto"
                    >
                        Czytaj Dalej ➡️
                    </button>
                )}

                {/* BRANCH MODE: Navigation */}
                {isBranchMode && (
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onPrev) onPrev();
                            }}
                            className="px-4 py-2 bg-stone-200 text-stone-800 border-2 border-stone-600 hover:bg-stone-300 active:translate-y-1 transition-all uppercase text-xl font-bold cursor-pointer pointer-events-auto"
                        >
                            ⬅️ {currentSubIndex === 0 ? "Powrót" : "Cofnij"}
                        </button>

                        {/* Only show Next if there is a next chapter (or handled by parent logic) */}
                        {/* We assume parent passes onNext only if valid, or we disable it? */}
                        {/* Let's assume onNext is always passed for consistency, logic handles bounds */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onNext) onNext();
                                if (onReturn) onReturn();
                            }}
                            className={`px-4 py-2 border-2 active:translate-y-1 transition-all uppercase text-xl font-bold cursor-pointer pointer-events-auto ${onReturn
                                    ? "bg-red-600 text-red-100 border-red-900 hover:bg-red-500" // Red for Return
                                    : "bg-amber-600 text-amber-100 border-amber-900 hover:bg-amber-500"
                                }`}
                        >
                            {onReturn ? "Powrót ↩️" : "Dalej ➡️"}
                        </button>
                    </div>
                )}
            </Html>
        </group>
    );
}