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

        // DYNAMIC OFFSET: Ensure train is always near the bottom edge.
        // Screen Bottom in World Units relative to Camera Center is (vpHeight / 2).
        // We want Train to be `Margin` units above Bottom Edge.
        // TrainZ = CameraZ + (vpHeight/2) - Margin.
        // CameraZ = TrainZ - (vpHeight/2) + Margin.
        // So Offset = (vpHeight/2) - Margin.

        // We need to access vpHeight inside useFrame, but it's constant from useLayout.
        // However, useLayout is a hook, we need to pass it in or trust it doesn't change often.
        // Actually, let's pass it via props or closure if possible, but useLayout is fine here.
        // Wait, useFrame is inside the component, so it captures 'vpHeight' from component scope.
        // But we need to get vpHeight from useLayout hook first.

        const BOTTOM_MARGIN = 2.0;
        const dynamicOffset = (vpHeight / 2) - BOTTOM_MARGIN;

        const branchCamX = Math.max(0, trainPos.x);
        const branchCamZ = trainPos.z - dynamicOffset;

        // Interpolate Targets based on tMix
        // Use smoothstep for extra easing logic if desired, but damp is already smooth.
        const targetCamX = THREE.MathUtils.lerp(mainCamX, branchCamX, tMix);
        const targetCamZ = THREE.MathUtils.lerp(mainCamZ, branchCamZ, tMix);

        // 4. Direct Movement (No Lag)
        // User requested to remove delay relative to train.
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
