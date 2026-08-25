"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { TextureLoader } from "three";
import { AsciiEffect, DEFAULT_CHARACTERS } from "@features/ascii/effects/AsciiEffect";
import { resolveImageSrc } from "@features/ascii/utils/imageUtils";


export function AsciiEffectPass({
  characters = DEFAULT_CHARACTERS,
  fontSize = 54,
  cellSize = 20,
  color = "#ff6b4a",
  invert = false,
  alphaThreshold = 0.1,
  respectAlpha = true,
  progress = 1,
  colorProgress = 1,
  randomness = 0.3,
  revealDirection = 1,
  revealEnd = 0.85,
  enableGooeyReveal = false,
  gooeyRadius = 0.15,
  gooeySoftness = 0.08,
  gooeyNoiseIntensity = 0.03,
  enableDepthParallax = false,
  parallaxIntensity = 0.02,
  colorDark,
  depthDetailMin,
  effectRef,
  mouseX = -1,
  mouseY = -1,
  mouseRef,
  isHovering = false,
  depthMapSrc,
  clickPoint,
  clickRadialInvert,
  impactProgress,
  revealOrigin = { x: 0.5, y: 0.5 },
}) {
  const gooeyIntensityRef = useRef(0);
  const parallaxOffsetRef = useRef({ x: 0, y: 0 });
  const wasHoveringRef = useRef(false);
  const scrambleSeedRef = useRef(0);

  const effect = useMemo(
    () =>
      new AsciiEffect({
        characters,
        fontSize,
        cellSize,
        color,
        invert,
        alphaThreshold,
        respectAlpha,
        progress,
        colorProgress,
        randomness,
        revealDirection,
        revealEnd,
        enableGooeyReveal,
        gooeyRadius,
        gooeySoftness,
        gooeyNoiseIntensity,
        enableDepthParallax,
        parallaxIntensity,
        colorDark,
        depthDetailMin,
        revealOrigin,
      }),
    [
      characters,
      fontSize,
      cellSize,
      color,
      invert,
      alphaThreshold,
      respectAlpha,
      randomness,
      revealDirection,
      revealEnd,
      enableGooeyReveal,
      gooeyRadius,
      gooeySoftness,
      gooeyNoiseIntensity,
      enableDepthParallax,
      parallaxIntensity,
      colorDark,
      depthDetailMin,
    ]
  );

  // Load depth map when enabled
  useEffect(() => {
    if (!depthMapSrc || !enableDepthParallax) return;
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(resolveImageSrc(depthMapSrc), (tex) => {
      effect.setDepthMap(tex);
      effect.setEnableDepthParallax(true);
    });
  }, [depthMapSrc, enableDepthParallax, effect]);

  useFrame((state) => {
    const mx = mouseRef?.current?.x ?? mouseX;
    const my = mouseRef?.current?.y ?? mouseY;

    effect.setProgress(progress);
    effect.setColorProgress(colorProgress);
    effect.setClickPoint(clickPoint?.x ?? -1, clickPoint?.y ?? -1);
    effect.setRadialInvert(+!!clickRadialInvert);
    effect.setImpactProgress(impactProgress ?? 0);
    effect.setRevealOrigin(revealOrigin.x, revealOrigin.y);

    if (isHovering && (enableDepthParallax || enableGooeyReveal)) {
      state.invalidate();
    }

    if (enableDepthParallax) {
      const targetX = isHovering ? -mx * parallaxIntensity : 0;
      const targetY = isHovering ? -my * parallaxIntensity * 0.5 : 0;
      const lerp = isHovering ? 0.08 : 0.05;
      parallaxOffsetRef.current.x +=
        (targetX - parallaxOffsetRef.current.x) * lerp;
      parallaxOffsetRef.current.y +=
        (targetY - parallaxOffsetRef.current.y) * lerp;
      effect.setParallaxOffset(
        parallaxOffsetRef.current.x,
        parallaxOffsetRef.current.y
      );
      if (!isHovering) {
        const dx = Math.abs(targetX - parallaxOffsetRef.current.x);
        const dy = Math.abs(targetY - parallaxOffsetRef.current.y);
        if (dx > 1e-4 || dy > 1e-4) state.invalidate();
      }
    }

    if (enableGooeyReveal) {
      effect.setMousePosition((mx + 1) / 2, (my + 1) / 2);
      if (isHovering && !wasHoveringRef.current) {
        scrambleSeedRef.current += 1;
        effect.setScrambleSeed(scrambleSeedRef.current);
      }
      wasHoveringRef.current = isHovering;
      const target = +!!isHovering;
      gooeyIntensityRef.current +=
        (target - gooeyIntensityRef.current) * (isHovering ? 0.08 : 0.06);
      effect.setGooeyIntensity(gooeyIntensityRef.current);
      if (
        !isHovering &&
        Math.abs(target - gooeyIntensityRef.current) > 0.001
      ) {
        state.invalidate();
      }
    }
  });

  useEffect(() => {
    if (effectRef) effectRef.current = effect;
    return () => {
      if (effectRef) effectRef.current = null;
    };
  }, [effect, effectRef]);

  return (
    <EffectComposer multisampling={0}>
      <primitive object={effect} />
    </EffectComposer>
  );
}
