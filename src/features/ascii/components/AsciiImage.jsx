"use client";

import { useState, useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import { resolveImageSrc, onTextureLoadError } from "@features/ascii/utils/imageUtils";

export function AsciiImage({
  imageSrc,
  onLoad,
  alignX = "center",
  alignY = "bottom",
  fit = "cover",
  stretchX = 1,
  stretchY = 1,
  rotationY = 0,
  rotationX = 0,
}) {
  const [texture, setTexture] = useState(null);
  const { viewport } = useThree();
  const meshRef = useRef(null);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      resolveImageSrc(imageSrc),
      (tex) => {
        setTexture(tex);
        onLoad?.();
      },
      undefined,
      onTextureLoadError
    );
  }, [imageSrc, onLoad]);

  if (!texture) return null;

  const img = texture.image;
  const aspect = img.width / img.height;
  const viewportAspect = viewport.width / viewport.height;

  let width;
  let height;
  if (fit === "contain" && aspect > viewportAspect) {
    width = viewport.width;
    height = viewport.width / aspect;
  } else {
    height = viewport.height;
    width = viewport.height * aspect;
  }

  const finalWidth = width * stretchX;
  const finalHeight = height * stretchY;

  let offsetX = 0;
  const overflowX = finalWidth - viewport.width;
  if (alignX === "left") offsetX = overflowX / 2;
  else if (alignX === "right") offsetX = -overflowX / 2;

  let offsetY = 0;
  const overflowY = finalHeight - viewport.height;
  if (alignY === "bottom") offsetY = overflowY / 2;
  else if (alignY === "top") offsetY = -overflowY / 2;

  return (
    <mesh
      ref={meshRef}
      position={[offsetX, offsetY, 0]}
      rotation={[rotationX, rotationY, 0]}
    >
      <planeGeometry args={[finalWidth, finalHeight]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.01}
      />
    </mesh>
  );
}




