import { useThree, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useLayout } from "./LayoutContext";

// --- CAMERA COMPONENT ---
interface FollowCameraProps {
    curve: THREE.Curve<THREE.Vector3>;
    progress: React.RefObject<number>;
    isBranch: boolean; // Added isBranch prop
}

export function FollowCamera({ curve, progress, isBranch }: FollowCameraProps) { // Destructured isBranch
    const { camera } = useThree();

    // Vertical Layout Camera defaults:
    camera.up.set(0, 0, -1);

    // Calculate curve length to determine offset for the "Center" of the train
    const curveLength = useMemo(() => curve.getLength(), [curve]);
    const centerOffset = 3.05;

    // Smooth blending factor for state transition
    const modeRef = useRef(0); // 0 = Main, 1 = Branch

    useFrame((state, delta) => {
        if (!curve) return;

        // 1. Calculate 't' for the CENTER of the train
        const tFront = Math.max(0, Math.min(1, progress.current));
        const tOffset = centerOffset / curveLength;
        const tCenter = Math.max(0, tFront - tOffset);

        // 2. Get Position of Train Center
        const trainPos = curve.getPointAt(tCenter);

        // --- DUAL STATE LOGIC ---

        // Target Mode:
        // isBranch ? 1 : 0.
        // Smoothly blend towards the target mode.
        const targetMode = isBranch ? 1 : 0;
        const transitionSpeed = 1.0; // Speed of mode switch
        modeRef.current = THREE.MathUtils.damp(modeRef.current, targetMode, transitionSpeed, delta);

        // MIX FACTOR (0..1)
        const tMix = modeRef.current;

        // STATE 1: MAIN (tMix = 0)
        // Camera X = 0 (Fixed World Center) -> Train appears on Left.
        // Camera Z = Train Z (Centered Vertically).
        const mainCamX = 0;
        const mainCamZ = trainPos.z;

        // STATE 2: BRANCH (tMix = 1)
        // Camera X = Train X (Centered Horizontally).
        // Camera Z = Train Z - Offset (Train appears at Bottom).
        const BRANCH_BOTTOM_OFFSET = 6.0;

        // FIX: Min X Clamp. Wait for train to reach center (X=0) before moving camera right.
        // This prevents camera from sliding "Left" to find the train when it's still on the side.
        const branchCamX = Math.max(0, trainPos.x);

        const branchCamZ = trainPos.z - BRANCH_BOTTOM_OFFSET;

        // Interpolate Targets based on tMix
        // Use smoothstep for extra easing logic if desired, but damp is already smooth.
        const targetCamX = THREE.MathUtils.lerp(mainCamX, branchCamX, tMix);
        const targetCamZ = THREE.MathUtils.lerp(mainCamZ, branchCamZ, tMix);

        // 4. Direct Movement (No Lag)
        // User requested to remove delay relative to train.
        camera.position.x = targetCamX;
        camera.position.z = targetCamZ;

        // 6. Y Axis: Fixed height
        camera.position.y = 16;

        // 7. LookAt
        // Standard Top-Down Look
        camera.lookAt(camera.position.x, 0, camera.position.z);
    }, -1); // Priority -1: Run AFTER Progress Update (-2) but BEFORE Scene Render (0)

    return null;
}
