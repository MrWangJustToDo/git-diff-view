import { DiffModeEnum } from '@git-diff-view/utils';
import { setContext, getContext } from 'svelte';

const key = Symbol('mode');

export function setMode(props: { diffViewMode?: DiffModeEnum }) {
	setContext(key, () => props.diffViewMode || DiffModeEnum.Split);
}

export function getMode() {
	return getContext(key) as () => DiffModeEnum;
}
