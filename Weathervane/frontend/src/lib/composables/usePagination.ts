import { computed, ref, type Ref } from "vue";

export function usePagination(initialPage = 1, initialPageSize = 20) {
  const page = ref(initialPage);
  const pageSize = ref(initialPageSize);

  function setPage(value: number) {
    page.value = Math.max(1, value);
  }
  function reset() {
    page.value = 1;
  }

  return { page, pageSize, setPage, reset };
}

export function totalPagesOf(total: Ref<number>, pageSize: Ref<number>) {
  return computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));
}
