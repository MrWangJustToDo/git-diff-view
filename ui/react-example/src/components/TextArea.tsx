import { Textarea as _Textarea } from "@mantine/core";
import { useEffect, useState } from "react";

export const Textarea = ({ onChange }: { onChange: (v: string) => void }) => {
  const [val, setVal] = useState("");

  useEffect(() => {
    onChange(val);
  }, [val]);

  return <_Textarea autoFocus value={val} onChange={(e) => setVal(e.target.value)} resize="vertical" />;
};
