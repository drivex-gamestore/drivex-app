"use client";

// components/SanityVideo.jsx
import React, { Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import { cx } from '@lib/vendor';// derived path for 801335
import { createResponsiveRatios } from '@lib/sanity/utils/responsive';
import { run } from '@lib/sanity/utils/run';
import { DEFAULT_MAX_WIDTH } from "@shared/constants/constants"; 

const MuxPlayer = dynamic(() => import("@mux/mux-player-react").then((mod) => mod.MuxPlayer));

function calculateHeight(value) {
  const ratio = Math.min(value / DEFAULT_MAX_WIDTH, 1);
  return Math.min(value, Math.round(300 + 300 * ratio ** 0.5));
}

export function SanityVideo(props) {
  const {
    video,
    aspectRatio,
    width,
    height,
    style,
    className,
    thumbnailTime,
    poster,
    animatedPoster,
    disablePoster,
    hoverPlayback,
    objectFit = "cover",
    objectPosition = "center",
    ...rest
  } = props;

  const isPosterDisabled = disablePoster !== undefined && disablePoster;
  const isHoverPlayback = hoverPlayback !== undefined && hoverPlayback;

  const playerRef = useRef(null);

  const handlePointerEnter = () => {
    if (isHoverPlayback && playerRef.current) {
      playerRef.current.play();
    }
  };

  const handlePointerLeave = () => {
    if (isHoverPlayback && playerRef.current) {
      playerRef.current.pause();
    }
  };

  const { playbackId, dimensions, thumbTime } = video ?? {};

  if (!playbackId) {
    return null;
  }

  const derivedWidth = width ?? dimensions?.width;
  const derivedHeight = height ?? dimensions?.height;
  const derivedAspectRatio = (width && height ? width / height : undefined) ?? aspectRatio ?? dimensions?.aspectRatio ?? 1.7777777777777777;

  const responsiveRatios = createResponsiveRatios(derivedAspectRatio);

  const generatedPoster = run(() => {
    if (isPosterDisabled || !playbackId) return null;
    if (poster) return poster;

    const params = {
      playbackId,
      time: thumbTime ?? undefined,
      animated: animatedPoster,
      height: derivedHeight ? calculateHeight(derivedHeight) : undefined,
      width: derivedWidth ? calculateHeight(derivedWidth) : undefined,
    };

    let url = `https://image.mux.com/${params.playbackId}/${params.animated ? "animated.gif" : "thumbnail.webp"}?time=${params.time = 1}&fit_mode=${params.fitMode = "preserve"}`;
    if (params.width) url += `&width=${params.width}`;
    if (params.height) url += `&height=${params.height}`;
    return url;
  });

  const posterToUse = isPosterDisabled ? "" : generatedPoster ?? undefined;
  const showFallback = !isPosterDisabled && !!generatedPoster;

  const containerStyle = {
    ...responsiveRatios.styles,
    "--desired-width": height ? "auto" : derivedWidth ? `${derivedWidth}px` : "auto",
    "--desired-height": height ? `${height}px` : "auto",
    ...style,
  };

  const backgroundImageUrl = `url(${generatedPoster})`;

  const fallbackStyle = {
    filter: "blur(20px)",
    backgroundImage: backgroundImageUrl,
    backgroundRepeat: "no-repeat",
    backgroundSize: objectFit,
    backgroundPosition: objectPosition,
  };

  const containerClassName = cx(
    "relative isolate h-(--desired-height,auto) w-(--desired-width,auto) max-w-full overflow-hidden",
    responsiveRatios.className,
    className
  );

  const pointerEnterHandler = isHoverPlayback ? handlePointerEnter : undefined;
  const pointerLeaveHandler = isHoverPlayback ? handlePointerLeave : undefined;

  const fallbackElement = showFallback ? (
    <div style={fallbackStyle} className="pointer-events-none absolute inset-0 -z-1 size-full" />
  ) : null;

  const resolvedThumbTime = thumbTime ?? undefined;

  const playerElement = (
    <MuxPlayer
      poster={posterToUse}
      ref={playerRef}
      playbackId={playbackId}
      thumbnailTime={resolvedThumbTime}
      objectFit={objectFit}
      objectPosition={objectPosition}
      className="absolute inset-0 z-10 size-full"
      {...rest}
    />
  );

  return (
    <div
      style={containerStyle}
      className={containerClassName}
      onPointerEnter={pointerEnterHandler}
      onPointerLeave={pointerLeaveHandler}
    >
      <Suspense fallback={fallbackElement}>
        {playerElement}
      </Suspense>
    </div>
  );
}
// original module ID: 700481
