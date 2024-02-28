## Usage

``` vue
    <DiffView
      # diffFileInstance / data
      :data="data"
      :diff-file="diffFile"
      :diff-view-font-size="14"
      :diff-view-mode="mode"
      :diff-view-highlight="highlight"
      :diff-view-add-widget="true"
      :diff-view-wrap="wrap"
      @on-add-widget-click="() => {}"
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
```

### example repo

[vue-example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/vue-example)

