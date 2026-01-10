
"use client";

import { Canvas } from "@react-three/fiber";
import { VoxelMap } from "../components/VoxelMap";
import { Train } from "../components/Train";
import { TrackSystem } from "../components/TrackSystem";
import * as THREE from "three";
import { useRef, useMemo, useState, Suspense } from "react";
import { FollowCamera } from "../components/FollowCamera";
import { StationSign } from "../components/StationSign";
import { ScrollControls } from "@react-three/drei";
import { LayoutProvider, useLayout } from "../components/LayoutContext";
import { BufferStop } from "../components/BufferStop";
import { ScrollSyncer } from "../components/ScrollSyncer";
import { BranchScrollHandler } from "../components/BranchScrollHandler";
import { AlignmentAutopilot } from "../components/AlignmentAutopilot";

import { STATION_DATA } from "../data/stationData";

// CONFIGURATION for geometry and track layout
const TURN_RADIUS = 5;
const TRANSITION = 3;
const SIGN_TRACK_GAP = 5;
const BEZIER_K = 0.55228475; // Approximation for quarter-circle
const LEAD_IN = 9;
const TRACK_START_Z = -10;

export default function Home() {
    return (
        <main className="relative w-screen h-screen overflow-hidden bg-stone-100">
            {/* UI Portal Target */}
            <div id="ui-portal" className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex items-center justify-center" />

            <Canvas camera={{ position: [0, 16, 0], fov: 50 }} shadows>
                <ambientLight intensity={0.7} color="#ffffff" />
                <directionalLight
                    position={[15, 20, 10]}
                    intensity={0.7}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-bias={-0.0001}
                    color="#fffaf0"
                />
                <directionalLight position={[-15, 10, -10]} intensity={0.1} color="#e0f0ff" />
                {/* Additional fill light restored */}
                <directionalLight position={[10, 10, 5]} intensity={0.5} />

                <Suspense fallback={null}>
                    <LayoutProvider stations={STATION_DATA}>
                        <SceneContent />
                    </LayoutProvider>
                </Suspense>
            </Canvas>
        </main>
    );
}

