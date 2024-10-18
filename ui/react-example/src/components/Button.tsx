import type { ReactNode } from "react";

export const Button = (props: { onClick?: () => void; children: ReactNode }) => (
  <button
    className="transform rounded-lg bg-slate-500 px-6 py-2 font-medium capitalize tracking-wide text-white transition-colors duration-300 hover:bg-slate-800 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
    {...props}
  />
);
