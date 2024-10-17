/* eslint-disable max-lines */
export const temp1 = `/* eslint-disable @typescript-eslint/ban-types */
import { readonly, toRaw } from "@vue/reactivity";
import { isPromise } from "@vue/shared";
import { useCallback, useEffect, useMemo, useRef } from "react";
// SEE https://github.com/facebook/react/pull/25231
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { Controller } from "./controller";
import { delDevController, setDevController, setNamespaceMap } from "./dev";
import { InternalNameSpace, isServer } from "./env";
import { traverse, traverseShallow } from "./tools";

import type { LifeCycle } from "./lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

const temp = new Set<Controller>();

/**
 * @internal
 */
export const useCallbackRef = <T extends Function>(callback: T) => {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const memoCallback = useCallback((...args: any) => {
    return callbackRef.current?.call(null, ...args);
  }, []) as unknown as T;

  return memoCallback;
};

/**
 * @internal
 */
export const useSubscribeCallbackRef = <T, K>(callback?: (arg?: T) => K, deepSelector?: boolean) => {
  const callbackRef = useRef<Function>();

  callbackRef.current = typeof callback === "function" ? callback : null;

  const memoCallback = useCallbackRef((arg: T) => {
    if (callbackRef.current) {
      const re = callbackRef.current(arg);
      if (deepSelector) {
        traverse(re);
      } else {
        // fix useState(s => s) not subscribe reactive state update
        traverseShallow(re);
      }
      return re;
    } else {
      // !BREAKING CHANGE, will change the default behavior when the deepSelector is true
      if (deepSelector) {
        traverse(arg);
      } else {
        traverseShallow(arg);
      }
      return arg;
    }
  });

  return memoCallback;
};

/**
 * @internal
 */
export const usePrevValue = <T>(v: T) => {
  const vRef = useRef(v);

  useEffect(() => {
    vRef.current = v;
  }, [v]);

  return vRef.current;
};

export const createHook = <T extends Record<string, unknown>, C extends Record<string, Function>>(
  reactiveState: UnwrapNestedRefs<T>,
  initialState: T,
  lifeCycle: LifeCycle,
  deepSelector = true,
  stableSelector = false,
  namespace?: string,
  actions: C = undefined
) => {
  const controllerList = new Set<Controller>();

  // TODO
  __DEV__ && !isServer && namespace && setNamespaceMap(namespace, initialState);

  let active = true;

  const readonlyState = __DEV__ ? readonly(initialState) : (reactiveState as DeepReadonly<UnwrapNestedRefs<T>>);

  namespace = namespace || InternalNameSpace.$$__ignore__$$;

  // tool function to generate \`useSelector\` hook
  const generateUseHook = <P>(type: "default" | "deep" | "deep-stable" | "shallow" | "shallow-stable") => {
    const currentIsDeep = type === "default" ? deepSelector : type === "deep" || type === "deep-stable";

    const currentIsStable = type === "default" ? stableSelector : type === "deep-stable" || type === "shallow-stable";

    return (selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) => {
      const ref = useRef<P | DeepReadonly<UnwrapNestedRefs<T>>>();

      const selectorRef = useSubscribeCallbackRef(selector, currentIsDeep);

      const getSelected = useCallbackRef(() => {
        // 0.1.9
        // make the returned value as a readonly value, so the only way to change the state is in the \`actions\` middleware
        if (selector) {
          ref.current = selector({ ...readonlyState, ...actions });
        } else {
          ref.current = { ...readonlyState, ...actions };
        }
      });

      // may not work will with hmr
      const prevSelector = currentIsStable ? selector : usePrevValue(selector);

      const ControllerInstance = useMemo(() => new Controller(() => selectorRef(reactiveState as any), lifeCycle, controllerList, namespace, getSelected), []);

      useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

      // initial
      useMemo(() => {
        if (!active) return;
        ControllerInstance.run();
        getSelected();
      }, [ControllerInstance, getSelected]);

      // !TODO try to improve the performance
      // rerun when the 'selector' change
      useMemo(() => {
        if (active && prevSelector !== selector) {
          ControllerInstance.run();
          getSelected();
        }
      }, [ControllerInstance, prevSelector, selector]);

      if (__DEV__) {
        ControllerInstance._devSelector = selector;

        ControllerInstance._devActions = actions;

        ControllerInstance._devWithDeep = currentIsDeep;

        ControllerInstance._devWithStable = currentIsStable;

        ControllerInstance._devType = type;

        ControllerInstance._devState = initialState;

        ControllerInstance._devResult = ref.current;

        if (!active) {
          console.error("current \`useSelector\` have been inactivated, check your code first");
        }

        useEffect(() => {
          setDevController(ControllerInstance, initialState);
          return () => {
            delDevController(ControllerInstance, initialState);
          };
        }, []);
      }

      useEffect(() => () => ControllerInstance.stop(), [ControllerInstance]);

      return ref.current;
    };
  };

  const defaultHook = generateUseHook("default");

  const deepHook = generateUseHook("deep");

  const deepStableHook = generateUseHook("deep-stable");

  const shallowHook = generateUseHook("shallow");

  const shallowStableHook = generateUseHook("shallow-stable");

  function useSelector(): DeepReadonly<UnwrapNestedRefs<T>> & C;
  function useSelector<P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P): P;
  function useSelector<P>(selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) {
    return defaultHook(selector);
  }

  const typedUseSelector = useSelector as typeof useSelector & {
    /**
     * @deprecated
     * use \`getReactiveState\` / \`getReadonlyState\` instead
     */
    getState: () => T;
    getActions: () => C;
    getIsActive: () => boolean;
    subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void) => () => void;
    getLifeCycle: () => LifeCycle;
    getReactiveState: () => UnwrapNestedRefs<T>;
    getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
    useStableSelector: typeof useSelector;
    useDeepSelector: typeof useSelector;
    useDeepStableSelector: typeof useSelector;
    useShallowSelector: typeof useSelector;
    useShallowStableSelector: typeof useSelector;
    cleanReactiveHooks: () => void;
  };

  typedUseSelector.getState = () => toRaw(initialState);

  typedUseSelector.getLifeCycle = () => lifeCycle;

  typedUseSelector.getActions = () => actions;

  typedUseSelector.getReactiveState = () => reactiveState;

  typedUseSelector.getReadonlyState = () => readonlyState;

  typedUseSelector.useDeepSelector = deepHook as typeof useSelector;

  typedUseSelector.useDeepStableSelector = deepStableHook as typeof useSelector;

  typedUseSelector.useShallowSelector = shallowHook as typeof useSelector;

  typedUseSelector.useShallowStableSelector = shallowStableHook as typeof useSelector;

  typedUseSelector.subscribe = (selector, cb, shallow?: boolean) => {
    const subscribeSelector = () => {
      const re = selector(reactiveState as DeepReadonly<UnwrapNestedRefs<T>>);
      if (__DEV__ && isPromise(re)) {
        console.error(\`[reactivity-store/subscribe] selector should return a plain object, but current is a promise\`);
      }
      if (shallow) {
        traverseShallow(re);
      } else {
        traverse(re);
      }
    };

    const controller = new Controller(subscribeSelector, lifeCycle, temp, InternalNameSpace.$$__subscribe__$$, () => cb());

    if (active) {
      controller.run();
    }

    if (__DEV__) {
      if (!active) {
        console.error("can not subscribe an inactivated hook, check your code first");
      }

      setDevController(controller, initialState);
    }

    return () => {
      if (__DEV__) {
        delDevController(controller, initialState);
      }
      controller.stop();
    };
  };

  typedUseSelector.cleanReactiveHooks = () => {
    controllerList.forEach((i) => i.stop());

    active = false;
  };

  typedUseSelector.getIsActive = () => active;

  return typedUseSelector;
};`

