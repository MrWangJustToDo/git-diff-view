import { provide, ref, watch } from "vue";

import type { InjectionKey } from "vue";

export const useProvide = <T extends Record<string, any>, K extends keyof T = keyof T>(
  props: T,
  key: K,
  keySymbol: InjectionKey<any>,
  deepWatch?: boolean
) => {
  const value = ref(props?.[key]);

  watch(
    () => props?.[key],
    () => {
      value.value = props[key];
    },
    { deep: deepWatch }
  );

  provide(keySymbol, value);
};
