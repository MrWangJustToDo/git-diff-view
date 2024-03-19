export const removeAllSelection = () => {
  const selection = window.getSelection();
  for (let i = 0; i < selection.rangeCount; i++) {
    selection.removeRange(selection.getRangeAt(i));
  }
};

export const syncScroll = (left: HTMLElement, right: HTMLElement) => {
  const onScroll = function (event: Event) {
    if (event === null || event.target === null) return;
    if (event.target === left) {
      right.scrollTop = left.scrollTop;
      right.scrollLeft = left.scrollLeft;
    } else {
      left.scrollTop = right.scrollTop;
      left.scrollLeft = right.scrollLeft;
    }
  };
  if (!left.onscroll) {
    left.onscroll = onScroll;
  }
  if (!right.onscroll) {
    right.onscroll = onScroll;
  }

  return () => {
    left.onscroll = null;
    right.onscroll = null;
  };
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const memoFunc = <T extends Function>(func: T): T => {
  const cache = {};
  return ((key: string) => {
    if (cache[key]) {
      return cache[key];
    }
    const result = func(key);
    cache[key] = result;
    return result;
  }) as unknown as T;
};

export const asideWidth = "--diff-aside-width--";
