"use client";

import { createContext, useContext, ReactNode } from "react";
import { useThree } from "@react-three/fiber";

interface StationInfo {
    label: string;
    desc: string;
}

interface LayoutMetrics {
    isMobile: boolean;
    cameraY: number;
    trackX: number;       // World X position of the track (Left aligned)
    signX: number;        // World X position where signs start (Centered in free space)
    signWidth: number;    // Available width for signs (80% of free space)
    vpWidth: number;      // Viewport width at y=0 plane
    vpHeight: number;     // Viewport height at y=0 plane
    trackLength: number;  // Total length of the track
    spacing: number;      // Spacing between stations
}

const LayoutContext = createContext<LayoutMetrics | null>(null);

export function LayoutProvider({ children, stations }: { children: ReactNode, stations: StationInfo[] }) {
    const { size } = useThree();

    // 0. Mobile Detection
    const isMobile = size.width < 768 || (size.width / size.height) < 1.0;

    // 0.1 Camera Config
    const cameraY = isMobile ? 26 : 16;
    const FOV = 50;

    // 0.2 Viewport Calculation
    const dist = cameraY;
    const vFOV = (FOV * Math.PI) / 180;
    const vpHeight = 2 * Math.tan(vFOV / 2) * dist;
    const vpWidth = vpHeight * (size.width / size.height);

    // 1. "Track on Left" Logic
    const leftEdge = -vpWidth / 2;
    const trackMargin = isMobile ? 1 : 3;
    const trackX = leftEdge + trackMargin;

    // 2. Calculate Available Width for Signs (Moved UP to be reusable)
    const CAMERA_HEIGHT = cameraY;
    const SIGN_HEIGHT = 3.0;
    const PERSPECTIVE_FACTOR = (CAMERA_HEIGHT - SIGN_HEIGHT) / CAMERA_HEIGHT;
    const vpWidthAtSign = vpWidth * PERSPECTIVE_FACTOR;

    const trainVisualWidth = 4;
    const trackRightEdge = trackX + (trainVisualWidth / 2);

    const screenRightEdgeCorrected = vpWidthAtSign / 2;
    const rightMargin = 0; // User requested 0 margin

    const availableSpaceStart = trackRightEdge;
    const availableSpaceEnd = screenRightEdgeCorrected - rightMargin;
    const availableWidth = Math.max(1, availableSpaceEnd - availableSpaceStart);

    // Requirements: Center in space, full available width (User requested 100% of available)
    const signWidth = availableWidth;
    const signX = availableSpaceStart + (availableWidth / 2);

    // 3. Spacing Logic (Content-Aware)
    // Now we use the REAL signWidth calculated above, ensuring consistency.
    const maxSignLength = stations.reduce((max, station) => {
        // PADDING logic from StationSign:
        const padding = signWidth < 10 ? 1.5 : 3.0;
        // Density 6.5 (Tuned).
        const charsPerLine = Math.floor((signWidth - padding) * 6.5);
        const descLines = station.desc ? Math.ceil(station.desc.length / Math.max(1, charsPerLine)) : 0;

        // Height: Base 1.8 + Lines * 0.42. Min 4.0.
        const rawHeight = 1.8 + (descLines * 0.42);
        const height = Math.max(4.0, rawHeight);
        return Math.max(max, height);
    }, 0);

    // Minimum buffer between signs (Z-axis gap)
    const MIN_GAP = vpHeight * 0.5;

    const spacing = Math.max(20, maxSignLength + MIN_GAP);
    const trackLength = spacing * (stations.length - 1) + 20;

    const metrics: LayoutMetrics = {
        isMobile,
        cameraY,
        trackX,
        signX,
        signWidth,
        vpWidth,
        vpHeight,
        trackLength,
        spacing,
    };

    return (
        <LayoutContext.Provider value={metrics}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error("useLayout must be used within a LayoutProvider");
    }
    return context;
}