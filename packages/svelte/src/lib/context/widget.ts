import { setContext, getContext } from 'svelte';

import type { SplitSide } from '@git-diff-view/core';

const key = Symbol('widget');

export function setWidget(widget: { side?: SplitSide; lineNumber?: number }) {
	setContext(key, () => widget);
}

export function getWidget() {
	return getContext(key) as () => {
		side?: SplitSide;
		lineNumber?: number;
	};
}
