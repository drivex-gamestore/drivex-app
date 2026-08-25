"use client";
import { useRef, useEffect, useCallback } from 'react';
import { gsap, ScrambleTextPlugin, ScrollTrigger } from '@lib/vendor';
const DEFAULT_CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

export default function useDualLayerScramble(options) {
    const elementRef = useRef(null);
    const timelineRef = useRef(null);
    const originalTextRef = useRef("");
    const originalHTMLRef = useRef("");
    const dimensionsRef = useRef(null);
    const linesDataRef = useRef([]);
    const spansRef = useRef([]);
    const isAnimatingRef = useRef(false);
    const isPreparedRef = useRef(false);

    useEffect(() => {
        if (!elementRef.current) return;
        
        const el = elementRef.current;
        const innerText = el.innerText ?? "";
        
        if (innerText.trim().length > 0) {
            originalTextRef.current = innerText;
            originalHTMLRef.current = el.innerHTML;
            dimensionsRef.current = { width: el.offsetWidth, height: el.offsetHeight };
        }
    }, []);

    const killTimeline = useCallback(() => {
        if (timelineRef.current) {
            timelineRef.current.kill();
            timelineRef.current = null;
            isAnimatingRef.current = false;
        }
    }, []);

    const prepareDOM = useCallback(() => {
        if (!elementRef.current || isPreparedRef.current) return;
        
        const el = elementRef.current;
        if ((originalTextRef.current || el.innerText || "").trim().length === 0) return;
        
        if (!dimensionsRef.current) {
            dimensionsRef.current = { width: el.offsetWidth, height: el.offsetHeight };
        }

        const splitTextIntoLines = (element) => {
            const text = element.innerText || "";
            if (text.trim().length === 0) return [];
            if (text.includes("\n")) return text.split("\n").filter(line => line.length > 0);
            
            const firstChild = element.firstChild;
            if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) return [text];
            
            const range = document.createRange();
            const lines = [];
            let currentLine = "";
            let lastTop = null;
            const length = firstChild.length;
            
            for (let i = 0; i < text.length && i < length; i++) {
                range.setStart(firstChild, i);
                range.setEnd(firstChild, i + 1);
                const rect = range.getBoundingClientRect();
                
                if (lastTop !== null && Math.abs(rect.top - lastTop) > 2) {
                    if (currentLine.length > 0) lines.push(currentLine);
                    currentLine = "";
                }
                currentLine += text[i];
                lastTop = rect.top;
            }
            
            if (currentLine.length > 0) lines.push(currentLine);
            return lines.length > 0 ? lines : [text];
        };

        const lines = splitTextIntoLines(el);
        const testDiv = document.createElement("div");
        testDiv.style.cssText = `
			position: absolute;
			visibility: hidden;
			pointer-events: none;
			white-space: nowrap;
		`;
        
        const computedStyle = window.getComputedStyle(el);
        testDiv.style.font = computedStyle.font;
        testDiv.style.fontSize = computedStyle.fontSize;
        testDiv.style.fontFamily = computedStyle.fontFamily;
        testDiv.style.fontWeight = computedStyle.fontWeight;
        testDiv.style.letterSpacing = computedStyle.letterSpacing;
        testDiv.style.textTransform = computedStyle.textTransform;
        
        document.body.appendChild(testDiv);
        
        linesDataRef.current = lines.map(line => {
            testDiv.textContent = line;
            return { text: line, width: testDiv.offsetWidth, height: testDiv.offsetHeight };
        });
        
        document.body.removeChild(testDiv);
        
        const maxWidth = Math.max(...linesDataRef.current.map(lineData => lineData.width));
        const totalHeight = linesDataRef.current.reduce((sum, lineData) => sum + lineData.height, 0);
        
        const finalWidth = Math.max(dimensionsRef.current?.width ?? 0, maxWidth);
        const finalHeight = Math.max(dimensionsRef.current?.height ?? 0, totalHeight);
        
        isPreparedRef.current = true;
        
        gsap.set(el, { width: finalWidth, height: finalHeight, display: "inline-block", overflow: "hidden" });
        el.innerHTML = "";
        spansRef.current = [];
        
        linesDataRef.current.forEach(lineData => {
            const span = document.createElement("span");
            span.style.cssText = `
				display: block;
				opacity: 0;
				width: ${lineData.width}px;
				height: ${lineData.height}px;
				overflow: hidden;
				white-space: nowrap;
			`;
            span.innerText = lineData.text;
            el.appendChild(span);
            spansRef.current.push(span);
        });
        
        gsap.set(el, { opacity: 1 });
    }, []);

    const playScramble = useCallback((overrides) => {
        if (!elementRef.current) return null;
        if (isAnimatingRef.current) return timelineRef.current;
        
        prepareDOM();
        
        const config = { ...options, ...overrides };
        const duration = config.duration ?? 1;
        const speed = config.speed ?? 1;
        const chars = config.chars ?? DEFAULT_CHARS;
        const firstColorClass = config.firstColorClass ?? "scramble-brand";
        const secondColorClass = config.secondColorClass ?? "scramble-foreground";
        const stagger = config.stagger ?? 0.08;
        
        const linesData = linesDataRef.current;
        const spans = spansRef.current;
        
        if (linesData.length === 0 || spans.length === 0) return null;
        
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            spans.forEach((span, index) => {
                const lineData = linesData[index];
                if (lineData) {
                    span.innerText = lineData.text;
                }
                span.style.opacity = "1";
                span.className = span.className.replace(/\bscramble-\w+\b/g, "");
            });
            config.onComplete?.();
            return null;
        }
        
        killTimeline();
        isAnimatingRef.current = true;
        
        timelineRef.current = gsap.timeline({
            onComplete: () => {
                isAnimatingRef.current = false;
                timelineRef.current = null;
                config.onComplete?.();
            }
        });
        
        spans.forEach((span, index) => {
            const lineData = linesData[index];
            if (!lineData) return;
            
            const originalText = lineData.text;
            const delay = index * stagger;
            
            const generateScrambled = (text, charSet = DEFAULT_CHARS) => {
                let scrambled = "";
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (char === " ") {
                        scrambled += char;
                    } else {
                        scrambled += charSet[Math.floor(Math.random() * charSet.length)];
                    }
                }
                return scrambled;
            };
            
            const initialScrambledText = generateScrambled(originalText, chars);
            const nonSpaceCount = originalText.replace(/\s/g, "").length;
            const spacesOnly = originalText.replace(/[^\s]/g, " ");
            
            timelineRef.current?.add(() => {
                gsap.set(span, { opacity: 1 });
                span.innerText = spacesOnly;
            }, delay);
            
            timelineRef.current?.to(span, {
                duration: duration,
                scrambleText: {
                    text: initialScrambledText,
                    chars: chars,
                    speed: speed,
                    revealDelay: 0.1,
                    oldClass: firstColorClass,
                    newClass: firstColorClass
                },
                ease: "none"
            }, delay);
            
            timelineRef.current?.to(span, {
                duration: duration,
                scrambleText: {
                    text: originalText,
                    chars: chars,
                    speed: speed,
                    revealDelay: 0.1,
                    oldClass: firstColorClass,
                    newClass: secondColorClass
                },
                ease: "none"
            }, delay + (nonSpaceCount > 0 ? duration / nonSpaceCount : 0));
        });
        
        return timelineRef.current;
    }, [options, killTimeline, prepareDOM]);

    const resetDOM = useCallback(() => {
        killTimeline();
        if (elementRef.current && isPreparedRef.current) {
            elementRef.current.innerHTML = originalHTMLRef.current || originalTextRef.current;
            gsap.set(elementRef.current, {
                opacity: 0,
                width: "auto",
                height: "auto",
                overflow: "visible"
            });
            spansRef.current = [];
            linesDataRef.current = [];
            isPreparedRef.current = false;
        }
    }, [killTimeline]);

    
    useEffect(() => {
        return () => {
            killTimeline();
            spansRef.current = [];
            linesDataRef.current = [];
            isPreparedRef.current = false;
        };
    }, [killTimeline]);

    return {
        ref: elementRef,
        scramble: playScramble,
        kill: resetDOM,
        isAnimating: isAnimatingRef.current
    };
}
