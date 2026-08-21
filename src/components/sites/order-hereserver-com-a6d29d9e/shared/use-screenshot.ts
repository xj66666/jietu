"use client";

import { useCallback, useState } from "react";
import type { RefObject } from "react";

/**
 * Rasterises the preview canvas the way the target's `screenshot()` does: capture the
 * node, keep the data URL around so the `.screen-mirror` overlay and the download
 * anchor can both use it.
 *
 * html2canvas-pro is loaded lazily — it touches `window` at import time and only ever
 * runs from a click handler, so there is no reason to ship it in the initial bundle.
 */
export function useScreenshot(targetRef: RefObject<HTMLElement | null>) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async () => {
    const node = targetRef.current;
    if (!node || isCapturing) return;
    setIsCapturing(true);
    setError(null);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(node, {
        // The target exports at device resolution; its background art is a 2x asset.
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      setScreenshotUrl(canvas.toDataURL("image/png"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsCapturing(false);
    }
  }, [targetRef, isCapturing]);

  const reset = useCallback(() => setScreenshotUrl(null), []);

  return { screenshotUrl, isCapturing, error, capture, reset };
}
