import { setContext, getContext } from 'svelte';

const key = Symbol('id');

export function setId(getId: () => string) {
	setContext(key, getId);
}

export function getId() {
	return getContext(key) as () => string;
}
