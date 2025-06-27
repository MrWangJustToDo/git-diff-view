import { setContext, getContext } from 'svelte';

const key = Symbol('enableHighlight');

export function setEnableHighlight(props: { diffViewHighlight?: boolean }) {
	setContext(key, () => props.diffViewHighlight);
}

export function getEnableHighlight() {
	return getContext(key) as () => boolean;
}
