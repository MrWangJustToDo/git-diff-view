import { useMemo } from "react";

export const useTextWidth = ({
  text,
  font,
}: {
  text: string;
  font: { fontFamily?: string; fontStyle?: string; fontSize?: string };
}) => {
  const width = useMemo(() => {
    const fontSize = parseInt(font.fontSize);
    let baseSize = 6;
    baseSize += fontSize > 10 ? (fontSize - 10) * 0.6 : 0;
    return baseSize * text.length;
  }, [text, font]);

  return width;
};
