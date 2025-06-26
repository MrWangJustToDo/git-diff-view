import { setContext, getContext } from 'svelte';

const key = Symbol('enableWrap');

export function setEnableWrap(props: { diffViewWrap?: boolean }) {
	setContext(key, () => props.diffViewWrap);
}

export function getEnableWrap() {
	return getContext(key);
}
