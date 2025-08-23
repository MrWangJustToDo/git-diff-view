import { setContext, getContext } from 'svelte';

const key = Symbol('dom');

export function setDom(getDom: () => HTMLElement) {
	setContext(key, getDom);
}

export function getDom() {
	return getContext(key) as () => HTMLElement;
}
