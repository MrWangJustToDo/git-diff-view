<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import * as data from "./data";
import { DiffModeEnum, DiffView, DiffViewProps, SplitSide, DiffFile, DiffViewWithMultiSelect } from "@git-diff-view/vue";
import { MessageData } from "./worker";

import type { MultiSelectExtendData } from "@git-diff-view/vue";

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

type Key = "a" | "b" | "c" | "d" | "e";

const highlight = ref(true);

const diffFile = ref<DiffFile>();

const wrap = ref(true);

const dark = ref(false);

const mode = ref(DiffModeEnum.Split);

const toggleHighlight = () => (highlight.value = !highlight.value);

const toggleTheme = () => (dark.value = !dark.value);

const toggleWrap = () => (wrap.value = !wrap.value);

const toggleMode = () => {
  mode.value = mode.value === DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.Split;
};

worker.addEventListener("message", (e: MessageEvent<MessageData>) => {
  console.log(e.data);
  const { data, bundle } = e.data;
  const instance = DiffFile.createInstance(data || {}, bundle);
  diffFile.value = instance;
});

const k = ref<Key>("b");

const v = ref("");

const instance = ref<{ getDiffFileInstance: () => DiffFile }>();

onMounted(() => {
  console.log(instance.value);
});

const _data = computed(() => data[k.value]);

const extendData = ref<DiffViewProps<any>["extendData"]>({ oldFile: {}, newFile: {} });

watch(
  () => diffFile.value,
  () => {
    extendData.value = { oldFile: {}, newFile: {} };
  }
);

watch(
  _data,
  () => {
    worker.postMessage({ data: _data.value });
  },
  { immediate: true }
);

const resetV = () => (v.value = "");

const showMultiSelect = ref(false);
const toggleMultiSelect = () => (showMultiSelect.value = !showMultiSelect.value);

const multiSelectExtend = ref<MultiSelectExtendData<string[]>>({ oldFile: {}, newFile: {} });
const multiSelectV = ref("");
const multiSelectWidget = ref<{ lineNumber: number; fromLineNumber: number; side: SplitSide } | null>(null);

watch(
  () => diffFile.value,
  () => {
    multiSelectExtend.value = { oldFile: {}, newFile: {} };
  }
);

const handleMultiSelectAddWidget = (props: { lineNumber: number; fromLineNumber?: number; side: SplitSide }) => {
  multiSelectV.value = "";
  multiSelectWidget.value = {
    lineNumber: props.lineNumber,
    fromLineNumber: props.fromLineNumber ?? props.lineNumber,
    side: props.side,
  };
};

const handleMultiSelectSubmit = (onClose: () => void) => {
  if (!multiSelectWidget.value || !multiSelectV.value.trim()) {
    multiSelectWidget.value = null;
    multiSelectV.value = "";
    onClose();
    return;
  }
  const { lineNumber, fromLineNumber, side } = multiSelectWidget.value;
  const _side = side === SplitSide.old ? "oldFile" : "newFile";
  const prev = multiSelectExtend.value;
  const sideData = { ...prev[_side] };
  const existing = sideData[lineNumber]?.data || [];
  sideData[lineNumber] = {
    data: [...existing, multiSelectV.value.trim()],
    fromLine: fromLineNumber,
  };
  multiSelectExtend.value = { ...prev, [_side]: sideData };
  multiSelectV.value = "";
  multiSelectWidget.value = null;
  onClose();
};
</script>

