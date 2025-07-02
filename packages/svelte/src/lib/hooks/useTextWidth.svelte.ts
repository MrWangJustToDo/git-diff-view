import { getTextMeasureInstance } from '$lib/utils/textMeasure.js';

import { useIsMounted } from './useIsMounted.svelte.js';

export const useTextWidth = ({
	text,
	font
}: {
	text: () => string;
	font: () => { fontFamily?: string; fontStyle?: string; fontSize?: string };
}) => {
	const isMounted = $derived.by(useIsMounted());

  const fontSize = parseInt(font().fontSize || '14');

  let baseSize = 6;

  baseSize += fontSize > 10 ? (fontSize - 10) * 0.6 : 0;

  let width = $state(baseSize * text().length);

  const measureText = () => {
    if (!isMounted) return;

    width = getTextMeasureInstance().measure(text() || '', font());
  }

  $effect(measureText);

  return () => width;
};
