import type { OctaneNode } from "octane";
import type { Octane } from "octane/jsx-runtime";

export type { OctaneNode };

export type OctaneElement = Octane.JSX.Element;
export type OctaneImperativeRef<T> = { current: T | null } | ((value: T | null) => void);

export interface OctaneRefObject<T> {
  current: T;
}

export type OctaneStyle = Exclude<Octane.JSX.IntrinsicElements["div"]["style"], string | undefined>;

export type NativeMouseEventHandler<T extends EventTarget> = (event: MouseEvent & { currentTarget: T }) => void;
