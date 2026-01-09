"use client";

import { createContext, useContext, ReactNode } from "react";
import { useThree } from "@react-three/fiber";

interface StationInfo {
    label: string;
    desc: string;
}

interface LayoutMetrics {
    trackX: number;       // World X position of the track (Left aligned)
    signX: number;        // World X position where signs start (Centered in free space)
    signWidth: number;    // Available width for signs (80% of free space)
    vpWidth: number;      // Viewport width at y=0 plane
    vpHeight: number;     // Viewport height at y=0 plane
    trackLength: number;  // Total length of the track
    spacing: number;      // Spacing between stations
}

const LayoutContext = createContext<LayoutMetrics | null>(null);

// Helper to estimate available sign width (must match logic in StationSign approx)
function measureExpectedSignWidth(vpWidth: number) {
    const CAMERA_HEIGHT = 16;
    const SIGN_HEIGHT = 3.0;
    const PERSPECTIVE_FACTOR = (CAMERA_HEIGHT - SIGN_HEIGHT) / CAMERA_HEIGHT;
    const vpWidthAtSign = vpWidth * PERSPECTIVE_FACTOR;

    // Logic from below:
    // Track takes ~20-25% left. Available space is right side.
    const leftEdge = -vpWidth / 2;
    const trackMargin = Math.min(3, vpWidth * 0.15);
    const trackX = leftEdge + trackMargin;

    const trainVisualWidth = 4;
    const trackRightEdge = trackX + (trainVisualWidth / 2); // Start of available space (approx)

    const screenRightEdgeCorrected = vpWidthAtSign / 2;
    const rightMargin = vpWidthAtSign * 0.05;

    const availableSpaceStart = trackRightEdge; // Simplified mapping
    const availableSpaceEnd = screenRightEdgeCorrected - rightMargin;
    const availableWidth = Math.max(1, availableSpaceEnd - availableSpaceStart);

    return availableWidth * 0.8;
}

export function LayoutProvider({ children, stations }: { children: ReactNode, stations: StationInfo[] }) {
    const { viewport } = useThree();

    const vpWidth = viewport.width;
    const vpHeight = viewport.height;

    // 1. "Track on Left" Logic
    const leftEdge = -vpWidth / 2;
    const trackMargin = Math.min(3, vpWidth * 0.15);
    const trackX = leftEdge + trackMargin;

    // 2. Spacing Logic (Content-Aware)
    // We must ensure the spacing is large enough to fit the longest sign (Z-Axis length).
    const maxSignLength = stations.reduce((max, station) => {
        // Heuristic must MATCH StationSign.tsx exactly to be accurate.
        const width = measureExpectedSignWidth(vpWidth);

        // PADDING logic from StationSign:
        // If vpWidth < 10 (mobile), padding is 1.5. Else 3.0.
        // We use the TALLER scenario (conservative) if in doubt, or exact if possible.
        // Let's mirror exact logic:
        const padding = width < 10 ? 1.5 : 3.0;

        // Chars/Line: (width - padding) * density.
        // Density 6.5 (Tuned).
        const charsPerLine = Math.floor((width - padding) * 6.5);
        const descLines = station.desc ? Math.ceil(station.desc.length / Math.max(1, charsPerLine)) : 0;

        // Height: Base 1.8 + Lines * 0.42. Min 4.0.
        const rawHeight = 1.8 + (descLines * 0.42);
        const height = Math.max(4.0, rawHeight);
        return Math.max(max, height);
    }, 0);

    // Minimum buffer between signs (Z-axis gap)
    // User requested gap to be exactly half the screen height.
    const MIN_GAP = vpHeight * 0.5;

    // Final Spacing: Max of (Standard constant, Physical Sign Size + Gap)
    // We remove the arbitrary 'vpHeight * 1.5' floor to respect the requested gap more precisely,
    // unless the calculated sign is huge.
    const spacing = Math.max(20, maxSignLength + MIN_GAP);
    const trackLength = spacing * (stations.length - 1) + 20;

    // 3. "Signs filling space" Logic
    const CAMERA_HEIGHT = 16;
    const SIGN_HEIGHT = 3.0; // Approx height of sign center
    const PERSPECTIVE_FACTOR = (CAMERA_HEIGHT - SIGN_HEIGHT) / CAMERA_HEIGHT; // ~0.81

    // Adjusted Viewport Width at Sign Height
    const vpWidthAtSign = vpWidth * PERSPECTIVE_FACTOR;

    const trainVisualWidth = 4;
    const trackRightEdge = trackX + (trainVisualWidth / 2);

    // Available space boundaries (Corrected for height)
    const screenRightEdgeCorrected = vpWidthAtSign / 2;
    const rightMargin = vpWidthAtSign * 0.05;

    const availableSpaceStart = trackRightEdge;
    const availableSpaceEnd = screenRightEdgeCorrected - rightMargin;
    const availableWidth = Math.max(1, availableSpaceEnd - availableSpaceStart);

    // Requirements:
    // - Center in this space
    // - Take 80% of this width
    const signWidth = availableWidth * 0.8;
    const signX = availableSpaceStart + (availableWidth / 2);

    const metrics: LayoutMetrics = {
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