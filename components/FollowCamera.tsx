import { useThree, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useLayout } from "./LayoutContext";

// --- CAMERA COMPONENT ---
interface FollowCameraProps {
    curve: THREE.Curve<THREE.Vector3>;
    progress: React.RefObject<number>;
    isBranch: boolean; // Added isBranch prop
    baseY?: number;    // NEW: Base Camera Height (Zoom level)
    offsetZ?: React.MutableRefObject<number>; // Optional Z-offset for inspection scrolling
}

export function FollowCamera({ curve, progress, isBranch, baseY = 16, offsetZ }: FollowCameraProps) { // Destructured isBranch
    const { camera } = useThree();
    const { vpHeight } = useLayout(); // Get Viewport Height for dynamic positioning

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

        // DUAL STATE LOGIC:
        // isBranch ? 1 : 0. Smoothly blend towards the target mode.
        const targetMode = isBranch ? 1 : 0;
        const transitionSpeed = 1.0;
        modeRef.current = THREE.MathUtils.damp(modeRef.current, targetMode, transitionSpeed, delta);

        const tMix = modeRef.current;

        // STATE 1: MAIN (tMix = 0)
        // Camera X = 0 (Fixed World Center)
        // Camera Z = Train Z
        const mainCamX = 0;
        const mainCamZ = trainPos.z;

        // STATE 2: BRANCH (tMix = 1)
        // Camera X = Train X
        // Camera Z = Train Z - Offset
        const BOTTOM_MARGIN = 2.0;
        const dynamicOffset = (vpHeight / 2) - BOTTOM_MARGIN;

        const branchCamX = Math.max(0, trainPos.x);
        const branchCamZ = trainPos.z - dynamicOffset;

        // Interpolate Targets
        const targetCamX = THREE.MathUtils.lerp(mainCamX, branchCamX, tMix);
        const targetCamZ = THREE.MathUtils.lerp(mainCamZ, branchCamZ, tMix);

        camera.position.x = targetCamX;
        camera.position.z = targetCamZ;

        // 6. Y Axis: Fixed height (Dynamic)
        camera.position.y = baseY;

        // 6.1 Inspection Offset
        if (offsetZ) {
            camera.position.z -= offsetZ.current;
        }

        // 7. LookAt
        // Standard Top-Down Look
        camera.lookAt(camera.position.x, 0, camera.position.z);
    }, -1); // Priority -1: Run AFTER Progress Update (-2) but BEFORE Scene Render (0)

    return null;
}
