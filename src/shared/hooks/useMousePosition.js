"use client";

import { useState, useEffect, useRef } from "react";

export function useMousePosition(options = {}) {
    const {
        lerp = 0.08,
        enabled = true,
        containerRef,
        refOnly = false
    } = options;

    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        let rafId;

        if (!enabled) {
            if (!refOnly) {
                setMouseX(0);
                setMouseY(0);
            }
            mouseRef.current.x = 0;
            mouseRef.current.y = 0;
            setIsHovering(false);
            return;
        }

        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let isHoveringLocal = false;

        const handleMouseMove = (e) => {
            const containerEl = containerRef?.current;
            
            if (containerEl) {
                const rect = containerEl.getBoundingClientRect();
                const normX = (e.clientX - rect.left) / rect.width;
                const normY = (e.clientY - rect.top) / rect.height;

                if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
                    if (!isHoveringLocal) {
                        isHoveringLocal = true;
                        setIsHovering(true);
                    }
                    targetX = 2 * normX - 1;
                    // Note: Y-axis is inverted relative to the container 
                    // (1 at top, -1 at bottom)
                    targetY = (1 - normY) * 2 - 1;
                } else if (isHoveringLocal) {
                    isHoveringLocal = false;
                    setIsHovering(false);
                    targetX = 0;
                    targetY = 0;
                }
            } else {
                targetX = (e.clientX / window.innerWidth) * 2 - 1;
                targetY = (e.clientY / window.innerHeight) * 2 - 1;
            }
            
            requestTick();
        };

        const handleDocumentMouseLeave = () => {
            targetX = 0;
            targetY = 0;
            requestTick();
        };

        const handleMouseEnter = () => {
            isHoveringLocal = true;
            setIsHovering(true);
        };

        const handleMouseLeave = () => {
            isHoveringLocal = false;
            setIsHovering(false);
            targetX = 0;
            targetY = 0;
            requestTick();
        };

        const requestTick = () => {
            if (!rafId) {
                rafId = requestAnimationFrame(tick);
            }
        };

        const tick = () => {
            currentX += (targetX - currentX) * lerp;
            currentY += (targetY - currentY) * lerp;
            
            mouseRef.current.x = currentX;
            mouseRef.current.y = currentY;
            
            if (!refOnly) {
                setMouseX(currentX);
                setMouseY(currentY);
            }
            
            if (Math.abs(targetX - currentX) > 1e-4 || Math.abs(targetY - currentY) > 1e-4) {
                rafId = requestAnimationFrame(tick);
            } else {
                rafId = 0; 
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleDocumentMouseLeave);

        const containerEl = containerRef?.current;
        if (containerEl) {
            containerEl.addEventListener("mouseenter", handleMouseEnter);
            containerEl.addEventListener("mouseleave", handleMouseLeave);
        } else {
            document.addEventListener("mouseenter", handleMouseEnter);
            document.addEventListener("mouseleave", handleMouseLeave);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleDocumentMouseLeave);
            
            if (containerEl) {
                containerEl.removeEventListener("mouseenter", handleMouseEnter);
                containerEl.removeEventListener("mouseleave", handleMouseLeave);
            } else {
                document.removeEventListener("mouseenter", handleMouseEnter);
                document.removeEventListener("mouseleave", handleMouseLeave);
            }
            
            cancelAnimationFrame(rafId);
        };
    }, [lerp, enabled, containerRef, refOnly]);

    return { mouseX, mouseY, isHovering, mouseRef };
}

