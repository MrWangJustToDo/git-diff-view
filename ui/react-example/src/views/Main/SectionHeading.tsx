import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}

export const SectionHeading = ({ eyebrow, title, description, align = "left", action }: SectionHeadingProps) => {
  const centered = align === "center";

  return (
    <div
      className={`mb-8 flex flex-col gap-4 ${centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}
    >
      <div className={centered ? "flex flex-col items-center" : undefined}>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
          {eyebrow}
        </div>
        <h2 className="mt-2 text-[1.55rem] font-extrabold leading-tight tracking-[-0.03em] text-gray-900 md:text-[1.8rem] dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
};
