import { inject } from "vue";

import {
  enableAddWidgetSymbol,
  enableHighlightSymbol,
  enableWrapSymbol,
  extendDataSymbol,
  fontSizeSymbol,
  idSymbol,
  modeSymbol,
  mountedSymbol,
  onAddWidgetClickSymbol,
  setWidgetStateSymbol,
  slotsSymbol,
  widgetStateSymbol,
} from "./provider";

export const useId = () => inject(idSymbol);

export const useMode = () => inject(modeSymbol);

export const useIsMounted = () => inject(mountedSymbol);

export const useFontSize = () => inject(fontSizeSymbol);

export const useEnableWrap = () => inject(enableWrapSymbol);

export const useEnableHighlight = () => inject(enableHighlightSymbol);

export const useEnableAddWidget = () => inject(enableAddWidgetSymbol);

export const useExtendData = () => inject(extendDataSymbol);

export const useOnAddWidgetClick = () => inject(onAddWidgetClickSymbol);

export const useSlots = () => inject(slotsSymbol);

export const useWidget = () => inject(widgetStateSymbol);

export const useSetWidget = () => inject(setWidgetStateSymbol);
