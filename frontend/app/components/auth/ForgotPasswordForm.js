"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/AuthContext/AuthContext";
import AuthCard from "@/app/shared/AuthCard";
import { Field } from "@/app/shared/Field";
import Button from "@/app/shared/Button";
import Notice from "@/app/shared/Notice";
import { validate } from "@/app/shared/validation";

export default function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(null); // { message, resetUrl? }
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(["email"], { email });
    if (nextErrors.email) {
      setError(nextErrors.email);
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword({ email: email.trim() });
    setSubmitting(false);

    if (result.success) {
      setDone({ message: result.message, resetUrl: result.resetUrl });
    } else {
      setFormError(result.message || "Could not process your request");
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link
          href="/"
          className="font-medium text-neutral-900 underline dark:text-neutral-100"
        >
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <>
          <Notice type="success">{done.message}</Notice>
          {/* Dev convenience only: in production the link is emailed and this
              block never renders. */}
          {done.resetUrl ? (
            <p className="text-xs break-all text-neutral-500 dark:text-neutral-400">
              Dev link:{" "}
              <Link
                href={done.resetUrl}
                className="underline text-neutral-800 dark:text-neutral-200"
              >
                {done.resetUrl}
              </Link>
            </p>
          ) : null}
        </>
      ) : (
        <>
          <Notice type="error">{formError}</Notice>
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setFormError("");
              }}
              error={error}
            />
            <Button type="submit" loading={submitting}>
              Send reset link
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
