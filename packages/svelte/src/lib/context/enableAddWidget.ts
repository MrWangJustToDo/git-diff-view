import { setContext, getContext } from 'svelte';

const key = Symbol('enableAddWidget');

export function setEnableAddWidget(props: { diffViewAddWidget?: boolean }) {
	setContext(key, () => props.diffViewAddWidget);
}

export function getEnableAddWidget() {
	return getContext(key) as () => boolean;
}
