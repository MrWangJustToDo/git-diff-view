/* eslint-disable @typescript-eslint/no-explicit-any */
import { setContext, getContext, type Snippet } from 'svelte';

import type { DiffFile, SplitSide } from '@git-diff-view/core';

const key = Symbol('renderExtendLine');

export function setRenderExtend<T>(props: {
	renderExtendLine?: Snippet<
		[
			{
				lineNumber: number;
				side: SplitSide;
				data: T;
				diffFile: DiffFile;
				onUpdate: () => void;
			}
		]
	>;
}) {
	setContext(key, () => props.renderExtendLine);
}

export function getRenderExtend() {
	return getContext(key) as () => Snippet<
		[
			{
				lineNumber: number;
				side: SplitSide;
				data: any;
				diffFile: DiffFile;
				onUpdate: () => void;
			}
		]
	>;
}
