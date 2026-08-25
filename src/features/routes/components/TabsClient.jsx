"use client";

import { useEffect, useState } from "react";
import { ScrollAnimatedHeadline } from "@animations/components/ScrollAnimatedHeadline";
import { SanityRichText } from "@lib/sanity/components/SanityRichText";
import { clsx as cx } from "clsx";

function TabsClient({ items, initialActiveKey, sectionHeadline }) {
  const firstKey = items[0]?._key ?? null;
  const [activeKey, setActiveKey] = useState(initialActiveKey ?? firstKey);
  const [forceKey, setForceKey] = useState(0);

  const setActive = (key) => {
    if (key !== activeKey) {
      setActiveKey(key);
      setForceKey((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (items.length) {
      if (!activeKey || !items.some((item) => item._key === activeKey)) {
        setActiveKey(firstKey);
      }
    } else {
      setActiveKey(null);
    }
  }, [activeKey, firstKey, items]);

  return (
    <div className="grid-layout items-start gap-y-32">
      {sectionHeadline && (
        <ScrollAnimatedHeadline
          headline={sectionHeadline}
          className="grid-span-12 lg:grid-span-7 lg:grid-start-6 mb-32"
        />
      )}

      <div className="grid-span-12 lg:grid-span-4">
        <div
          role="tablist"
          aria-orientation="vertical"
          className="flex flex-col gap-16"
        >
          {items.map((item) => {
            const isActive = item._key === activeKey;
            const tabId = `tab-${item._key}`;
            const panelId = `panel-${item._key}`;
            return (
              <button
                key={item._key}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={() => setActive(item._key)}
                className={cx(
                  "border-border border-b pb-16 text-left text-accent uppercase transition-colors",
                  isActive
                    ? "text-brand"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {item.headline}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid-span-12 lg:grid-span-7 lg:grid-start-6">
        {items.map((item) => {
          const isActive = item._key === activeKey;
          const tabId = `tab-${item._key}`;
          const panelId = `panel-${item._key}`;
          return (
            <div
              key={item._key}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!isActive}
              className={cx(
                "text-body text-foreground-muted",
                isActive ? "block" : "hidden"
              )}
            >
              <SanityRichText
                value={item.text}
                key={`${item._key}-${forceKey}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { TabsClient };
