import Link from "next/link";

/**
 * Centered card used by every auth screen (login / signup / forgot / reset).
 * Keeps the visual shell in one place so the forms only carry their fields.
 */
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
          >
            Cloth Software
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {footer}
          </p>
        ) : null}
      </div>
    </main>
  );
}
