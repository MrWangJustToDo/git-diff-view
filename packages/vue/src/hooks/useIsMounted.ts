import { onMounted, ref } from "vue";

export const useIsMounted = () => {
  const isMount = ref(false);

  onMounted(() => {
    isMount.value = true;
  });

  return isMount;
};
