<script setup lang="ts">
import { computed, ref, watch } from "vue";
import * as data from "./data";
import { DiffModeEnum, DiffView, DiffViewProps, SplitSide } from "@git-diff-view/vue";
import { MessageData } from "./worker";
import { DiffFile } from "@git-diff-view/core";

const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });

type Key = "a" | "b" | "c" | "d" | "e";

const highlight = ref(true);

const diffFile = ref<DiffFile>();

const wrap = ref(true);

const mode = ref(DiffModeEnum.Split);

const toggleHighlight = () => (highlight.value = !highlight.value);

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

const k = ref<Key>("a");

const v = ref("");

const _data = computed(() => data[k.value]);

const extendData = ref<DiffViewProps<any>["extendData"]>({ oldFile: {}, newFile: {} });

watch(() => diffFile.value, () => {
  extendData.value = { oldFile: {}, newFile: {} };
});

watch(
  _data,
  () => {
    worker.postMessage({ data: _data.value });
  },
  { immediate: true }
);

const resetV = () => (v.value = "");
</script>

<template>
  <div class="w-[90%] m-auto mb-[1em] mt-[1em]">
    <h2 class="text-[24px]">
      A Vue component to show the file diff (just like github) <span class="text-red-500"> (🚧 wip) </span>
    </h2>
    <br />
    <p>
      Select a file to show the diff: &nbsp;
      <select class="border rounded-sm" v-model="k">
        <option value="a">diff 1</option>
        <option value="b">diff 2</option>
        <option value="c">diff 3</option>
        <option value="d">diff 4</option>
        <option value="e">diff 5</option>
      </select>
    </p>
  </div>
  <div class="w-[90%] m-auto mb-[1em] text-right">
    <div class="inline-flex gap-x-4">
      <button
        class="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
        @click="toggleWrap"
      >
        {{ wrap ? "Toggle to nowrap" : "Toggle to wrap" }}
      </button>
      <button
        class="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
        @click="toggleHighlight"
      >
        {{ highlight ? "Toggle to disable highlight" : "Toggle to enable highlight" }}
      </button>
      <button
        class="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white"
        @click="toggleMode"
      >
        {{ mode === DiffModeEnum.Split ? "Toggle to UnifiedMode" : "Toggle to SplitMode" }}
      </button>
    </div>
  </div>
  <div class="w-[90%] m-auto border border-[grey] border-solid rounded-[5px] overflow-hidden mb-[5em]">
    <DiffView
      :diff-file="diffFile"
      :diff-view-font-size="14"
      :diff-view-mode="mode"
      :diff-view-highlight="highlight"
      :diff-view-add-widget="true"
      :diff-view-wrap="wrap"
      @on-add-widget-click="resetV"
      :extend-data="extendData"
    >
      <template #widget="{ onClose, lineNumber, side }">
        <div class="border flex flex-col w-full px-[4px] py-[8px]">
          <textarea class="w-full border min-h-[80px] p-[2px]" v-model="v" />
          <div class="m-[5px] mt-[0.8em] text-right">
            <div class="inline-flex gap-x-[12px] justify-end">
              <button class="border px-[12px] py-[6px] rounded-[4px]" @click="onClose">cancel</button>
              <button
                class="border px-[12px] py-[6px] rounded-[4px]"
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
        <div class="border flex px-[10px] py-[8px] bg-slate-400">
          <h2 class="text-[20px]">>> {{ data }}</h2>
        </div>
      </template>
    </DiffView>
  </div>
</template>
