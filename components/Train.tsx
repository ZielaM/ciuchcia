"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// --- COLORS (Constants) ---
const C_RED = "#e74c3c";
const C_DARK_RED = "#c0392b";
const C_WHITE = "#ecf0f1";
const C_DARK_GREY = "#2c3e50";
const C_BLACK = "#1a1a1a";
const C_YELLOW = "#f1c40f";
const C_GREY_LIGHT = "#bdc3c7";
const C_WHEEL_METAL = "#111";

interface TrainProps {
    curve?: THREE.Curve<THREE.Vector3>;
    position?: THREE.Vector3;
    progress: React.MutableRefObject<number>;
}

export function Train({ curve, position, progress }: TrainProps) {
    // Refs for individual carriages to control them independently
    const frontLocoRef = useRef<THREE.Group>(null);
    const wagonRef = useRef<THREE.Group>(null);
    const rearLocoRef = useRef<THREE.Group>(null);

    // Calculate spacing in 't' units (0..1)
    // The models are asymmetric, so the pivot point (center of rotation) is not in the geometric center.
    // Front Connection: Needs ~3.2 units distance.
    // Rear Connection: Needs MORE distance (~4.2 units) because the Rear Loco is rotated 180deg, 
    // effectively shifting its geometric "front" (facing the wagon) closer to the pivot.
    const { spacingFront, spacingRear } = useMemo(() => {
        if (!curve) return { spacingFront: 0.01, spacingRear: 0.01 };
        const totalLength = curve.getLength();
        return {
            spacingFront: 3.05 / totalLength,
            spacingRear: 3.55 / totalLength // Increased to prevent overlap
        };
    }, [curve]);

    useFrame(() => {
        if (!curve) return;

        // 1. Advance main progress (Front Locomotive)
        // Automatic movement is controlled by page.tsx logic

        // 2. Helper function to update a specific carriage
        const updateCarriage = (ref: THREE.Group, offsetT: number) => {
            const t = progress.current - offsetT;

            // LINEAR TRACK FIX: 
            // Clamp t to [0,1] to prevent wrapping or "snake ouroboros" artifacts where the tail 
            // seemingly appears at the end of the track when t < 0.
            const clampedT = Math.max(0, Math.min(1, t));

            const point = curve.getPointAt(clampedT);
            const tangent = curve.getTangentAt(clampedT);

            ref.position.copy(point);
            tangent.y += 0.8;
            ref.lookAt(point.clone().add(tangent));
        };

        // 3. Update all 3 parts with CUSTOM offsets
        if (frontLocoRef.current) updateCarriage(frontLocoRef.current, 0);
        if (wagonRef.current) updateCarriage(wagonRef.current, spacingFront);
        if (rearLocoRef.current) updateCarriage(rearLocoRef.current, spacingFront + spacingRear); // Cumulative offset
    });

    return (
        <group position={position || [0, 0, 0]}>

            {/* --- UNIT 1: LOCOMOTIVE (FRONT) --- */}
            {/* We wrapped it in a group to handle specific model corrections if needed, 
                but since we control position directly, we apply ref here. */}
            <group ref={frontLocoRef}>
                {/* Internal rotation to fix model orientation (X -> Z) */}
                <group rotation={[0, -Math.PI / 2, 0]}>
                    <CarriageSegment />
                    <group position={[1.5, 0, 0]}>
                        <DriverCabin />
                    </group>
                    {/* Rear Connector attached to this carriage */}
                    <mesh position={[-1.65, 0.2, 0]}>
                        <boxGeometry args={[0.3, 1.0, 0.6]} />
                        <meshStandardMaterial color={C_BLACK} />
                    </mesh>
                </group>
            </group>

            {/* --- UNIT 2: MIDDLE WAGON --- */}
            <group ref={wagonRef}>
                <group rotation={[0, -Math.PI / 2, 0]}>
                    <CarriageSegment />
                    {/* Rear Connector attached to this carriage */}
                    <mesh position={[-1.65, 0.2, 0]}>
                        <boxGeometry args={[0.3, 1.0, 0.6]} />
                        <meshStandardMaterial color={C_BLACK} />
                    </mesh>
                </group>
            </group>

            {/* --- UNIT 3: LOCOMOTIVE (REAR) --- */}
            <group ref={rearLocoRef}>
                {/* 
                    Rear locomotive faces backwards (-Z during travel).
                    Rotated +90 degrees relative to standard orientation.
                */}
                <group rotation={[0, Math.PI / 2, 0]}>
                    <CarriageSegment />
                    <group position={[1.5, 0, 0]}>
                        <DriverCabin />
                    </group>
                </group>
            </group>

        </group>
    )
}

