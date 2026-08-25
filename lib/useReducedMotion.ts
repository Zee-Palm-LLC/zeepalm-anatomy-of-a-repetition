"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

/** The server has no opinion about motion preference; assume none. */
const getServerSnapshot = () => false;

/**
 * Read the motion preference as an external store rather than syncing it into
 * state from an effect — no cascading render, and it stays correct if the
 * preference changes while the page is open.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
