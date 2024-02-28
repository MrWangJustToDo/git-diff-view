## Usage

``` tsx
    <DiffViewReact<string>
      ref={ref}
      renderWidgetLine={({ onClose, side, lineNumber }) => (
        <div className="border flex flex-col w-full px-[4px] py-[8px]">
          <TextArea onChange={(v) => (valRef.current = v)} />
          <div className="m-[5px] mt-[0.8em] text-right">
            <div className="inline-flex gap-x-[12px] justify-end">
              <button
                className="border px-[12px] py-[6px] rounded-[4px]"
                onClick={() => {
                  onClose();
                  valRef.current = "";
                }}
              >
                cancel
              </button>
              <button
                className="border px-[12px] py-[6px] rounded-[4px]"
                onClick={() => {
                  onClose();
                  if (valRef.current) {
                    const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
                    setExtend((prev) => {
                      const res = { ...prev };
                      res[sideKey] = { ...res[sideKey], [lineNumber]: { lineNumber, data: valRef.current } };
                      return res;
                    });
                    setTimeout(() => {
                      valRef.current = "";
                    });
                  }
                }}
              >
                submit
              </button>
            </div>
          </div>
        </div>
      )}
      // use data
      // data={data[v]}
      diffFile={diffFileInstance}
      extendData={extend}
      renderExtendLine={({ data }) => {
        return (
          <div className="border flex px-[10px] py-[8px] bg-slate-400">
            <h2 className="text-[20px]">
              {">> "}
              {data}
            </h2>
          </div>
        );
      }}
      diffViewFontSize={fontsize}
      diffViewHighlight={highlight}
      diffViewMode={mode}
      diffViewWrap={wrap}
      diffViewAddWidget
    />
```

### example repo

[react-example](https://github.com/MrWangJustToDo/git-diff-view/tree/main/ui/react-example)