// ... (Sub-components CarriageSegment, DriverCabin, Bogie remain unchanged) ...
// ============================================================================
// SUB-COMPONENTS (VOXEL BLOCKS)
// ============================================================================

/**
 * Represents a standard passenger carriage segment.
 * Includes chassis, body, windows, doors, roof, and bogies.
 */
function CarriageSegment() {
    const shiftX = 0.25;

    return (
        <group position={[-0.5, 0, 0]}>
            {/* 1. CHASSIS (Undercarriage) */}
            <mesh position={[0 + shiftX, -0.4, 0]}>
                <boxGeometry args={[3.0, 0.2, 0.7]} />
                <meshStandardMaterial color={C_DARK_GREY} />
            </mesh>

            {/* 2. LOWER STRIPE */}
            <mesh position={[0 + shiftX, -0.2, 0]}>
                <boxGeometry args={[3.0, 0.2, 0.8]} />
                <meshStandardMaterial color={C_DARK_RED} />
            </mesh>

            {/* 3. MAIN BODY (White) */}
            <mesh position={[0 + shiftX, 0.3, 0]}>
                <boxGeometry args={[3.0, 0.8, 0.8]} />
                <meshStandardMaterial color={C_WHITE} />
            </mesh>

            {/* 4. WINDOWS AND DOORS FRAMES */}
            <mesh position={[-0.8 + shiftX, 0.3, 0]}>
                <boxGeometry args={[0.5, 0.35, 0.82]} />
                <meshStandardMaterial color={C_BLACK} roughness={0.2} />
            </mesh>
            <mesh position={[0 + shiftX, 0.3, 0]}>
                <boxGeometry args={[0.8, 0.35, 0.82]} />
                <meshStandardMaterial color={C_BLACK} roughness={0.2} />
            </mesh>
            <mesh position={[0.8 + shiftX, 0.3, 0]}>
                <boxGeometry args={[0.5, 0.35, 0.82]} />
                <meshStandardMaterial color={C_BLACK} roughness={0.2} />
            </mesh>

            {/* Doors */}
            <mesh position={[1.5, 0.3, 0]}>
                <boxGeometry args={[0.3, 0.6, 0.82]} />
                <meshStandardMaterial color={C_BLACK} />
            </mesh>
            <mesh position={[-1.0, 0.3, 0]}>
                <boxGeometry args={[0.3, 0.6, 0.82]} />
                <meshStandardMaterial color={C_BLACK} />
            </mesh>

            {/* 5. ROOF */}
            <mesh position={[0 + shiftX, 0.75, 0]}>
                <boxGeometry args={[3.0, 0.1, 0.7]} />
                <meshStandardMaterial color={C_WHITE} />
            </mesh>
            <mesh position={[0 + shiftX, 0.82, 0]}>
                <boxGeometry args={[3.0, 0.05, 0.5]} />
                <meshStandardMaterial color={C_GREY_LIGHT} />
            </mesh>
            <mesh position={[-0.5 + shiftX, 0.9, 0]}>
                <boxGeometry args={[0.6, 0.15, 0.3]} />
                <meshStandardMaterial color={C_DARK_GREY} />
            </mesh>

            {/* 6. WHEELS (Bogies) */}
            <Bogie position={[1.3, -0.6, 0]} />
            <Bogie position={[-0.7, -0.6, 0]} />
        </group>
    );
}

