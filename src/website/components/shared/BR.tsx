import { memo, useEffect, useRef } from 'react';
import {
  FINAL_COLOR,
  INITIAL_COLOR,
  VIEWBOX_WIDTH,
} from '@site/src/website/hooks/BR/definitions';
import rawDots from '@site/src/website/hooks/BR/dots.json';

const OVERLAY_COUNT = 4;
const OVERLAY_MAX_DOTS = 400;
const CYCLE_S = 16;
// Render at low resolution — dots are hard-edged squares so pixelated scaling is lossless.
// This keeps GPU textures tiny (~1.6 MB total) vs rendering at display size (~200+ MB with scale+DPR).
const RENDER_WIDTH = 320;

type Dot = { cx: number; cy: number; r: number };

const allDots: Dot[] = (
  rawDots as Array<{ cx: number; cy: number; r: number }>
).map((d) => ({ cx: d.cx, cy: d.cy, r: d.r }));

const BASE_COLOR = `rgba(${INITIAL_COLOR.red},${INITIAL_COLOR.green},${INITIAL_COLOR.blue},${INITIAL_COLOR.alpha})`;
const HIGH_COLOR = `rgba(${FINAL_COLOR.red},${FINAL_COLOR.green},${FINAL_COLOR.blue},${FINAL_COLOR.alpha})`;

// 100, 200, 300, 400 dots per overlay
const overlaySubsets: Dot[][] = Array.from(
  { length: OVERLAY_COUNT },
  (_, i) => {
    const count = Math.round(((i + 1) / OVERLAY_COUNT) * OVERLAY_MAX_DOTS);
    return [...allDots].sort(() => Math.random() - 0.5).slice(0, count);
  }
);

const offscreen =
  typeof document !== 'undefined' ? document.createElement('canvas') : null;

function toDataURL(
  dots: Dot[],
  color: string,
  renderWidth: number,
  renderHeight: number
): string {
  if (!offscreen) return '';
  offscreen.width = renderWidth;
  offscreen.height = renderHeight;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return '';
  ctx.clearRect(0, 0, renderWidth, renderHeight);
  const scale = renderWidth / VIEWBOX_WIDTH;
  ctx.fillStyle = color;
  for (const d of dots) {
    const size = Math.max(1, Math.round(d.r * 2 * scale));
    ctx.fillRect(
      Math.round(d.cx * scale - size / 2),
      Math.round(d.cy * scale - size / 2),
      size,
      size
    );
  }
  return offscreen.toDataURL();
}

type BRProps = { className?: string; style?: React.CSSProperties };

const BRCanvas = ({ className, style }: BRProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLImageElement>(null);
  const overlayRefs = useRef<(HTMLImageElement | null)[]>(
    Array(OVERLAY_COUNT).fill(null)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rendered = false;

    const repaint = () => {
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      if (!containerWidth || !containerHeight) return;

      const renderHeight = Math.round(
        containerHeight * (RENDER_WIDTH / containerWidth)
      );

      if (baseRef.current)
        baseRef.current.src = toDataURL(
          allDots,
          BASE_COLOR,
          RENDER_WIDTH,
          renderHeight
        );

      overlayRefs.current.forEach((el, i) => {
        if (el)
          el.src = toDataURL(
            overlaySubsets[i]!,
            HIGH_COLOR,
            RENDER_WIDTH,
            renderHeight
          );
      });

      rendered = true;
    };

    repaint();

    const ro = new ResizeObserver(() => {
      // Skip re-render on tiny fluctuations after first paint
      if (rendered) repaint();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    imageRendering: 'pixelated',
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', ...style }}
    >
      <img ref={baseRef} alt='' style={layerStyle} />
      {Array.from({ length: OVERLAY_COUNT }, (_, i) => (
        <img
          key={i}
          alt=''
          ref={(el) => {
            overlayRefs.current[i] = el;
          }}
          style={{
            ...layerStyle,
            // translateZ forces independent compositor layer so opacity animation
            // doesn't trigger Layerize on the parent subtree every frame
            transform: 'translateZ(0)',
            animation: `br-cycle ${CYCLE_S}s steps(${CYCLE_S * 30}) ${-(CYCLE_S / OVERLAY_COUNT) * i}s infinite`,
            willChange: 'opacity',
          }}
        />
      ))}
    </div>
  );
};

export const BR = memo(BRCanvas);
