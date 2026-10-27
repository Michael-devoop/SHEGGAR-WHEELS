"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";

/* ---------- constants ---------- */
const START_FRAME = 10;
const TOTAL_FRAMES = 224;
const FRAME_DIR = "/byd-frames";

/** Pad number to 4 digits: 1 → "0001" */
function pad(n: number): string {
  return String(n).padStart(4, "0");
}

function frameSrc(index: number): string {
  return `${FRAME_DIR}/frame_${pad(index)}.webp`;
}

/* ---------- component ---------- */

interface ScrollCarCanvasProps {
  children?: ReactNode;
}

/**
 * Scroll-controlled car reveal canvas.
 *
 * Renders individual WebP frames onto a `<canvas>` whose current frame is
 * driven by the user's vertical scroll progress through a tall wrapper.
 *
 * Implementation notes:
 * - The wrapper is ~300vh, giving enough scroll runway for 224 frames.
 * - The canvas is `position: sticky` so it stays in view while scrolling.
 * - Frame 1 is loaded eagerly; the rest stream in progressively.
 * - `requestAnimationFrame` gates scroll-listener work to one paint per frame.
 * - High-DPI displays are handled via `devicePixelRatio`.
 * - If `prefers-reduced-motion` is active, only the middle frame is shown.
 *
 * Children are rendered inside the sticky container so they scroll away
 * naturally when the 300vh track ends.
 */
export default function ScrollCarCanvas({ children }: ScrollCarCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef(0);
  const loadedCountRef = useRef(0);

  /* ---- draw a specific frame ---- */
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img) return;

    /* high-DPI sizing */
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width * dpr;
    const h = rect.height * dpr;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    /* cover-fit the image into the canvas */
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

    if (imgRatio > canvasRatio) {
      /* image is wider → crop sides */
      sw = img.naturalHeight * canvasRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      /* image is taller → crop top/bottom */
      sh = img.naturalWidth / canvasRatio;
      sy = (img.naturalHeight - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  }, []);

  /* ---- scroll handler ---- */
  const handleScroll = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const scrollable = wrapper.scrollHeight - window.innerHeight;
    /* How far the wrapper top has scrolled past the viewport top */
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollable));
    const range = TOTAL_FRAMES - START_FRAME;
    const frameIndex = Math.min(
      TOTAL_FRAMES,
      Math.max(START_FRAME, Math.round(progress * range) + START_FRAME),
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      drawFrame(frameIndex);
    }
  }, [drawFrame]);

  /* ---- progressive image loader ---- */
  useEffect(() => {
    /* Respect reduced-motion: show a static mid frame only */
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES + 1).fill(null);
    imagesRef.current = images;

    /** Load a single frame and resolve when done. */
    function loadImage(index: number): Promise<void> {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          images[index] = img;
          loadedCountRef.current++;
          /* Draw if this is the frame we should be showing */
          if (index === currentFrameRef.current) {
            drawFrame(index);
          }
          resolve();
        };
        img.onerror = () => {
          /* Gracefully skip broken frames */
          resolve();
        };
        img.src = frameSrc(index);
      });
    }

    async function loadAll() {
      /* 1. Load start frame immediately for instant first paint */
      await loadImage(START_FRAME);
      currentFrameRef.current = START_FRAME;
      drawFrame(START_FRAME);

      if (prefersReduced) {
        /* Static fallback: load and show the middle frame */
        const mid = Math.round(TOTAL_FRAMES / 2);
        await loadImage(mid);
        currentFrameRef.current = mid;
        drawFrame(mid);
        return;
      }

      /* 2. Load remaining frames in small batches to avoid memory spikes */
      const BATCH_SIZE = 8;
      for (let start = START_FRAME + 1; start <= TOTAL_FRAMES; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE, TOTAL_FRAMES + 1);
        const batch: Promise<void>[] = [];
        for (let i = start; i < end; i++) {
          batch.push(loadImage(i));
        }
        await Promise.all(batch);
      }
    }

    loadAll();

    /* ---- scroll listener (throttled via rAF) ---- */
    if (!prefersReduced) {
      function onScroll() {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(handleScroll);
      }
      window.addEventListener("scroll", onScroll, { passive: true });

      /* Initial position (user may have scrolled before JS loads) */
      handleScroll();

      return () => {
        window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafRef.current);
      };
    }
  }, [drawFrame, handleScroll]);

  /* ---- resize handler: re-draw current frame ---- */
  useEffect(() => {
    function onResize() {
      drawFrame(currentFrameRef.current);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawFrame]);

  return (
    <div ref={wrapperRef} className="hero-scroll-wrapper">
      <div className="hero-scroll-sticky">
        {/* Canvas sits at the back */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="hero-scroll-canvas"
        />
        {/* Content + overlays layered on top, inside the sticky container */}
        {children}
      </div>
    </div>
  );
}

