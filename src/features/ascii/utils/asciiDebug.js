"use client";



const debugState = {
  enabled: false,
  textureCount: 0,
  debugMode: 0,
};

let lastAtlasCanvas = null;
let lastAtlasConfig = null;
let lastAtlasStatsKey = "";


function showAtlasDebug(canvas, config) {
  if (typeof document === "undefined") return;

  lastAtlasCanvas = canvas;
  lastAtlasConfig = config;

  const panel = (() => {
    let el = document.getElementById("ascii-debug-atlas");
    if (el) return el;

    el = document.createElement("div");
    el.id = "ascii-debug-atlas";
    el.style.position = "fixed";
    el.style.bottom = "16px";
    el.style.right = "16px";
    el.style.zIndex = "99999";
    el.style.background = "rgba(0,0,0,0.85)";
    el.style.border = "1px solid #333";
    el.style.borderRadius = "8px";
    el.style.padding = "8px";
    el.style.color = "#fff";
    el.style.fontFamily =
      "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    el.style.fontSize = "12px";
    el.style.display = "grid";
    el.style.gap = "6px";
    el.style.opacity = "0.85";

    const title = document.createElement("div");
    title.textContent = "ASCII Atlas";
    title.style.fontWeight = "600";
    el.appendChild(title);
    document.body.appendChild(el);
    return el;
  })();

  while (panel.lastChild) {
    panel.removeChild(panel.lastChild);
  }

  const info = document.createElement("div");
  info.textContent = `size=${config.size} cell=${config.cell} chars=${config.characters.length} font=${config.fontSize}px`;
  info.style.color = "#ccc";
  panel.appendChild(info);

  const preview = document.createElement("canvas");
  preview.width = 2 * config.size;
  preview.height = 2 * config.size;
  const ctx = preview.getContext("2d");
  if (!ctx) {
    panel.appendChild(preview);
    return;
  }

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, 2 * config.size, 2 * config.size);
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= config.size; i += config.cell) {
    const pos = 2 * i + 0.5;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, 2 * config.size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(2 * config.size, pos);
    ctx.stroke();
  }

  preview.style.width = `${config.size}px`;
  preview.style.height = `${config.size}px`;
  preview.style.border = "1px solid #444";
  panel.appendChild(preview);
}

/**
 * Logs atlas pixel statistics when they change.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ size: number, cell: number, characters: string, fontSize: number }} config
 */
function logAtlasStats(ctx, config) {
  const { size } = config;
  const data = ctx.getImageData(0, 0, size, size).data;
  let nonBlackPixels = 0;
  let nonZeroAlphaPixels = 0;
  let rgbWithZeroAlpha = 0;
  let maxAlpha = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3] ?? 0;
    if (r || g || b) nonBlackPixels++;
    if (a > 0) nonZeroAlphaPixels++;
    if ((r || g || b) && a === 0) rgbWithZeroAlpha++;
    if (a > maxAlpha) maxAlpha = a;
  }

  const key = `${nonBlackPixels}:${nonZeroAlphaPixels}:${rgbWithZeroAlpha}:${maxAlpha}`;
  if (key !== lastAtlasStatsKey) {
    lastAtlasStatsKey = key;
    console.log(
      "%c[ASCII Debug] Atlas stats",
      "color: #ff6b4a; font-weight: bold",
      {
        size: config.size,
        cell: config.cell,
        characters: config.characters.length,
        fontSize: config.fontSize,
        nonBlackPixels,
        nonZeroAlphaPixels,
        rgbWithZeroAlpha,
        maxAlpha,
      }
    );
  }
}

function isDebugEnabled() {
  return debugState.enabled || window.__ASCII_DEBUG__ === true;
}

/**
 * Enable / disable ASCII debug mode.
 * @param {boolean} enabled
 */
function setDebugEnabled(enabled) {
  debugState.enabled = enabled;
  if (enabled) {
    console.log(
      "%c[ASCII Debug] Enabled",
      "color: #ff6b4a; font-weight: bold",
      `\nVersion: 2026-01-26-2`,
      `\nTexture count: ${debugState.textureCount}`,
      "\nTo disable: window.__ASCII_DEBUG__ = false"
    );
    if (lastAtlasCanvas && lastAtlasConfig) {
      showAtlasDebug(lastAtlasCanvas, lastAtlasConfig);
      const ctx = lastAtlasCanvas.getContext("2d");
      if (ctx) logAtlasStats(ctx, lastAtlasConfig);
    }
  }
}

function onTextureCreated() {
  debugState.textureCount++;
  if (isDebugEnabled()) {
    console.log(
      `%c[ASCII Debug] Texture created (total: ${debugState.textureCount})`,
      "color: #888"
    );
  }
}

function onTextureDisposed() {
  debugState.textureCount = Math.max(0, debugState.textureCount - 1);
  if (isDebugEnabled()) {
    console.log(
      `%c[ASCII Debug] Texture disposed (total: ${debugState.textureCount})`,
      "color: #888"
    );
  }
}

const asciiDebugUtils = {
  enable: () => setDebugEnabled(true),
  disable: () => setDebugEnabled(false),
  getTextureCount: () => debugState.textureCount,
  setDebugMode: (mode) => {
    debugState.debugMode = mode;
    window.dispatchEvent(
      new CustomEvent("ascii-debug-mode", { detail: mode })
    );
    if (isDebugEnabled()) {
      console.log(
        "%c[ASCII Debug] Debug mode",
        "color: #ff6b4a; font-weight: bold",
        mode
      );
    }
  },
  getDebugMode: () => debugState.debugMode,
  showAtlas: () => {
    if (lastAtlasCanvas && lastAtlasConfig) {
      showAtlasDebug(lastAtlasCanvas, lastAtlasConfig);
    } else {
      console.warn(
        "[ASCII Debug] No atlas available yet. Try refreshAtlas() after the scene renders."
      );
    }
  },
  logAtlasStats: () => {
    if (lastAtlasCanvas && lastAtlasConfig) {
      const ctx = lastAtlasCanvas.getContext("2d");
      if (ctx) logAtlasStats(ctx, lastAtlasConfig);
    } else {
      console.warn(
        "[ASCII Debug] No atlas available yet. Try refreshAtlas() after the scene renders."
      );
    }
  },
  refreshAtlas: () => {
    window.dispatchEvent(new CustomEvent("ascii-debug-refresh"));
  },
  clearOverlays: () => {
    const el = document.getElementById("ascii-debug-atlas");
    el?.parentElement?.removeChild(el);
  },
};

// Expose globally for runtime inspection (matches original bundle behavior)
if (typeof window !== "undefined") {
  window.__ASCII_DEBUG_UTILS__ = asciiDebugUtils;
  window.ASCII_DEBUG_UTILS = asciiDebugUtils;
}

export {
  debugState,
  showAtlasDebug,
  logAtlasStats,
  isDebugEnabled,
  setDebugEnabled,
  onTextureCreated,
  onTextureDisposed,
  asciiDebugUtils,
};