<template>
  <div class="m-auto mb-[1em] mt-[1em] w-[90%]">
    <h2 class="text-[24px]">A Vue component to show the file diff</h2>
    <br />
    <p>
      Select a file to show the diff: &nbsp;
      <select class="rounded-sm border" v-model="k">
        <option value="a">diff 1</option>
        <option value="b">diff 2</option>
        <option value="c">diff 3</option>
        <option value="d">diff 4</option>
        <option value="e">diff 5</option>
      </select>
    </p>
  </div>
  <div class="m-auto mb-[1em] w-[90%] text-right">
    <div class="inline-flex gap-x-4">
      <button
        class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
        @click="toggleWrap"
      >
        {{ wrap ? "Toggle to nowrap" : "Toggle to wrap" }}
      </button>
      <button
        class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
        @click="toggleHighlight"
      >
        {{ highlight ? "Toggle to disable highlight" : "Toggle to enable highlight" }}
      </button>
      <button
        class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
        @click="toggleTheme"
      >
        {{ dark ? "Toggle to light theme" : "Toggle to dark theme" }}
      </button>
      <button
        class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
        @click="toggleMode"
      >
        {{ mode === DiffModeEnum.Split ? "Toggle to UnifiedMode" : "Toggle to SplitMode" }}
      </button>
    </div>
  </div>
  <div class="m-auto mb-[5em] w-[90%] overflow-hidden rounded-[5px] border border-solid border-[#e1e1e1]">
    <DiffView
      :diff-file="diffFile"
      :diff-view-font-size="14"
      :diff-view-mode="mode"
      :diff-view-highlight="highlight"
      :diff-view-add-widget="true"
      ref="instance"
      :diff-view-theme="dark ? 'dark' : 'light'"
      :diff-view-wrap="wrap"
      @on-add-widget-click="resetV"
      :extend-data="extendData"
    >
      <template #widget="{ onClose, lineNumber, side }">
        <div class="flex w-full flex-col border px-[4px] py-[8px]">
          <textarea class="min-h-[80px] w-full border p-[2px]" v-model="v" />
          <div class="m-[5px] mt-[0.8em] text-right">
            <div class="inline-flex justify-end gap-x-[12px]">
              <button class="rounded-[4px] border px-[12px] py-[6px]" @click="onClose">cancel</button>
              <button
                class="rounded-[4px] border px-[12px] py-[6px]"
                @click="
                  () => {
                    if (v.length) {
                      const _side = side === SplitSide.old ? 'oldFile' : 'newFile';
                      extendData![_side]![lineNumber] = { data: v };
                      onClose();
                    }
                  }
                "
              >
                submit
              </button>
            </div>
          </div>
        </div>
      </template>
      <template #extend="{ data }">
        <div class="flex border bg-slate-400 px-[10px] py-[8px]">
          <h2 class="text-[20px]">>> {{ data }}</h2>
        </div>
      </template>
    </DiffView>
  </div>

  <!-- MultiSelect Example -->
  <div class="m-auto mb-[1em] w-[90%]">
    <button
      class="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-orange-700"
      @click="toggleMultiSelect"
    >
      {{ showMultiSelect ? 'Hide MultiSelect Example' : 'Show MultiSelect Example' }}
    </button>
  </div>
  <div v-if="showMultiSelect" class="m-auto mb-[5em] w-[90%]">
    <h2 class="mb-[0.5em] text-[20px]">MultiSelect: Drag on line numbers to select multiple lines</h2>
    <div class="overflow-hidden rounded-[5px] border border-solid border-[#e1e1e1]">
      <DiffViewWithMultiSelect
        :diff-file="diffFile"
        :diff-view-font-size="14"
        :diff-view-mode="mode"
        :diff-view-highlight="highlight"
        :diff-view-add-widget="true"
        :diff-view-theme="dark ? 'dark' : 'light'"
        :diff-view-wrap="wrap"
        :enable-multi-select="true"
        :extend-data="multiSelectExtend"
        @on-add-widget-click="handleMultiSelectAddWidget"
      >
        <template #widget="{ onClose, lineNumber, side }">
          <div class="flex w-full flex-col border px-[4px] py-[8px]">
            <p v-if="multiSelectWidget" class="mb-[4px] text-sm text-gray-500">
              {{ multiSelectWidget.fromLineNumber === multiSelectWidget.lineNumber
                ? `Add comment on line ${multiSelectWidget.lineNumber}`
                : `Add comment on lines ${multiSelectWidget.fromLineNumber} - ${multiSelectWidget.lineNumber}` }}
            </p>
            <textarea class="min-h-[80px] w-full border p-[2px]" v-model="multiSelectV" />
            <div class="m-[5px] mt-[0.8em] text-right">
              <div class="inline-flex justify-end gap-x-[12px]">
                <button class="rounded-[4px] border px-[12px] py-[6px]" @click="() => { multiSelectWidget = null; multiSelectV = ''; onClose(); }">cancel</button>
                <button class="rounded-[4px] border px-[12px] py-[6px]" @click="() => handleMultiSelectSubmit(onClose)">submit</button>
              </div>
            </div>
          </div>
        </template>
        <template #extend="{ data, lineNumber, fromLineNumber }">
          <div class="flex flex-col border bg-slate-100 px-[10px] py-[8px]">
            <p v-if="fromLineNumber !== lineNumber" class="mb-[4px] text-xs text-gray-500">
              Lines {{ fromLineNumber }} - {{ lineNumber }}
            </p>
            <div v-for="(d, i) in (data as string[])" :key="i" class="mb-[4px] rounded border bg-white p-[6px]">
              {{ d }}
            </div>
          </div>
        </template>
      </DiffViewWithMultiSelect>
    </div>
  </div>
</template>
