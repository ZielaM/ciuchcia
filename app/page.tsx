"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { VoxelMap } from "../components/VoxelMap";
import { Train } from "../components/Train";
import { TrackSystem } from "../components/TrackSystem";
import * as THREE from "three";
import { useRef, useMemo, useState, Suspense } from "react";
import { FollowCamera } from "../components/FollowCamera";
import { StationSign } from "../components/StationSign";
import { ScrollControls, useScroll } from "@react-three/drei";
import { LayoutProvider, useLayout } from "../components/LayoutContext";

// Define stops relative to station count
export interface StationData {
    label: string;
    desc: string;
    subChapters?: StationData[];
}

const STATION_DATA: StationData[] = [
    { label: "Wstęp", desc: "Witamy w Voxel Train!" },
    {
        label: "Rozdział 1",
        desc: "Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. ",
        subChapters: [
            { label: "Maszyna Parowa", desc: "Wynalazek Watta zmienił świat." },
            { label: "Fabryki", desc: "Masowa produkcja i urbanizacja." }
        ]
    },
    {
        label: "Rozdział 2",
        desc: "Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. ",
        subChapters: [
            { label: "Maszyna Parowa", desc: "Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. Początki kolei parowej. " },
            { label: "Fabryki", desc: "Masowa produkcja i urbanizacja." },
            { label: "Transport", desc: "Kolej łączy miasta." }
        ]
    },
    {
        label: "Rozdział 3",
        desc: "Elektryfikacja.",
        subChapters: [
            { label: "Maszyna Parowa", desc: "Wynalazek Watta zmienił świat." }
        ]
    },
    { label: "Finał", desc: "Koleje dużych prędkości." },
];

// CONSTANTS FOR GEOMETRY & TRACK
const TURN_RADIUS = 5;
const TRANSITION = 3;
const SIGN_TRACK_GAP = 5;
const K = 0.55228475;
const LEAD_IN = 9;
const TRACK_START_Z = -10; // Unified Start Position

function AlignmentAutopilot({
    targetT,
    progress,
    curveLength,
    onComplete,
    speed = 25 // Default Fast align
}: {
    targetT: number | null,
    progress: React.MutableRefObject<number>,
    curveLength: number,
    onComplete?: () => void,
    speed?: number
}) {
    useFrame((state, delta) => {
        if (targetT === null || curveLength === 0) return;

        const diff = targetT - progress.current;

        // Threshold to snap (approx 0.1 units on ground)
        const tSnap = 0.1 / curveLength;

        if (Math.abs(diff) < tSnap) {
            progress.current = targetT;
            if (onComplete) onComplete();
            return;
        }

        const dir = Math.sign(diff);
        // Convert ground speed to t speed
        const tSpeed = speed / curveLength;
        const move = dir * tSpeed * delta;

        // Don't overshoot
        if (Math.abs(move) > Math.abs(diff)) {
            progress.current = targetT;
        } else {
            progress.current += move;
        }
    });
    return null;
}

export default function Home() {
    return (
        <main className="relative w-screen h-screen overflow-hidden bg-stone-100">
            {/* Portal Target for 3D UI */}
            <div id="ui-portal" className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex items-center justify-center" />

            {/* Helper text */}
            <div className="absolute bottom-5 right-5 pointer-events-none opacity-50 font-pixel text-stone-600 z-20">
                SCROLL TO MOVE
            </div>

            <Canvas camera={{ position: [0, 16, 0], fov: 50 }} shadows>
                {/* DARKER SCENE + BRIGHT FRAMES (via Emissive) */}
                <ambientLight intensity={0.2} color="#ffffff" />

                {/* Main Sun: Darker to create mood */}
                <directionalLight
                    position={[15, 20, 10]}
                    intensity={0.6}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-bias={-0.0001}
                    color="#fffaf0"
                />

                {/* Fill Light: Barely visible */}
                <directionalLight
                    position={[-15, 10, -10]}
                    intensity={0.1}
                    color="#e0f0ff"
                />

                <Suspense fallback={null}>
                    {/* Environment removed to prevent overexposure */}
                    <LayoutProvider stations={STATION_DATA}>
                        <SceneContent />
                    </LayoutProvider>
                </Suspense>
            </Canvas>
        </main>
    );
}

