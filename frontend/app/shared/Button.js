/** Primary submit button with a built-in loading state. */
export default function Button({
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) {
  return (
    <button
      className={
        "inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 " +
        "text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none " +
        "focus:ring-2 focus:ring-neutral-900/20 disabled:cursor-not-allowed disabled:opacity-60 " +
        "dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 " +
        className
      }
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
