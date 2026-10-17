import { useEffect, useLayoutEffect } from "octane";

const isClient = typeof window !== "undefined";

export const useSafeLayout = isClient ? useLayoutEffect : useEffect;
