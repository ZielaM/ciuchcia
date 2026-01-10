
import React from "react";
import { useFrame } from "@react-three/fiber";

interface AlignmentAutopilotProps {
    targetT: number | null;
    progress: React.MutableRefObject<number>;
    curveLength: number;
    onComplete?: () => void;
    speed?: number;
}

export function AlignmentAutopilot({
    targetT,
    progress,
    curveLength,
    onComplete,
    speed = 25
}: AlignmentAutopilotProps) {
    useFrame((state, delta) => {
        if (targetT === null || curveLength === 0) return;

        const diff = targetT - progress.current;
        const tSnap = 0.1 / curveLength; // Snap threshold ~0.1 units

        if (Math.abs(diff) < tSnap) {
            progress.current = targetT;
            if (onComplete) onComplete();
            return;
        }

        const dir = Math.sign(diff);
        const tSpeed = speed / curveLength;
        const move = dir * tSpeed * delta;

        if (Math.abs(move) > Math.abs(diff)) {
            progress.current = targetT;
        } else {
            progress.current += move;
        }
    });

    return null;
}
