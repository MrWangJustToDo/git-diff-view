import { generateHook } from "./generate";

import type { Accessor } from "solid-js";


export const useDom = generateHook("dom") as () => Accessor<HTMLElement | undefined>;