export const temp2 = `/* eslint-disable @typescript-eslint/ban-types */
import { readonly, toRaw } from "@vue/reactivity";
import { isPromise } from "@vue/shared";
import { useCallback, useEffect, useMemo, useRef } from "react";
// SEE https://github.com/facebook/react/pull/25231
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { Controller } from "./controller";
import { delDevController, setDevController, setNamespaceMap } from "./dev";
import { InternalNameSpace, isServer } from "./env";
import { traverse, traverseShallow } from "./tools";

import type { LifeCycle } from "./lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

/**
 * @internal
 */
export const useCallbackRef = <T extends Function>(callback: T) => {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const memoCallback = useCallback((...args: any) => {
    return callbackRef.current?.call(null, ...args);
  }, []) as unknown as T;

  return memoCallback;
};

/**
 * @internal
 */
export const useSubscribeCallbackRef = <T, K>(callback?: (arg?: T) => K, deepSelector?: boolean) => {
  const callbackRef = useRef<Function>();

  callbackRef.current = typeof callback === "function" ? callback : null;

  const memoCallback = useCallbackRef((arg: T) => {
    if (callbackRef.current) {
      const re = callbackRef.current(arg);
      if (deepSelector) {
        traverse(re);
      } else {
        // fix useState(s => s) not subscribe reactive state update
        traverseShallow(re);
      }
      return re;
    } else {
      // !BREAKING CHANGE, will change the default behavior when the deepSelector is true
      if (deepSelector) {
        traverse(arg);
      } else {
        traverseShallow(arg);
      }
      return arg;
    }
  });

  return memoCallback;
};

/**
 * @internal
 */
export const usePrevValue = <T>(v: T) => {
  const vRef = useRef(v);

  useEffect(() => {
    vRef.current = v;
  }, [v]);

  return vRef.current;
};

export const createHook = <T extends Record<string, unknown>, C extends Record<string, Function>>(
  reactiveState: UnwrapNestedRefs<T>,
  initialState: T,
  lifeCycle: LifeCycle,
  deepSelector = true,
  stableSelector = false,
  namespace?: string,
  actions: C = undefined
) => {
  const controllerList = new Set<Controller>();

  // TODO
  __DEV__ && !isServer && namespace && setNamespaceMap(namespace, initialState);

  let active = true;

  const readonlyState = __DEV__ ? readonly(initialState) : (reactiveState as DeepReadonly<UnwrapNestedRefs<T>>);

  namespace = namespace || InternalNameSpace.$$__ignore__$$;

  // tool function to generate \`useSelector\` hook
  const generateUseHook = <P>(type: "default" | "deep" | "deep-stable" | "shallow" | "shallow-stable") => {
    const currentIsDeep = type === "default" ? deepSelector : type === "deep" || type === "deep-stable";

    const currentIsStable = type === "default" ? stableSelector : type === "deep-stable" || type === "shallow-stable";

    return (selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) => {
      const ref = useRef<P | DeepReadonly<UnwrapNestedRefs<T>>>();

      const selectorRef = useSubscribeCallbackRef(selector, currentIsDeep);

      const getSelected = useCallbackRef(() => {
        // 0.1.9
        // make the returned value as a readonly value, so the only way to change the state is in the \`actions\` middleware
        if (selector) {
          ref.current = selector({ ...readonlyState, ...actions });
        } else {
          ref.current = { ...readonlyState, ...actions };
        }
      });

      // may not work will with hmr
      const prevSelector = currentIsStable ? selector : usePrevValue(selector);

      const ControllerInstance = useMemo(() => new Controller(() => selectorRef(reactiveState as any), lifeCycle, controllerList, namespace, getSelected), []);

      useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

      // initial
      useMemo(() => {
        ControllerInstance.run();
        getSelected();
      }, [ControllerInstance, getSelected]);

      // !TODO try to improve the performance
      // rerun when the 'selector' change
      useMemo(() => {
        if (prevSelector !== selector) {
          ControllerInstance.run();
          getSelected();
        }
      }, [ControllerInstance, prevSelector, selector]);

      if (__DEV__) {
        ControllerInstance._devSelector = selector;

        ControllerInstance._devActions = actions;

        ControllerInstance._devWithDeep = currentIsDeep;

        ControllerInstance._devWithStable = currentIsStable;

        ControllerInstance._devType = type;

        ControllerInstance._devState = initialState;

        ControllerInstance._devResult = ref.current;

        useEffect(() => {
          setDevController(ControllerInstance, initialState);

          return () => {
            delDevController(ControllerInstance, initialState);
          };
        }, [ControllerInstance]);
      }

      useEffect(() => {
        ControllerInstance.active();
        return () => {
          // fix React strictMode issue
          if (__DEV__) {
            ControllerInstance.inactive();
          } else {
            ControllerInstance.stop();
          }
        };
      }, [ControllerInstance]);

      return ref.current;
    };
  };

  const defaultHook = generateUseHook("default");

  const deepHook = generateUseHook("deep");

  const deepStableHook = generateUseHook("deep-stable");

  const shallowHook = generateUseHook("shallow");

  const shallowStableHook = generateUseHook("shallow-stable");

  function useSelector(): DeepReadonly<UnwrapNestedRefs<T>> & C;
  function useSelector<P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P): P;
  function useSelector<P>(selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) {
    return defaultHook(selector);
  }

  const typedUseSelector = useSelector as typeof useSelector & {
    /**
     * @deprecated
     * use \`getReactiveState\` / \`getReadonlyState\` instead
     */
    getState: () => T;
    getActions: () => C;
    getIsActive: () => boolean;
    subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void) => () => void;
    getLifeCycle: () => LifeCycle;
    getReactiveState: () => UnwrapNestedRefs<T>;
    getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
    useStableSelector: typeof useSelector;
    useDeepSelector: typeof useSelector;
    useDeepStableSelector: typeof useSelector;
    useShallowSelector: typeof useSelector;
    useShallowStableSelector: typeof useSelector;
    cleanReactiveHooks: () => void;
  };

  typedUseSelector.getState = () => toRaw(initialState);

  typedUseSelector.getLifeCycle = () => lifeCycle;

  typedUseSelector.getActions = () => actions;

  typedUseSelector.getReactiveState = () => reactiveState;

  typedUseSelector.getReadonlyState = () => readonlyState;

  typedUseSelector.useDeepSelector = deepHook as typeof useSelector;

  typedUseSelector.useDeepStableSelector = deepStableHook as typeof useSelector;

  typedUseSelector.useShallowSelector = shallowHook as typeof useSelector;

  typedUseSelector.useShallowStableSelector = shallowStableHook as typeof useSelector;

  typedUseSelector.subscribe = (selector, cb, shallow?: boolean) => {
    const subscribeSelector = () => {
      const re = selector(reactiveState as DeepReadonly<UnwrapNestedRefs<T>>);
      if (__DEV__ && isPromise(re)) {
        console.error(\`[reactivity-store/subscribe] selector should return a plain object, but current is a promise\`);
      }
      if (shallow) {
        traverseShallow(re);
      } else {
        traverse(re);
      }
    };

    const controller = new Controller(subscribeSelector, lifeCycle, controllerList, InternalNameSpace.$$__subscribe__$$, () => cb());

    controller.run();

    if (__DEV__) {
      setDevController(controller, initialState);
    }

    return () => {
      if (__DEV__) {
        delDevController(controller, initialState);
      }
      controller.stop();
    };
  };

  typedUseSelector.cleanReactiveHooks = () => {
    controllerList.forEach((i) => i.stop());

    active = false;
  };

  typedUseSelector.getIsActive = () => active;

  return typedUseSelector;
};`