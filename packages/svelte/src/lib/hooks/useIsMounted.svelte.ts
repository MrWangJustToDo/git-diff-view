/* eslint-disable svelte/prefer-writable-derived */
export const useIsMounted = () => {
	let isMounted = $state(false);

	$effect(() => {
		isMounted = true;
	});

	return () => isMounted;
};
