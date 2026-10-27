import React, { useEffect } from "react";

// A panel over the page: rises from the bottom on the phone, sits in the middle on the desktop.
const Sheet = ({ title, onClose, children }) => {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 lg:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="h-10 w-10 shrink-0 rounded-full bg-neutral-800 text-lg hover:bg-neutral-700"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Sheet;
