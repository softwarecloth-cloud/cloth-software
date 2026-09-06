"use client";

import { useId, useState } from "react";

const baseInput =
  "block w-full rounded-lg border px-3 py-2 text-sm text-neutral-900 outline-none transition " +
  "placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/10 " +
  "dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:ring-white/10";

function borderClass(error) {
  return error
    ? "border-red-400 focus:border-red-500 dark:border-red-500/60"
    : "border-neutral-300 focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-300";
}

/** Labelled text/email/tel input with inline error text. */
export function Field({ label, error, type = "text", className = "", ...props }) {
  const id = useId();
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`${baseInput} ${borderClass(error)} bg-white dark:bg-neutral-950`}
        aria-invalid={!!error}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({ label, error, className = "", ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`${baseInput} ${borderClass(error)} bg-white pr-16 dark:bg-neutral-950`}
          aria-invalid={!!error}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          tabIndex={-1}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

/** Simple select, used for gender. */
export function SelectField({ label, error, children, className = "", ...props }) {
  const id = useId();
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        {label}
      </label>
      <select
        id={id}
        className={`${baseInput} ${borderClass(error)} bg-white dark:bg-neutral-950`}
        aria-invalid={!!error}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
