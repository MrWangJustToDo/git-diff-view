import { getId } from '$lib/context/id.js';

import { useIsMounted } from './useIsMounted.svelte.js';

export type ObserveElement = HTMLElement & {
	__observeCallback?: Set<() => void>;
	__observeInstance?: ResizeObserver;
};

export const useDomWidth = ({
	selector,
	enable
}: {
	selector: () => string;
	enable: () => boolean;
}) => {
	const id = $derived.by(getId());

	const isMounted = $derived.by(useIsMounted());

	let width = $state(0);

	const cancel = { current: () => {} };

	const observeWidth = () => {
		if (!isMounted) return;

		cancel.current?.();

		if (enable()) {
			const container = document.querySelector(`#diff-root${id}`);

			const wrapper = container?.querySelector(selector());

			if (!wrapper) return;

			const typedWrapper = wrapper as ObserveElement;

			const cb = () => {
				const rect = wrapper?.getBoundingClientRect();
				width = rect?.width ?? 0;
			};

			cb();

			const cleanCb = () => {
				typedWrapper?.__observeCallback?.delete(cb);
				if (typedWrapper?.__observeCallback?.size === 0) {
					typedWrapper.__observeInstance?.disconnect();
					typedWrapper.removeAttribute('data-observe');
					delete typedWrapper.__observeCallback;
					delete typedWrapper.__observeInstance;
				}
			};

			if (typedWrapper.__observeCallback) {
				typedWrapper.__observeCallback.add(cb);

				cancel.current = () => cleanCb();

				return;
			}

			typedWrapper.__observeCallback = new Set();

			typedWrapper.__observeCallback.add(cb);

			const observer = new ResizeObserver(() =>
				typedWrapper?.__observeCallback?.forEach((cb) => cb())
			);

			typedWrapper.__observeInstance = observer;

			observer.observe(typedWrapper);

			typedWrapper.setAttribute('data-observe', 'height');

			cancel.current = () => cleanCb();
		}
	};

	$effect(observeWidth);

	return () => width;
};
