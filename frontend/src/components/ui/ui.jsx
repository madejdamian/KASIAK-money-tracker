import React from "react";

export const inputClass =
  "w-full h-12 rounded-xl bg-neutral-800 px-4 text-base text-white placeholder-neutral-500 outline-none focus:outline focus:outline-2 focus:outline-secondColor disabled:opacity-60";

export const primaryButtonClass =
  "h-12 px-6 rounded-xl bg-secondColor text-base font-semibold text-white transition-colors hover:bg-[#28bf8a] disabled:opacity-60 disabled:cursor-not-allowed";

export const secondaryButtonClass =
  "h-12 px-6 rounded-xl bg-neutral-800 text-base text-white transition-colors hover:bg-neutral-700 disabled:opacity-60";

export const dangerButtonClass =
  "h-12 px-6 rounded-xl bg-red-900/60 text-base text-red-200 transition-colors hover:bg-red-800/70 disabled:opacity-60";

export const Card = ({ children, className = "" }) => (
  <section className={`bg-thirdColor rounded-2xl p-4 ${className}`}>
    {children}
  </section>
);

export const Field = ({ label, htmlFor, children }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={htmlFor} className="text-sm text-neutral-400">
      {label}
    </label>
    {children}
  </div>
);

export const ErrorText = ({ children }) =>
  children ? (
    <p role="alert" className="text-sm text-red-400">
      {String(children.message ?? children)}
    </p>
  ) : null;

export const PageHeader = ({ title, children }) => (
  <header className="flex items-center justify-between gap-3 px-4 pt-6 pb-2">
    <h1 className="text-2xl font-semibold">{title}</h1>
    {children}
  </header>
);

export const Segmented = ({ name, value, onChange, options }) => (
  <div className="grid grid-flow-col auto-cols-fr gap-2" role="radiogroup">
    {options.map((option) => (
      <label
        key={option.value}
        className={`h-12 rounded-xl flex items-center justify-center text-base cursor-pointer transition-colors ${
          value === option.value
            ? "bg-secondColor text-white font-semibold"
            : "bg-neutral-800 text-neutral-300"
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
