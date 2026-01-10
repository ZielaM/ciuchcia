
import React from "react";
import { useFrame } from "@react-three/fiber";

interface AlignmentAutopilotProps {
    targetT: number | null;
    progressRef: React.MutableRefObject<number>;
    curveLength: number;
    onComplete?: () => void;
    speed?: number;
}

export function AlignmentAutopilot({
    targetT,
    progressRef,
    curveLength,
    onComplete,
    speed = 25
}: AlignmentAutopilotProps) {
    useFrame((state, delta) => {
        if (targetT === null || curveLength === 0) return;

        const diff = targetT - progressRef.current;
        const tSnap = 0.1 / curveLength; // Snap threshold is approximately 0.1 world units

        if (Math.abs(diff) < tSnap) {
            progressRef.current = targetT;
            if (onComplete) onComplete();
            return;
        }

        const dir = Math.sign(diff);
        const tSpeed = speed / curveLength;
        const move = dir * tSpeed * delta;

        if (Math.abs(move) > Math.abs(diff)) {
            progressRef.current = targetT;
        } else {
            progressRef.current += move;
        }
    });

    return null;
}
