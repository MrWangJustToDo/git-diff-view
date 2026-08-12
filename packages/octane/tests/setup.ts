import { cleanup } from "@octanejs/testing-library";
import { afterEach, vi } from "vitest";

class TestResizeObserver implements ResizeObserver {
  readonly observed = new Set<Element>();

  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    this.observed.add(target);
    this.callback([{ target, contentRect: target.getBoundingClientRect() } as ResizeObserverEntry], this);
  }

  unobserve(target: Element) {
    this.observed.delete(target);
  }

  disconnect() {
    this.observed.clear();
  }
}

globalThis.ResizeObserver = TestResizeObserver;

// Reason: jsdom does not perform layout; non-zero geometry lets width/height
// observer hooks execute the same rendering and cleanup paths used in browsers.
HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
  bottom: 24,
  height: 24,
  left: 0,
  right: 640,
  toJSON: () => ({}),
  top: 0,
  width: 640,
  x: 0,
  y: 0,
})) as unknown as typeof HTMLElement.prototype.getBoundingClientRect;

// Reason: jsdom has no canvas implementation, while the production component
// measures line-number text through a 2D canvas context.
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  font: "",
  measureText: (text: string) => ({ width: text.length * 8 }),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});
