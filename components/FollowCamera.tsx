"use client";
import { useThree, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

// --- CAMERA COMPONENT ---
interface FollowCameraProps {
    curve: THREE.Curve<THREE.Vector3>;
    progress: React.RefObject<number>;
}

export function FollowCamera({ curve, progress }: FollowCameraProps) {
    const { camera } = useThree();

    // Vertical Layout Camera defaults:
    camera.up.set(0, 0, -1);

    // Calculate curve length to determine offset for the "Center" of the train
    // The Train.tsx uses ~3.05 units for the Wagon (middle).
    const curveLength = useMemo(() => curve.getLength(), [curve]);

    // Center of train is roughly at the Wagon position (3.05 units behind front)
    const centerOffset = 3.05;

    useFrame((state, delta) => {
        if (!curve) return;

        // 1. Calculate 't' for the CENTER of the train
        const tFront = Math.max(0, Math.min(1, progress.current));

        // Convert distance offset to 't' offset
        // t = dist / length
        const tOffset = centerOffset / curveLength;

        // Clamp tCenter
        const tCenter = Math.max(0, tFront - tOffset);

        // 2. Get Position of Train Center
        const trainPos = curve.getPointAt(tCenter);

        // 3. Determine Target Camera X
        // Rule: Min X = 0 (Main Track Camera Pos).
        // Camera only moves right (positive X) if train goes right of center.
        const targetCamX = Math.max(0, trainPos.x);

        // 4. Smooth Damping for X
        const smoothTime = 2.0;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, smoothTime, delta);

        // 5. Z Axis: Follow Train Center with fixed offset
        // User requested centering: Remove hardcoded offset (-3.3)
        const targetCamZ = trainPos.z;
        camera.position.z = targetCamZ;

        // 6. Y Axis: Fixed height
        camera.position.y = 16;

        // 7. LookAt
        // Look at the smoothed Camera X to keep perspective straight relative to movement
        camera.lookAt(camera.position.x, 0, targetCamZ);
    });

    return null;
}
