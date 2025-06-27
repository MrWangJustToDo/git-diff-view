import { setContext, getContext } from 'svelte';

const key = Symbol('fontSize');

export function setFontSize(props: { diffViewFontSize?: number }) {
	setContext(key, () => props.diffViewFontSize || 14);
}

export function getFontSize() {
	return getContext(key) as () => number;
}
