"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { cx } from "@lib/vendor"; 
import { useIsTouchDevice } from "@shared/hooks/useIsTouchDevice";
import { HoverImage } from "@features/ascii/components/HoverImage";

import { AsciiEffectPass } from "@features/ascii/components/AsciiEffectPass";
import { DemandFrameloop } from "@features/ascii/components/DemandFrameloop";
import { DEFAULT_CHARACTERS } from "@features/ascii/effects/AsciiEffect";



function preventContextLost(event) {
  event.preventDefault();
}

function onCanvasCreated({ gl, invalidate }) {
  gl.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    console.warn("[ASCII] WebGL context lost");
  });
  gl.domElement.addEventListener("webglcontextrestored", () => {
    console.warn("[ASCII] WebGL context restored");
    invalidate();
  });
}


export function AsciiCanvas({
  imageSrc,
  className,
  characters = DEFAULT_CHARACTERS,
  fontSize = 54,
  cellSize = 20,
  color = "#ff6b4a",
  invert = false,
  progress = 1,
  colorProgress = 1,
  randomness = 0.3,
  revealDirection = 1,
  revealEnd = 0.85,
  effectRef,
  alignX = "center",
  alignY = "bottom",
  fit = "cover",
  mobileFit,
  enableHover = false,
  hoverMode = "stretch",
  hoverIntensity,
  mouseX = 0,
  mouseY = 0,
  mouseRef,
  enableGooeyReveal = false,
  gooeyRadius = 0.15,
  gooeySoftness = 0.08,
  gooeyNoiseIntensity = 0.03,
  isHovering = false,
  enableDepthParallax = false,
  depthMapSrc,
  parallaxIntensity = 0.02,
  colorDark,
  depthDetailMin,
  clickPoint,
  clickRadialInvert,
  impactProgress,
  revealOrigin = { x: 0.5, y: 0.5 },
  frameloop = "always",
  dpr = [1, 1.5],
}) {
  const containerRef = useRef(null);
  const [resolvedCellSize, setResolvedCellSize] = useState(cellSize);
  const [isVisible, setIsVisible] = useState(true);
  const [hasSize, setHasSize] = useState(false);

  const effectiveHoverIntensity =
    hoverIntensity ?? (hoverMode === "headTurn" ? 0.04 : 0.15);

  const isTouch = useIsTouchDevice();
  const effectiveFit = isTouch && mobileFit ? mobileFit : fit;

  useEffect(() => {
    if (frameloop !== "always") return;
    const el = containerRef.current;
    if (!el) return;

    let timeoutId = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          setIsVisible(true);
        } else {
          timeoutId = setTimeout(() => setIsVisible(false), 500);
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [frameloop]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const size = Math.max(el.clientWidth, el.clientHeight);
      if (!Number.isFinite(size) || size <= 0) return;
      if (!hasSize) setHasSize(true);
      const dprFactor =
        Math.max(dpr[0], Math.min(window.devicePixelRatio ?? 1, dpr[1])) / 2;
      const next =
        cellSize * Math.max(0.5, size / 1920) * 1.35 * dprFactor;
      if (Number.isFinite(next) && next > 0) {
        setResolvedCellSize(next);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cellSize, dpr]);

  const activeFrameloop =
    frameloop !== "always" || isVisible ? frameloop : "never";

  const glConfig = {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  };

  const cameraConfig = {
    position: [0, 0, 5],
    fov: 50,
  };

  const style = { background: "transparent" };
  
  const effectCellSize = Math.max(1, 1.6 * resolvedCellSize);

  return (
    <div ref={containerRef} className={cx("relative size-full", className)}>
      {hasSize && (
        <Canvas
          frameloop={activeFrameloop}
          className="opacity-100"
          dpr={dpr}
          gl={glConfig}
          camera={cameraConfig}
          style={style}
          onCreated={onCanvasCreated}
        >
        <DemandFrameloop frameloop={frameloop} />
        <HoverImage
          imageSrc={imageSrc}
          alignX={alignX}
          alignY={alignY}
          fit={effectiveFit}
          enableHover={enableHover}
          hoverMode={hoverMode}
          hoverIntensity={effectiveHoverIntensity}
          mouseX={mouseX}
          mouseY={mouseY}
          isHovering={isHovering}
        />
        <AsciiEffectPass
          characters={characters}
          fontSize={fontSize}
          cellSize={effectCellSize}
          color={color}
          invert={invert}
          respectAlpha={true}
          alphaThreshold={0.1}
          progress={progress}
          colorProgress={colorProgress}
          randomness={randomness}
          revealDirection={revealDirection}
          revealEnd={revealEnd}
          effectRef={effectRef}
          enableGooeyReveal={enableGooeyReveal}
          gooeyRadius={gooeyRadius}
          gooeySoftness={gooeySoftness}
          gooeyNoiseIntensity={gooeyNoiseIntensity}
          mouseX={mouseX}
          mouseY={mouseY}
          mouseRef={mouseRef}
          isHovering={isHovering}
          enableDepthParallax={enableDepthParallax}
          depthMapSrc={depthMapSrc}
          parallaxIntensity={parallaxIntensity}
          colorDark={colorDark}
          depthDetailMin={depthDetailMin}
          clickPoint={clickPoint}
          clickRadialInvert={clickRadialInvert}
          impactProgress={impactProgress}
          revealOrigin={revealOrigin}
        />
        </Canvas>
      )}
    </div>
  );
}
