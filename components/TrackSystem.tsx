"use client";

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Line } from "@react-three/drei";

const GAUGE = 0.7;

interface TrackProps {
    curve: THREE.Curve<THREE.Vector3>;
    debug?: boolean; // help-line flag
    renderSkip?: number; // Distance from start to skip rendering (for overlapping segments)
}

export function TrackSystem({ curve, debug = true, renderSkip = 0 }: TrackProps) {

    // Use "Spaced" points for rails to ensure uniform density even on long straight sections
    const railLinePoints = useMemo(() => {
        const points = curve.getSpacedPoints(200);
        if (renderSkip > 0) {
            const totalLen = curve.getLength();
            const ratio = renderSkip / totalLen;
            const skipIndex = Math.floor(points.length * ratio);
            return points.slice(skipIndex);
        }
        return points;
    }, [curve, renderSkip]);

    const sleepersRef = useRef<THREE.InstancedMesh>(null);
    const sleepersNumber = useMemo(() => Math.floor(curve.getLength() / 0.6), [curve]);

    const sleeperPoints = useMemo(() => {
        const points = curve.getSpacedPoints(sleepersNumber);
        if (renderSkip > 0) {
            const totalLen = curve.getLength();
            // Sleepers are roughly 0.6 apart. 
            // Determine how many to skip.
            const skipCount = Math.floor(renderSkip / 0.6);
            return points.slice(skipCount);
        }
        return points;
    }, [curve, sleepersNumber, renderSkip]);

    useLayoutEffect(() => {
        if (!sleepersRef.current) return;

        // Reset count if needed (though args controls max)
        // With partial rendering, we might have fewer sleepers than args count.

        const tempObject = new THREE.Object3D();

        sleeperPoints.forEach((position, i) => {
            // Determine orientation by looking at the next point
            // For the last point, look at the tangent from previous point (or keep same rotation as last)
            const nextPos = sleeperPoints[i + 1];
            const prevPos = sleeperPoints[i - 1];

            let lookData: THREE.Vector3;

            if (nextPos) {
                lookData = nextPos;
            } else if (prevPos) {
                // If last point, assume direction from previous to current
                // tempObject.lookAt requires a target point, so we project forward
                const direction = new THREE.Vector3().subVectors(position, prevPos);
                lookData = position.clone().add(direction);
            } else {
                lookData = position; // Fallback
            }

            tempObject.position.copy(position);
            tempObject.lookAt(lookData);
            tempObject.updateMatrix();
            sleepersRef.current!.setMatrixAt(i, tempObject.matrix);
        });

        // Hide unused instances (if any remaining in buffer)
        for (let i = sleeperPoints.length; i < sleepersNumber; i++) {
            tempObject.position.set(0, -1000, 0); // Move out of view
            tempObject.updateMatrix();
            sleepersRef.current!.setMatrixAt(i, tempObject.matrix);
        }

        sleepersRef.current.instanceMatrix.needsUpdate = true;
    }, [sleeperPoints, sleepersNumber]);

    return (
        <group>
            {/* DEBUG LINE */}
            {debug && (
                <Line
                    points={railLinePoints}
                    color="hotpink"
                    lineWidth={5}
                />
            )}

            {/* TRACK LAYERS */}
            {/* Note: sleepersNumber is based on TOTAL length, but we might render fewer. That's fine. */}
            <instancedMesh ref={sleepersRef} args={[undefined, undefined, sleepersNumber]}>
                <boxGeometry args={[GAUGE + 0.4, 0.15, 0.3]} />
                <meshStandardMaterial color="brown" />
            </instancedMesh>

            {/* TRACK RAILS */}
            {/* We pass high-res spaced points directly to avoid re-sampling issues in Rail component */}
            <Rail offset={-GAUGE / 2} points={railLinePoints} debug={debug} />
            <Rail offset={GAUGE / 2} points={railLinePoints} debug={debug} />
        </group>
    );
}

interface RailProps {
    offset: number;
    points: THREE.Vector3[];
    debug?: boolean;
}

function Rail({ offset, points, debug = false }: RailProps) {
    // Generate offset points based on the input uniform properties
    const offsetPoints = useMemo(() =>
        points.map((point, index) => {
            // Need tangent at this specific point.
            // Since `points` are just positions, we approximate tangent from neighbors.

            // Let's deduce tangent from vector to next point.
            const nextPoint = points[index + 1] || points[index];
            const prevPoint = points[index - 1] || points[index];

            // Central difference for smoother tangent
            const tangent = new THREE.Vector3().subVectors(nextPoint, prevPoint).normalize();

            // Fallback for endpoints
            if (index === 0) tangent.subVectors(points[1], points[0]).normalize();
            if (index === points.length - 1) tangent.subVectors(points[index], points[index - 1]).normalize();

            const normal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0));
            const tempPoint = point.clone().add(normal.multiplyScalar(offset));
            tempPoint.y += 0.1;
            return tempPoint;
        }), [points, offset]);

    const railCurve = useMemo(() => {
        return new THREE.CatmullRomCurve3(offsetPoints, false, 'catmullrom', 0.5);
    }, [offsetPoints]);

    return (
        <group>
            {debug && (
                <Line
                    points={offsetPoints}
                    color="blue"
                    lineWidth={5}
                />
            )}
            <mesh>
                <tubeGeometry args={[railCurve, 200, 0.05, 8, false]} />
                <meshStandardMaterial color="grey" />
            </mesh>
        </group>
    );
}