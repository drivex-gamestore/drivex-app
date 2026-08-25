import { HIGH_RES_SOURCE_WIDTHS } from '@shared/constants/constants'; 
import { SanityImage } from '@lib/sanity/components/SanityImage'; 
import { SanityVideo } from '@lib/sanity/components/SanityVideo'; 
import { ExternalVideo } from '@lib/sanity/components/ExternalVideo'; 

export function SanityMedia({
  media,
  loop,
  autoPlay,
  imageProps = {},
  videoProps = {},
  externalVideoProps = {},
  ...restProps
}) {
  if (!media) {
    return null;
  }

  const {
    type,
    image,
    video,
    externalVideoUrl,
    videoOptions,
    highResolution,
    aspectRatio
  } = media;

  const containerProps = { aspectRatio, ...restProps };

  switch (type) {
    case "image": {
      const builderOptions = highResolution 
        ? { sourceWidths: HIGH_RES_SOURCE_WIDTHS } 
        : undefined;
        
      return (
        <SanityImage
          image={image}
          builderOptions={builderOptions}
          {...containerProps}
          {...imageProps}
        />
      );
    }
    case "video": {
      return (
        <SanityVideo
          video={video}
          loop={loop}
          autoPlay={autoPlay}
          {...containerProps}
          {...videoOptions}
          {...videoProps}
        />
      );
    }
    case "externalVideo": {
      const loopExternal = loop ?? true;
      const autoPlayExternal = autoPlay === true || autoPlay === "in-view" || autoPlay === undefined;

      return (
        <ExternalVideo
          src={externalVideoUrl}
          loop={loopExternal}
          autoPlay={autoPlayExternal}
          muted={true}
          controls={false}
          {...containerProps}
          {...externalVideoProps}
        />
      );
    }
    default:
      console.warn(`Unsupported media type: ${type}`);
      return null;
  }
}
