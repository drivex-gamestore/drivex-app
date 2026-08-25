"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';

const CONSENT_KEY = "consent:marketing";
export const LI_CONVERSION_CALL_BOOKED = 26590537;
export const LI_CONVERSION_CTA_CLICK = 26590545;

export function trackLinkedInConversion(conversionId) {
    if (window.lintrk && conversionId) {
        window.lintrk("track", {
            conversion_id: conversionId
        });
    }
}

export function LinkedInConsent() {
    const [consent, setConsent] = useState(undefined);

    useEffect(() => {
        const storedConsent = localStorage.getItem(CONSENT_KEY);
        if (storedConsent === "true") {
            setConsent(true);
        } else if (storedConsent === "false") {
            setConsent(false);
        } else {
            setConsent(null);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, "true");
        setConsent(true);
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, "false");
        setConsent(false);
    };

    if (consent === undefined) {
        return null;
    }

    return (
        <>
            {consent === true && (
                <>
                    <Script id="li-partner" strategy="afterInteractive">
                        {`
						_linkedin_partner_id = "9621769";
						window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
						window._linkedin_data_partner_ids.push(_linkedin_partner_id);
					`}
                    </Script>
                    <Script 
                        id="li-insight" 
                        strategy="afterInteractive" 
                        src="https://snap.licdn.com/li.lms-analytics/insight.min.js" 
                    />
                </>
            )}
            {consent === null && (
                <div className="fixed bottom-24 left-24 z-50 max-w-[300px] border border-border bg-surface p-16">
                    <p className="font-mono text-foreground/70 text-xs">
                        We use cookies to measure ad performance.
                    </p>
                    <div className="mt-12 flex items-center gap-12">
                        <button
                            type="button"
                            onClick={handleDecline}
                            className="cursor-pointer font-mono text-foreground/50 text-xs transition-colors duration-200 ease-out hover:text-foreground"
                        >
                            Decline
                        </button>
                        <button
                            type="button"
                            onClick={handleAccept}
                            className="cursor-pointer font-mono text-brand text-xs transition-colors duration-200 ease-out hover:text-brand/80"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
