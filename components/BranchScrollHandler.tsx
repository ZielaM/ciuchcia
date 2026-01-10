
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

interface BranchScrollHandlerProps {
    viewOffsetRef: React.MutableRefObject<number>;
    isBranch: boolean;
    maxOffset: number;
}

export function BranchScrollHandler({ viewOffsetRef, isBranch, maxOffset }: BranchScrollHandlerProps) {
    const { gl } = useThree();

    useEffect(() => {
        if (!isBranch) {
            viewOffsetRef.current = 0;
            return;
        }

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            // Scroll Down = Move Camera Up (Increase Offset)
            const speed = 0.02;
            viewOffsetRef.current -= e.deltaY * speed;
            viewOffsetRef.current = Math.max(0, Math.min(viewOffsetRef.current, maxOffset));
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 0) return;
            const y = e.touches[0].clientY;
            const deltaY = touchStartY - y;
            touchStartY = y;

            const speed = 0.05;
            viewOffsetRef.current -= deltaY * speed;
            viewOffsetRef.current = Math.max(0, Math.min(viewOffsetRef.current, maxOffset));
        };

        const target = window;

        target.addEventListener('wheel', handleWheel, { passive: false });
        target.addEventListener('touchstart', handleTouchStart, { passive: false });
        target.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            target.removeEventListener('wheel', handleWheel);
            target.removeEventListener('touchstart', handleTouchStart);
            target.removeEventListener('touchmove', handleTouchMove);
        };
    }, [isBranch, maxOffset, gl, viewOffsetRef]);

    return null;
}
