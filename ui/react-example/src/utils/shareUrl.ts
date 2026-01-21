/**
 * Share URL utilities for encoding/decoding playground state
 * Uses lz-string compression + URL-safe encoding to keep URLs short
 */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

// Git diff mode state
export interface GitDiffShareState {
  lang: string;
  diffString: string;
  content: string;
}

// File diff mode state
export interface FileDiffShareState {
  lang1: string;
  lang2: string;
  file1: string;
  file2: string;
}

/**
 * Encode Git diff state to URL parameter
 */
export function encodeGitDiffState(state: GitDiffShareState): string {
  const json = JSON.stringify(state);
  return compressToEncodedURIComponent(json);
}

/**
 * Decode Git diff state from URL parameter
 */
export function decodeGitDiffState(encoded: string): GitDiffShareState | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as GitDiffShareState;
  } catch {
    return null;
  }
}

/**
 * Encode File diff state to URL parameter
 */
export function encodeFileDiffState(state: FileDiffShareState): string {
  const json = JSON.stringify(state);
  return compressToEncodedURIComponent(json);
}

/**
 * Decode File diff state from URL parameter
 */
export function decodeFileDiffState(encoded: string): FileDiffShareState | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as FileDiffShareState;
  } catch {
    return null;
  }
}

/**
 * Generate share URL for Git diff mode
 */
export function generateGitDiffShareUrl(state: GitDiffShareState): string {
  const url = new URL(window.location.href);
  url.searchParams.set("type", "try");
  url.searchParams.set("tab", "git");

  const encoded = encodeGitDiffState(state);
  url.searchParams.set("data", encoded);

  return url.toString();
}

/**
 * Generate share URL for File diff mode
 */
export function generateFileDiffShareUrl(state: FileDiffShareState): string {
  const url = new URL(window.location.href);
  url.searchParams.set("type", "try");
  url.searchParams.set("tab", "file");

  const encoded = encodeFileDiffState(state);
  url.searchParams.set("data", encoded);

  return url.toString();
}

/**
 * Get share data from current URL
 */
export function getShareDataFromUrl(): string | null {
  const url = new URL(window.location.href);
  return url.searchParams.get("data");
}

/**
 * Update URL with Git diff state (without page reload)
 */
export function updateUrlWithGitDiffState(state: GitDiffShareState): void {
  const url = new URL(window.location.href);
  url.searchParams.set("type", "try");
  url.searchParams.set("tab", "git");

  const encoded = encodeGitDiffState(state);
  url.searchParams.set("data", encoded);

  window.history.replaceState({}, "", url.toString());
}

/**
 * Update URL with File diff state (without page reload)
 */
export function updateUrlWithFileDiffState(state: FileDiffShareState): void {
  const url = new URL(window.location.href);
  url.searchParams.set("type", "try");
  url.searchParams.set("tab", "file");

  const encoded = encodeFileDiffState(state);
  url.searchParams.set("data", encoded);

  window.history.replaceState({}, "", url.toString());
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
