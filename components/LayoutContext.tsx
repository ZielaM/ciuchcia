"use client";

import { createContext, useContext, ReactNode } from "react";
import { useThree } from "@react-three/fiber";

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

export function LayoutProvider({ children, stationCount }: { children: ReactNode, stationCount: number }) {
    const { viewport } = useThree();

    const vpWidth = viewport.width;
    const vpHeight = viewport.height;

    // 1. "Track on Left" Logic
    // Track is at ground level (Y~0.6), so vpWidth is accurate.
    const leftEdge = -vpWidth / 2;
    const trackMargin = Math.min(3, vpWidth * 0.15);
    const trackX = leftEdge + trackMargin;

    // 2. Track Length Logic
    // Spacing: Each station section should be at least one screen height (vpHeight) or more.
    const spacing = Math.max(20, vpHeight * 1.5);
    const trackLength = spacing * (stationCount - 1) + 20; // + padding at end

    // 3. "Signs filling space" Logic
    // PROBLEM: Signs are elevated (Y ~ 3.0). Camera is at Y=16.
    // Perspective makes the visible area at Y=3.0 NARROWER than at Y=0.
    // We must calculate limits based on the visible frustum at Sign Height.
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

    // Space between "Visual Track Right Edge" and "Screen Right Edge"
    // Note: trackX is at Y=0.6. We are comparing with width at Y=3. 
    // This is valid enough for layout.

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
        spacing
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