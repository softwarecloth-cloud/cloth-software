/** Inline success / error banner shown above a form. */
export default function Notice({ type = "error", children }) {
  if (!children) return null;

  const styles =
    type === "success"
      ? "border-green-300 bg-green-50 text-green-800 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-300"
      : "border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300";

  return (
    <div
      role={type === "success" ? "status" : "alert"}
      className={`mb-4 rounded-lg border px-3 py-2 text-sm ${styles}`}
    >
      {children}
    </div>
  );
}
