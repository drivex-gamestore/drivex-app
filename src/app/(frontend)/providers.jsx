"use client";

import { LenisProvider } from '@providers/LenisProvider';
import PreloaderProvider from '@providers/PreloaderProvider';
import { PageTransitionProvider } from '@providers/PageTransitionProvider';
import { PageEnterProvider } from '@providers/PageEnterProvider';
import { ModalProvider } from '@providers/ModalProvider';
import { FooterVisibilityProvider as FooterProvider } from '@providers/FooterProvider';
import { LazyAnalytics } from '@lib/analytics/LazyAnalytics';

export default function AppProviders({ children }) {
  return (
    <LenisProvider>
      <PreloaderProvider>
        <PageTransitionProvider>
          <PageEnterProvider>
            <ModalProvider>
                <FooterProvider>
                  <LazyAnalytics>
                    {children}
                  </LazyAnalytics>
                </FooterProvider>
            </ModalProvider>
          </PageEnterProvider>
        </PageTransitionProvider>
      </PreloaderProvider>
    </LenisProvider>
  );
}