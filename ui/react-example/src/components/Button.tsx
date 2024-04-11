import { ReactNode } from "react";

export const Button = (props: { onClick?: () => void; children: ReactNode }) => (
  <button
    className="px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-slate-500 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
    {...props}
  />
);