function SceneContent() {
    const { trackX, signX, signWidth, trackLength, spacing } = useLayout();
    const { viewport } = useThree();

    // Dynamic Branch Spacing = Viewport Width + Margin
    const branchSpacing = viewport.width + 2;

    // STATE
    const [activeTrack, setActiveTrack] = useState<'main' | number>('main');
    const [aligningTo, setAligningTo] = useState<number | null>(null);

    // Branch State
    const [currentSubIndex, setCurrentSubIndex] = useState(0);
    const [isReturning, setIsReturning] = useState(false);

    // Distinguish between "Aligning to Enter" and "Aligning to Park"
    const [pendingEntry, setPendingEntry] = useState<number | null>(null);

    // REFS for progress
    const mainProgress = useRef(0);
    const branchProgress = useRef(0);

    // --- DYNAMIC TRACK GENERATION ---

    // Generate Curve: Vertical Line at x = trackX
    const curve = useMemo(() => {
        const points = [
            new THREE.Vector3(trackX, 0.6, TRACK_START_Z),
            new THREE.Vector3(trackX, 0.6, trackLength + 10),
        ];
        return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    }, [trackX, trackLength]);

    const mainCurveLength = useMemo(() => curve.getLength(), [curve]);

    // Calculate STOPS (0..1) based on physical distance
    const stops = useMemo(() => {
        const arr = [];
        const realCurveLength = mainCurveLength;

        for (let i = 0; i < STATION_DATA.length; i++) {
            const zPos = i * spacing;
            const startZ = TRACK_START_Z;
            // t = distance from start / total length
            const t = Math.max(0, Math.min(1, (zPos - startZ) / realCurveLength));
            arr.push(t);
        }
        return arr;
    }, [curve, spacing, mainCurveLength]);


    // --- BRANCH TRACKS GENERATION ---

    const branchCurves = useMemo(() => {
        const curves: { [key: number]: THREE.Curve<THREE.Vector3> } = {};

        STATION_DATA.forEach((station, index) => {
            if (station.subChapters && station.subChapters.length > 0) {
                const startX = trackX;

                // --- GEOMETRY FIRST LOGIC ---
                // 1. Target Z for the Straight Section
                // We want the Straight Track to be exactly `SIGN_TRACK_GAP` below the Main Sign.
                // Main Sign Z = index * spacing.
                const mainSignZ = index * spacing;
                const targetStraightZ = mainSignZ + SIGN_TRACK_GAP;

                // 2. Reverse Engineer StartZ
                // Geometry: Start -> LeadIn -> Transition(+3) -> Turn(+5) -> Straight.
                // So StraightZ = StartZ + TRANSITION + TURN_RADIUS.
                // StartZ = StraightZ - TRANSITION - TURN_RADIUS.
                const startZ = targetStraightZ - TRANSITION - TURN_RADIUS;

                const totalXDist = (station.subChapters.length) * branchSpacing;
                const branchLength = totalXDist + 10;

                const path = new THREE.CurvePath<THREE.Vector3>();

                // 1. LEAD-IN STRAIGHT
                const p1 = new THREE.Vector3(startX, 0.6, startZ - LEAD_IN);
                const p2 = new THREE.Vector3(startX, 0.6, startZ);
                path.add(new THREE.LineCurve3(p1, p2));

                // 2. TRANSITION STRAIGHT 
                const p2_end = new THREE.Vector3(startX, 0.6, startZ + TRANSITION);
                path.add(new THREE.LineCurve3(p2, p2_end));

                // 3. TURN 
                const c1 = new THREE.Vector3(startX, 0.6, startZ + TRANSITION + (TURN_RADIUS * K));
                const p3 = new THREE.Vector3(startX + TURN_RADIUS, 0.6, startZ + TRANSITION + TURN_RADIUS);
                // Note: p3.z SHOULD be `targetStraightZ`.

                const c2 = new THREE.Vector3(
                    (startX + TURN_RADIUS) - (TURN_RADIUS * K),
                    0.6,
                    startZ + TRANSITION + TURN_RADIUS
                );
                path.add(new THREE.CubicBezierCurve3(p2_end, c1, c2, p3));

                // 4. EXTENSION STRAIGHT
                const p4 = new THREE.Vector3(p3.x + branchLength, 0.6, p3.z);
                path.add(new THREE.LineCurve3(p3, p4));

                curves[index] = path;
            }
        });
        return curves;
    }, [trackX, spacing, branchSpacing]);


    // 1. Calculate Max Branch Length for VoxelMap
    const maxBranchLength = useMemo(() => {
        let maxLen = 0;
        Object.keys(branchCurves).forEach(key => {
            const c = branchCurves[parseInt(key)];
            if (c) maxLen = Math.max(maxLen, c.getLength());
        });
        return maxLen;
    }, [branchCurves]);

    // Determine active branch length dynamically
    const activeBranchLength = useMemo(() => {
        if (typeof activeTrack === 'number') {
            return branchCurves[activeTrack]?.getLength() || 1;
        }
        return 1;
    }, [activeTrack, branchCurves]);

    // --- SWITCHING & NAVIGATION LOGIC ---

    const handleEnterBranch = (index: number) => {
        setAligningTo(index);
        setPendingEntry(index);
        setIsReturning(false);
    };

    const handleReturnToMain = () => {
        setIsReturning(true);
    };

    const finalizeReturnToMain = () => {
        setIsReturning(false);
        if (typeof activeTrack === 'number') {
            const returnedFromIndex = activeTrack;

            // 1. Calculate precise re-entry point (Switch Z)
            const mainSignZ = returnedFromIndex * spacing;
            const targetStraightZ = mainSignZ + SIGN_TRACK_GAP;
            const startZ = targetStraightZ - TRANSITION - TURN_RADIUS;

            // 2. Map startZ to main t
            // t = (Z - startZ_World) / Length
            const p1z = TRACK_START_Z;
            const tSwitch = (startZ - p1z) / mainCurveLength;

            // 3. Set Position to Switch
            mainProgress.current = tSwitch;

            // 4. Switch Context to Main
            setActiveTrack('main');
            setCurrentSubIndex(0);

            // 5. Trigger Autopilot to Drive to Station ("Park")
            setPendingEntry(null);
            setAligningTo(returnedFromIndex);
        }
    };

    const handleBranchNext = () => {
        if (typeof activeTrack !== 'number') return;
        const subs = STATION_DATA[activeTrack].subChapters;
        if (!subs) return;
        if (currentSubIndex < subs.length - 1) {
            setCurrentSubIndex(prev => prev + 1);
        }
    };

    const handleBranchPrev = () => {
        if (currentSubIndex > 0) {
            setCurrentSubIndex(prev => prev - 1);
        } else {
            handleReturnToMain();
        }
    };

    const performSwitch = (index: number) => {
        const targetCurve = branchCurves[index];
        if (!targetCurve) return;

        const totalLength = targetCurve.getLength();

        const leadInLength = 9;
        const startT = leadInLength / totalLength;
        branchProgress.current = startT;

        setActiveTrack(index);
        setAligningTo(null);
        setCurrentSubIndex(0);
    };

    // --- BRANCH TARGET CALCULATION ---
    const branchTargetT = useMemo(() => {
        if (typeof activeTrack !== 'number') return null;
        if (isReturning) {
            const totalLength = activeBranchLength;
            const leadInLength = 9;
            return leadInLength / totalLength;
        }

        const setupConfig = LEAD_IN + TRANSITION + (Math.PI * TURN_RADIUS / 2);

        // Target = LeadIn + Transition + Turn + (i+1)*Spacing.
        // Sign X Position should match the Train X.
        // Train X on Straight = TrackX + TURN_RADIUS + LinearDistance.
        // Sign X = TrackX + 5 + (i+1)*BranchSpacing.
        const dist = setupConfig + ((currentSubIndex + 1) * branchSpacing) + 3.05;

        return Math.min(1, dist / activeBranchLength);

    }, [activeTrack, currentSubIndex, activeBranchLength, branchSpacing, isReturning]);


    const currentCurve = activeTrack === 'main' ? curve : branchCurves[activeTrack as number];
    const currentProgress = activeTrack === 'main' ? mainProgress : branchProgress;


    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            {/* Scroll Control */}
            <ScrollControls
                pages={STATION_DATA.length * 1.5}
                damping={0.2} // Disabled inertia for crisp UI sync
                enabled={activeTrack === 'main' && aligningTo === null}
            >
                {aligningTo === null && <ScrollSyncer progress={mainProgress} stops={stops} />}
            </ScrollControls>

            {/* Main Autopilot */}
            <AlignmentAutopilot
                targetT={aligningTo !== null ? stops[aligningTo] : null}
                progress={mainProgress}
                curveLength={mainCurveLength}
                speed={25}
                onComplete={() => {
                    if (aligningTo !== null) {
                        if (pendingEntry === aligningTo) {
                            performSwitch(aligningTo);
                        } else {
                            // Just Parking
                            setAligningTo(null);
                        }
                    }
                }}
            />

            {/* Branch Autopilot */}
            {activeTrack !== 'main' && (
                <AlignmentAutopilot
                    targetT={branchTargetT}
                    progress={branchProgress}
                    curveLength={activeBranchLength}
                    speed={20}
                    onComplete={() => {
                        if (isReturning) finalizeReturnToMain();
                    }}
                />
            )}

            <VoxelMap maxBranchLength={maxBranchLength} />

            {/* --- MAIN SIGNS GENERATION --- */}
            {/* We use explicit Z logic now to match Geometry-First principle */}
            {stops.map((t, i) => {
                // 1. Calculate ideal Geometric Z for Main Sign.
                // Based on Grid: index * spacing
                const mainSignZ = i * spacing;

                // We ignore 't' for Z position to ensure grid alignment, 
                // though t-based calc should yield the same result.
                const signPos = new THREE.Vector3(signX, 0.6, mainSignZ);

                const isActiveBranch = activeTrack === i;

                return (
                    <StationSign
                        key={`main-${i}`}
                        position={signPos}
                        label={STATION_DATA[i]?.label}
                        description={STATION_DATA[i]?.desc}
                        width={signWidth}
                        subChapters={STATION_DATA[i]?.subChapters}
                        onEnter={isActiveBranch ? undefined : () => handleEnterBranch(i)}
                    />
                );
            })}

            {/* --- BRANCH SIGNS GENERATION --- */}
            {activeTrack !== 'main' && STATION_DATA[activeTrack as number]?.subChapters?.map((sub, i, arr) => {
                const startX = trackX;

                // GEOMETRY-FIRST ALIGNMENT:
                // Main Sign Z is at `index * spacing`.
                // Branch Track Straight Part is at `index * spacing + SIGN_TRACK_GAP`.
                // Sub-Chapter Signs should maintain the SAME offset from the track.
                // SubSign Z = Track Z - SIGN_TRACK_GAP.
                // Therefore: SubSign Z = (MainSignZ + GAP) - GAP = MainSignZ.

                const mainStationZ = (activeTrack as number) * spacing;
                const subSignZ = mainStationZ; // Identical Z to Main Signs

                // XPos: TrackX + Radius(5) + Spacing*(i+1)
                const sX = startX + 5 + ((i + 1) * branchSpacing);
                const pos = new THREE.Vector3(sX, 0.6, subSignZ);

                const isCurrent = i === currentSubIndex;
                const isLast = i === arr.length - 1;

                return (
                    <StationSign
                        key={`branch-${i}`}
                        position={pos}
                        label={sub.label}
                        description={sub.desc}
                        width={signWidth}
                        currentSubIndex={i}
                        onNext={isCurrent && !isLast ? handleBranchNext : undefined}
                        onPrev={isCurrent ? handleBranchPrev : undefined}
                        onReturn={isCurrent && isLast ? handleReturnToMain : undefined}
                    />
                )
            })}


            <Train curve={currentCurve} position={new THREE.Vector3(0, 0.8, 0)} progress={currentProgress} />

            {/* Main Track */}
            <TrackSystem curve={curve} />

            {/* Branch Tracks */}
            {Object.values(branchCurves).map((branchCurve, i) => (
                <TrackSystem key={i} curve={branchCurve} debug={false} />
            ))}

            <FollowCamera
                curve={currentCurve}
                progress={currentProgress}
                isBranch={activeTrack !== 'main'}
            />
        </>
    );
}

// --- SCROLL SYNC ---
function ScrollSyncer({ progress, stops }: { progress: React.MutableRefObject<number>, stops: number[] }) {
    const scroll = useScroll();
    const startT = stops[0];
    const endT = stops[stops.length - 1];

    useFrame(() => {
        // Map scroll 0..1 to StartStation..EndStation range
        progress.current = startT + scroll.offset * (endT - startT);
    }, -2); // Priority -2: Run BEFORE Camera Update (-1) and Render (0)

    return null;
}