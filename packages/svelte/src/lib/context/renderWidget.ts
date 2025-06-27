import { setContext, getContext, type Snippet } from 'svelte';

import type { DiffFile, SplitSide } from '@git-diff-view/core';

const key = Symbol('renderWidget');

export function setRenderWidget(props: {
	renderWidgetLine?: Snippet<
		[
			{
				lineNumber: number;
				side: SplitSide;
				diffFile: DiffFile;
				onClose: () => void;
			}
		]
	>;
}) {
	setContext(key, () => props.renderWidgetLine);
}

export function getRenderWidget() {
	return getContext(key) as () => Snippet<
		[
			{
				lineNumber: number;
				side: SplitSide;
				diffFile: DiffFile;
				onClose: () => void;
			}
		]
	>;
}
