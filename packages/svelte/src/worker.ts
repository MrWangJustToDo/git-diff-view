import { DiffFile } from '@git-diff-view/core';

import type { DiffViewProps } from '@git-diff-view/svelte';

export type MessageData = {
	id: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: DiffViewProps<any>['data'];
	theme?: 'light' | 'dark';
	bundle: ReturnType<DiffFile['getBundle']>;
};

const post = (d: MessageData) => postMessage(d);

onmessage = (event: MessageEvent<MessageData>) => {
	const _data = event.data;

	const data = _data.data;

	const file = new DiffFile(
		data?.oldFile?.fileName || '',
		data?.oldFile?.content || '',
		data?.newFile?.fileName || '',
		data?.newFile?.content || '',
		data?.hunks || [],
		data?.oldFile?.fileLang || '',
		data?.newFile?.fileLang || ''
	);

	file.initTheme(_data.theme);

	file.initRaw();

	file.initSyntax();

	file.buildSplitDiffLines();

	file.buildUnifiedDiffLines();

	const res: MessageData = {
		id: _data.id,
		data: _data.data,
		bundle: file.getBundle()
	};

	file.clear();

	post(res);
};
