export const removeAllSelection = () => {
  window.getSelection()?.removeAllRanges();
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

export const getElementRoot = (element?: HTMLElement) => {
  if (element) {
    const root = element.getRootNode();

    if (root instanceof ShadowRoot) {
      return root;
    }

    return element.ownerDocument;
  }
  return document;
};

export const getDiffIdFromElement = (element?: HTMLElement) => {
  if (element) {
    if (typeof element.closest === "function") {
      const diffRoot = element.closest('[data-component="git-diff-view"]');
      const ele = diffRoot?.querySelector?.(".diff-view-wrapper");
      return ele?.getAttribute?.("id");
    } else {
      let el: HTMLElement | null = element;
      while (el) {
        if (el.getAttribute && el.getAttribute("data-component") === "git-diff-view") {
          const ele = el.querySelector(".diff-view-wrapper");
          return ele.getAttribute("id");
        }
        el = el.parentElement;
      }
    }
  }
};
