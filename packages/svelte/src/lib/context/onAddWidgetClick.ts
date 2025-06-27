import { setContext, getContext } from 'svelte';

import type { SplitSide } from '@git-diff-view/core';

const key = Symbol('onAddWidgetClick');

export function setOnAddWidgetClick(props: {
	onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
}) {
	setContext(key, () => props.onAddWidgetClick);
}

export function getOnAddWidgetClick() {
	return getContext(key) as () => (lineNumber: number, side: SplitSide) => void;
}
