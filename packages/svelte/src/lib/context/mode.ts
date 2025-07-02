import { setContext, getContext } from 'svelte';

import { DiffModeEnum } from '$lib/utils/symbol.js';

const key = Symbol('mode');

export function setMode(props: { diffViewMode?: DiffModeEnum }) {
	setContext(key, () => props.diffViewMode || DiffModeEnum.Split);
}

export function getMode() {
	return getContext(key) as () => DiffModeEnum;
}
