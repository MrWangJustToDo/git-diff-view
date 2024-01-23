import { inject } from "vue";

import { enableAddWidgetSymbol, enableHighlightSymbol, enableWrapSymbol, extendDataSymbol, fontSizeSymbol, idSymbol, modeSymbol, onAddWidgetClickSymbol, renderExtendLineSymbol, renderWidgetLineSymbol } from "./provider";

export const useId = () => inject(idSymbol);

export const useMode = () => inject(modeSymbol);

export const useFontSize = () => inject(fontSizeSymbol);

export const useEnableWrap = () => inject(enableWrapSymbol);

export const useEnableHighlight = () => inject(enableHighlightSymbol);

export const useEnableAddWidget = () => inject(enableAddWidgetSymbol);

export const useRenderWidgetLine = () => inject(renderWidgetLineSymbol);

export const useExtendData = () => inject(extendDataSymbol);

export const useRenderExtendLine = () => inject(renderExtendLineSymbol);

export const useOnAddWidgetClick = () => inject(onAddWidgetClickSymbol);