/**
 * Represents the driver's cabin (nose) of the locomotive.
 * Uses stepped voxels to approximate a curved aerodynamic shape.
 */
function DriverCabin() {
    return (
        <group position={[-0.5, 0, 0]}>
            <mesh position={[0.4, 0.25, 0]}> <boxGeometry args={[0.4, 0.75, 0.78]} /> <meshStandardMaterial color={C_RED} /> </mesh>
            <mesh position={[0.4, -0.15, 0]}> <boxGeometry args={[0.5, 0.3, 0.75]} /> <meshStandardMaterial color={C_RED} /> </mesh>
            <mesh position={[0.35, 0.65, 0]}> <boxGeometry args={[0.2, 0.2, 0.76]} /> <meshStandardMaterial color={C_BLACK} roughness={0.1} /> </mesh>

            <mesh position={[0.75, 0.1, 0]}> <boxGeometry args={[0.4, 0.6, 0.75]} /> <meshStandardMaterial color={C_RED} /> </mesh>
            <mesh position={[0.75, -0.225, 0]}> <boxGeometry args={[0.4, 0.15, 0.75]} /> <meshStandardMaterial color={C_RED} /> </mesh>
            <mesh position={[0.55, 0.45, 0]}> <boxGeometry args={[0.2, 0.2, 0.74]} /> <meshStandardMaterial color={C_BLACK} roughness={0.1} /> </mesh>

            <mesh position={[1.05, -0.1, 0]}> <boxGeometry args={[0.3, 0.4, 0.7]} /> <meshStandardMaterial color={C_RED} /> </mesh>
            <mesh position={[0.9, -0.35, 0]}> <boxGeometry args={[0.8, 0.15, 0.6]} /> <meshStandardMaterial color={C_DARK_GREY} /> </mesh>
            <mesh position={[1.25, -0.3, 0]}> <boxGeometry args={[0.2, 0.15, 0.4]} /> <meshStandardMaterial color={C_DARK_GREY} /> </mesh>

            {/* Headlights */}
            <mesh position={[1.1, -0.05, 0.25]}> <boxGeometry args={[0.1, 0.1, 0.15]} /> <meshStandardMaterial color={C_YELLOW} emissive={C_YELLOW} emissiveIntensity={2} /> </mesh>
            <mesh position={[1.1, -0.05, -0.25]}> <boxGeometry args={[0.1, 0.1, 0.15]} /> <meshStandardMaterial color={C_YELLOW} emissive={C_YELLOW} emissiveIntensity={2} /> </mesh>
        </group>
    );
}

/**
 * Reusable wheel assembly (bogie). 
 * Consists of two axles and a central frame.
 */
function Bogie({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Wheels */}
            <mesh position={[0.25, 0, 0.25]}> <boxGeometry args={[0.2, 0.2, 0.15]} /> <meshStandardMaterial color={C_WHEEL_METAL} /> </mesh>
            <mesh position={[0.25, 0, -0.25]}> <boxGeometry args={[0.2, 0.2, 0.15]} /> <meshStandardMaterial color={C_WHEEL_METAL} /> </mesh>
            <mesh position={[-0.25, 0, 0.25]}> <boxGeometry args={[0.2, 0.2, 0.15]} /> <meshStandardMaterial color={C_WHEEL_METAL} /> </mesh>
            <mesh position={[-0.25, 0, -0.25]}> <boxGeometry args={[0.2, 0.2, 0.15]} /> <meshStandardMaterial color={C_WHEEL_METAL} /> </mesh>
            {/* Frame */}
            <mesh position={[0, 0.05, 0]}> <boxGeometry args={[0.8, 0.1, 0.5]} /> <meshStandardMaterial color="#333" /> </mesh>
        </group>
    );
}