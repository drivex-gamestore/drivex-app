import { Preloader } from '@features/animations/utils/pageLoader';
import { HeaderClient } from '@components/layout/HeaderClient';
import { FooterClient } from '@components/layout/FooterClient';
import { NewsletterPopupClient } from '@features/newsletters/NewsletterPopupClient';
import { LazyCustomCursor } from '@components/ui/LazyCustomCursor';
import { GridOverlay } from '@components/ui/GridOverlay';
import { PageTransitionOverlay } from '@features/transitions/components/PageTransitionOverlay';
import { LazyPageTransitionRectangles } from '@features/transitions/LazyPageTransitionRectangles';
import { PageTransitionScrollLock } from '@features/transitions/PageTransitionScrollLock';
import { getHeaderData } from '@lib/sanity/queries/HeaderData'; 
import { getFooterData } from '@lib/sanity/queries/FooterData';
import { SyncBodyTheme } from '@components/theme/SyncBodyTheme'; 

export default async function AppLayout({ children }) {
  const [headerData, footerData] = await Promise.all([
    getHeaderData(),
    getFooterData(),
  ]);

  return (
    <>
      <SyncBodyTheme />
      <Preloader />
      <PageTransitionScrollLock />
      <PageTransitionOverlay />
      <LazyPageTransitionRectangles />
      <GridOverlay />
      <LazyCustomCursor>
        <HeaderClient
          navItems={headerData?.navItems}
          headerCta={headerData?.headerCta}
          flyout={headerData?.flyout}
          spotsRemaining={headerData?.spotsRemaining}
        />
        <main className="relative z-[1]">
          {children}
        </main>
        <FooterClient
          navigation={footerData?.navigation}
          contactInformation={footerData?.contactInformation}
          copyrightNotice={footerData?.copyrightNotice}
          asciiImageLeft={footerData?.asciiImageLeft}
          asciiDepthMapLeft={footerData?.asciiDepthMapLeft}
          asciiColorLeft={footerData?.asciiColorLeft}
          asciiColorDarkLeft={footerData?.asciiColorDarkLeft}
          asciiCellSizeLeft={footerData?.asciiCellSizeLeft}
          asciiParallaxIntensityLeft={footerData?.asciiParallaxIntensityLeft}
          asciiRevealOriginXLeft={footerData?.asciiRevealOriginXLeft}
          asciiRevealOriginYLeft={footerData?.asciiRevealOriginYLeft}
          asciiMobileFallbackLeft={footerData?.asciiMobileFallbackLeft}
          asciiImage={footerData?.asciiImage}
          asciiDepthMap={footerData?.asciiDepthMap}
          asciiColor={footerData?.asciiColor}
          asciiColorDark={footerData?.asciiColorDark}
          asciiCellSize={footerData?.asciiCellSize}
          asciiParallaxIntensity={footerData?.asciiParallaxIntensity}
          asciiRevealOriginX={footerData?.asciiRevealOriginX}
          asciiRevealOriginY={footerData?.asciiRevealOriginY}
          asciiMobileFallback={footerData?.asciiMobileFallback}
          showWatermark={footerData?.showWatermark}
          spotsRemaining={footerData?.spotsRemaining}
        />
        <NewsletterPopupClient />
      </LazyCustomCursor>
    </>
  );
}

