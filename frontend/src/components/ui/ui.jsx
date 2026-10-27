import React from "react";

export const inputClass =
  "w-full h-12 rounded-xl bg-neutral-800 px-4 text-base text-neutral-50 placeholder-neutral-500 outline-none border border-transparent focus:border-brand disabled:opacity-60";

export const primaryButtonClass =
  "h-12 px-6 rounded-xl bg-brand text-base font-bold text-on-brand transition-colors hover:bg-[#ffcd4d] active:bg-brand-soft disabled:opacity-60 disabled:cursor-not-allowed";

export const secondaryButtonClass =
  "h-12 px-6 rounded-xl bg-neutral-800 text-base font-semibold text-neutral-50 transition-colors hover:bg-neutral-700 disabled:opacity-60";

export const dangerButtonClass =
  "h-12 px-6 rounded-xl bg-danger/15 text-base font-semibold text-danger transition-colors hover:bg-danger/25 disabled:opacity-60";

export const Card = ({ children, className = "" }) => (
  <section className={`bg-surface rounded-3xl p-5 ${className}`}>{children}</section>
);

export const Field = ({ label, htmlFor, children }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-400">
      {label}
    </label>
    {children}
  </div>
);

export const ErrorText = ({ children }) =>
  children ? (
    <p role="alert" className="text-sm text-danger">
      {String(children.message ?? children)}
    </p>
  ) : null;

export const PageHeader = ({ title, children }) => (
  <header className="flex items-center justify-between gap-3 px-4 pt-6 pb-2 lg:pt-10 lg:pb-4">
    <h1 className="font-display text-3xl font-bold lg:text-4xl">{title}</h1>
    {children}
  </header>
);

export const Segmented = ({ name, value, onChange, options }) => (
  <div className="grid grid-flow-col auto-cols-fr gap-1.5 rounded-2xl bg-neutral-900 p-1.5" role="radiogroup">
    {options.map((option) => (
      <label
        key={option.value}
        className={`h-11 rounded-xl flex items-center justify-center text-sm cursor-pointer transition-colors ${
          value === option.value
            ? "bg-brand text-on-brand font-bold"
            : "text-neutral-300 hover:bg-neutral-800"
        }`}
      >
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className="sr-only"
        />
        {option.label}
      </label>
    ))}
  </div>
);
