/* eslint-disable @typescript-eslint/no-explicit-any */
import { setContext, getContext } from 'svelte';

const key = Symbol('extend');

export function setExtend<T>(props: {
	extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
}) {
	setContext(key, () => props.extendData);
}

export function getExtend() {
	return getContext(key) as () => {
		oldFile?: Record<string, { data: any }>;
		newFile?: Record<string, { data: any }>;
	};
}
