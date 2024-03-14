import { provide, ref, watch } from "vue";

import type { InjectionKey } from "vue";

export const useProvide = <T extends Record<string, any>, K extends keyof T = keyof T>(
  props: T,
  key: K,
  keySymbol: InjectionKey<any>,
  option?: { defaultValue?: T[K]; deepWatch?: boolean }
) => {
  const value = ref(props?.[key] || option?.defaultValue);

  watch(
    () => props?.[key],
    () => {
      value.value = props[key];
    },
    { deep: option?.deepWatch }
  );

  provide(keySymbol, value);
};
