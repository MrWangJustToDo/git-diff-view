<script setup lang="ts">
import { ref } from 'vue';
import { b } from './data'
import { DiffView, DiffViewProps, SplitSide } from '@git-diff-view/vue';

const v = ref('');

const extendData = ref<DiffViewProps<any>['extendData']>({ oldFile: {}, newFile: {} });

const resetV = () => v.value = ''
</script>

<template>
  <div class="w-[90%] m-auto border border-[grey] border-solid rounded-[5px] overflow-hidden mb-[5em]">
    <DiffView :data="b" :diff-view-font-size="14" :diff-view-highlight="true" :diff-view-add-widget="true"
      :diff-view-wrap="true" @on-add-widget-click="resetV" :extend-data="extendData">
      <template #widget="{ onClose, lineNumber, side }">
        <div class="border flex flex-col w-full px-[4px] py-[8px]">
          <textarea class="w-full border min-h-[80px] p-[2px]" v-model="v" />
          <div class="m-[5px] mt-[0.8em] text-right">
            <div class="inline-flex gap-x-[12px] justify-end">
              <button class="border px-[12px] py-[6px] rounded-[4px]" @click="onClose">
                cancel
              </button>
              <button class="border px-[12px] py-[6px] rounded-[4px]" @click="() => {
                if (v.length) {
                  const _side = side === SplitSide.old ? 'oldFile' : 'newFile'
                  extendData![_side]![lineNumber] = { data: v };
                  onClose();
                }
              }">
                submit
              </button>
            </div>
          </div>
        </div>
      </template>
      <template #extend="{ data }">
        <div className="border flex px-[10px] py-[8px] bg-slate-400">
          <h2 className="text-[20px]">
            >> {{ data }}
          </h2>
        </div>
      </template>
    </DiffView>
  </div>
</template>