function SceneContent() {
    const { trackX, signX, signWidth, trackLength, spacing, cameraY, vpHeight, isMobile } = useLayout();

    // Spacing between branch sub-chapter signs
    const branchSpacing = signWidth * 2;

    // --- State Management ---
    const [activeTrack, setActiveTrack] = useState<'main' | number>('main');
    const [aligningTo, setAligningTo] = useState<number | null>(null);
    const [currentSubIndex, setCurrentSubIndex] = useState(0);
    const [isReturning, setIsReturning] = useState(false);
    const [pendingEntry, setPendingEntry] = useState<number | null>(null);
    const [syncScroll, setSyncScroll] = useState(false);

    // Progress Refs
    const mainProgress = useRef(0);
    const branchProgress = useRef(0);
    const viewOffset = useRef(0); // For branch sign scrolling

    const isBranch = activeTrack !== 'main';

    // --- curve Generation ---
    const curve = useMemo(() => {
        const points = [
            new THREE.Vector3(trackX, 0.6, TRACK_START_Z),
            new THREE.Vector3(trackX, 0.6, trackLength + 10),
        ];
        return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
    }, [trackX, trackLength]);

    const mainCurveLength = useMemo(() => curve.getLength(), [curve]);

    const stops = useMemo(() => {
        const arr = [];
        const realCurveLength = mainCurveLength;
        for (let i = 0; i < STATION_DATA.length; i++) {
            const zPos = i * spacing;
            const t = Math.max(0, Math.min(1, (zPos - TRACK_START_Z) / realCurveLength));
            arr.push(t);
        }
        return arr;
    }, [spacing, mainCurveLength]);

    const branchCurves = useMemo(() => {
        const curves: { [key: number]: THREE.Curve<THREE.Vector3> } = {};

        STATION_DATA.forEach((station, index) => {
            if (station.subChapters && station.subChapters.length > 0) {
                const startX = trackX;
                const mainSignZ = index * spacing;
                const targetStraightZ = mainSignZ + SIGN_TRACK_GAP;
                const startZ = targetStraightZ - TRANSITION - TURN_RADIUS;
                const totalXDist = (station.subChapters.length) * branchSpacing;
                const branchLength = totalXDist + 10;

                const path = new THREE.CurvePath<THREE.Vector3>();

                // Segment 1: Lead-in
                path.add(new THREE.LineCurve3(
                    new THREE.Vector3(startX, 0.6, startZ - LEAD_IN),
                    new THREE.Vector3(startX, 0.6, startZ)
                ));

                // Segment 2: Transition
                const p2 = new THREE.Vector3(startX, 0.6, startZ);
                const p2_end = new THREE.Vector3(startX, 0.6, startZ + TRANSITION);
                path.add(new THREE.LineCurve3(p2, p2_end));

                // Segment 3: Turn (Cubic Bezier)
                const c1 = new THREE.Vector3(startX, 0.6, startZ + TRANSITION + (TURN_RADIUS * BEZIER_K));
                const p3 = new THREE.Vector3(startX + TURN_RADIUS, 0.6, startZ + TRANSITION + TURN_RADIUS);
                const c2 = new THREE.Vector3(p3.x - (TURN_RADIUS * BEZIER_K), 0.6, p3.z);
                path.add(new THREE.CubicBezierCurve3(p2_end, c1, c2, p3));

                // Segment 4: Extension
                const p4 = new THREE.Vector3(p3.x + branchLength, 0.6, p3.z);
                path.add(new THREE.LineCurve3(p3, p4));

                curves[index] = path;
            }
        });
        return curves;
    }, [trackX, spacing, branchSpacing]);

    // Active track helpers
    const activeBranchLength = useMemo(() => {
        if (typeof activeTrack === 'number') {
            return branchCurves[activeTrack]?.getLength() || 1;
        }
        return 1;
    }, [activeTrack, branchCurves]);

    const maxBranchLength = useMemo(() => {
        let maxLen = 0;
        Object.values(branchCurves).forEach(c => maxLen = Math.max(maxLen, c.getLength()));
        return maxLen;
    }, [branchCurves]);

    // --- Navigation Logic ---
    const handleEnterBranch = (index: number) => {
        setAligningTo(index);
        setPendingEntry(index);
        setIsReturning(false);
    };

    const handleReturnToMain = () => setIsReturning(true);

    const finalizeReturnToMain = () => {
        setIsReturning(false);
        if (typeof activeTrack === 'number') {
            const returnedFromIndex = activeTrack;
            const mainSignZ = returnedFromIndex * spacing;
            const targetStraightZ = mainSignZ + SIGN_TRACK_GAP;
            const startZ = targetStraightZ - TRANSITION - TURN_RADIUS;
            const tSwitch = (startZ - TRACK_START_Z) / mainCurveLength;

            mainProgress.current = tSwitch;
            setActiveTrack('main');
            setCurrentSubIndex(0);
            setPendingEntry(null);
            // setAligningTo(returnedFromIndex); 

            setSyncScroll(true);
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
        const startT = LEAD_IN / totalLength;
        branchProgress.current = startT;

        setActiveTrack(index);
        setAligningTo(null);
        setCurrentSubIndex(0);
    };

    const branchTargetT = useMemo(() => {
        if (typeof activeTrack !== 'number') return null;
        if (isReturning) {
            return LEAD_IN / activeBranchLength;
        }
        const setupConfig = LEAD_IN + TRANSITION + (Math.PI * TURN_RADIUS / 2);
        const dist = setupConfig + ((currentSubIndex + 1) * branchSpacing) + 3.05;
        return Math.min(1, dist / activeBranchLength);
    }, [activeTrack, currentSubIndex, activeBranchLength, branchSpacing, isReturning]);

    const currentCurve = activeTrack === 'main' ? curve : branchCurves[activeTrack as number];
    const currentProgress = activeTrack === 'main' ? mainProgress : branchProgress;

    // --- View Max Offset Calculation ---
    // Calculates how far we can scroll down on a branch sign
    const branchMaxOffset = useMemo(() => {
        if (typeof activeTrack !== 'number') return 12.0;
        const subs = STATION_DATA[activeTrack]?.subChapters;
        if (!subs) return 12.0;
        const currentSub = subs[currentSubIndex];
        if (!currentSub) return 12.0;

        const desc = currentSub.desc || "";
        const frameWidth = 14.0; // Approximation
        const titleCharsPerLine = Math.floor((frameWidth - 1.0) * 2.2);
        const titleLines = Math.ceil((currentSub.label || "").length / Math.max(1, titleCharsPerLine));
        const titleHeight = titleLines * 0.8;

        const charsPerLine = Math.floor((frameWidth - 1.0) * 6.5);
        const descLines = Math.ceil(desc.length / Math.max(1, charsPerLine));
        const descHeight = descLines * 0.42;

        const calculatedHeight = 1.0 + titleHeight + 0.5 + descHeight + 1.0;
        const VIEW_MARGIN = -3.0; // Adjustable
        const TRAIN_BOTTOM_MARGIN = 2.0;

        return calculatedHeight + VIEW_MARGIN + SIGN_TRACK_GAP + TRAIN_BOTTOM_MARGIN - (isMobile ? 0 : vpHeight);
    }, [activeTrack, currentSubIndex, isMobile, vpHeight]);

    return (
        <>
            {/* --- Scroll Controls & Handlers --- */}
            <ScrollControls
                pages={STATION_DATA.length * 1.5}
                damping={0}
                enabled={activeTrack === 'main' && aligningTo === null}
            >
                {activeTrack === 'main' && (
                    <ScrollSyncer
                        progressRef={mainProgress}
                        stops={stops}
                        isAutopilot={aligningTo !== null}
                        forceSync={syncScroll}
                        onSyncComplete={() => setSyncScroll(false)}
                    />
                )}
            </ScrollControls>

            {isBranch && (
                <BranchScrollHandler
                    viewOffsetRef={viewOffset}
                    isBranch={isBranch}
                    maxOffset={branchMaxOffset}
                />
            )}

            {/* --- Autopilots --- */}
            <AlignmentAutopilot
                targetT={aligningTo !== null ? stops[aligningTo] : null}
                progressRef={mainProgress}
                curveLength={mainCurveLength}
                speed={25}
                onComplete={() => {
                    if (aligningTo !== null) {
                        if (pendingEntry === aligningTo) {
                            performSwitch(aligningTo);
                        } else {
                            setAligningTo(null);
                        }
                    }
                }}
            />

            {activeTrack !== 'main' && (
                <AlignmentAutopilot
                    targetT={branchTargetT}
                    progressRef={branchProgress}
                    curveLength={activeBranchLength}
                    speed={20}
                    onComplete={() => {
                        if (isReturning) finalizeReturnToMain();
                    }}
                />
            )}

            {/* --- Environment --- */}
            <VoxelMap maxBranchLength={maxBranchLength} />

            {/* --- Signs --- */}
            {stops.map((t, i) => {
                const mainSignZ = i * spacing;
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

            {activeTrack !== 'main' && STATION_DATA[activeTrack as number]?.subChapters?.map((sub, i, arr) => {
                const startX = trackX;
                const mainStationZ = (activeTrack as number) * spacing;
                const sX = startX + 5 + ((i + 1) * branchSpacing);
                const pos = new THREE.Vector3(sX, 0.6, mainStationZ);
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

            {/* --- Tracks & Trains --- */}
            <Train curve={currentCurve} position={new THREE.Vector3(0, 0.8, 0)} progress={currentProgress} />
            <TrackSystem curve={curve} />
            {Object.values(branchCurves).map((branchCurve, i) => (
                <TrackSystem key={i} curve={branchCurve} debug={false} renderSkip={LEAD_IN + 3} />
            ))}

            {/* --- Buffer Stops --- */}
            {/* Main Start */}
            <BufferStop
                position={new THREE.Vector3(trackX, 0.6, TRACK_START_Z)}
                rotation={new THREE.Euler(0, 0, 0)}
            />
            {/* Main End */}
            <BufferStop
                position={new THREE.Vector3(trackX, 0.6, trackLength + 10)}
                rotation={new THREE.Euler(0, Math.PI, 0)}
            />
            {/* Branch Ends */}
            {Object.entries(branchCurves).map(([key, bCurve]) => {
                const endPoint = bCurve.getPoint(1);
                const tangent = bCurve.getTangent(1);
                const angle = Math.atan2(tangent.x, tangent.z);
                return (
                    <BufferStop
                        key={`buffer-branch-${key}`}
                        position={endPoint}
                        rotation={new THREE.Euler(0, angle + Math.PI, 0)}
                    />
                );
            })}

            <FollowCamera
                curve={currentCurve}
                progress={currentProgress}
                isBranch={activeTrack !== 'main'}
                baseY={cameraY}
                offsetZ={viewOffset}
            />
        </>
    );
}